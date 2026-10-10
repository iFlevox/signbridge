import { Landmark3D, RecordedSequenceSample } from './recognition-types'

/**
 * iFlevox SignBridge — Consented Local Dataset Collection & Export Utility
 *
 * Implements strict privacy & data sovereignty:
 * - ONLY extracts and saves 3D landmark coordinates (never camera pixels or video files).
 * - Requires explicit signer consent before recording starts.
 * - Stored exclusively in browser localStorage / IndexedDB.
 * - Exportable as standard JSON dataset conforming to UzSL research format.
 * - One-click delete / wipe controls.
 */

const STORAGE_KEY = 'iflevox_signbridge_local_sequences_v1'

export class LocalDatasetCollector {
  private activeSequence: Array<{ timestampMs: number; landmarks: Landmark3D[] }> = []
  private isRecording = false
  private currentLabel = ''
  private currentCategory: 'dactyl_letter' | 'dynamic_sign' | 'core_sign' = 'dynamic_sign'
  private consentGiven = false
  private startTime = 0

  public setConsent(consent: boolean) {
    this.consentGiven = consent
  }

  public getConsent(): boolean {
    return this.consentGiven
  }

  public startRecording(label: string, category: 'dactyl_letter' | 'dynamic_sign' | 'core_sign'): boolean {
    if (!this.consentGiven) {
      console.warn('Dataset collection requires explicit user consent.')
      return false
    }

    this.currentLabel = label
    this.currentCategory = category
    this.activeSequence = []
    this.isRecording = true
    this.startTime = performance.now()
    return true
  }

  public captureFrame(landmarks: Landmark3D[]) {
    if (!this.isRecording) return

    const now = performance.now()
    this.activeSequence.push({
      timestampMs: Math.round(now - this.startTime),
      landmarks: landmarks.map((p) => ({
        x: Math.round(p.x * 10000) / 10000,
        y: Math.round(p.y * 10000) / 10000,
        z: Math.round((p.z || 0) * 10000) / 10000,
      })),
    })
  }

  public stopAndSave(): RecordedSequenceSample | null {
    if (!this.isRecording || this.activeSequence.length < 5) {
      this.isRecording = false
      this.activeSequence = []
      return null
    }

    this.isRecording = false
    const duration = this.activeSequence[this.activeSequence.length - 1].timestampMs
    const fps = Math.round((this.activeSequence.length / (duration / 1000)) || 30)

    const sample: RecordedSequenceSample = {
      id: `sample_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      label: this.currentLabel,
      category: this.currentCategory,
      recordedAt: new Date().toISOString(),
      signerConsent: true,
      fps,
      frames: this.activeSequence,
    }

    this.saveSampleLocally(sample)
    this.activeSequence = []
    return sample
  }

  public cancelRecording() {
    this.isRecording = false
    this.activeSequence = []
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording
  }

  public getCurrentFrameCount(): number {
    return this.activeSequence.length
  }

  private saveSampleLocally(sample: RecordedSequenceSample) {
    if (typeof window === 'undefined') return
    try {
      const existing = this.getSavedSamples()
      existing.push(sample)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    } catch (err) {
      console.error('Failed to store sequence locally:', err)
    }
  }

  public getSavedSamples(): RecordedSequenceSample[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  public deleteSample(id: string) {
    if (typeof window === 'undefined') return
    const filtered = this.getSavedSamples().filter((s) => s.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  }

  public clearAll() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }

  public exportDatasetJSON(): string {
    const samples = this.getSavedSamples()
    return JSON.stringify(
      {
        datasetName: 'iFlevox SignBridge — Consented Uzbek Sign Language Keypoint Corpus',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        totalSamples: samples.length,
        coordinateSystem: 'Normalized 21 MediaPipe 3D Hand Landmarks',
        samples,
      },
      null,
      2
    )
  }
}
