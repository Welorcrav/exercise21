// Firebase ID tokenni tekshiradi. Qo'shimcha paket kerak emas (faqat node:crypto).
const crypto = require("node:crypto");

const CERT_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
let cache = { certs: null, exp: 0 };

async function fetchCerts() {
  if (cache.certs && Date.now() < cache.exp) return cache.certs;
  const r = await fetch(CERT_URL);
  if (!r.ok) throw new Error("certs fetch failed");
  const m = /max-age=(\d+)/.exec(r.headers.get("cache-control") || "");
  cache = { certs: await r.json(), exp: Date.now() + (m ? Number(m[1]) : 3600) * 1000 };
  return cache.certs;
}

const b64 = (s) => Buffer.from(s, "base64url");

async function verifyIdToken(token, projectId, getCerts = fetchCerts) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("bad token format");
  const header = JSON.parse(b64(parts[0]).toString());
  const p = JSON.parse(b64(parts[1]).toString());
  if (header.alg !== "RS256") throw new Error("bad alg");
  const cert = (await getCerts())[header.kid];
  if (!cert) throw new Error("unknown key");
  const ok = crypto.createVerify("RSA-SHA256").update(parts[0] + "." + parts[1]).verify(cert, b64(parts[2]));
  if (!ok) throw new Error("bad signature");
  const now = Math.floor(Date.now() / 1000);
  if (typeof p.exp !== "number" || p.exp <= now) throw new Error("expired");
  if (typeof p.iat !== "number" || p.iat > now + 300) throw new Error("bad iat");
  if (p.aud !== projectId) throw new Error("bad aud");
  if (p.iss !== "https://securetoken.google.com/" + projectId) throw new Error("bad iss");
  if (typeof p.sub !== "string" || !p.sub) throw new Error("bad sub");
  return p;
}

module.exports = { verifyIdToken };
