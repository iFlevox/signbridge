import { RecognitionState } from './recognition-types'

export interface StableSignDetectorOptions {
  stableFramesThreshold?: number // Default: 7 consecutive frames of the same gloss
  cooldownMs?: number // Minimum delay between appending same letter repeatedly
}

export class SignSequenceBuffer {
  private lastGloss: string | null = null
  private consecutiveFrames = 0
  private lastCommitTimestamp = 0
  private textBuffer = ''
  private history: Array<{ gloss: string; timestamp: number; category: string }> = []

  private stableFramesThreshold: number
  private cooldownMs: number

  constructor(options: StableSignDetectorOptions = {}) {
    this.stableFramesThreshold = options.stableFramesThreshold ?? 7
    this.cooldownMs = options.cooldownMs ?? 1000
  }

  public processFrame(
    state: RecognitionState,
    gloss: string | null,
    category: string | null = null,
    now: number = Date.now()
  ): {
    committed: boolean
    newChar: string | null
    currentText: string
    isHolding: boolean
    holdProgress: number // 0 to 1
  } {
    if (state !== 'recognized' || !gloss) {
      this.consecutiveFrames = 0
      this.lastGloss = null
      return {
        committed: false,
        newChar: null,
        currentText: this.textBuffer,
        isHolding: false,
        holdProgress: 0,
      }
    }

    if (gloss === this.lastGloss) {
      this.consecutiveFrames++
    } else {
      this.lastGloss = gloss
      this.consecutiveFrames = 1
    }

    const holdProgress = Math.min(1, this.consecutiveFrames / this.stableFramesThreshold)

    if (this.consecutiveFrames >= this.stableFramesThreshold) {
      // Check cooldown if committing same gloss
      const isCoolingDown =
        this.history.length > 0 &&
        this.history[this.history.length - 1].gloss === gloss &&
        now - this.lastCommitTimestamp < this.cooldownMs

      if (!isCoolingDown) {
        this.commitGloss(gloss, category || 'unknown', now)
        this.consecutiveFrames = 0 // Reset after committing
        return {
          committed: true,
          newChar: gloss,
          currentText: this.textBuffer,
          isHolding: false,
          holdProgress: 0,
        }
      }
    }

    return {
      committed: false,
      newChar: null,
      currentText: this.textBuffer,
      isHolding: this.consecutiveFrames > 1,
      holdProgress,
    }
  }

  private commitGloss(gloss: string, category: string, timestamp: number) {
    this.lastCommitTimestamp = timestamp
    this.history.push({ gloss, timestamp, category })

    if (category === 'core_sign') {
      // Word signs appended with space
      if (this.textBuffer.length > 0 && !this.textBuffer.endsWith(' ')) {
        this.textBuffer += ' '
      }
      this.textBuffer += gloss + ' '
    } else {
      // Dactyl letters appended sequentially
      this.textBuffer += gloss
    }
  }

  public addSpace(): string {
    if (this.textBuffer.length > 0 && !this.textBuffer.endsWith(' ')) {
      this.textBuffer += ' '
    }
    return this.textBuffer
  }

  public backspace(): string {
    if (this.textBuffer.length > 0) {
      this.textBuffer = this.textBuffer.slice(0, -1)
    }
    return this.textBuffer
  }

  public clear(): void {
    this.textBuffer = ''
    this.consecutiveFrames = 0
    this.lastGloss = null
    this.history = []
  }

  public getText(): string {
    return this.textBuffer
  }

  public getHistory() {
    return [...this.history]
  }
}
