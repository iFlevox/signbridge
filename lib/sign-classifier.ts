import { Landmark3D, ClassificationResult, DynamicMotionFeatures, TemporalFrame } from './recognition-types'

/**
 * iFlevox SignBridge — Layer B: Continuous & Kinematic Sign Classifier
 *
 * Combines:
 * 1. Static handshape analysis (21 landmarks)
 * 2. Continuous temporal motion segmentation (sliding velocity window, trajectory, stroke apex)
 *
 * Supports continuous, fluid signing WITHOUT mandatory pauses:
 * - Dynamic signs emit at the kinematic stroke apex (sudden deceleration or directional inflection)
 * - Static/dactyl signs emit when held smoothly for minimal adaptive transition window
 * - Transitions between signs are classified as 'transition', preventing erroneous interim letters
 */

export function distance3D(a: Landmark3D, b: Landmark3D): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = (a.z || 0) - (b.z || 0)
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export interface FingerState {
  isExtended: boolean
  curl: number // 0 = straight, 1 = fully curled
  tipToWristDist: number
}

export function analyzeFingers(landmarks: Landmark3D[]): {
  thumb: FingerState
  index: FingerState
  middle: FingerState
  ring: FingerState
  pinky: FingerState
  palmScale: number
} {
  const wrist = landmarks[0]
  const palmBase = distance3D(landmarks[0], landmarks[9]) || 0.1

  const checkFinger = (mcpIdx: number, pipIdx: number, dipIdx: number, tipIdx: number): FingerState => {
    const pip = landmarks[pipIdx]
    const tip = landmarks[tipIdx]

    const tipToWrist = distance3D(tip, wrist) / palmBase
    const pipToWrist = distance3D(pip, wrist) / palmBase

    // Extended if tip is farther from wrist than PIP and reaches beyond palm
    const isExtended = tipToWrist > pipToWrist && tipToWrist > 1.20
    const curl = Math.max(0, Math.min(1, (1.7 - tipToWrist) / 0.8))

    return {
      isExtended,
      curl,
      tipToWristDist: tipToWrist,
    }
  }

  const thumbTip = landmarks[4]
  const indexMcp = landmarks[5]

  const thumbToWrist = distance3D(thumbTip, wrist) / palmBase
  const thumbToIndexMcp = distance3D(thumbTip, indexMcp) / palmBase
  const isThumbExtended = thumbToWrist > 1.05 && thumbToIndexMcp > 0.40

  const thumb: FingerState = {
    isExtended: isThumbExtended,
    curl: isThumbExtended ? 0.15 : 0.85,
    tipToWristDist: thumbToWrist,
  }

  const index = checkFinger(5, 6, 7, 8)
  const middle = checkFinger(9, 10, 11, 12)
  const ring = checkFinger(13, 14, 15, 16)
  const pinky = checkFinger(17, 18, 19, 20)

  return { thumb, index, middle, ring, pinky, palmScale: palmBase }
}

/**
 * Extract motion trajectory and kinematics from a temporal window of frames
 */
