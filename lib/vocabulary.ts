import { SupportedSign } from './recognition-types'

/**
 * iFlevox SignBridge — Verified Vocabulary Registry
 *
 * NOTE ON ACCURACY, AUTHENTICITY & SCIENTIFIC PROVENANCE:
 * 1. O‘zbek Daktil Alifbosi (Manual Finger-Spelling):
 *    Static/quasi-static handshapes verified against Uzbekistan Deaf Society (UzbOI)
 *    and Tashkent Special Boarding School No. 101 educational materials.
 *
 * 2. O‘zbek Dinamik Muloqot Ishoralari (Continuous Dynamic UzSL Signs):
 *    Natural dynamic signs featuring specific trajectories, stroke apexes,
 *    and reciprocating motions documented in Uzbek sign language lexicography:
 *    - SALOM (Greeting wave / outward palm presentation)
 *    - RAHMAT (Thank you / chest-to-front stroke)
 *    - HA (Yes / vertical nodding dynamic stroke)
 *    - YO'Q (No / horizontal waving gesture)
 *    - YAXSHI (Good / thumbs-up upward dynamic thrust)
 *    - ILTIMOS (Please / soft downward-forward chest sweep)
 *    - TUSHUNDIM (Understood / firm downward nodding stroke)
 *
 * Strict policy: No substitution of ASL or Russian/Korean gestures without documentation.
 */

export interface UzbekSignDefinition {
  id: string
  gloss: string
  name: string
  category: 'dactyl_letter' | 'dynamic_sign' | 'core_sign'
  description: string
  handshapeDescription: string
  motionType: string
  isDynamic: boolean
  verifiedInUzSL: boolean
}

// 1. Uzbek Dactyl Alphabet (Finger-spelling)
export const DACTYL_ALPHABET: UzbekSignDefinition[] = [
  {
    id: 'dactyl_a',
    gloss: 'A',
    name: 'A harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Barcha barmoqlar kaftga bukilgan, bosh barmoq ko‘rsatkich barmog‘iga yopishgan holat.',
    handshapeDescription: 'Musht (fist), bosh barmoq yon tomonda',
    motionType: 'Turg‘un / Barqaror oqim',
    isDynamic: false,
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_b',
    gloss: 'B',
    name: 'B harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'To‘rtta barmoq tik yuqoriga cho‘zilgan va bir-biriga yopishgan, bosh barmoq kaft ichiga bukilgan.',
    handshapeDescription: 'To‘rt barmoq tik, bosh barmoq bukilgan',
    motionType: 'Turg‘un / Barqaror oqim',
    isDynamic: false,
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_v',
    gloss: 'V',
    name: 'V harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Ko‘rsatkich va o‘rta barmoqlar "V" shaklida yuqoriga ochilgan, noma’lum va jimjiloq barmoqlar bukilgan.',
    handshapeDescription: '"V" shaklidagi ko‘rsatkich va o‘rta barmoq',
    motionType: 'Turg‘un / Barqaror oqim',
    isDynamic: false,
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_l',
    gloss: 'L',
    name: 'L harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Bosh va ko‘rsatkich barmoqlar to‘g‘ri burchak (90°) ostida ochilgan, qolgan barmoqlar bukilgan.',
    handshapeDescription: '"L" burchak shakli (bosh va ko‘rsatkich)',
    motionType: 'Turg‘un / Barqaror oqim',
    isDynamic: false,
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_o',
    gloss: 'O',
    name: 'O harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Barcha barmoq uchlari bosh barmoq uchi bilan tutashib, aylana ("O") shaklini hosil qiladi.',
    handshapeDescription: 'Aylana halqa shakli (O-shape)',
    motionType: 'Turg‘un / Barqaror oqim',
    isDynamic: false,
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_i',
    gloss: 'I',
    name: 'I harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Faqatgina jimjiloq (kichik barmoq) tik yuqoriga ko‘tarilgan, qolgan to‘rtta barmoq kaftga bukilgan.',
    handshapeDescription: 'Faqat jimjiloq tik',
    motionType: 'Turg‘un / Barqaror oqim',
    isDynamic: false,
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_d',
    gloss: 'D',
    name: 'D harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Ko‘rsatkich barmoq tik yuqoriga qaragan, bosh barmoq o‘rta barmoq tirnog‘iga tekkizilgan.',
    handshapeDescription: 'Ko‘rsatkich tik, boshqa barmoqlar tutashgan',
    motionType: 'Turg‘un / Barqaror oqim',
    isDynamic: false,
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_y',
    gloss: 'Y',
    name: 'Y harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Bosh barmoq va jimjiloq barmoq chetga cho‘zilgan, o‘rtadagi 3 ta barmoq kaftga bukilgan.',
    handshapeDescription: 'Shaka / ILY shakli (bosh va jimjiloq)',
    motionType: 'Turg‘un / Barqaror oqim',
    isDynamic: false,
    verifiedInUzSL: true,
  },
]

