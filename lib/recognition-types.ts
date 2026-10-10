/**
 * iFlevox SignBridge — Recognition Architecture Interfaces
 *
 * Strict three-layer separation:
 * Layer A: Hand & Pose Tracking (MediaPipe HandLandmarker 21 3D points)
 * Layer B: Sign & Dactyl Recognition (Feature extraction, angle analysis, classifier)
 * Layer C: Text Rendering & Gloss-to-Text Buffer
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
}

export type RecognitionState =
  | 'idle'
  | 'no_hand'
  | 'analyzing'
  | 'recognized'
  | 'unknown_gesture'

export interface ClassificationResult {
  state: RecognitionState
  gloss: string | null
  confidence: number
  category: 'dactyl_letter' | 'core_sign' | 'custom_prototype' | null
  description: string
  alternativeGuesses?: Array<{ label: string; score: number }>
}

export interface SupportedSign {
  id: string
  gloss: string
  uzbekName: string
  category: 'dactyl_letter' | 'core_sign' | 'custom_prototype'
  description: string
  handShape: string
  movement: string
  verifiedInUZSL: boolean
}
