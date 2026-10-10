/**
 * iFlevox SignBridge — Unified Vocabulary & Recognition Model Contracts
 */

export type VerificationTier =
  | 'verified_primary'    // Officially validated by Deaf organizations / Special schools
  | 'verified_secondary'  // Validated by academic peer-reviewed datasets & published checkpoints
  | 'provisional'         // Documented community proposal awaiting multi-signer benchmark

export type SourceProvenance =
  | 'imo-ishora.uz'
  | 'akkomron/uzslr-isolated-dynamic'
  | 'Mrkomiljon/uzbek-sign-language'
  | 'UzbOI-1993-2012'
  | 'Tashkent-School-101'
  | 'remu.uz'

export type LexicalDomain =
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
  | 'household_items'
  | 'sports_leisure'

export interface UnifiedUzSLSign {
  id: string
  gloss: string
  uzbekName: string
  category: 'dactyl_letter' | 'dynamic_sign' | 'core_sign' | 'custom_prototype'
  domain: LexicalDomain

  // Linguistic & Sign features
  description: string
  linguisticNotes: string
  grammaticalCategory: 'noun' | 'verb' | 'adjective' | 'interjection' | 'letter' | 'particle'
  dominantHandShape: string
  nonDominantHandShape?: string
  twoHanded: boolean
  motionTrajectory: string
  facialAndBodyExpression?: string
  regionalVariants?: string

  // Provenance, Rights & Media References
  sourceProvenance: SourceProvenance
  sourceReference: string
  licenseAndRights: string
  videoDemoUrl?: string // Official demonstration link or CloudFront reference
  externalDictionaryUrl?: string // e.g. imo-ishora.uz entry link

  // Model & Recognition Mapping (Separation of Dictionary from Recognition)
  verificationTier: VerificationTier
  isDynamic: boolean
  hasTrainableDataset: boolean // True if raw coordinates/videos exist in an open dataset
  datasetSampleCount?: number // e.g. 2,800 or 50 classes
  isRecognizedInLiveCamera: boolean // True ONLY if current browser model actually detects it!
  modelMappingIdentifier?: string // e.g. "assalomu_alaykum", "A", "V", "yordam_berish"
}
