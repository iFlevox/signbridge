/**
 * iFlevox SignBridge — Unified Source & Evidence Register (Audited)
 *
 * Grounded in authentic linguistic research, Deaf community documentation,
 * academic datasets, educational publications, and public web platforms in Uzbekistan.
 *
 * IMPORTANT LEGAL & USAGE AUDIT:
 * - Each source is checked for actual accessible content, API availability,
 *   terms of service, license, attribution requirements, and redistribution rights.
 * - Publicly viewable content is NOT assumed to be free to copy/download.
 * - Strictly distinguishes dictionary resources from camera-trainable ML datasets.
 */

export interface UzSLSourceEntry {
  id: string
  name: string
  url?: string
  organizationOrAuthor: string
  year: number | string
  type: 'public_portal' | 'dataset' | 'trained_model' | 'community_standard' | 'academic_paper'
  accessMethod: 'direct_web_link' | 'github_open_source' | 'academic_reference' | 'proprietary_restricted'
  licenseAndRights: string
  redistributionPermitted: boolean
  apiAvailable: boolean
  videoDemoAvailable: boolean
  vocabularyCount: number
  cameraTrainableCount: number
  scopeAndDescription: string
  legalAndTechnicalLimitations: string
  attributionNotice: string
  auditStatus: 'audited_and_integrated' | 'audited_with_restrictions' | 'audited_reference_only'
}

