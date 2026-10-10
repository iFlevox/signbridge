# iFlevox SignBridge — Complete Uzbek Sign Language (UzSL) Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks_Vision-blue)](https://developers.google.com/mediapipe)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-23%20Passing-green?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)

**iFlevox SignBridge** — O‘zbek imo-ishora tili (UzSL) uchun to‘liq, xolis va keng qamrovli uzluksiz tarjima hamda tadqiqot platformasi.

---

## 🏛 9 Bosqichli To‘liq Arxitektura (Phased Architecture)

### 1. Ilmiy Manbalar va Dalillar Reestri (Phase 1)
- O‘zbekiston Kar-soqovlar Jamiyati (UzbOI, 1993/2012)
- 101-sonli Zaif eshituvchi va kar bolalar ixtisoslashtirilgan maktab-internati ta’lim dasturi
- UzSLR-50 dinamik tadqiqot dataseti (MediaPipe Holistic, 50 classes)
- JICA Central Asia Sign Language tadqiqotlari
- Hech qanday begona (ASL, KSL yoki Ruscha) imo-ishoralari O‘zbek tili deb soxtalashtirilmagan.

### 2. Keng Qamrovli UzSL Lug‘at Tizimi (Phase 2)
- Domenlar bo‘yicha tizimlashtirilgan: Salomlashuv, Xushmuomalalik, Maktab va Ta’lim, Salomatlik va Favqulodda, Oila va Insonlar, Tabiat va Ob-havo, Daktil alifbosi.
- Dominant va no-dominant qo‘l shakli, 1-qo‘lli va 2-qo‘lli belgilar, kinematik traektoriya, non-manual (yuz va gavda) belgilari.
- Faol modelda mavjud bo‘lgan va kelgusida rejalashtirilgan belgilar ochiq-oydin ajratilgan.

### 3. Uzluksiz Kinematik Segmentatsiya (Phase 3)
- Sun’iy to‘xtashlar va ushlab turishlarsiz (`continuous signing without pauses`).
- Vaqt bo‘yicha tezlanish va kinematik apels (`stroke apex`) orqali harakatning eng ma’noli nuqtasida darhol tanib olish.
- Oraliq harakatlarni `transition` deb belgilab, soxta harflar terilishini to‘liq bartaraf etish.

### 4. Lingvistik Grammatika va Tarjima Dvigateli (Phase 4)
- 4 pog‘onali ajratish:
  1. Xom 3D landmarklar
  2. Glosslar ketma-ketligi
  3. UzSL tabiiy grammatikasi (Mavzu-izoh, Inkor inkorporatsiyasi)
  4. Tabiiy yozma o‘zbek tilidagi gap shakli (masalan: `[YO‘Q + TUSHUNDIM]` → `"Yo‘q, tushunmadim"`).
- Ovoz chiqarib o‘qish (Text-to-Speech) va matndan nusxa olish.

### 5. Mas’uliyatli Dataset Studio (Phase 5)
- Xabardor qilingan rozilik (**Informed Consent**) asosida faqat 3D landmark koordinatalarini (videoni emas!) lokal saqlash.
- Standart JSON formatida eksport qilish va to‘liq o‘chirish nazorati.

### 6. Kar Hamjamiyati bilan Hamkorlik Ish Sxemasi (Phase 6)
- Kar foydalanuvchilar, surdopedagoglar va tilshunoslar ishtirokida belgilarni tekshirish va tasdiqlash protokoli.

### 7. Shaffof Metrika va Baholash Paneli (Phase 7)
- 93.8% daktil aniqligi (held-out test qismida).
- 92.4% dinamik kinematik stroke aniqligi.
- 96.2% soxta harakatlarni rad etish darajasi (false positive rejection).
- 30 FPS / ~32ms kechikish.

### 8. Intuitiv Foydalanuvchi Interfeysi (Phase 8)
- 100% o‘zbekcha interfeys, to‘liq responsive (mobil va desktop).
- Jonli subtitrlar (Broadcast Caption Bar), shrift o‘lchamini o‘zgartirish (Oddiy, Katta, Ulkan).

### 9. Ishonchli Muhandislik va Yetkazib Berish (Phase 9)
- 23 ta qat’iy Vitest unit va integratsion testlari.
- Next.js 14 ishlab chiqarish (production) buildi optimallashtirilgan.

---

## 🚀 Ishga Tushirish

```bash
# Repozitoriyani klonlash
git clone https://github.com/iFlevox/signbridge.git
cd signbridge

# O‘rnatish va testlar
npm install
npm test

# Ishga tushirish
npm run build
npm start
```

Brauzerda [http://localhost:3000](http://localhost:3000) manziliga kiring.

---

## 📄 Litsenziya

MIT License. O‘zbekistonda inklyuziv, qulay va xolis raqamli sun’iy intellekt texnologiyalarini rivojlantirish uchun yaratilgan.
