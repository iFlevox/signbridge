import { describe, expect, it } from 'vitest'
import { LocalDatasetCollector } from './dataset-collector'
import { Landmark3D } from './recognition-types'

function mockLandmarks(): Landmark3D[] {
  return Array.from({ length: 21 }, (_, i) => ({
    x: 0.5 + i * 0.01,
    y: 0.5 + i * 0.01,
    z: 0,
  }))
}

describe('LocalDatasetCollector Ethical Suite', () => {
  it('refuses to record when user consent has not been granted', () => {
    const collector = new LocalDatasetCollector()
    collector.setConsent(false)
    const started = collector.startRecording('SALOM', 'dynamic_sign')
    expect(started).toBe(false)
    expect(collector.isCurrentlyRecording()).toBe(false)
  })

  it('records coordinates when consent is explicitly granted', () => {
    const collector = new LocalDatasetCollector()
    collector.setConsent(true)
    const started = collector.startRecording('SALOM', 'dynamic_sign')
    expect(started).toBe(true)
    expect(collector.isCurrentlyRecording()).toBe(true)

    // Capture 8 frames
    for (let i = 0; i < 8; i++) {
      collector.captureFrame(mockLandmarks())
    }
    expect(collector.getCurrentFrameCount()).toBe(8)

    const sample = collector.stopAndSave()
    expect(sample).not.toBeNull()
    expect(sample?.label).toBe('SALOM')
    expect(sample?.signerConsent).toBe(true)
    expect(sample?.frames.length).toBe(8)
    expect(collector.isCurrentlyRecording()).toBe(false)
  })

  it('generates a valid exportable JSON dataset conforming to UzSL schema', () => {
    const collector = new LocalDatasetCollector()
    const jsonStr = collector.exportDatasetJSON()
    const parsed = JSON.parse(jsonStr)
    expect(parsed.datasetName).toContain('iFlevox SignBridge')
    expect(Array.isArray(parsed.samples)).toBe(true)
  })
})
