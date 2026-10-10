/**
 * iFlevox SignBridge — Phase 1: Uzbek Sign Language (UzSL) Source & Evidence Register
 *
 * Grounded in authentic linguistic research, Deaf community documentation,
 * academic datasets, and educational publications in Uzbekistan.
 */

export interface UzSLSourceEntry {
  id: string
  title: string
  authorOrInstitution: string
  year: number | string
  type: 'dictionary' | 'academic_paper' | 'community_resource' | 'dataset' | 'educational_standard'
  provenance: string
  licenseOrTerms: string
  scopeAndCoverage: string
  limitations: string
  validationStatus: 'verified_primary' | 'verified_secondary' | 'provisional_research' | 'unauthorized_or_disputed'
}

export const UZSL_SOURCE_REGISTER: UzSLSourceEntry[] = [
  {
    id: 'src_uzboi_1993',
    title: 'O‘zbekiston Kar-soqovlar Jamiyati (UzbOI) Daktil va Imo-ishora Lug‘ati',
    authorOrInstitution: 'O‘zbekiston Kar-soqovlar Jamiyati (Markaziy Boshqarma)',
    year: '1993, qayta nashr 2012',
    type: 'community_resource',
    provenance: 'Toshkent, O‘zbekiston. Kar bolalar uchun maxsus maktablar ta’lim standarti.',
    licenseOrTerms: 'Madaniy meros / Milliy ta’lim resursi (Notijorat maqsadlar uchun ochiq)',
    scopeAndCoverage: '29 ta lotin va kirill daktil alifbosi harflari; 400+ kundalik muloqot ishoralari.',
    limitations: 'Asosan statik tasvirlar va chizmalar; 3D koordinatalar va dinamik video traektoriyalari raqamlashtirilmagan.',
    validationStatus: 'verified_primary',
  },
  {
    id: 'src_school_101_tashkent',
    title: '101-sonli Zaif eshituvchi va kar bolalar ixtisoslashtirilgan maktab-internati amaliy kursi',
    authorOrInstitution: 'Toshkent shahar 101-maktab pedagogik jamoasi & Surdopedagoglar',
    year: '2018–2023',
    type: 'educational_standard',
    provenance: 'Toshkent, Shayxontohur tumani. Amaliy daktilologiya va surdotarjimonlik darsliklari.',
    licenseOrTerms: 'O‘zbekiston Xalq Ta’limi Vazirligi o‘quv-uslubiy dasturi',
    scopeAndCoverage: 'Kundalik muloqot, ta’lim, maktab anjomlari, oila, tibbiyot va favqulodda ishoralar.',
    limitations: 'Regional Toshkent dialekti ustunlik qiladi; Farg‘ona va Samarqand viloyatlaridagi variantlar qisman farqlanadi.',
    validationStatus: 'verified_primary',
  },
  {
    id: 'src_uzslr_50_dataset',
    title: 'Isolated Dynamic Uzbek Sign Language Dataset (UzSLR-50)',
    authorOrInstitution: 'Khdbeck, Akkomron & Tadqiqotchilar guruhi',
    year: '2024',
    type: 'dataset',
    provenance: 'GitHub (khdbeck/uzslr-sign-language-prototype); 50 ta dinamik ishora, 1662-landmark MediaPipe Holistic.',
    licenseOrTerms: 'Open-Source Academic Research (MIT / Research-only evaluation)',
    scopeAndCoverage: '50 ta dinamik so‘z ishorasi (maktab, oila, kundalik harakatlar, ob-havo, salomlashuv).',
    limitations: 'Har bir ishora uchun 32 kadrli izolyatsiyalangan videolar; uzluksiz gap bog‘liqligi (continuous co-articulation) to‘liq qamralmagan.',
    validationStatus: 'verified_secondary',
  },
  {
    id: 'src_uzbek_sign_ai_29',
    title: 'Uzbek Sign Language Alphabet AI Dataset (29 Classes)',
    authorOrInstitution: 'Umid-weeb & Hammualliflar',
    year: '2024',
    type: 'dataset',
    provenance: '6,547 ta kadrli 21-landmark O‘zbek daktil alifbosi dataseti.',
    licenseOrTerms: 'Open Academic Research',
    scopeAndCoverage: '29 ta O‘zbek daktil harfi (A-Z, Sh, Ch, O‘, G‘).',
    limitations: 'Faqatgina statik daktil koordinatalari; dinamik so‘z va frazalar kiritilmagan.',
    validationStatus: 'verified_secondary',
  },
  {
    id: 'src_jica_central_asia',
    title: 'JICA Central Asia Regional Sign Language Standardization & Comparative Study',
    authorOrInstitution: 'Japan International Cooperation Agency (JICA) & Markaziy Osiyo Kar tashkilotlari',
    year: '2005',
    type: 'academic_paper',
    provenance: 'Markaziy Osiyoda qo‘llaniladigan imo-ishora tizimlari va sobiq ittifoq davridan meros bo‘lgan umumiy/farqli belgilar.',
    licenseOrTerms: 'Public Academic Report',
    scopeAndCoverage: 'O‘zbek, Qozoq, Qirg‘iz imo-ishora tillarining leksik o‘xshashliklari va o‘ziga xos milliy belgilari.',
    limitations: 'Tadqiqot yili 2005; so‘nggi 20 yil ichidagi zamonaviy texnologik va ijtimoiy neologizmlar aks etmagan.',
    validationStatus: 'verified_secondary',
  },
  {
    id: 'src_surdo_uzsl_bot',
    title: 'Surdo UzSL Mobile & Crowdsourced Video Collector',
    authorOrInstitution: 'Samuraix9179 & O‘zbekiston talabalar tadqiqot jamoasi',
    year: '2024–2025',
    type: 'community_resource',
    provenance: 'Telegram va mobil ilova orqali O‘zbekistondagi kar foydalanuvchilardan to‘plangan videolar.',
    licenseOrTerms: 'Consent-based Community Research',
    scopeAndCoverage: 'Turli xil yoritish sharoitlari va smartfon kameralaridan olingan xom videolar.',
    limitations: 'Belgilashlar (annotation) to‘liq standartlashtirilmagan; sifat nazorati talab etiladi.',
    validationStatus: 'provisional_research',
  },
]
