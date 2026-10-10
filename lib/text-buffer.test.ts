import { describe, expect, it } from 'vitest'
import { ContinuousSignDecoder } from './text-buffer'

describe('ContinuousSignDecoder & Natural Signing Suite', () => {
  it('does NOT require long artificial pause for static dactyl letters', () => {
    const decoder = new ContinuousSignDecoder({ staticDebounceFrames: 3, duplicateSignCooldownMs: 300 })
    
    // In continuous signing, 3 rapid frames (~90ms) is enough
    let res
    for (let i = 0; i < 3; i++) {
      res = decoder.processContinuousFrame('recognized', 'A', 'dactyl_letter', false, 1000 + i * 30)
    }
    expect(res?.committed).toBe(true)
    expect(decoder.getText()).toBe('A')
  })

  it('emits dynamic sign immediately at stroke peak with zero pause required', () => {
    const decoder = new ContinuousSignDecoder({ dynamicApexCooldownMs: 500 })

    // Single stroke apex trigger
    const res = decoder.processContinuousFrame('recognized', 'SALOM', 'dynamic_sign', true, 1000)
    expect(res.committed).toBe(true)
    expect(res.isDynamic).toBe(true)
    expect(decoder.getText()).toBe('SALOM ')
  })

  it('correctly forms continuous words without stopping between letters', () => {
    const decoder = new ContinuousSignDecoder({ staticDebounceFrames: 2, duplicateSignCooldownMs: 200 })

    // Continuous fluent spelling of "VALI"
    // V
    for (let i = 0; i < 2; i++) decoder.processContinuousFrame('recognized', 'V', 'dactyl_letter', false, 100 + i * 30)
    expect(decoder.getText()).toBe('V')

    // Transition between signs (should be ignored gracefully)
    decoder.processContinuousFrame('transition', null, null, false, 200)

    // A
    for (let i = 0; i < 2; i++) decoder.processContinuousFrame('recognized', 'A', 'dactyl_letter', false, 300 + i * 30)
    expect(decoder.getText()).toBe('VA')

    // L
    for (let i = 0; i < 2; i++) decoder.processContinuousFrame('recognized', 'L', 'dactyl_letter', false, 450 + i * 30)
    expect(decoder.getText()).toBe('VAL')

    // I
    for (let i = 0; i < 2; i++) decoder.processContinuousFrame('recognized', 'I', 'dactyl_letter', false, 600 + i * 30)
    expect(decoder.getText()).toBe('VALI')
  })

  it('automatically adds space between words upon natural pause', () => {
    const decoder = new ContinuousSignDecoder({ autoSpaceTimeoutMs: 1000 })
    
    decoder.processContinuousFrame('recognized', 'HA', 'dynamic_sign', true, 1000)
    // Wait longer than autoSpaceTimeoutMs with no_hand
    decoder.processContinuousFrame('no_hand', null, null, false, 2500)
    expect(decoder.getText().endsWith(' ')).toBe(true)
  })
})