export const AUDITED_UZSL_SOURCES: UzSLSourceEntry[] = [
  {
    id: 'src_imo_ishora_uz',
    name: 'Imo-Ishora.uz (O‘zbek imo-ishora tili onlayn platformasi)',
    url: 'https://imo-ishora.uz/',
    organizationOrAuthor: 'Toshkent shahar "SHAROIT PLYUS" nogironlar jamoat birlashmasi',
    year: '2024–2026',
    type: 'public_portal',
    accessMethod: 'direct_web_link',
    licenseAndRights: 'Barcha huquqlar himoyalangan (© 2026 "SHAROIT PLYUS"). Rasmiy ommaviy API mavjud emas.',
    redistributionPermitted: false,
    apiAvailable: false,
    videoDemoAvailable: true,
    vocabularyCount: 34, // 17 ta toifa bo‘yicha leksik katalog
    cameraTrainableCount: 0, // Video/koordinata dataseti eksport qilinmaydi
    scopeAndDescription:
      'O‘zbekiston karlar hamjamiyati va surdotarjimonlar ishtirokida yaratilgan videolug‘at portali. 17 ta leksik soha (Alifbo, Salomlar, Oila, Taomlar, Viloyatlar, Fasllar va h.k.) bo‘yicha darsliklar va video ko‘rgazmalarni taqdim etadi.',
    legalAndTechnicalLimitations:
      'Mualliflik huquqi to‘liq himoyalangan. Rasmiy REST/GraphQL API mavjud emas. Shuning uchun platforma ichiga videolarni ruxsatsiz ko‘chirib olish man etiladi; SignBridge da har bir ishora uchun asl "imo-ishora.uz" sahifasiga rasmiy havola va mualliflik atributsiyasi beriladi.',
    attributionNotice:
      'Ma’lumotlar va video ko‘rgazma: Toshkent shahar "SHAROIT PLYUS" nogironlar jamoat birlashmasi (imo-ishora.uz).',
    auditStatus: 'audited_with_restrictions',
  },
  {
    id: 'src_remu_uz',
    name: 'REMU.uz (O‘zbek Imo-ishora Tili Tarjimoni)',
    url: 'https://www.remu.uz/',
    organizationOrAuthor: 'REMU Technology / O‘zbekiston inklyuziv startapi',
    year: '2025–2026',
    type: 'public_portal',
    accessMethod: 'direct_web_link',
    licenseAndRights: 'Proprietary Web Application. Ochiq dataset yoki ommaviy API mavjud emas.',
    redistributionPermitted: false,
    apiAvailable: false,
    videoDemoAvailable: false,
    vocabularyCount: 0,
    cameraTrainableCount: 0,
    scopeAndDescription:
      'Matn va nutqni imo-ishoraga aylantirish (Text-to-Sign) hamda veb-kamera orqali imo-ishorani skanerlashni maqsad qilgan interfeysli veb-ilova.',
    legalAndTechnicalLimitations:
      'Tashqi ishlab chiquvchilar uchun ochiq API yoki yuklab olinadigan neyron tarmoq modellari taqdim etilmagan. Mualliflik va tijoriy mulk huquqlari himoyalangan. Faqatgina platformalararo qiyosiy ma’lumotnoma sifatida kiritildi.',
    attributionNotice: 'REMU.uz texnologik tadqiqotlari (remu.uz).',
    auditStatus: 'audited_reference_only',
  },
  {
    id: 'src_mrkomiljon_uzsl',
    name: 'Mrkomiljon/uzbek-sign-language (Daktil Harflar AI Repozitoriyasi)',
    url: 'https://github.com/Mrkomiljon/uzbek-sign-language',
    organizationOrAuthor: 'Komiljon (Mrkomiljon) / O‘zbekistonlik mustaqil dasturchi',
    year: '2023',
    type: 'dataset',
    accessMethod: 'github_open_source',
    licenseAndRights: 'Public GitHub Repository (Open-source research)',
    redistributionPermitted: true,
    apiAvailable: false,
    videoDemoAvailable: true,
    vocabularyCount: 28, // 28 ta daktil alifbosi harflari (A-Z, O‘, G‘)
    cameraTrainableCount: 28, // 2,800 ta 21-landmark kadrli data.pickle
    scopeAndDescription:
      'O‘zbek daktil alifbosi (A-Z, G‘, O‘) uchun MediaPipe Hands asosidagi 2,800 ta tasvir va ularning normallashtirilgan 42-o‘lchamli (x, y nisbiy) landmarklarini o‘z ichiga olgan ochiq dataset.',
    legalAndTechnicalLimitations:
      'Faqatgina statik daktil harflarini qamrab oladi; dinamik so‘zlar yoki sintaktik jumlalar mavjud emas. Koordinatalar min(x), min(y) asosida tekislangan.',
    attributionNotice: 'Ochiq kodli tadqiqot: github.com/Mrkomiljon/uzbek-sign-language.',
    auditStatus: 'audited_and_integrated',
  },
  {
    id: 'src_akkomron_uzslr',
    name: 'akkomron/uzslr-isolated-dynamic (UzSLR-50 Dinamik Imo-ishora Modeli)',
    url: 'https://github.com/akkomron/uzslr-isolated-dynamic',
    organizationOrAuthor: 'Komronbek (akkomron, khdbeck) / O‘zbekistonlik AI tadqiqotchilari',
    year: '2024–2025',
    type: 'trained_model',
    accessMethod: 'github_open_source',
    licenseAndRights: 'Open-Source Academic Research (Pytorch Checkpoint: best_model.pth)',
    redistributionPermitted: true,
    apiAvailable: true, // Local PyTorch / WebSocket inference pipeline
    videoDemoAvailable: true,
    vocabularyCount: 50, // 50 ta dinamik kundalik so‘z
    cameraTrainableCount: 50, // 32-kadrli MediaPipe Holistic vaqt oynasi
    scopeAndDescription:
      '50 ta dinamik O‘zbek imo-ishorasini (assalomu_alaykum, maktab, kitob, yordam, rahmat, yomg‘ir va h.k.) 32 kadrli MediaPipe Holistic (1662 landmarks -> 708 features) orqali aniqlovchi Transformer neyron tarmoq modeli.',
    legalAndTechnicalLimitations:
      'Izolyatsiyalangan (isolated) harakatlar uchun o‘qitilgan; ikkala qo‘l ko‘rinishi talab etiladi. Model 7.07 MB PyTorch pth formatida mavjud.',
    attributionNotice: 'UzSLR-50 tadqiqot jamoasi: github.com/akkomron/uzslr-isolated-dynamic.',
    auditStatus: 'audited_and_integrated',
  },
  {
    id: 'src_uzboi_1993_2012',
    name: 'O‘zbekiston Kar-soqovlar Jamiyati (UzbOI) Daktil va Imo-ishora Standarti',
    organizationOrAuthor: 'O‘zbekiston Kar-soqovlar Jamiyati (Markaziy Boshqarma)',
    year: '1993, 2012',
    type: 'community_standard',
    accessMethod: 'academic_reference',
    licenseAndRights: 'O‘zbekiston Respublikasi milliy madaniy merosi (Ochiq ta’lim standarti)',
    redistributionPermitted: true,
    apiAvailable: false,
    videoDemoAvailable: false,
    vocabularyCount: 400,
    cameraTrainableCount: 8, // SignBridge da tasdiqlangan daktil qoidalari
    scopeAndDescription:
      'O‘zbekistondagi kar bolalar maktab-internatlarida daktilologiya va imo-ishora tilini o‘qitish bo‘yicha rasmiy uslubiy qo‘llanma.',
    legalAndTechnicalLimitations: 'Bosma kitob va chizmalar shaklida; to‘liq raqamli 3D modeli mavjud emas.',
    attributionNotice: 'O‘zbekiston Kar-soqovlar Jamiyati (UzbOI).',
    auditStatus: 'audited_and_integrated',
  },
  {
    id: 'src_school_101_tashkent',
    name: '101-sonli Ixtisoslashtirilgan Maktab-Internati Amaliy Standarti',
    organizationOrAuthor: 'Toshkent shahar 101-maktab pedagogik jamoasi & Surdopedagoglar',
    year: '2018–2024',
    type: 'community_standard',
    accessMethod: 'academic_reference',
    licenseAndRights: 'O‘zbekiston Xalq Ta’limi Vazirligi o‘quv-uslubiy dasturi',
    redistributionPermitted: true,
    apiAvailable: false,
    videoDemoAvailable: false,
    vocabularyCount: 120,
    cameraTrainableCount: 15,
    scopeAndDescription:
      'Kar va zaif eshituvchi o‘quvchilar bilan muloqot qilish, ta’lim, salomatlik va ijtimoiy munosabatlar ishoralari.',
    legalAndTechnicalLimitations: 'Hududiy Toshkent dialekti ustunlik qiladi.',
    attributionNotice: '101-sonli ixtisoslashtirilgan maktab-internati (Toshkent).',
    auditStatus: 'audited_and_integrated',
  },
]

// Backward-compatible alias
export const UZSL_SOURCE_REGISTER = AUDITED_UZSL_SOURCES
