import { SupportedSign } from './recognition-types'

/**
 * iFlevox SignBridge — Comprehensive Uzbek Sign Language (UzSL) Vocabulary Database
 *
 * Version: 2.0.0
 * Linguistic Structure:
 * - Dactyl manual alphabet (Finger-spelling)
 * - Authentic everyday dynamic signs (Greetings, Politeness, Education, Health, Emergency, Food, Family)
 * - Non-manual markers (Facial expressions, Head nods, Posture)
 * - Domain organization & Regional variants (Toshkent, Farg'ona, Samarqand)
 * - Strict verification tiers: 'verified_primary', 'verified_secondary', 'provisional'
 */

export interface UzSLSignEntry {
  id: string
  gloss: string
  uzbekName: string
  category: 'dactyl_letter' | 'dynamic_sign' | 'core_sign' | 'custom_prototype'
  domain:
    | 'dactyl'
    | 'greetings'
    | 'polite_conversation'
    | 'education_school'
    | 'health_emergency'
    | 'family_people'
    | 'food_daily'
    | 'weather_nature'
    | 'travel_places'
    | 'work_services'

  description: string
  linguisticNotes: string
  grammaticalCategory: 'noun' | 'verb' | 'adjective' | 'interjection' | 'letter' | 'particle'

  dominantHandShape: string
  nonDominantHandShape?: string
  twoHanded: boolean
  motionTrajectory: string
  facialAndBodyExpression?: string
  regionalVariants?: string

  verificationTier: 'verified_primary' | 'verified_secondary' | 'provisional'
  sourceReference: string
  isDynamic: boolean
  isSupportedInCurrentModel: boolean // Strictly true ONLY if implemented in real-time classifier
}

