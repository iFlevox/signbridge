import { Landmark3D, ClassificationResult } from './recognition-types'

/**
 * iFlevox SignBridge — Layer B: Sign Recognition Classifier
 *
 * Geometric & Kinematic Feature Extraction:
 * Standard 21 MediaPipe Hand Landmarks:
 * 0: WRIST
 * 1-4: THUMB (CMC, MCP, IP, TIP)
 * 5-8: INDEX (MCP, PIP, DIP, TIP)
 * 9-12: MIDDLE (MCP, PIP, DIP, TIP)
 * 13-16: RING (MCP, PIP, DIP, TIP)
 * 17-20: PINKY (MCP, PIP, DIP, TIP)
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

export function classifyHandLandmarks(landmarks: Landmark3D[] | null): ClassificationResult {
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

  // 9. Core Sign: 'YAXSHI' (Thumbs Up gesture)
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

  // 10. Core Sign: 'SALOM' (Open flat palm)
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

  // 11. Honest Fallback: Hand is present, but pose is not in supported vocabulary
  return {
    state: 'unknown_gesture',
    gloss: null,
    confidence: 0,
    category: null,
    description: 'Qo‘l harakati aniqlandi, ammo bu ishora joriy model lug‘atida mavjud emas.',
  }
}
