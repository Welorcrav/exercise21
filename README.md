# Exercise 21 Reader

Litva matni, sarlavha tanlash mashqi va so'zni bosib tarjima ko'rish. Ma'lumotlar SQLite bazasida saqlanadi.

## Fayllar

| Fayl | Vazifasi |
| --- | --- |
| `server.js` | Server va SQLite baza (`exercise21.db` fayli o'zi yaratiladi) |
| `auth.js` | Firebase tokenini tekshiradi (Google login) |
| `package.json` | Loyiha sozlamasi (paket o'rnatish shart emas) |
| `public/index.html` | Sahifa |
| `public/style.css` | Dizayn, telefon uchun moslashuv |
| `public/data.js` | Matnlar, sarlavhalar, to'g'ri javoblar, tayyor tarjimalar |
| `public/firebase-config.js` | Firebase sozlamalari (siz to'ldirasiz) |
| `public/store.js` | Bazaga yozish/o'qish (server yo'q bo'lsa brauzer xotirasiga yozadi) |
| `public/app.js` | Sahifaning ishlashi |

## Firebase'da qiladigan ishlaringiz

1. https://console.firebase.google.com ga kiring, **Add project** bosing, nom bering (Analytics shart emas).
2. Chap menyuda **Build > Authentication > Get started** bosing. **Sign-in method** ichida **Google** ni tanlang, **Enable** qiling, support email tanlang va **Save** bosing.
3. **Authentication > Settings > Authorized domains** ga saytingiz turadigan domenni qo'shing (masalan `mysite.onrender.com`). `localhost` o'zi bor. IP manzil (`192.168...`) qo'shib bo'lmaydi, shuning uchun telefonda Google login sinash uchun sayt https domenda turishi kerak (hosting yoki ngrok/cloudflared tunnel).
4. Chap tepada **Project settings** (tishli g'ildirak) > **General** > **Your apps** > **Web** (`</>`) belgisini bosing, ilova nomini yozing, **Register app** bosing. Chiqqan `firebaseConfig` ichidan `apiKey`, `authDomain`, `projectId`, `appId` ni `public/firebase-config.js` ga qo'ying.
5. **Project ID** ni (Project settings > General ichida yozilgan) serverga ham bering, quyida ko'rsatilgan.

## Ishga tushirish

Node.js 22.13 yoki yangiroq kerak.

Login bilan (Firebase sozlangan):

```
FIREBASE_PROJECT_ID=sizning-project-id node server.js
```

Windows PowerShell'da:

```
$env:FIREBASE_PROJECT_ID="sizning-project-id"; node server.js
```

Loginsiz (faqat o'zingiz, kompyuterda sinash uchun): `FIREBASE_PROJECT_ID` ni bermang va `firebase-config.js` ni o'zgartirmang, oddiy `node server.js`.

Keyin `http://localhost:3000` ni oching.

## Baza

Ikki jadval: `user_vocab` (foydalanuvchi, so'z, tarjima) va `user_answers` (foydalanuvchi, savol, tanlangan sarlavha). Har bir Google hisobning ma'lumoti alohida. Server har so'rovdagi Firebase tokenini tekshiradi va foydalanuvchi ID sini tokendan oladi.

API: `GET /api/state`, `PUT /api/vocab`, `DELETE /api/vocab/:word`, `PUT /api/answers`. Hammasi `Authorization: Bearer <token>` talab qiladi.

Internetga qo'yganda `exercise21.db` fayli o'chib ketmaydigan joyda (doimiy disk) turishi kerak, aks holda server qayta ishga tushganda ma'lumot yo'qoladi. `DB_FILE` o'zgaruvchisi bilan fayl manzilini o'zgartirish mumkin.

Boshqa baza (Postgres, Firestore) kerak bo'lsa, faqat `server.js` ichidagi `q.*` so'rovlarini almashtirish yetadi.