export function extractMotionFeatures(history: TemporalFrame[]): DynamicMotionFeatures {
  if (history.length < 2) {
    return {
      durationMs: 0,
      frameCount: history.length,
      netDisplacementX: 0,
      netDisplacementY: 0,
      totalTrajectoryLength: 0,
      peakVelocity: 0,
      meanVelocity: 0,
      dominantDirection: 'stationary',
      isReciprocatingHorizontal: false,
      isReciprocatingVertical: false,
      strokeDetected: false,
      strokeCenterLandmarks: null,
    }
  }

  const first = history[0]
  const last = history[history.length - 1]
  const durationMs = last.timestampMs - first.timestampMs

  let totalDist = 0
  let peakVel = 0
  let velSum = 0

  let xReversals = 0
  let yReversals = 0
  let prevDx = 0
  let prevDy = 0

  for (let i = 1; i < history.length; i++) {
    const p1 = history[i - 1].landmarks[0]
    const p2 = history[i].landmarks[0]
    const dt = Math.max(0.001, (history[i].timestampMs - history[i - 1].timestampMs) / 1000)

    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const segDist = Math.hypot(dx, dy)
    const vel = segDist / dt

    totalDist += segDist
    velSum += vel
    if (vel > peakVel) peakVel = vel

    // Reciprocating direction changes
    if (Math.abs(dx) > 0.005) {
      if (prevDx !== 0 && Math.sign(dx) !== Math.sign(prevDx)) {
        xReversals++
      }
      prevDx = dx
    }

    if (Math.abs(dy) > 0.005) {
      if (prevDy !== 0 && Math.sign(dy) !== Math.sign(prevDy)) {
        yReversals++
      }
      prevDy = dy
    }
  }

  const meanVelocity = velSum / (history.length - 1)
  const netDx = last.landmarks[0].x - first.landmarks[0].x
  const netDy = last.landmarks[0].y - first.landmarks[0].y

  let dominantDirection: 'left' | 'right' | 'up' | 'down' | 'circular' | 'stationary' = 'stationary'
  if (totalDist > 0.05) {
    if (Math.abs(netDx) > Math.abs(netDy) * 1.3) {
      dominantDirection = netDx > 0 ? 'right' : 'left'
    } else if (Math.abs(netDy) > Math.abs(netDx) * 1.3) {
      dominantDirection = netDy > 0 ? 'down' : 'up'
    } else {
      dominantDirection = 'circular'
    }
  }

  // Reciprocating motion flags (e.g. side-to-side wave for YO'Q, vertical nod for HA)
  const isReciprocatingHorizontal = xReversals >= 2 && totalDist > 0.08
  const isReciprocatingVertical = yReversals >= 2 && totalDist > 0.08

  // Stroke apex detection: velocity dropped significantly after reaching a peak, or inflection reached
  const recentVel = history.length >= 3
    ? Math.hypot(last.landmarks[0].x - history[history.length - 2].landmarks[0].x, last.landmarks[0].y - history[history.length - 2].landmarks[0].y) /
      Math.max(0.001, (last.timestampMs - history[history.length - 2].timestampMs) / 1000)
    : meanVelocity

  const strokeDetected = peakVel > 0.35 && recentVel < peakVel * 0.45 && totalDist > 0.05

  return {
    durationMs,
    frameCount: history.length,
    netDisplacementX: netDx,
    netDisplacementY: netDy,
    totalTrajectoryLength: totalDist,
    peakVelocity: peakVel,
    meanVelocity,
    dominantDirection,
    isReciprocatingHorizontal,
    isReciprocatingVertical,
    strokeDetected,
    strokeCenterLandmarks: last.landmarks,
  }
}

/**
 * Continuous Classifier: Evaluates current landmarks + temporal motion window
 */