export const UZSL_COMPREHENSIVE_VOCABULARY: UzSLSignEntry[] = [
  // ==========================================
  // 1. O‘ZBEK DAKTIL ALIFBOSI (FINGER-SPELLING)
  // ==========================================
  {
    id: 'dactyl_a',
    gloss: 'A',
    uzbekName: 'A harfi (Daktil)',
    category: 'dactyl_letter',
    domain: 'dactyl',
    description: 'Barcha barmoqlar kaftga bukilgan, bosh barmoq ko‘rsatkich barmog‘iga yopishgan holat.',
    linguisticNotes: 'O‘zbek daktil alifbosi asosi; ismlar, chet so‘zlar va abreviaturalarni harflab aytish uchun ishlatiladi.',
    grammaticalCategory: 'letter',
    dominantHandShape: 'Musht (fist), bosh barmoq yonboshda',
    twoHanded: false,
    motionTrajectory: 'Turg‘un / Oqimli',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & 101-maktab ta’lim standarti',
    isDynamic: false,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'dactyl_b',
    gloss: 'B',
    uzbekName: 'B harfi (Daktil)',
    category: 'dactyl_letter',
    domain: 'dactyl',
    description: 'To‘rtta barmoq tik yuqoriga cho‘zilgan va bir-biriga yopishgan, bosh barmoq kaft ichiga bukilgan.',
    linguisticNotes: 'To‘rt barmoq bir-biriga zich turishi lozim; ochiq yoyilmasligi shart.',
    grammaticalCategory: 'letter',
    dominantHandShape: 'To‘rt barmoq tik, bosh barmoq bukilgan',
    twoHanded: false,
    motionTrajectory: 'Turg‘un / Oqimli',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & 101-maktab ta’lim standarti',
    isDynamic: false,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'dactyl_v',
    gloss: 'V',
    uzbekName: 'V harfi (Daktil)',
    category: 'dactyl_letter',
    domain: 'dactyl',
    description: 'Ko‘rsatkich va o‘rta barmoqlar "V" shaklida yuqoriga ochilgan, noma’lum va jimjiloq barmoqlar bukilgan.',
    linguisticNotes: 'Barmoqlar orasi aniq 30-45 daraja ochiq bo‘lishi lozim.',
    grammaticalCategory: 'letter',
    dominantHandShape: '"V" shaklidagi ko‘rsatkich va o‘rta barmoq',
    twoHanded: false,
    motionTrajectory: 'Turg‘un / Oqimli',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & 101-maktab ta’lim standarti',
    isDynamic: false,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'dactyl_l',
    gloss: 'L',
    uzbekName: 'L harfi (Daktil)',
    category: 'dactyl_letter',
    domain: 'dactyl',
    description: 'Bosh va ko‘rsatkich barmoqlar to‘g‘ri burchak (90°) ostida ochilgan, qolgan barmoqlar bukilgan.',
    linguisticNotes: 'Lotin "L" harfi konturini to‘liq takrorlaydi.',
    grammaticalCategory: 'letter',
    dominantHandShape: '"L" burchak shakli (bosh va ko‘rsatkich)',
    twoHanded: false,
    motionTrajectory: 'Turg‘un / Oqimli',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & 101-maktab ta’lim standarti',
    isDynamic: false,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'dactyl_o',
    gloss: 'O',
    uzbekName: 'O harfi (Daktil)',
    category: 'dactyl_letter',
    domain: 'dactyl',
    description: 'Barcha barmoq uchlari bosh barmoq uchi bilan tutashib, aylana ("O") shaklini hosil qiladi.',
    linguisticNotes: 'Aylana shakli aniq ko‘rinishi uchun kaft suhbatdoshga biroz qiya tutiladi.',
    grammaticalCategory: 'letter',
    dominantHandShape: 'Aylana halqa shakli (O-shape)',
    twoHanded: false,
    motionTrajectory: 'Turg‘un / Oqimli',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & 101-maktab ta’lim standarti',
    isDynamic: false,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'dactyl_i',
    gloss: 'I',
    uzbekName: 'I harfi (Daktil)',
    category: 'dactyl_letter',
    domain: 'dactyl',
    description: 'Faqatgina jimjiloq (kichik barmoq) tik yuqoriga ko‘tarilgan, qolgan to‘rtta barmoq kaftga bukilgan.',
    linguisticNotes: 'Jimjiloq tik va tarang turishi kerak.',
    grammaticalCategory: 'letter',
    dominantHandShape: 'Faqat jimjiloq tik',
    twoHanded: false,
    motionTrajectory: 'Turg‘un / Oqimli',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & 101-maktab ta’lim standarti',
    isDynamic: false,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'dactyl_d',
    gloss: 'D',
    uzbekName: 'D harfi (Daktil)',
    category: 'dactyl_letter',
    domain: 'dactyl',
    description: 'Ko‘rsatkich barmoq tik yuqoriga qaragan, bosh barmoq o‘rta barmoq tirnog‘iga tekkizilgan.',
    linguisticNotes: 'Ko‘rsatkich barmoq boshqa barmoqlardan alohida tiklanadi.',
    grammaticalCategory: 'letter',
    dominantHandShape: 'Ko‘rsatkich tik, boshqa barmoqlar tutashgan',
    twoHanded: false,
    motionTrajectory: 'Turg‘un / Oqimli',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & 101-maktab ta’lim standarti',
    isDynamic: false,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'dactyl_y',
    gloss: 'Y',
    uzbekName: 'Y harfi (Daktil)',
    category: 'dactyl_letter',
    domain: 'dactyl',
    description: 'Bosh barmoq va jimjiloq barmoq chetga cho‘zilgan, o‘rtadagi 3 ta barmoq kaftga bukilgan.',
    linguisticNotes: 'Shaka shakliga o‘xshash, ammo kaft oldinga qaragan.',
    grammaticalCategory: 'letter',
    dominantHandShape: 'Shaka / ILY shakli (bosh va jimjiloq)',
    twoHanded: false,
    motionTrajectory: 'Turg‘un / Oqimli',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & 101-maktab ta’lim standarti',
    isDynamic: false,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'dactyl_t',
    gloss: 'T',
    uzbekName: 'T harfi (Daktil)',
    category: 'dactyl_letter',
    domain: 'dactyl',
    description: 'Bosh barmoq ko‘rsatkich va o‘rta barmoqlar oralig‘idan tashqariga chiqarilgan musht holati.',
    linguisticNotes: 'Barmoqlar zich qisiladi.',
    grammaticalCategory: 'letter',
    dominantHandShape: 'Musht ichidan bosh barmoq ko‘rsatilgan',
    twoHanded: false,
    motionTrajectory: 'Turg‘un',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI daktil jadvallari',
    isDynamic: false,
    isSupportedInCurrentModel: false, // Modelda hali o‘rgatilmagan, halol belgilash
  },
  {
    id: 'dactyl_sh',
    gloss: 'SH',
    uzbekName: 'Sh harfi (Daktil)',
    category: 'dactyl_letter',
    domain: 'dactyl',
    description: 'Uch barmoq (ko‘rsatkich, o‘rta, noma’lum) yuqoriga "W" shaklida ko‘tarilgan.',
    linguisticNotes: 'O‘zbek daktil alifbosidagi maxsus digraf harf.',
    grammaticalCategory: 'letter',
    dominantHandShape: 'Uch barmoq tik',
    twoHanded: false,
    motionTrajectory: 'Turg‘un',
    verificationTier: 'verified_primary',
    sourceReference: '101-maktab daktilologiya dasturi',
    isDynamic: false,
    isSupportedInCurrentModel: false,
  },

  // ==========================================
  // 2. KUNDALIK MULOQOT VA SALOMLASHUV (GREETINGS & POLITE)
  // ==========================================
  {
    id: 'sign_salom',
    gloss: 'SALOM',
    uzbekName: 'Salom (Salomlashish)',
    category: 'dynamic_sign',
    domain: 'greetings',
    description: 'Ochiq kaft suhbatdoshga qaratilib, o‘ng-chapga qisqa tebratiladi yoki ko‘krakdan oldinga ochiladi.',
    linguisticNotes: 'Rasmiy va do‘stona muloqotda universal; yuzda samimiy tabassum talab etiladi.',
    grammaticalCategory: 'interjection',
    dominantHandShape: 'Ochiq tekis kaft (Open B-palm)',
    twoHanded: false,
    motionTrajectory: 'Dinamik: Kaft tebranishi (Wave)',
    facialAndBodyExpression: 'Yengil tabassum, ko‘z kontakti',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & UzSLR-50 tadqiqoti',
    isDynamic: true,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'sign_assalomu_alaykum',
    gloss: 'ASSALOMU_ALAYKUM',
    uzbekName: 'Assalomu alaykum (Rasmiy salom)',
    category: 'dynamic_sign',
    domain: 'greetings',
    description: 'O‘ng qo‘l kafti ko‘krakning chap tomoniga (yurakka) qo‘yilib, bosh yengil egiladi.',
    linguisticNotes: 'O‘zbek milliy odob-axloqiga xos eng hurmatli salomlashish shakli.',
    grammaticalCategory: 'interjection',
    dominantHandShape: 'Yassi tekis kaft',
    twoHanded: false,
    motionTrajectory: 'Ko‘krak sohasiga mayin qo‘yish',
    facialAndBodyExpression: 'Hurmat ifodasi, yengil ta’zim (head bow)',
    regionalVariants: 'Farg‘ona vodiysida ikki qo‘llab ko‘krakka qo‘yish varianti ham mavjud',
    verificationTier: 'verified_primary',
    sourceReference: '101-maktab milliy madaniyat kursi & UzSLR-50',
    isDynamic: true,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'sign_rahmat',
    gloss: 'RAHMAT',
    uzbekName: 'Rahmat (Minnatdorchilik)',
    category: 'dynamic_sign',
    domain: 'polite_conversation',
    description: 'Ochiq kaft ko‘krak yoki iyak sohasidan boshlanib, suhbatdosh tomon oldinga-pastga mayin uzatiladi.',
    linguisticNotes: 'Tashakkur bildirish; imo-ishora tezligi hissiyot kuchini ko‘rsatadi.',
    grammaticalCategory: 'interjection',
    dominantHandShape: 'Ochiq tekis kaft, barmoqlar tutash',
    twoHanded: false,
    motionTrajectory: 'Oldinga-pastga uzatish (Forward stroke)',
    facialAndBodyExpression: 'Boshni yengil egish, minnatdor nigoh',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & 101-maktab amaliy lug‘ati',
    isDynamic: true,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'sign_ha',
    gloss: 'HA',
    uzbekName: 'Ha (Rozilik / Tasdiq)',
    category: 'dynamic_sign',
    domain: 'polite_conversation',
    description: 'Musht yoki qisman bukilgan kaft yuqoridan pastga 1-2 marta qat’iy silkitiladi.',
    linguisticNotes: 'Bosh irg‘ash (nodding) harakati bilan sinxron bajarilishi tabiiylikni oshiradi.',
    grammaticalCategory: 'particle',
    dominantHandShape: 'Yengil musht (S-hand)',
    twoHanded: false,
    motionTrajectory: 'Vertikal silkinish (Nod down-up)',
    facialAndBodyExpression: 'Boshni pastga silkish (Affirmative nod)',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI lug‘ati',
    isDynamic: true,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'sign_yoq',
    gloss: 'YO‘Q',
    uzbekName: 'Yo‘q (Rad etish)',
    category: 'dynamic_sign',
    domain: 'polite_conversation',
    description: 'Ko‘rsatkich barmoq yoki ochiq kaft gorizontal o‘ng-chapga tez tebrantiriladi.',
    linguisticNotes: 'Boshni ikki tomonga chayqash (head shake) bilan to‘ldiriladi.',
    grammaticalCategory: 'particle',
    dominantHandShape: 'Ko‘rsatkich barmoq tik yoki ochiq kaft',
    twoHanded: false,
    motionTrajectory: 'Gorizontal tebranish (Side-to-side)',
    facialAndBodyExpression: 'Boshni ikki tomonga silkish, lablarni qisish',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI lug‘ati',
    isDynamic: true,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'sign_yaxshi',
    gloss: 'YAXSHI',
    uzbekName: 'Yaxshi (Maqullash / Sifat)',
    category: 'dynamic_sign',
    domain: 'polite_conversation',
    description: 'Bosh barmoq tik ko‘tarilgan (Thumbs up) holda oldinga yoki yuqoriga aniq zarba beriladi.',
    linguisticNotes: 'Ham ma’qullash (OK), ham sifat (yaxshi bola, yaxshi ish) ma’nosida ishlatiladi.',
    grammaticalCategory: 'adjective',
    dominantHandShape: 'Bosh barmoq tik (Thumbs Up)',
    twoHanded: false,
    motionTrajectory: 'Yuqoriga siljish / Stroke',
    facialAndBodyExpression: 'Ma’qullovchi nigoh, yengil qosh ko‘tarish',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & UzSLR-50',
    isDynamic: true,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'sign_iltimos',
    gloss: 'ILTIMOS',
    uzbekName: 'Iltimos (Murojaat)',
    category: 'dynamic_sign',
    domain: 'polite_conversation',
    description: 'Ochiq kaft ko‘krak qafasi sohasida mayin aylanma yoki oldinga intilish harakati.',
    linguisticNotes: 'Murojaat va iltimos ohangi yuz ifodasi orqali kuchaytiriladi.',
    grammaticalCategory: 'particle',
    dominantHandShape: 'Ochiq kaft, biroz qayrilgan',
    twoHanded: false,
    motionTrajectory: 'Mayin aylanma harakat',
    facialAndBodyExpression: 'Ochilib qarash, umidvor ifoda',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & UzSLR-50',
    isDynamic: true,
    isSupportedInCurrentModel: true,
  },
  {
    id: 'sign_tushundim',
    gloss: 'TUSHUNDIM',
    uzbekName: 'Tushundim (Fahm / Anglash)',
    category: 'dynamic_sign',
    domain: 'polite_conversation',
    description: 'Ko‘rsatkich yoki bosh barmoq peshona/bosh yaqinidan tezda pastga tushiriladi.',
    linguisticNotes: '"Fikrimga yetib keldi" degan metaforik ma’noni ifodalaydi.',
    grammaticalCategory: 'verb',
    dominantHandShape: 'Ko‘rsatkich yoki D-handshape',
    twoHanded: false,
    motionTrajectory: 'Pastga tez tushirish (Drop stroke)',
    facialAndBodyExpression: 'Boshni bir marta qat’iy tushirish',
    verificationTier: 'verified_primary',
    sourceReference: '101-maktab darsliklari',
    isDynamic: true,
    isSupportedInCurrentModel: true,
  },

  // ==========================================
  // 3. TA’LIM VA MAKTAB (EDUCATION & SCHOOL)
  // ==========================================
  {
    id: 'sign_maktab',
    gloss: 'MAKTAB',
    uzbekName: 'Maktab (Ta’lim dargohi)',
    category: 'dynamic_sign',
    domain: 'education_school',
    description: 'Ikki qo‘l kaftlari bir-biriga qarama-qarshi qo‘yilib, kitob ochilishini ifodalaydi.',
    linguisticNotes: 'UzSL maktablarida o‘quv jarayonidagi eng asosiy so‘z.',
    grammaticalCategory: 'noun',
    dominantHandShape: 'Ochiq tekis kaft',
    nonDominantHandShape: 'Ochiq tekis kaft',
    twoHanded: true,
    motionTrajectory: 'Kaftlarni kitob kabi ochish',
    facialAndBodyExpression: 'Neytral jiddiy ifoda',
    verificationTier: 'verified_secondary',
    sourceReference: 'UzSLR-50 (#maktab) & 101-maktab',
    isDynamic: true,
    isSupportedInCurrentModel: false, // Kelgusi 2-qo‘lli modelga rejalashtirilgan
  },
  {
    id: 'sign_kitob',
    gloss: 'KITOB',
    uzbekName: 'Kitob',
    category: 'dynamic_sign',
    domain: 'education_school',
    description: 'Kaftlar yonma-yon tutashtirilib, kitob sahifasi kabi ochib-yopiladi.',
    linguisticNotes: 'Ikki qo‘lli simmetrik ishora.',
    grammaticalCategory: 'noun',
    dominantHandShape: 'Yassi kaft',
    nonDominantHandShape: 'Yassi kaft',
    twoHanded: true,
    motionTrajectory: 'Kaftlarni ochib-yopish',
    verificationTier: 'verified_secondary',
    sourceReference: 'UzSLR-50 (#kitob)',
    isDynamic: true,
    isSupportedInCurrentModel: false,
  },

  // ==========================================
  // 4. SALOMATLIK VA FAVQULODDA (HEALTH & EMERGENCY)
  // ==========================================
  {
    id: 'sign_yordam',
    gloss: 'YORDAM',
    uzbekName: 'Yordam (Ko‘mak berish / Qutqarish)',
    category: 'dynamic_sign',
    domain: 'health_emergency',
    description: 'Bir qo‘l musht holida pastdagi ochiq kaft ustiga qo‘yilib, ikkalasi birgalikda yuqoriga/oldinga ko‘tariladi.',
    linguisticNotes: 'Favqulodda va shoshilinch yordam so‘rashda baland ko‘tariladi.',
    grammaticalCategory: 'noun',
    dominantHandShape: 'Musht (dominant)',
    nonDominantHandShape: 'Kaft tayanchi (non-dominant)',
    twoHanded: true,
    motionTrajectory: 'Ko‘tarilish va oldinga uzatish',
    facialAndBodyExpression: 'Jiddiy, chaqiruvchi nigoh',
    verificationTier: 'verified_secondary',
    sourceReference: 'UzSLR-50 (#yordam_berish) & FVV tavsiyalari',
    isDynamic: true,
    isSupportedInCurrentModel: false,
  },
  {
    id: 'sign_shifoxona',
    gloss: 'SHIFOXONA',
    uzbekName: 'Shifoxona (Doktorxona)',
    category: 'dynamic_sign',
    domain: 'health_emergency',
    description: 'Ko‘rsatkich va o‘rta barmoq yelkada yoki peshonada qizil xoch shaklini chizadi.',
    linguisticNotes: 'Tibbiyot, tez yordam va doktor tushunchalari bilan bog‘liq.',
    grammaticalCategory: 'noun',
    dominantHandShape: 'Xoch chizuvchi barmoqlar',
    twoHanded: false,
    motionTrajectory: 'Xoch harakati (kesishish)',
    facialAndBodyExpression: 'Tashvishli yoki xabardor ifoda',
    verificationTier: 'provisional',
    sourceReference: 'UzbOI tibbiy lug‘at qoralamasi',
    isDynamic: true,
    isSupportedInCurrentModel: false,
  },

  // ==========================================
  // 5. OILA VA INSONLAR (FAMILY & PEOPLE)
  // ==========================================
  {
    id: 'sign_ota',
    gloss: 'OTA',
    uzbekName: 'Ota (Dada)',
    category: 'dynamic_sign',
    domain: 'family_people',
    description: 'Bosh barmoq iyak yoki lab usti (mo‘ylov) sohasiga tekkizilib, tashqariga uzatiladi.',
    linguisticNotes: 'Erkaklik belgisi — mo‘ylov chizig‘i bilan metaforik bog‘langan.',
    grammaticalCategory: 'noun',
    dominantHandShape: 'L-shakli yoki bosh barmoq',
    twoHanded: false,
    motionTrajectory: 'Iyakdan oldinga',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & 101-maktab',
    isDynamic: true,
    isSupportedInCurrentModel: false,
  },
  {
    id: 'sign_ona',
    gloss: 'ONA',
    uzbekName: 'Ona (Aya)',
    category: 'dynamic_sign',
    domain: 'family_people',
    description: 'Kaft yoki barmoq yonoq yoki iyak ostiga (ro‘mol bog‘lash sohasi) mayin tekkiziladi.',
    linguisticNotes: 'Ayollik belgisi — ro‘mol yoki sirg‘a bilan bog‘liq an’anaviy ishora.',
    grammaticalCategory: 'noun',
    dominantHandShape: 'Yumshoq ochiq kaft',
    twoHanded: false,
    motionTrajectory: 'Yonoqqa tekkizish',
    facialAndBodyExpression: 'Mehrli mayin ifoda',
    verificationTier: 'verified_primary',
    sourceReference: 'UzbOI & 101-maktab',
    isDynamic: true,
    isSupportedInCurrentModel: false,
  },

  // ==========================================
  // 6. OB-HAVO VA TABIAT (WEATHER & NATURE)
  // ==========================================
  {
    id: 'sign_yomgir',
    gloss: 'YOMG‘IR',
    uzbekName: 'Yomg‘ir',
    category: 'dynamic_sign',
    domain: 'weather_nature',
    description: 'Har ikkala qo‘l barmoqlari pastga qarab mayin tebrangan holda yuqoridan pastga tushiriladi.',
    linguisticNotes: 'Tomchilar yog‘ishini tasvirlovchi ikonik ishora.',
    grammaticalCategory: 'noun',
    dominantHandShape: 'Egilgan barmoqlar tebranishi',
    twoHanded: true,
    motionTrajectory: 'Yuqoridan pastga tushish',
    verificationTier: 'verified_secondary',
    sourceReference: 'UzSLR-50 (#yomg_ir)',
    isDynamic: true,
    isSupportedInCurrentModel: false,
  },
  {
    id: 'sign_qor',
    gloss: 'QOR',
    uzbekName: 'Qor',
    category: 'dynamic_sign',
    domain: 'weather_nature',
    description: 'Kaftlar ochiq sekin aylanma tebranish bilan pastga tushadi (qor parchalari parvozi).',
    linguisticNotes: 'Yomg‘irga nisbatan sekinroq va yumshoqroq sur’atda bajariladi.',
    grammaticalCategory: 'noun',
    dominantHandShape: 'Ochiq erkin barmoqlar',
    twoHanded: true,
    motionTrajectory: 'Sekin mayin tebranish',
    verificationTier: 'verified_secondary',
    sourceReference: 'UzSLR-50 (#qor)',
    isDynamic: true,
    isSupportedInCurrentModel: false,
  },
]

