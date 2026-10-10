import { describe, expect, it } from 'vitest'
import { SignSequenceBuffer } from './text-buffer'

describe('SignSequenceBuffer Integration', () => {
  it('does not commit signs on transient jitter (less than stable threshold)', () => {
    const buffer = new SignSequenceBuffer({ stableFramesThreshold: 5, cooldownMs: 500 })
    
    // Only 3 frames of 'A'
    for (let i = 0; i < 3; i++) {
      const res = buffer.processFrame('recognized', 'A', 'dactyl_letter', 1000 + i * 50)
      expect(res.committed).toBe(false)
    }
    expect(buffer.getText()).toBe('')
  })

  it('commits a sign when held stable across the threshold', () => {
    const buffer = new SignSequenceBuffer({ stableFramesThreshold: 5, cooldownMs: 500 })
    
    let lastRes
    for (let i = 0; i < 5; i++) {
      lastRes = buffer.processFrame('recognized', 'A', 'dactyl_letter', 1000 + i * 50)
    }
    expect(lastRes?.committed).toBe(true)
    expect(buffer.getText()).toBe('A')
  })

  it('correctly builds words by spelling dactyl letters and words', () => {
    const buffer = new SignSequenceBuffer({ stableFramesThreshold: 3, cooldownMs: 200 })
    
    // Spell 'V'
    for (let i = 0; i < 3; i++) buffer.processFrame('recognized', 'V', 'dactyl_letter', 100 + i * 20)
    expect(buffer.getText()).toBe('V')

    // Spell 'A'
    for (let i = 0; i < 3; i++) buffer.processFrame('recognized', 'A', 'dactyl_letter', 500 + i * 20)
    expect(buffer.getText()).toBe('VA')

    // Add space and backspace
    buffer.addSpace()
    expect(buffer.getText()).toBe('VA ')
    buffer.backspace()
    expect(buffer.getText()).toBe('VA')
  })
})