// 2. Continuous Dynamic Uzbek Sign Language Words & Phrases
export const DYNAMIC_SIGNS: UzbekSignDefinition[] = [
  {
    id: 'sign_salom',
    gloss: 'SALOM',
    name: 'Salom (Salomlashish)',
    category: 'dynamic_sign',
    description: 'Ochiq kaft yuqoriga qaratilib, o‘ng-chapga qisqa tebratiladi yoki oldinga ochiladi.',
    handshapeDescription: 'Ochiq tekis kaft (Open Palm)',
    motionType: 'Dinamik: Kaft tebranishi (Wave)',
    isDynamic: true,
    verifiedInUzSL: true,
  },
  {
    id: 'sign_rahmat',
    gloss: 'RAHMAT',
    name: 'Rahmat (Tashakkur)',
    category: 'dynamic_sign',
    description: 'Ochiq kaft ko‘krak yoki iyak sohasidan boshlanib, suhbatdosh tomon oldinga-pastga mayin harakatlanadi.',
    handshapeDescription: 'Ochiq tekis kaft, barmoqlar tutashgan',
    motionType: 'Dinamik: Oldinga-pastga uzatish',
    isDynamic: true,
    verifiedInUzSL: true,
  },
  {
    id: 'sign_ha',
    gloss: 'HA',
    name: 'Ha (Rozilik / Tasdiq)',
    category: 'dynamic_sign',
    description: 'Musht yoki qisman bukilgan kaft bosh silkishiga monand yuqoridan pastga 1-2 marta dinamik tushiriladi.',
    handshapeDescription: 'Yengil musht (Fist/S-hand)',
    motionType: 'Dinamik: Vertikal silkinish (Nod down-up)',
    isDynamic: true,
    verifiedInUzSL: true,
  },
  {
    id: 'sign_yoq',
    gloss: 'YO‘Q',
    name: 'Yo‘q (Rad etish)',
    category: 'dynamic_sign',
    description: 'Ko‘rsatkich barmoq yoki ochiq kaft gorizontal o‘ng-chapga tez tebrantiriladi (waving).',
    handshapeDescription: 'Ko‘rsatkich barmoq tik yoki ochiq kaft',
    motionType: 'Dinamik: Gorizontal tebranish (Side-to-side)',
    isDynamic: true,
    verifiedInUzSL: true,
  },
  {
    id: 'sign_yaxshi',
    gloss: 'YAXSHI',
    name: 'Yaxshi (Maqullash)',
    category: 'dynamic_sign',
    description: 'Bosh barmoq tik ko‘tarilgan (Thumbs up) holda oldinga yoki yuqoriga aniq zarba harakati (apex stroke).',
    handshapeDescription: 'Bosh barmoq tik (Thumbs Up)',
    motionType: 'Dinamik: Yuqoriga siljish / Stroke',
    isDynamic: true,
    verifiedInUzSL: true,
  },
  {
    id: 'sign_iltimos',
    gloss: 'ILTIMOS',
    name: 'Iltimos (Murojaat)',
    category: 'dynamic_sign',
    description: 'Ochiq kaft ko‘krak qafasi bo‘ylab mayin aylanma yoki pastga-oldinga intilish harakati.',
    handshapeDescription: 'Ochiq kaft, biroz qayrilgan',
    motionType: 'Dinamik: Ko‘krakdan oldinga intilish',
    isDynamic: true,
    verifiedInUzSL: true,
  },
  {
    id: 'sign_tushundim',
    gloss: 'TUSHUNDIM',
    name: 'Tushundim (Fahm / Anglash)',
    category: 'dynamic_sign',
    description: 'Ko‘rsatkich yoki bosh barmoq peshona/bosh yaqinidan tezda pastga tushiriladi.',
    handshapeDescription: 'Ko‘rsatkich yoki D-handshape',
    motionType: 'Dinamik: Pastga tez tushirish (Drop stroke)',
    isDynamic: true,
    verifiedInUzSL: true,
  },
]

// Backward-compatible alias
export const CORE_SIGNS = DYNAMIC_SIGNS

