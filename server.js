// Exercise 21 serveri. Faqat Node.js 22.13+ kerak, qo'shimcha paket o'rnatish shart emas.
// Ishga tushirish:  node server.js   ->  http://localhost:3000
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { verifyIdToken } = require("./auth");

const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, "exercise21.db");
const PUBLIC = path.join(__dirname, "public");
// Firebase loyiha ID si. Bo'sh bo'lsa login talab qilinmaydi (faqat o'zingiz uchun, kompyuterda).
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "";

const db = new DatabaseSync(DB_FILE);
db.exec(`
  CREATE TABLE IF NOT EXISTS user_vocab (
    uid         TEXT NOT NULL,
    word        TEXT NOT NULL,
    translation TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uid, word)
  );
  CREATE TABLE IF NOT EXISTS user_answers (
    uid        TEXT NOT NULL,
    question   TEXT NOT NULL,
    heading    TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uid, question)
  );
`);
// eski (loginsiz) jadvallardagi ma'lumotni 'local' foydalanuvchiga ko'chirish
try {
  db.exec(`INSERT OR IGNORE INTO user_vocab (uid, word, translation) SELECT 'local', word, translation FROM vocab`);
  db.exec(`INSERT OR IGNORE INTO user_answers (uid, question, heading) SELECT 'local', question, heading FROM answers`);
} catch {}

const q = {
  allVocab: db.prepare("SELECT word, translation FROM user_vocab WHERE uid = ?"),
  putVocab: db.prepare(`INSERT INTO user_vocab (uid, word, translation, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                        ON CONFLICT(uid, word) DO UPDATE SET translation = excluded.translation, updated_at = CURRENT_TIMESTAMP`),
  delVocab: db.prepare("DELETE FROM user_vocab WHERE uid = ? AND word = ?"),
  allAnswers: db.prepare("SELECT question, heading FROM user_answers WHERE uid = ?"),
  putAnswer: db.prepare(`INSERT INTO user_answers (uid, question, heading, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                         ON CONFLICT(uid, question) DO UPDATE SET heading = excluded.heading, updated_at = CURRENT_TIMESTAMP`),
  clearAnswers: db.prepare("DELETE FROM user_answers WHERE uid = ?"),
};

// So'rov egasini aniqlaydi: login yoqilgan bo'lsa tokenni tekshiradi, bo'lmasa 'local'.
async function currentUid(req) {
  if (!PROJECT_ID) return "local";
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || "");
  if (!m) return null;
  try { return (await verifyIdToken(m[1], PROJECT_ID)).sub; } catch { return null; }
}

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 100_000) { reject(new Error("too large")); req.destroy(); } });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); } });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    let uid = null;
    if (url.pathname.startsWith("/api/")) {
      uid = await currentUid(req);
      if (!uid) return send(res, 401, { error: "login kerak" });
    }
    if (url.pathname === "/api/state" && req.method === "GET") {
      const vocab = {}, answers = {};
      for (const r of q.allVocab.all(uid)) vocab[r.word] = r.translation;
      for (const r of q.allAnswers.all(uid)) answers[r.question] = r.heading;
      return send(res, 200, { vocab, answers });
    }
    if (url.pathname === "/api/vocab" && req.method === "PUT") {
      const { word, translation } = await readJson(req);
      if (typeof word !== "string" || typeof translation !== "string" || !word.trim() || !translation.trim() || word.length > 80 || translation.length > 200)
        return send(res, 400, { error: "bad input" });
      q.putVocab.run(uid, word.trim().toLowerCase(), translation.trim());
      return send(res, 200, { ok: true });
    }
    if (url.pathname.startsWith("/api/vocab/") && req.method === "DELETE") {
      q.delVocab.run(uid, decodeURIComponent(url.pathname.slice("/api/vocab/".length)).toLowerCase());
      return send(res, 200, { ok: true });
    }
    if (url.pathname === "/api/answers" && req.method === "PUT") {
      const { answers } = await readJson(req);
      if (!answers || typeof answers !== "object") return send(res, 400, { error: "bad input" });
      db.exec("BEGIN");
      q.clearAnswers.run(uid);
      for (const [question, heading] of Object.entries(answers)) {
        if (/^Q[1-6]$/.test(question) && /^[A-H]$/.test(heading)) q.putAnswer.run(uid, question, heading);
      }
      db.exec("COMMIT");
      return send(res, 200, { ok: true });
    }
    if (url.pathname.startsWith("/api/")) return send(res, 404, { error: "not found" });

    // statik fayllar
    let file = url.pathname === "/" ? "/index.html" : url.pathname;
    const full = path.normalize(path.join(PUBLIC, file));
    if (!full.startsWith(PUBLIC + path.sep)) return send(res, 403, "Forbidden", "text/plain");
    fs.readFile(full, (err, data) => {
      if (err) return send(res, 404, "Not found", "text/plain");
      send(res, 200, data, TYPES[path.extname(full)] || "application/octet-stream");
    });
  } catch (e) {
    try { db.exec("ROLLBACK"); } catch {}
    send(res, 500, { error: "server error" });
  }
});

server.listen(PORT, () => console.log(`Exercise 21: http://localhost:${PORT}  (baza: ${DB_FILE}, login: ${PROJECT_ID ? "Firebase " + PROJECT_ID : "o'chiq"})`));
