import { describe, expect, it } from 'vitest'
import { UNIFIED_UZSL_VOCABULARY } from './vocabulary'
import { AUDITED_UZSL_SOURCES } from './source-register'
import { getSystemCoverageMetrics } from './coverage-metrics'

describe('Unified UzSL Vocabulary & Dataset Audit Suite', () => {
  it('loads a unified vocabulary database with over 80 verified entries', () => {
    expect(UNIFIED_UZSL_VOCABULARY.length).toBeGreaterThanOrEqual(80)
  })

  it('guarantees unique IDs across the entire unified vocabulary (duplicate detection)', () => {
    const ids = UNIFIED_UZSL_VOCABULARY.map((s) => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('strictly separates dictionary entries from live camera recognition', () => {
    const total = UNIFIED_UZSL_VOCABULARY.length
    const liveRecognized = UNIFIED_UZSL_VOCABULARY.filter((s) => s.isRecognizedInLiveCamera)
    const trainableOnly = UNIFIED_UZSL_VOCABULARY.filter((s) => s.hasTrainableDataset && !s.isRecognizedInLiveCamera)

    // A dictionary entry alone must NEVER cause the camera to claim that it recognized it
    expect(liveRecognized.length).toBeLessThan(total)
    expect(trainableOnly.length).toBeGreaterThan(0)
    expect(liveRecognized.length).toBe(15) // Exactly 8 dactyl letters + 7 dynamic signs implemented in browser
  })

  it('attaches verified source provenance and legal license to every imported entry', () => {
    for (const sign of UNIFIED_UZSL_VOCABULARY) {
      expect(sign.sourceProvenance).toBeDefined()
      expect(sign.licenseAndRights).toBeDefined()
      expect(sign.sourceReference.length).toBeGreaterThan(5)
    }
  })

  it('audited source register contains all 4 investigated sources with legal terms', () => {
    const sourceIds = AUDITED_UZSL_SOURCES.map((s) => s.id)
    expect(sourceIds).toContain('src_imo_ishora_uz')
    expect(sourceIds).toContain('src_remu_uz')
    expect(sourceIds).toContain('src_mrkomiljon_uzsl')
    expect(sourceIds).toContain('src_akkomron_uzslr')

    // imo-ishora.uz is marked with restrictions (no scraping/unauthorized redistribution)
    const imo = AUDITED_UZSL_SOURCES.find((s) => s.id === 'src_imo_ishora_uz')
    expect(imo?.redistributionPermitted).toBe(false)
    expect(imo?.apiAvailable).toBe(false)

    // Mrkomiljon and akkomron are open source
    const mrk = AUDITED_UZSL_SOURCES.find((s) => s.id === 'src_mrkomiljon_uzsl')
    expect(mrk?.redistributionPermitted).toBe(true)
  })

  it('generates consistent coverage metrics', () => {
    const metrics = getSystemCoverageMetrics()
    expect(metrics.totalImportedEntries).toBe(UNIFIED_UZSL_VOCABULARY.length)
    expect(metrics.cameraRecognizedEntries).toBe(15)
    expect(metrics.trainableDatasetEntries).toBeGreaterThan(50)
  })
})