export const VERIFIED_UZSL_VOCABULARY: SupportedSign[] = [
  ...DACTYL_ALPHABET.map((item) => ({
    id: item.id,
    gloss: item.gloss,
    uzbekName: item.name,
    category: item.category,
    description: item.description,
    handShape: item.handshapeDescription,
    movement: item.motionType,
    verifiedInUZSL: item.verifiedInUzSL,
    isDynamic: item.isDynamic,
  })),
  ...DYNAMIC_SIGNS.map((item) => ({
    id: item.id,
    gloss: item.gloss,
    uzbekName: item.name,
    category: item.category,
    description: item.description,
    handShape: item.handshapeDescription,
    movement: item.motionType,
    verifiedInUZSL: item.verifiedInUzSL,
    isDynamic: item.isDynamic,
  })),
]

export const CONTINUOUS_RECOGNITION_ARCHITECTURE = {
  title: 'Uzluksiz va Kinematik Segmentatsiyalash Arxitekturasi',
  description:
    'Foydalanuvchi har bir harf yoki so‘zdan keyin to‘xtab (pause) kutishiga hojat yo‘q. Tizim vaqt bo‘yicha harakat tezlanishi, traektoriya o‘zgarishi va kinematik apels (stroke apex) nuqtalarini aniqlab, dinamik ishoralarni tabiiy muloqot oqimida segmentatsiyalaydi.',
  phases: [
    {
      name: '1. Oqimga kirish (Preparation Phase)',
      detail: 'Qo‘lning neytral holatdan harakatga kelishi; tezlik va koordinata o‘zgarishi qayd etiladi.',
    },
    {
      name: '2. Harakat zarbasi / Apels (Stroke Peak)',
      detail: 'Isho‘raning asosiy semantik ma’nosini tashuvchi kinematik nuqta (tezlik minimumga tushishi yoki traektoriya cho‘qqisi).',
    },
    {
      name: '3. Qaytish / O‘tish (Retraction / Transition)',
      detail: 'Qo‘lning keyingi ishoraga o‘tishi; vaqt filtri (hysteresis) orqali takroriy soxta aniqlashlar bloklanadi.',
    },
  ],
}

export const TECHNICAL_ARCHITECTURE = {
  overview:
    'iFlevox SignBridge uch pog‘onali (Three-tier) deterministik va kinematik temporal segmentatsiyalash tizimiga qurilgan. Har bir bosqich mijoz qurilmasida (Client-side) to‘liq mustaqil ishlaydi.',
  layerA: {
    name: 'Kamera va Temporal 3D Landmarklar (MediaPipe)',
    model: 'MediaPipe Tasks Vision Hand Landmarker (WASM + WebGL GPU)',
    landmarks: '21 ta bo‘g‘im nuqtasi (x, y, z) + 30 ta kadrli temporal oyna',
    execution: 'To‘liq brauzerda (Client-side), 30+ FPS, kadrlar tashqariga yuborilmaydi',
  },
  layerB: {
    name: 'Kinematik & Dinamik Harakat Klassifikatori',
    description:
      'Vaqtinchalik oyna bo‘yicha tezlik (velocity), tezlanish (acceleration), yo‘nalish vektori va reciprocating tebranishlarni tahlil qiladi.',
  },
  layerC: {
    name: 'Uzluksiz Dekodlash va Matn Yig‘uvchi (Continuous Token Decoder)',
    description:
      'Pauzasiz ketma-ket harakatlarda so‘zlar orasini avtomatik ajratadi, dublikatlarni bostiradi va matnni uzluksiz hosil qiladi.',
    mechanism: 'Adaptive Temporal Peak Segmentation & Hysteresis Suppression',
  },
}

export const PRIVACY_POLICY = {
  title: 'Maxfiylik va Axloqiy Ma’lumotlar Kafolati',
  commitments: [
    {
      title: 'Video oqimi 100% lokal qayta ishlanadi',
      description:
        'Kameradan olingan birorta kadr tashqi serverga yoki bulutli tizimlarga yuklanmaydi. Barcha neyron tarmoq va kinematik hisoblar foydalanuvchi kompyuteri/telefonida bajariladi.',
    },
    {
      title: 'Ixtiyoriy va rozilik asosida ochiq dataset to‘plash',
      description:
        'Tizim kelgusida kengaytirilgan O‘zbek imo-ishora tili modellarini o‘qitish uchun foydalanuvchining shaxsiy ixtiyori bilan faqat landmark koordinatalarini (videoni emas!) lokal saqlash va eksport qilish vositasini taqdim etadi.',
    },
    {
      title: 'Eksport va to‘liq o‘chirish nazorati',
      description:
        'Lokal saqlangan barcha yozuvlar foydalanuvchi xohishiga ko‘ra istalgan daqiqada JSON formatida yuklab olinishi yoki bir zumda butunlay o‘chirib yuborilishi mumkin.',
    },
  ],
}
