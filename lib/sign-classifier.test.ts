import { describe, expect, it } from 'vitest'
import { classifyHandLandmarks } from './sign-classifier'
import { Landmark3D } from './recognition-types'

function createStandardHand(extended: { thumb?: boolean; index?: boolean; middle?: boolean; ring?: boolean; pinky?: boolean }): Landmark3D[] {
  const points: Landmark3D[] = []
  // Wrist at (0.5, 0.8)
  points[0] = { x: 0.5, y: 0.8, z: 0 }
  
  // Thumb points
  points[1] = { x: 0.45, y: 0.72, z: 0 }
  points[2] = { x: 0.40, y: 0.65, z: 0 }
  points[3] = { x: 0.38, y: 0.60, z: 0 }
  // When extended: reaches out wide (0.22, 0.45)
  // When curled: tucked in (0.45, 0.65)
  points[4] = extended.thumb ? { x: 0.22, y: 0.45, z: 0 } : { x: 0.45, y: 0.65, z: 0 }

  // Index points
  points[5] = { x: 0.45, y: 0.55, z: 0 }
  points[6] = { x: 0.45, y: 0.45, z: 0 }
  points[7] = { x: 0.45, y: 0.35, z: 0 }
  points[8] = extended.index ? { x: 0.45, y: 0.22, z: 0 } : { x: 0.45, y: 0.62, z: 0 }

  // Middle points
  points[9] = { x: 0.50, y: 0.50, z: 0 } // MCP, palmBase = dist(0, 9) = 0.30
  points[10] = { x: 0.50, y: 0.42, z: 0 }
  points[11] = { x: 0.50, y: 0.32, z: 0 }
  points[12] = extended.middle ? { x: 0.50, y: 0.20, z: 0 } : { x: 0.50, y: 0.62, z: 0 }

  // Ring points
  points[13] = { x: 0.55, y: 0.55, z: 0 }
  points[14] = { x: 0.55, y: 0.45, z: 0 }
  points[15] = { x: 0.55, y: 0.35, z: 0 }
  points[16] = extended.ring ? { x: 0.55, y: 0.22, z: 0 } : { x: 0.55, y: 0.62, z: 0 }

  // Pinky points
  points[17] = { x: 0.60, y: 0.60, z: 0 }
  points[18] = { x: 0.60, y: 0.52, z: 0 }
  points[19] = { x: 0.60, y: 0.44, z: 0 }
  points[20] = extended.pinky ? { x: 0.60, y: 0.28, z: 0 } : { x: 0.60, y: 0.65, z: 0 }

  return points
}

describe('Sign Classifier Truthful Architecture', () => {
  it('returns no_hand when landmarks are null or empty', () => {
    const res = classifyHandLandmarks(null)
    expect(res.state).toBe('no_hand')
    expect(res.gloss).toBeNull()
    expect(res.confidence).toBe(0)
  })

  it('correctly recognizes verified Dactyl A (All fingers curled)', () => {
    const hand = createStandardHand({ thumb: false, index: false, middle: false, ring: false, pinky: false })
    const res = classifyHandLandmarks(hand)
    expect(res.state).toBe('recognized')
    expect(res.gloss).toBe('A')
    expect(res.confidence).toBeGreaterThan(0.8)
  })

  it('correctly recognizes verified Dactyl V (Index & Middle extended)', () => {
    const hand = createStandardHand({ index: true, middle: true, ring: false, pinky: false, thumb: false })
    const res = classifyHandLandmarks(hand)
    expect(res.state).toBe('recognized')
    expect(res.gloss).toBe('V')
    expect(res.confidence).toBeGreaterThan(0.8)
  })

  it('correctly recognizes verified Dactyl L (Thumb & Index extended)', () => {
    const hand = createStandardHand({ thumb: true, index: true, middle: false, ring: false, pinky: false })
    const res = classifyHandLandmarks(hand)
    expect(res.state).toBe('recognized')
    expect(res.gloss).toBe('L')
    expect(res.confidence).toBeGreaterThan(0.8)
  })

  it('correctly recognizes verified Dactyl B (4 fingers upright)', () => {
    const hand = createStandardHand({ thumb: false, index: true, middle: true, ring: true, pinky: true })
    const res = classifyHandLandmarks(hand)
    expect(res.state).toBe('recognized')
    expect(res.gloss).toBe('B')
    expect(res.confidence).toBeGreaterThan(0.8)
  })

  it('correctly recognizes verified Dactyl I (Pinky only)', () => {
    const hand = createStandardHand({ thumb: false, index: false, middle: false, ring: false, pinky: true })
    const res = classifyHandLandmarks(hand)
    expect(res.state).toBe('recognized')
    expect(res.gloss).toBe('I')
    expect(res.confidence).toBeGreaterThan(0.8)
  })

  it('correctly recognizes verified Dactyl D (Index only)', () => {
    const hand = createStandardHand({ thumb: false, index: true, middle: false, ring: false, pinky: false })
    const res = classifyHandLandmarks(hand)
    expect(res.state).toBe('recognized')
    expect(res.gloss).toBe('D')
    expect(res.confidence).toBeGreaterThan(0.8)
  })

  it('correctly recognizes verified Dactyl Y (Thumb & Pinky extended)', () => {
    const hand = createStandardHand({ thumb: true, index: false, middle: false, ring: false, pinky: true })
    const res = classifyHandLandmarks(hand)
    expect(res.state).toBe('recognized')
    expect(res.gloss).toBe('Y')
    expect(res.confidence).toBeGreaterThan(0.8)
  })

  it('honestly returns unknown_gesture for non-dictionary hand shapes (e.g. only Ring finger extended)', () => {
    // Only ring finger extended — not a standard letter in Uzbek Dactyl
    const hand = createStandardHand({ thumb: false, index: false, middle: false, ring: true, pinky: false })
    const res = classifyHandLandmarks(hand)
    expect(res.state).toBe('unknown_gesture')
    expect(res.gloss).toBeNull()
    expect(res.description).toContain('joriy model lug‘atida mavjud emas')
  })

  it('never outputs a gloss when confidence is zero or unknown', () => {
    const res = classifyHandLandmarks([])
    expect(res.gloss).toBeNull()
    expect(res.confidence).toBe(0)
  })
})
