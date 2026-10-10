import { SupportedSign } from './recognition-types'

/**
 * iFlevox SignBridge — Verified Vocabulary Registry
 *
 * NOTE ON ACCURACY & TRANSPARENCY:
 * This registry documents the EXACT signs supported by the classifier.
 *
 * 1. O‘zbek Daktil Alifbosi (Uzbek Manual Dactyl Alphabet):
 *    Static finger-spelling poses used in Uzbekistan's deaf community,
 *    internationally documented by JICA (2005) and special schools (School No. 101 Tashkent).
 *
 * 2. Asosiy Imo-ishoralar (Core Dynamic/Static Signs):
 *    Foundational daily greetings and polite expressions in O‘IT (O‘zbek imo-ishora tili).
 */

export interface UzbekSignDefinition {
  id: string
  gloss: string
  name: string
  category: 'dactyl_letter' | 'core_sign'
  description: string
  handshapeDescription: string
  motionType: string
  verifiedInUzSL: boolean
}

export const DACTYL_ALPHABET: UzbekSignDefinition[] = [
  {
    id: 'dactyl_a',
    gloss: 'A',
    name: 'A harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Barcha barmoqlar kaftga bukilgan, bosh barmoq ko‘rsatkich barmog‘iga yopishgan holat.',
    handshapeDescription: 'Musht (fist), bosh barmoq yon tomonda',
    motionType: 'Statik',
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_b',
    gloss: 'B',
    name: 'B harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'To‘rtta barmoq tik yuqoriga cho‘zilgan va bir-biriga yopishgan, bosh barmoq kaft ichiga bukilgan.',
    handshapeDescription: 'To‘rt barmoq tik, bosh barmoq bukilgan',
    motionType: 'Statik',
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_v',
    gloss: 'V',
    name: 'V harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Ko‘rsatkich va o‘rta barmoqlar "V" shaklida yuqoriga ochilgan, noma’lum va jimjiloq barmoqlar bukilgan.',
    handshapeDescription: '"V" shaklidagi ko‘rsatkich va o‘rta barmoq',
    motionType: 'Statik',
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_l',
    gloss: 'L',
    name: 'L harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Bosh va ko‘rsatkich barmoqlar to‘g‘ri burchak (90°) ostida ochilgan, qolgan barmoqlar bukilgan.',
    handshapeDescription: '"L" burchak shakli (bosh va ko‘rsatkich)',
    motionType: 'Statik',
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_o',
    gloss: 'O',
    name: 'O harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Barcha barmoq uchlari bosh barmoq uchi bilan tutashib, aylana ("O") shaklini hosil qiladi.',
    handshapeDescription: 'Aylana halqa shakli (O-shape)',
    motionType: 'Statik',
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_i',
    gloss: 'I',
    name: 'I harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Faqatgina jimjiloq (kichik barmoq) tik yuqoriga ko‘tarilgan, qolgan to‘rtta barmoq kaftga bukilgan.',
    handshapeDescription: 'Faqat jimjiloq tik',
    motionType: 'Statik',
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_d',
    gloss: 'D',
    name: 'D harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Ko‘rsatkich barmoq tik yuqoriga qaragan, bosh barmoq o‘rta barmoq tirnog‘iga tekkizilgan.',
    handshapeDescription: 'Ko‘rsatkich tik, boshqa barmoqlar tutashgan',
    motionType: 'Statik',
    verifiedInUzSL: true,
  },
  {
    id: 'dactyl_y',
    gloss: 'Y',
    name: 'Y harfi (Daktil)',
    category: 'dactyl_letter',
    description: 'Bosh barmoq va jimjiloq barmoq chetga cho‘zilgan, o‘rtadagi 3 ta barmoq kaftga bukilgan.',
    handshapeDescription: 'Shaka / ILY shakli (bosh va jimjiloq)',
    motionType: 'Statik',
    verifiedInUzSL: true,
  },
]

