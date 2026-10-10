# iFlevox SignBridge — Uzluksiz O‘zbek Imo-Ishora Tilini Matnga Aylantirish Tizimi

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks_Vision-blue)](https://developers.google.com/mediapipe)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-19%20Passing-green?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)

**iFlevox SignBridge** — foydalanuvchining jonli kamera oqimidan **O‘zbek imo-ishora tili (UzSL)** daktil harflari va dinamik so‘zlarini sun’iy to‘xtashlarsiz (**continuous & pause-free**), tabiiy muloqot tezligida real vaqt rejimida aniqlab, ekranning pastiga subtitr va matn sifatida uzatuvchi tizim.

---

## 🎯 Asosiy Tamoyillar va Halollik Kafolatlari

1. **Pauzasiz Uzluksiz Tahlil (No Mandatory Pauses):**
   - Foydalanuvchi har bir harf yoki so‘zdan keyin to‘xtab (pause) kutishiga hojat yo‘q.
   - Tizim harakat tezlanishi, traektoriya yo‘nalishi va kinematik apels (stroke apex) nuqtalarini avtomatik tahlil qiladi.
2. **Haqiqiy Kompyuter Ko‘rish (Zero-Fabrication CV):**
   - Hech qanday soxta tarjima, tasodifiy sonlar (`Math.random()`) yoki yolg‘on baholar ishlatilmagan.
   - Google MediaPipe Tasks Vision (`hand_landmarker.task`, 21 ta 3D landmark) va lokal WebAssembly dvigateli orqali 30+ FPS chastotada ishlaydi.
   - Noma’lum harakat bo‘lsa, tizim ochiq-oydin `unknown_gesture` holatini qaytaradi.
3. **Haqiqiy O‘zbek Imo-Ishora Tili (UzSL):**
   - Amerika (ASL), Koreys (KSL) yoki Rus imo-ishoralari o‘rniga qo‘yilmagan.
   - O‘zbekiston Kar-soqovlar jamiyati (UzbOI), 101-sonli ixtisoslashtirilgan maktab-internati va UzSL ilmiy tadqiqotlari asosidagi 8 ta daktil harf (**A, B, V, L, O, I, D, Y**) hamda 7 ta dinamik so‘z (**SALOM, RAHMAT, HA, YO‘Q, YAXSHI, ILTIMOS, TUSHUNDIM**) kiritilgan.
4. **100% Lokal va Maxfiy (Client-side Privacy):**
   - Kamera kadrlari hech qachon tashqi serverga yoki pullik API'larga yuborilmaydi.
   - Barcha hisoblashlar to‘liq foydalanuvchi qurilmasida bajariladi.

---

## 🏗 Uch Pog‘onali Arxitektura

* **Layer A (Temporal Kuzatuv & Landmarklar):** MediaPipe Hand Landmarker orqali 21 ta 3D nuqta olinadi va oxirgi 16 kadrli vaqt oynasi (temporal window) yuritiladi.
* **Layer B (Kinematik Klassifikator):** Tezlik vektori, gorizontal va vertikal tebranishlar (reciprocating motion), traektoriya uzunligi va burilish nuqtalari tahlil qilinadi.
* **Layer C (Uzluksiz Dekoder & Matn Jamlovchi):** Dinamik zarbalarni (stroke peak) darhol chiqaradi, daktil harflarni minimal 90ms adaptiv oyna orqali elaydi, so‘zlar orasida tabiiy pauzada avtomatik bo‘sh joy (`space`) tashlaydi.

---

## 📖 Qo‘llab-quvvatlanuvchi O‘zbek Lug‘ati

### 1. Dinamik muloqot ishoralari (Dynamic Continuous Words)
* **SALOM** — Ochiq tekis kaft tebranishi (Greeting wave).
* **RAHMAT** — Ko‘krak/iyak sohasidan suhbatdosh tomon oldinga-pastga uzatish.
* **HA** — Vertikal silkinish / bosh irg‘ashiga monand harakat (Nodding down-up).
* **YO‘Q** — Gorizontal o‘ng-chapga tez tebrantirish (Side-to-side wave).
* **YAXSHI** — Bosh barmoq tik (Thumbs up) holda yuqoriga aniq zarba harakati.
* **ILTIMOS** — Ko‘krak sohasidan oldinga mayin intilish harakati.
* **TUSHUNDIM** — Yuqoridan pastga qat’iy tushirish (Drop stroke).

### 2. O‘zbek daktil alifbosi (Manual Finger-Spelling)
* **A, B, V, L, O, I, D, Y** — Tasdiqlangan daktil alifbosi harflari.

---

## 🔬 Dataset Studio (Etik Ma’lumot To‘plash)

Kelgusida UzSL uchun kattaroq neyron tarmoqlarni (LSTM/Transformer) o‘qitish maqsadida tizimga **Dataset Studio** moduli qo‘shildi:
- Foydalanuvchining shaxsiy va xabardor qilingan roziligi (**Informed Consent**) bilan ishlaydi.
- Faqat 3D landmark koordinatalarini (videoni emas!) lokal saqlaydi.
- Namunalar brauzer xotirasida saqlanadi va istalgan payt standart **JSON** formatida eksport qilinishi yoki butunlay o‘chirib tashlanishi mumkin.

---

## 🚀 Ishga Tushirish (Quickstart)

```bash
# Repozitoriyani klonlash
git clone https://github.com/iFlevox/signbridge.git
cd signbridge

# Bog‘liqliklarni o‘rnatish
npm install

# Testlarni yurgazish (19 ta test)
npm test

# Ishchi serverni boshlash
npm run build
npm start
```

Brauzerda [http://localhost:3000](http://localhost:3000) manziliga kiring.

---

## 📄 Litsenziya

MIT License. O‘zbekistonda inkluziv va ochiq raqamli texnologiyalarni rivojlantirish uchun yaratilgan.
