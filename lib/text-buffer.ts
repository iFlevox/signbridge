import { RecognitionState } from './recognition-types'

export interface ContinuousDecoderOptions {
  staticDebounceFrames?: number   // Frames needed for static dactyl letters (e.g. 4 frames = ~120ms at 30fps)
  dynamicApexCooldownMs?: number  // Cooldown after emitting dynamic sign to prevent re-triggering (e.g. 700ms)
  duplicateSignCooldownMs?: number // Cooldown before same sign can be emitted consecutively
  autoSpaceTimeoutMs?: number      // Idle duration after which a space is added between words
}

export interface DecoderFrameOutput {
  committed: boolean
  newChar: string | null
  currentText: string
  isDynamic: boolean
  isHolding: boolean
  holdProgress: number // 0 to 1
  state: RecognitionState
}

export class ContinuousSignDecoder {
  private textBuffer = ''
  private history: Array<{ gloss: string; timestamp: number; category: string; isDynamic: boolean }> = []

  private currentCandidate: string | null = null
  private candidateFrames = 0
  private lastCommitTimestamp = 0
  private lastHandSeenTimestamp = 0

  private staticDebounceFrames: number
  private dynamicApexCooldownMs: number
  private duplicateSignCooldownMs: number
  private autoSpaceTimeoutMs: number

  constructor(options: ContinuousDecoderOptions = {}) {
    // Highly responsive: 4 frames (~120ms) is enough without user needing to pause
    this.staticDebounceFrames = options.staticDebounceFrames ?? 4
    this.dynamicApexCooldownMs = options.dynamicApexCooldownMs ?? 650
    this.duplicateSignCooldownMs = options.duplicateSignCooldownMs ?? 900
    this.autoSpaceTimeoutMs = options.autoSpaceTimeoutMs ?? 1800
  }

  public processContinuousFrame(
    state: RecognitionState,
    gloss: string | null,
    category: string | null = null,
    isDynamicStroke = false,
    now: number = Date.now()
  ): DecoderFrameOutput {
    // 1. Hand presence and automatic word spacing on natural pause
    if (state === 'no_hand') {
      if (
        this.lastHandSeenTimestamp > 0 &&
        now - this.lastHandSeenTimestamp > this.autoSpaceTimeoutMs &&
        this.textBuffer.length > 0 &&
        !this.textBuffer.endsWith(' ')
      ) {
        this.textBuffer += ' '
        this.lastHandSeenTimestamp = 0
      }

      this.currentCandidate = null
      this.candidateFrames = 0
      return {
        committed: false,
        newChar: null,
        currentText: this.textBuffer,
        isDynamic: false,
        isHolding: false,
        holdProgress: 0,
        state: 'no_hand',
      }
    }

    this.lastHandSeenTimestamp = now

    // 2. Ignore transition or unknown states without resetting buffer
    if (state === 'transition' || state === 'unknown_gesture' || !gloss) {
      this.currentCandidate = null
      this.candidateFrames = 0
      return {
        committed: false,
        newChar: null,
        currentText: this.textBuffer,
        isDynamic: false,
        isHolding: false,
        holdProgress: 0,
        state,
      }
    }

    const isDynamic = category === 'dynamic_sign' || isDynamicStroke

    // 3. Dynamic stroke apex: Emits immediately at the peak with zero pause required!
    if (isDynamic) {
      const timeSinceLast = now - this.lastCommitTimestamp
      const isSameAsLast =
        this.history.length > 0 && this.history[this.history.length - 1].gloss === gloss

      // Check cooldown to prevent duplicate triggers from a single continuous gesture
      if (timeSinceLast >= this.dynamicApexCooldownMs && (!isSameAsLast || timeSinceLast >= this.duplicateSignCooldownMs)) {
        this.commitGloss(gloss, category || 'dynamic_sign', true, now)
        this.currentCandidate = null
        this.candidateFrames = 0
        return {
          committed: true,
          newChar: gloss,
          currentText: this.textBuffer,
          isDynamic: true,
          isHolding: false,
          holdProgress: 1,
          state: 'recognized',
        }
      }

      return {
        committed: false,
        newChar: null,
        currentText: this.textBuffer,
        isDynamic: true,
        isHolding: true,
        holdProgress: 1,
        state: 'recognized',
      }
    }

    // 4. Continuous Static / Dactyl: Minimal adaptive debounce (3-4 frames ~ 100ms)
    if (gloss === this.currentCandidate) {
      this.candidateFrames++
    } else {
      this.currentCandidate = gloss
      this.candidateFrames = 1
    }

    const holdProgress = Math.min(1, this.candidateFrames / this.staticDebounceFrames)

    if (this.candidateFrames >= this.staticDebounceFrames) {
      const timeSinceLast = now - this.lastCommitTimestamp
      const isSameAsLast =
        this.history.length > 0 && this.history[this.history.length - 1].gloss === gloss

      if (!isSameAsLast || timeSinceLast >= this.duplicateSignCooldownMs) {
        this.commitGloss(gloss, category || 'dactyl_letter', false, now)
        this.candidateFrames = 0 // Reset after commit
        return {
          committed: true,
          newChar: gloss,
          currentText: this.textBuffer,
          isDynamic: false,
          isHolding: false,
          holdProgress: 0,
          state: 'recognized',
        }
      }
    }

    return {
      committed: false,
      newChar: null,
      currentText: this.textBuffer,
      isDynamic: false,
      isHolding: this.candidateFrames > 1,
      holdProgress,
      state: 'recognized',
    }
  }

  private commitGloss(gloss: string, category: string, isDynamic: boolean, timestamp: number) {
    this.lastCommitTimestamp = timestamp
    this.history.push({ gloss, timestamp, category, isDynamic })

    if (isDynamic || category === 'core_sign') {
      // Dynamic signs emitted as distinct words with clean spacing
      if (this.textBuffer.length > 0 && !this.textBuffer.endsWith(' ')) {
        this.textBuffer += ' '
      }
      this.textBuffer += gloss + ' '
    } else {
      // Finger-spelled dactyl letters appended directly to form continuous words
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
      // If trailing space, remove word or space
      if (this.textBuffer.endsWith(' ')) {
        this.textBuffer = this.textBuffer.trimEnd()
      } else {
        this.textBuffer = this.textBuffer.slice(0, -1)
      }
    }
    return this.textBuffer
  }

  public clear(): void {
    this.textBuffer = ''
    this.candidateFrames = 0
    this.currentCandidate = null
    this.history = []
  }

  public getText(): string {
    return this.textBuffer
  }

  public getHistory() {
    return [...this.history]
  }
}

// Backward-compatible export
export const SignSequenceBuffer = ContinuousSignDecoder
