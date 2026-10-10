/**
 * iFlevox SignBridge — Recognition Architecture Interfaces
 *
 * Strict three-layer separation:
 * Layer A: Temporal Tracking (21 3D hand landmarks + velocity/trajectory window)
 * Layer B: Continuous Kinematic Classifier & Temporal Segmentation
 * Layer C: Incremental Language Decoding & Buffer
 */

export interface Landmark3D {
  x: number
  y: number
  z: number
}

export interface HandLandmarkResult {
  landmarks: Landmark3D[]
  handedness: 'Left' | 'Right'
  score: number
  timestampMs: number
}

export type RecognitionState =
  | 'idle'
  | 'no_hand'
  | 'analyzing'
  | 'transition'       // During active movement between signs
  | 'stroke_peak'      // Kinematic apex / sign stroke detected
  | 'recognized'       // Validated sign emitted
  | 'unknown_gesture'  // Movement or handshape outside verified vocabulary

export interface TemporalFrame {
  landmarks: Landmark3D[]
  timestampMs: number
  wristVelocity: number          // Speed of wrist movement in screen-units/sec
  fingersVelocity: number        // Mean speed of fingertips
  palmScale: number
}

export interface DynamicMotionFeatures {
  durationMs: number
  frameCount: number
  netDisplacementX: number
  netDisplacementY: number
  totalTrajectoryLength: number
  peakVelocity: number
  meanVelocity: number
  dominantDirection: 'left' | 'right' | 'up' | 'down' | 'circular' | 'stationary'
  isReciprocatingHorizontal: boolean // e.g. waving side-to-side (YO'Q)
  isReciprocatingVertical: boolean   // e.g. nodding down-up (HA)
  strokeDetected: boolean            // Peak-then-deceleration phase
  strokeCenterLandmarks: Landmark3D[] | null
}

export interface ClassificationResult {
  state: RecognitionState
  gloss: string | null
  confidence: number
  category: 'dactyl_letter' | 'dynamic_sign' | 'core_sign' | 'custom_prototype' | null
  description: string
  motionType?: string
  isDynamicStroke?: boolean
  alternativeGuesses?: Array<{ label: string; score: number }>
}

export interface SupportedSign {
  id: string
  gloss: string
  uzbekName: string
  category: 'dactyl_letter' | 'dynamic_sign' | 'core_sign' | 'custom_prototype'
  description: string
  handShape: string
  movement: string
  verifiedInUZSL: boolean
  isDynamic: boolean
  motionPattern?: string
}

export interface RecordedSequenceSample {
  id: string
  label: string
  category: 'dactyl_letter' | 'dynamic_sign' | 'core_sign'
  recordedAt: string
  signerConsent: boolean
  fps: number
  frames: Array<{
    timestampMs: number
    landmarks: Landmark3D[]
  }>
}
