import { describe, expect, it } from 'vitest'
import { translateUzSLSequence } from './grammar-translator'

describe('UzSL Linguistic Grammar & Translation Engine', () => {
  it('correctly maps single isolated glosses to natural Uzbek written expressions', () => {
    expect(translateUzSLSequence(['SALOM']).fluentUzbek).toBe('Salom!')
    expect(translateUzSLSequence(['RAHMAT']).fluentUzbek).toBe('Rahmat, tashakkur!')
    expect(translateUzSLSequence(['TUSHUNDIM']).fluentUzbek).toBe('Tushundim.')
  })

  it('synthesizes compound conversational formulas (SALOM + RAHMAT)', () => {
    const res = translateUzSLSequence(['SALOM', 'RAHMAT'])
    expect(res.fluentUzbek).toBe('Salom, katta rahmat!')
    expect(res.appliedGrammarRule).toContain('Polite greeting')
  })

  it('incorporates sign language negation (YO‘Q + TUSHUNDIM -> Tushunmadim)', () => {
    const res = translateUzSLSequence(['YO‘Q', 'TUSHUNDIM'])
    expect(res.fluentUzbek).toContain('tushunmadim')
    expect(res.appliedGrammarRule).toContain('negation incorporation')
  })

  it('never fabricates missing words on unknown arbitrary sequences', () => {
    const res = translateUzSLSequence(['A', 'B', 'V'])
    expect(res.rawGlosses).toEqual(['A', 'B', 'V'])
    expect(res.fluentUzbek).toBe('A b v.')
  })
})
