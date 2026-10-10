# iFlevox SignBridge — O‘zbek imo-ishora tilini kompyuter ko‘rish orqali matnga aylantirish tizimi

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks_Vision-blue)](https://developers.google.com/mediapipe)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-green?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)

**iFlevox SignBridge** — foydalanuvchining jonli kamera oqimidan O‘zbek imo-ishora tili (UzSL / O‘zbek daktil alifbosi va asosiy muloqot so‘zlari) harakatlarini aniqlab, ularni real vaqt rejimida o‘zbekcha matnga aylantiruvchi ochiq kodli dasturiy ta’minot.

---

## 🎯 Asosiy tamoyillar va halollik kafolatlari

1. **Haqiqiy kompyuter ko‘rish (Real Computer Vision):** Barcha jarayonlar Google MediaPipe Vision modelining 21 ta 3D qo‘l skeleti nuqtalari va kinematik tahlilga asoslangan.
2. **Nol soxtalik (Zero-Fabrication):** Tizimda tasodifiy sonlar (mocking), soxta confidence qiymatlari yoki o‘ylab topilgan tarjimalar mutlaqo mavjud emas. Agar ishora bazada bo‘lmasa, tizim to‘g‘ridan-to‘g‘ri *“noma’lum ishora”* (unknown gesture) holatini ko‘rsatadi.
3. **ASL/KSL o‘rnini bosmaslik:** Amerika imo-ishora tili (ASL) yoki Koreys imo-ishora tili (KSL) O‘zbek imo-ishora tili sifatida soxtalashtirilmagan. Qo‘llab-quvvatlanuvchi har bir daktil va ishora O‘zbekistondagi manbalarga (O‘zbekiston Kar-soqovlar jamiyati, 101-maktab internati va UzSL ilmiy tadqiqotlari) mos keladi.
4. **100% lokal va maxfiy (Client-side Privacy):** Kamera kadrlari hech qachon tashqi serverga yoki pullik API'larga yuborilmaydi. Barcha hisoblashlar WebAssembly va WebGL orqali to‘liq foydalanuvchi qurilmasida bajariladi.

---

## 🏗 Uch pog‘onali arxitektura

* **Layer A (Kuzatuv va Landmarklar):** MediaPipe Hand Landmarker orqali 21 ta bo‘g‘im nuqtasi $(x, y, z)$ 30+ FPS chastotada kuzatiladi.
* **Layer B (Klassifikator):** Kaft o‘lchamiga nisbatan normallashtirilgan masofalar, barmoq bukilish darajasi (curl ratio) va burchaklar tekshiriladi.
* **Layer C (Barqarorlashtirish va Matn buferi):** Harakat oraliq tebranishlarini elash uchun 8 ta barqaror kadr (temporal debounce) filtri qo‘llaniladi va so‘zlar/harflar matnga jamlanadi.

---

## 📖 Qo‘llab-quvvatlanuvchi O‘zbek daktil va ishoralar lug‘ati

### 1. O‘zbek daktil alifbosi (Manual Alphabet)
* **A** — Musht, bosh barmoq yonboshda.
* **B** — To‘rt barmoq tik yuqoriga, bosh barmoq kaft ichida.
* **V** — Ko‘rsatkich va o‘rta barmoqlar "V" shaklida ochiq.
* **L** — Bosh va ko‘rsatkich barmoqlar 90° burchak hosil qiladi.
* **O** — Barmoq uchlari bosh barmoq uchi bilan tutashib aylana hosil qiladi.
* **I** — Faqat jimjiloq barmoq tik ko‘tarilgan.
* **D** — Ko‘rsatkich barmoq tik, boshqa barmoqlar tutashgan.
* **Y** — Bosh va jimjiloq ochiq (Shaka shakli).

### 2. Muloqot ishoralari (Core Signs)
* **SALOM** — Ochiq tekis kaft salomi.
* **YAXSHI** — Bosh barmoq yuqoriga ko‘tarilgan maqullash ishorasi (Thumbs Up).

---

## 🚀 Ishga tushirish (Local Setup)

```bash
# Repozitoriyani klonlash
git clone https://github.com/iFlevox/signbridge.git
cd signbridge

# Bog‘liqliklarni o‘rnatish
npm install

# Testlarni yurgazish
npm test

# Ishchi serverni boshlash
npm run dev
```

Brauzerda [http://localhost:3000](http://localhost:3000) manziliga kiring.

---

## 🧪 Testlash

Loyiha arxitekturasining tozaligi va deterministik ekanligi Vitest orqali qamrab olingan:

```bash
npx vitest run
```

---

## 📄 Litsenziya

MIT License. Ochiq va qulay muloqotni rivojlantirish uchun yaratilgan.