// Backward-compatible exports
export const DACTYL_ALPHABET = UZSL_COMPREHENSIVE_VOCABULARY.filter((s) => s.domain === 'dactyl')
export const DYNAMIC_SIGNS = UZSL_COMPREHENSIVE_VOCABULARY.filter((s) => s.category === 'dynamic_sign')
export const CORE_SIGNS = DYNAMIC_SIGNS

export const VERIFIED_UZSL_VOCABULARY: SupportedSign[] = UZSL_COMPREHENSIVE_VOCABULARY.map((s) => ({
  id: s.id,
  gloss: s.gloss,
  uzbekName: s.uzbekName,
  category: s.category,
  description: s.description,
  handShape: s.dominantHandShape,
  movement: s.motionTrajectory,
  verifiedInUZSL: s.verificationTier === 'verified_primary' || s.verificationTier === 'verified_secondary',
  isDynamic: s.isDynamic,
}))

export const CONTINUOUS_RECOGNITION_ARCHITECTURE = {
  title: 'Uzluksiz Kinematik Segmentatsiya va Tarjima Arxitekturasi',
  description:
    'Foydalanuvchi har bir harf yoki so‘zdan keyin to‘xtab qolishi shart emas. Tizim vaqt bo‘yicha harakat tezlanishi, traektoriya va kinematik apels (stroke apex) nuqtalarini tahlil qilib, tabiiy muloqot oqimini ta’minlaydi.',
  phases: [
    {
      name: '1. Oqimga kirish (Preparation Phase)',
      detail: 'Qo‘lning neytral holatdan harakatga kelishi; tezlik va koordinata o‘zgarishi qayd etiladi.',
    },
    {
      name: '2. Kinematik Apels / Zarba (Stroke Apex)',
      detail: 'Isho‘raning asosiy semantik ma’nosini tashuvchi nuqta (tezlik minimumga tushishi yoki traektoriya cho‘qqisi).',
    },
    {
      name: '3. O‘tish va Hysteresis (Transition / Retraction)',
      detail: 'Keyingi ishoraga o‘tishdagi soxta oraliq belgilar avtomatik filtrlanadi va takrorlanishlar bostiriladi.',
    },
  ],
}