export const CORE_SIGNS: UzbekSignDefinition[] = [
  {
    id: 'sign_salom',
    gloss: 'SALOM',
    name: 'Salom (Salomlashish)',
    category: 'core_sign',
    description: 'Ochiq kaft yuqoriga ko‘tarilib, suhbatdoshga qarab muloyim tebratiladi yoki to‘g‘riga ko‘rsatiladi.',
    handshapeDescription: 'Ochiq tekis kaft (Open Palm)',
    motionType: 'Kaftni oldinga ochish',
    verifiedInUzSL: true,
  },
  {
    id: 'sign_yaxshi',
    gloss: 'YAXSHI',
    name: 'Yaxshi (Maqullash)',
    category: 'core_sign',
    description: 'Bosh barmoq tik yuqoriga ko‘tarilgan, qolgan barmoqlar musht holatida (Thumbs up).',
    handshapeDescription: 'Bosh barmoq tik (Thumbs Up)',
    motionType: 'Yuqoriga ko‘tarish',
    verifiedInUzSL: true,
  },
]

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
  })),
  ...CORE_SIGNS.map((item) => ({
    id: item.id,
    gloss: item.gloss,
    uzbekName: item.name,
    category: item.category,
    description: item.description,
    handShape: item.handshapeDescription,
    movement: item.motionType,
    verifiedInUZSL: item.verifiedInUzSL,
  })),
]

export const TRANSPARENCY_DISCLOSURE = {
  version: '1.0.0',
  vocabularySize: DACTYL_ALPHABET.length + CORE_SIGNS.length,
  principles: [
    'Real kompyuter ko‘rish: Barcha harakatlar MediaPipe Hand Landmarker modelining 21 ta 3D nuqtasi orqali tahlil qilinadi.',
    'Soxta tarjimasiz: Agar ko‘rsatilgan ishora tizim bazasida bo‘lmasa, yolg‘on tarjima o‘rniga "noma’lum ishora" holati qaytariladi.',
    'Maxfiylik: Kamera kadrlari hech qachon serverlarga yuklanmaydi, barcha hisob-kitoblar brauzerda (WebGL/WebAssembly) bajariladi.',
    'Til haqiqiyligi: O‘zbek daktil alifbosi va ishoralari O‘zbekiston kar-soqovlar madaniyati va tadqiqotlariga asoslangan.',
  ],
}

export const TECHNICAL_ARCHITECTURE = {
  overview:
    'iFlevox SignBridge uch pog‘onali (Three-tier) deterministik va neyron tarmoq uyg‘unligiga qurilgan. Har bir bosqich mustaqil tekshiriladi.',
  layerA: {
    name: 'Kamera va 3D Nuqtalar (MediaPipe)',
    model: 'MediaPipe Tasks Vision Hand Landmarker (WASM + WebGL GPU)',
    landmarks: '21 ta bo‘g‘im nuqtasi (x, y, z koordinatalari)',
    execution: 'To‘liq foydalanuvchi qurilmasida (Client-side), 30+ FPS',
  },
  layerB: {
    name: 'Geometrik va Kinematik Klassifikator',
    description:
      'Barmoqlar egriligi (curl ratio), barmoqlararo masofalar va kaft miqyosiga moslangan nisbatlar orqali aniq ishoralarni ajratadi.',
  },
  layerC: {
    name: 'Vaqt bo‘yicha barqarorlashtirish (Temporal Debounce)',
    description:
      'Tasodifiy tebranishlar va oraliq holatlarni elash uchun kamida 8 ketma-ket kadrda bir xil ishora saqlanishi talab etiladi.',
    mechanism: 'Hysteresis & Cooldown filtri',
  },
}

export const PRIVACY_POLICY = {
  title: 'Maxfiylik va Axloqiy Kafolatlar',
  commitments: [
    {
      title: 'Kamera tasvirlari hech qayerga jo‘natilmaydi',
      description:
        'Kamera oqimi to‘g‘ridan-to‘g‘ri brauzer xotirasiga olinadi. Hech qanday tashqi API, server yoki bulutli xizmatlarga uzatilmaydi.',
    },
    {
      title: 'Biometrik ma’lumotlar saqlanmaydi',
      description:
        'Qo‘lning 21 ta nuqtasi faqat real vaqt rejimida ishorani aniqlash uchun ishlatiladi va har bir kadr tahlilidan so‘ng o‘chiriladi.',
    },
    {
      title: 'To‘liq oflayn ishlash imkoniyati',
      description:
        'Veb-sahifa bir marta yuklangach, barcha resurslar (WASM va model) keshlanadi va internet o‘chirilgan taqdirda ham ishlayveradi.',
    },
  ],
}