export function classifyContinuousHand(
  landmarks: Landmark3D[] | null,
  motion?: DynamicMotionFeatures | null
): ClassificationResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      state: 'no_hand',
      gloss: null,
      confidence: 0,
      category: null,
      description: 'Qo‘l ko‘rinmayapti. Kameraga qo‘lingizni ko‘rsating.',
    }
  }

  const f = analyzeFingers(landmarks)
  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]
  const middleTip = landmarks[12]

  const thumbToIndexTip = distance3D(thumbTip, indexTip) / f.palmScale
  const indexToMiddleTip = distance3D(indexTip, middleTip) / f.palmScale

  // Dynamic gesture evaluation if motion features are present
  if (motion && motion.frameCount >= 5) {
    // 1. Dynamic 'YO‘Q' (Horizontal reciprocating waving side-to-side with index or open hand)
    if (motion.isReciprocatingHorizontal && (f.index.isExtended || (f.index.isExtended && f.middle.isExtended))) {
      return {
        state: 'recognized',
        gloss: 'YO‘Q',
        confidence: 0.94,
        category: 'dynamic_sign',
        isDynamicStroke: true,
        motionType: 'Gorizontal tebranish (Waving)',
        description: 'O‘zbek imo-ishorasi: "YO‘Q" (Yonma-yon tebratish harakati)',
      }
    }

    // 2. Dynamic 'HA' (Vertical reciprocating nodding movement with fist or relaxed hand)
    if (motion.isReciprocatingVertical && !f.index.isExtended && !f.middle.isExtended) {
      return {
        state: 'recognized',
        gloss: 'HA',
        confidence: 0.93,
        category: 'dynamic_sign',
        isDynamicStroke: true,
        motionType: 'Vertikal silkinish (Nodding)',
        description: 'O‘zbek imo-ishorasi: "HA" (Yuqori-pastga silkinish harakati)',
      }
    }

    // 3. Dynamic 'ASSALOMU_ALAYKUM' (Flat palm resting near chest/heart area)
    if (
      f.thumb.isExtended &&
      f.index.isExtended &&
      f.middle.isExtended &&
      f.ring.isExtended &&
      f.pinky.isExtended &&
      landmarks[0].y > 0.55 &&
      landmarks[0].x < 0.55 &&
      motion.totalTrajectoryLength < 0.12 &&
      indexToMiddleTip < 0.28
    ) {
      return {
        state: 'recognized',
        gloss: 'ASSALOMU_ALAYKUM',
        confidence: 0.96,
        category: 'dynamic_sign',
        isDynamicStroke: true,
        motionType: 'Ko‘krak sohasiga qo‘yish',
        description: 'O‘zbek milliy odobi: "Assalomu alaykum" (Ko‘krakka kaft qo‘yish)',
      }
    }

    // 4. Dynamic 'SALOM' (Open palm with reciprocating wave or outward stroke)
    if (
      f.thumb.isExtended &&
      f.index.isExtended &&
      f.middle.isExtended &&
      f.ring.isExtended &&
      f.pinky.isExtended &&
      (motion.isReciprocatingHorizontal || motion.totalTrajectoryLength > 0.08)
    ) {
      return {
        state: 'recognized',
        gloss: 'SALOM',
        confidence: 0.95,
        category: 'dynamic_sign',
        isDynamicStroke: true,
        motionType: 'Kaft tebranishi (Greeting Wave)',
        description: 'O‘zbek imo-ishorasi: "SALOM" (Ochiq kaft salomi)',
      }
    }

    // 5. Dynamic 'RAHMAT' (Open hand forward-downward outward stroke from chest)
    if (
      f.index.isExtended &&
      f.middle.isExtended &&
      motion.netDisplacementY > 0.04 &&
      motion.strokeDetected
    ) {
      return {
        state: 'recognized',
        gloss: 'RAHMAT',
        confidence: 0.92,
        category: 'dynamic_sign',
        isDynamicStroke: true,
        motionType: 'Oldinga-pastga uzatish',
        description: 'O‘zbek imo-ishorasi: "RAHMAT" (Minnatdorchilik uzatmasi)',
      }
    }

    // 6. Dynamic 'ILTIMOS' (Gentle downward/circular sweep near chest)
    if (
      f.index.isExtended &&
      f.middle.isExtended &&
      motion.dominantDirection === 'circular' &&
      motion.totalTrajectoryLength > 0.12
    ) {
      return {
        state: 'recognized',
        gloss: 'ILTIMOS',
        confidence: 0.90,
        category: 'dynamic_sign',
        isDynamicStroke: true,
        motionType: 'Mayin aylanma harakat',
        description: 'O‘zbek imo-ishorasi: "ILTIMOS" (Ko‘krak sohasidagi intilish)',
      }
    }

    // 7. Dynamic 'TUSHUNDIM' (Quick downward stroke with index/hand)
    if (
      f.index.isExtended &&
      motion.netDisplacementY > 0.07 &&
      motion.peakVelocity > 0.45 &&
      motion.strokeDetected
    ) {
      return {
        state: 'recognized',
        gloss: 'TUSHUNDIM',
        confidence: 0.91,
        category: 'dynamic_sign',
        isDynamicStroke: true,
        motionType: 'Pastga tez tushirish (Drop stroke)',
        description: 'O‘zbek imo-ishorasi: "TUSHUNDIM" (Pastga qat’iy tushirish)',
      }
    }

    // If rapid transition motion is in progress (high velocity, not yet apex), label transition
    if (motion.meanVelocity > 0.60 && !motion.strokeDetected) {
      return {
        state: 'transition',
        gloss: null,
        confidence: 0,
        category: null,
        description: 'Harakatlanish jarayonida (ishora o‘tishi)...',
      }
    }
  }

  // --- Static & Quasistatic Handshape Vocabulary (Dactyl Alphabet & Core Poses) ---

  // 1. Dactyl 'A' (Tight fist, thumb resting beside index, all 4 fingers curled)
  if (
    !f.index.isExtended &&
    !f.middle.isExtended &&
    !f.ring.isExtended &&
    !f.pinky.isExtended &&
    f.index.curl > 0.55 &&
    f.middle.curl > 0.55 &&
    f.ring.curl > 0.55 &&
    f.pinky.curl > 0.55 &&
    thumbToIndexTip < 0.65
  ) {
    return {
      state: 'recognized',
      gloss: 'A',
      confidence: 0.94,
      category: 'dactyl_letter',
      description: 'O‘zbek daktil alifbosi: "A" harfi (Musht, bosh barmoq yonboshda)',
    }
  }

  // 2. Dactyl 'B' (Four fingers upright together, thumb tucked onto palm)
  if (
    f.index.isExtended &&
    f.middle.isExtended &&
    f.ring.isExtended &&
    f.pinky.isExtended &&
    !f.thumb.isExtended
  ) {
    return {
      state: 'recognized',
      gloss: 'B',
      confidence: 0.93,
      category: 'dactyl_letter',
      description: 'O‘zbek daktil alifbosi: "B" harfi (To‘rt barmoq tik, bosh barmoq kaftda)',
    }
  }

  // 3. Dactyl 'V' (Index and Middle extended, ring & pinky curled)
  if (
    f.index.isExtended &&
    f.middle.isExtended &&
    !f.ring.isExtended &&
    !f.pinky.isExtended &&
    !f.thumb.isExtended
  ) {
    return {
      state: 'recognized',
      gloss: 'V',
      confidence: 0.94,
      category: 'dactyl_letter',
      description: 'O‘zbek daktil alifbosi: "V" harfi (Ko‘rsatkich va o‘rta barmoqlar ochiq)',
    }
  }

  // 4. Dactyl 'L' (Thumb and Index form 90 degree angle, others curled)
  if (
    f.thumb.isExtended &&
    f.index.isExtended &&
    !f.middle.isExtended &&
    !f.ring.isExtended &&
    !f.pinky.isExtended &&
    thumbToIndexTip > 0.65
  ) {
    return {
      state: 'recognized',
      gloss: 'L',
      confidence: 0.93,
      category: 'dactyl_letter',
      description: 'O‘zbek daktil alifbosi: "L" harfi (Bosh va ko‘rsatkich barmoq "L" shaklida)',
    }
  }

  // 5. Dactyl 'I' (Only pinky extended upright, other fingers curled)
  if (
    f.pinky.isExtended &&
    !f.index.isExtended &&
    !f.middle.isExtended &&
    !f.ring.isExtended &&
    !f.thumb.isExtended &&
    f.index.curl > 0.50
  ) {
    return {
      state: 'recognized',
      gloss: 'I',
      confidence: 0.92,
      category: 'dactyl_letter',
      description: 'O‘zbek daktil alifbosi: "I" harfi (Faqat jimjiloq tik ko‘tarilgan)',
    }
  }

  // 6. Dactyl 'D' (Index extended upright, thumb touches curled middle/ring)
  if (
    f.index.isExtended &&
    !f.middle.isExtended &&
    !f.ring.isExtended &&
    !f.pinky.isExtended &&
    !f.thumb.isExtended &&
    f.middle.curl > 0.50
  ) {
    return {
      state: 'recognized',
      gloss: 'D',
      confidence: 0.90,
      category: 'dactyl_letter',
      description: 'O‘zbek daktil alifbosi: "D" harfi (Ko‘rsatkich barmoq tik, boshqalar tutashgan)',
    }
  }

  // 7. Dactyl 'Y' (Thumb and pinky extended, middle 3 curled — Shaka shape)
  if (
    f.thumb.isExtended &&
    f.pinky.isExtended &&
    !f.index.isExtended &&
    !f.middle.isExtended &&
    !f.ring.isExtended &&
    f.index.curl > 0.50
  ) {
    return {
      state: 'recognized',
      gloss: 'Y',
      confidence: 0.93,
      category: 'dactyl_letter',
      description: 'O‘zbek daktil alifbosi: "Y" harfi (Bosh va jimjiloq ochiq)',
    }
  }

  // 8. Dactyl 'O' (All fingertips touching thumb tip to form an 'O' ring)
  if (
    thumbToIndexTip < 0.32 &&
    f.index.curl > 0.30 &&
    f.middle.curl > 0.30 &&
    !f.pinky.isExtended &&
    !f.ring.isExtended &&
    !f.index.isExtended
  ) {
    return {
      state: 'recognized',
      gloss: 'O',
      confidence: 0.89,
      category: 'dactyl_letter',
      description: 'O‘zbek daktil alifbosi: "O" harfi (Barmoqlar doira halqasini hosil qiladi)',
    }
  }

  // 9. Core Static / Kinematic: 'YAXSHI' (Thumbs Up gesture)
  if (
    f.thumb.isExtended &&
    !f.index.isExtended &&
    !f.middle.isExtended &&
    !f.ring.isExtended &&
    !f.pinky.isExtended &&
    landmarks[4].y < landmarks[2].y - 0.05
  ) {
    return {
      state: 'recognized',
      gloss: 'YAXSHI',
      confidence: 0.95,
      category: 'core_sign',
      description: 'O‘zbek imo-ishorasi: "YAXSHI" (Maqullash / thumbs up)',
    }
  }

  // 10. Core Static: 'SALOM' (Open flat palm)
  if (
    f.thumb.isExtended &&
    f.index.isExtended &&
    f.middle.isExtended &&
    f.ring.isExtended &&
    f.pinky.isExtended &&
    indexToMiddleTip < 0.32
  ) {
    return {
      state: 'recognized',
      gloss: 'SALOM',
      confidence: 0.91,
      category: 'core_sign',
      description: 'O‘zbek imo-ishorasi: "SALOM" (Ochiq kaft salomi)',
    }
  }

  // 11. Honest Fallback: Hand is present, but pose is outside supported vocabulary
  return {
    state: 'unknown_gesture',
    gloss: null,
    confidence: 0,
    category: null,
    description: 'Qo‘l harakati aniqlandi, ammo bu ishora joriy model lug‘atida mavjud emas.',
  }
}

// Backward-compatible wrapper
export function classifyHandLandmarks(landmarks: Landmark3D[] | null): ClassificationResult {
  return classifyContinuousHand(landmarks, null)
}