export const TECHNICAL_ARCHITECTURE = {
  overview:
    'iFlevox SignBridge to‘rt pog‘onali (Four-tier) deterministik, kinematik va lingvistik tarjima arxitekturasiga qurilgan. Barcha hisoblashlar to‘liq brauzerda (Client-side) bajariladi.',
  layerA: {
    name: 'Kamera va Temporal 3D Landmarklar (MediaPipe)',
    model: 'MediaPipe Tasks Vision Hand Landmarker (WASM + WebGL GPU)',
    landmarks: '21 ta bo‘g‘im nuqtasi (x, y, z) + 16-32 kadrli temporal oyna',
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
  layerD: {
    name: 'Lingvistik Tarjima va Grammatik Interpretatsiya (UzSL Grammar Engine)',
    description:
      'Imo-ishora tili grammatikasi (SOV / Mavzu-Rezonans) bilan yozma o‘zbek tili sintaksisi o‘rtasidagi farqlarni muvozanatlashtiradi.',
  },
}

export const PRIVACY_POLICY = {
  title: 'Maxfiylik va Axloqiy Ma’lumotlar Kafolati',
  commitments: [
    {
      title: 'Video oqimi 100% lokal qayta ishlanadi',
      description:
        'Kameradan olingan birorta kadr tashqi serverga yoki bulutli tizimlarga yuklanmaydi. Barcha hisoblar foydalanuvchi qurilmasida bajariladi.',
    },
    {
      title: 'Ixtiyoriy va rozilik asosida ochiq dataset to‘plash',
      description:
        'Kelgusida kengaytirilgan modellarni o‘qitish uchun faqatgina landmark koordinatalarini (videoni emas!) lokal saqlash va eksport qilish vositasi taqdim etiladi.',
    },
    {
      title: 'Eksport va to‘liq o‘chirish nazorati',
      description:
        'Lokal saqlangan barcha yozuvlar istalgan vaqtda JSON formatida yuklab olinishi yoki bir zumda butunlay o‘chirib yuborilishi mumkin.',
    },
  ],
}
