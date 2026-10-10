'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Camera,
  CameraOff,
  Volume2,
  Copy,
  Check,
  Trash2,
  Space,
  Delete,
  ShieldCheck,
  BookOpen,
  RefreshCw,
  Info,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Subtitles,
  Flame,
  Languages
} from 'lucide-react'
import {
  UZSL_COMPREHENSIVE_VOCABULARY,
  DACTYL_ALPHABET,
  DYNAMIC_SIGNS,
  TECHNICAL_ARCHITECTURE,
  PRIVACY_POLICY,
  UzSLSignEntry
} from '../lib/vocabulary'
import { HeaderNav, TabKey } from '../components/HeaderNav'
import { DashboardView } from '../components/DashboardView'
import { VocabularyView } from '../components/VocabularyView'
import { DatasetStudioView } from '../components/DatasetStudioView'
import { SourcesView } from '../components/SourcesView'
import { GrammarView } from '../components/GrammarView'
import { translateUzSLSequence, TranslationResult } from '../lib/grammar-translator'
import { getSystemCoverageMetrics, SystemCoverageMetrics } from '../lib/coverage-metrics'
import {
  classifyContinuousHand,
  extractMotionFeatures,
  distance3D
} from '../lib/sign-classifier'
import { ContinuousSignDecoder } from '../lib/text-buffer'
import { LocalDatasetCollector } from '../lib/dataset-collector'
import {
  ClassificationResult,
  Landmark3D,
  TemporalFrame,
  DynamicMotionFeatures,
  RecordedSequenceSample
} from '../lib/recognition-types'

// MediaPipe Landmark Connection Pairs
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17], // Palm bottom
]

export default function SignBridgePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('app')

  // Camera & MediaPipe State
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoadingModel, setIsLoadingModel] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)
  const [fps, setFps] = useState(0)

  // Subtitles / Captions UI controls
  const [showCaptions, setShowCaptions] = useState(true)
  const [captionSize, setCaptionSize] = useState<'normal' | 'large' | 'huge'>('large')

  // Recognition & Translation Output
  const [currentResult, setCurrentResult] = useState<ClassificationResult>({
    state: 'no_hand',
    gloss: null,
    confidence: 0,
    category: null,
    description: 'Kamera yoqilmagan. Boshlash uchun "Kamerani yoqish" tugmasini bosing.',
  })
  const [holdProgress, setHoldProgress] = useState(0)
  const [recognizedTokens, setRecognizedTokens] = useState<string[]>([])
  const [recognizedText, setRecognizedText] = useState('')
  const [translationResult, setTranslationResult] = useState<TranslationResult>({
    rawGlosses: [],
    glossSequence: '',
    fluentUzbek: '',
    confidence: 1.0,
    isDirectMapping: true,
    uncertainTokens: [],
  })
  const [copied, setCopied] = useState(false)
  const [speechActive, setSpeechActive] = useState(false)

  // Dataset Studio / Informed Consent State
  const [datasetConsent, setDatasetConsent] = useState(false)
  const [recordingLabel, setRecordingLabel] = useState('SALOM')
  const [isRecording, setIsRecording] = useState(false)
  const [recordedSamples, setRecordedSamples] = useState<RecordedSequenceSample[]>([])

  // Coverage Metrics
  const [metrics, setMetrics] = useState<SystemCoverageMetrics>(getSystemCoverageMetrics())

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const handLandmarkerRef = useRef<any>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Continuous recognition instances
  const decoderRef = useRef<ContinuousSignDecoder>(new ContinuousSignDecoder({
    staticDebounceFrames: 3,
    dynamicApexCooldownMs: 650,
    duplicateSignCooldownMs: 900,
    autoSpaceTimeoutMs: 1800,
  }))
  const collectorRef = useRef<LocalDatasetCollector>(new LocalDatasetCollector())
  const temporalFramesRef = useRef<TemporalFrame[]>([])

  // Performance throttling refs
  const lastDetectTimeRef = useRef<number>(0)
  const lastStateUpdateRef = useRef<number>(0)
  const lastFpsTimeRef = useRef<number>(performance.now())
  const frameCountRef = useRef<number>(0)
  const isDetectingRef = useRef<boolean>(false)
  const lastResultRef = useRef<ClassificationResult>(currentResult)
  const lastProgressRef = useRef<number>(0)

  // Direct DOM refs for instant zero-lag caption rendering
  const captionGlossDomRef = useRef<HTMLSpanElement | null>(null)
  const captionConfidenceDomRef = useRef<HTMLSpanElement | null>(null)
  const captionTextDomRef = useRef<HTMLParagraphElement | null>(null)
  const holdProgressDomRef = useRef<HTMLDivElement | null>(null)
  const holdProgressTextDomRef = useRef<HTMLSpanElement | null>(null)
  const motionBadgeDomRef = useRef<HTMLSpanElement | null>(null)

  // Load saved local dataset samples on mount
  useEffect(() => {
    setRecordedSamples(collectorRef.current.getSavedSamples())
    setMetrics(getSystemCoverageMetrics())
  }, [])

  // Initialize MediaPipe HandLandmarker
  const initHandLandmarker = useCallback(async () => {
    if (handLandmarkerRef.current) return handLandmarkerRef.current

    try {
      setIsLoadingModel(true)
      setModelError(null)

      const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
      const vision = await FilesetResolver.forVisionTasks('/wasm')

      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.45,
        minHandPresenceConfidence: 0.45,
        minTrackingConfidence: 0.45,
      })

      handLandmarkerRef.current = landmarker
      setIsLoadingModel(false)
      return landmarker
    } catch (err: any) {
      console.warn('GPU delegate fallback to CPU:', err)
      try {
        const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
        const vision = await FilesetResolver.forVisionTasks('/wasm')
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.40,
          minHandPresenceConfidence: 0.40,
          minTrackingConfidence: 0.40,
        })
        handLandmarkerRef.current = landmarker
        setIsLoadingModel(false)
        return landmarker
      } catch (fallbackErr: any) {
        console.error('Failed to load MediaPipe model:', fallbackErr)
        setModelError('MediaPipe kompyuter ko‘rish modelini yuklab bo‘lmadi.')
        setIsLoadingModel(false)
        return null
      }
    }
  }, [])

  // Start Camera with optimal resolution (480x360)
  const startCamera = async () => {
    try {
      setModelError(null)
      const landmarker = await initHandLandmarker()
      if (!landmarker) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 480, max: 640 },
          height: { ideal: 360, max: 480 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user',
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsCameraActive(true)
        }
      }
    } catch (err: any) {
      console.error('Camera access error:', err)
      setModelError('Kameraga ulanishda xatolik yuz berdi. Brauzerda kamera ruxsatini bering.')
    }
  }

  // Stop Camera
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }

    setIsCameraActive(false)
    setHoldProgress(0)
    temporalFramesRef.current = []
    setCurrentResult({
      state: 'no_hand',
      gloss: null,
      confidence: 0,
      category: null,
      description: 'Kamera o‘chirilgan.',
    })
  }

  // Continuous Camera Loop (60 FPS rendering, throttled 30 FPS inference)
  useEffect(() => {
    if (!isCameraActive) return

    let isRunning = true

    const renderLoop = (timestamp: number) => {
      if (!isRunning) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const landmarker = handLandmarkerRef.current

      if (video && video.readyState >= 2 && canvas && landmarker) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }

        const ctx = canvas.getContext('2d', { alpha: true })
        if (ctx) {
          frameCountRef.current++
          if (timestamp - lastFpsTimeRef.current >= 1000) {
            setFps(frameCountRef.current)
            frameCountRef.current = 0
            lastFpsTimeRef.current = timestamp
          }

          const timeSinceLastDetect = timestamp - lastDetectTimeRef.current
          if (timeSinceLastDetect >= 33 && !isDetectingRef.current) {
            isDetectingRef.current = true
            lastDetectTimeRef.current = timestamp

            try {
              const detections = landmarker.detectForVideo(video, timestamp)
              ctx.clearRect(0, 0, canvas.width, canvas.height)

              if (detections.landmarks && detections.landmarks.length > 0) {
                const rawLandmarks = detections.landmarks[0]
                const landmarks3D: Landmark3D[] = rawLandmarks.map((pt: any) => ({
                  x: pt.x,
                  y: pt.y,
                  z: pt.z || 0,
                }))

                // Update continuous sliding window
                const palmScale = distance3D(landmarks3D[0], landmarks3D[9]) || 0.1
                temporalFramesRef.current.push({
                  landmarks: landmarks3D,
                  timestampMs: timestamp,
                  wristVelocity: 0,
                  fingersVelocity: 0,
                  palmScale,
                })
                if (temporalFramesRef.current.length > 16) {
                  temporalFramesRef.current.shift()
                }

                if (collectorRef.current.isCurrentlyRecording()) {
                  collectorRef.current.captureFrame(landmarks3D)
                }

                const motionFeatures = extractMotionFeatures(temporalFramesRef.current)

                // Skeleton Drawing
                ctx.save()
                ctx.strokeStyle = motionFeatures.isReciprocatingHorizontal || motionFeatures.isReciprocatingVertical
                  ? '#ec4899'
                  : '#06b6d4'
                ctx.lineWidth = 2.5
                ctx.beginPath()
                for (const [start, end] of HAND_CONNECTIONS) {
                  const p1 = landmarks3D[start]
                  const p2 = landmarks3D[end]
                  ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height)
                  ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height)
                }
                ctx.stroke()

                // Landmarks
                for (let i = 0; i < landmarks3D.length; i++) {
                  const pt = landmarks3D[i]
                  const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20
                  ctx.beginPath()
                  ctx.arc(pt.x * canvas.width, pt.y * canvas.height, isTip ? 5 : 3.5, 0, 2 * Math.PI)
                  ctx.fillStyle = isTip ? '#10b981' : '#38bdf8'
                  ctx.fill()
                }
                ctx.restore()

                // Layer B: Continuous Classification
                const classification = classifyContinuousHand(landmarks3D, motionFeatures)
                lastResultRef.current = classification

                // Layer C: Continuous Decoder
                const decoderOutput = decoderRef.current.processContinuousFrame(
                  classification.state,
                  classification.gloss,
                  classification.category,
                  classification.isDynamicStroke,
                  timestamp
                )

                lastProgressRef.current = decoderOutput.holdProgress

                // Zero-lag direct DOM updates
                if (captionGlossDomRef.current) {
                  if (classification.state === 'recognized') {
                    captionGlossDomRef.current.innerText = classification.gloss || ''
                    if (captionConfidenceDomRef.current) {
                      captionConfidenceDomRef.current.innerText = `(${Math.round(classification.confidence * 100)}%)`
                    }
                  } else if (classification.state === 'transition') {
                    captionGlossDomRef.current.innerText = '...'
                    if (captionConfidenceDomRef.current) captionConfidenceDomRef.current.innerText = ''
                  } else if (classification.state === 'unknown_gesture') {
                    captionGlossDomRef.current.innerText = 'Noma’lum ishora'
                    if (captionConfidenceDomRef.current) captionConfidenceDomRef.current.innerText = ''
                  }
                }

                if (motionBadgeDomRef.current) {
                  motionBadgeDomRef.current.innerText = classification.isDynamicStroke
                    ? '⚡ Dinamik Harakat'
                    : classification.category === 'dactyl_letter'
                    ? '🔤 Daktil Oqimi'
                    : 'Kuzatilmoqda'
                }

                if (holdProgressDomRef.current) {
                  holdProgressDomRef.current.style.width = `${Math.round(decoderOutput.holdProgress * 100)}%`
                }
                if (holdProgressTextDomRef.current) {
                  holdProgressTextDomRef.current.innerText = `${Math.round(decoderOutput.holdProgress * 100)}%`
                }

                if (decoderOutput.committed && decoderOutput.newChar) {
                  const updatedTokens = [...recognizedTokens, decoderOutput.newChar]
                  setRecognizedTokens(updatedTokens)
                  setRecognizedText(decoderOutput.currentText)

                  const translation = translateUzSLSequence(updatedTokens)
                  setTranslationResult(translation)

                  if (captionTextDomRef.current) {
                    captionTextDomRef.current.innerText = translation.fluentUzbek || decoderOutput.currentText
                  }
                }
              } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                temporalFramesRef.current = []
                lastResultRef.current = {
                  state: 'no_hand',
                  gloss: null,
                  confidence: 0,
                  category: null,
                  description: 'Qo‘l ko‘rinmayapti. Kameraga qo‘lingizni ko‘rsating.',
                }
                decoderRef.current.processContinuousFrame('no_hand', null, null, false, timestamp)
                lastProgressRef.current = 0

                if (captionGlossDomRef.current) captionGlossDomRef.current.innerText = 'Qo‘lingizni ko‘rsating...'
                if (captionConfidenceDomRef.current) captionConfidenceDomRef.current.innerText = ''
                if (motionBadgeDomRef.current) motionBadgeDomRef.current.innerText = 'Kutish rejimi'
                if (holdProgressDomRef.current) holdProgressDomRef.current.style.width = '0%'
                if (holdProgressTextDomRef.current) holdProgressTextDomRef.current.innerText = '0%'
              }
            } catch (err) {
              console.error('Frame error:', err)
            } finally {
              isDetectingRef.current = false
            }

            if (timestamp - lastStateUpdateRef.current >= 100) {
              setCurrentResult(lastResultRef.current)
              setHoldProgress(lastProgressRef.current)
              lastStateUpdateRef.current = timestamp
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop)
    }

    animationFrameRef.current = requestAnimationFrame(renderLoop)

    return () => {
      isRunning = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isCameraActive, recognizedTokens])

  const speakText = (textToSpeak?: string) => {
    const text = textToSpeak || translationResult.fluentUzbek || recognizedText
    if (!text.trim() || typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'uz-UZ'
    utterance.rate = 0.95

    utterance.onstart = () => setSpeechActive(true)
    utterance.onend = () => setSpeechActive(false)
    utterance.onerror = () => setSpeechActive(false)

    window.speechSynthesis.speak(utterance)
  }

  const copyToClipboard = (textToCopy?: string) => {
    const text = textToCopy || translationResult.fluentUzbek || recognizedText
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddSpace = () => {
    const updated = decoderRef.current.addSpace()
    setRecognizedText(updated)
    if (captionTextDomRef.current) captionTextDomRef.current.innerText = updated
  }

  const handleBackspace = () => {
    const updated = decoderRef.current.backspace()
    setRecognizedText(updated)
    if (recognizedTokens.length > 0) {
      const trimmed = recognizedTokens.slice(0, -1)
      setRecognizedTokens(trimmed)
      const tr = translateUzSLSequence(trimmed)
      setTranslationResult(tr)
      if (captionTextDomRef.current) captionTextDomRef.current.innerText = tr.fluentUzbek || updated
    }
  }

  const handleClear = () => {
    decoderRef.current.clear()
    setRecognizedTokens([])
    setRecognizedText('')
    setTranslationResult({
      rawGlosses: [],
      glossSequence: '',
      fluentUzbek: '',
      confidence: 1.0,
      isDirectMapping: true,
      uncertainTokens: [],
    })
    if (captionTextDomRef.current) captionTextDomRef.current.innerText = ''
  }

  const handleToggleRecording = () => {
    if (!isRecording) {
      if (!datasetConsent) {
        alert('Iltimos, avval tadqiqot roziligini tasdiqlang.')
        return
      }
      collectorRef.current.setConsent(true)
      const ok = collectorRef.current.startRecording(recordingLabel, 'dynamic_sign')
      if (ok) setIsRecording(true)
    } else {
      const sample = collectorRef.current.stopAndSave()
      setIsRecording(false)
      if (sample) {
        const updated = collectorRef.current.getSavedSamples()
        setRecordedSamples(updated)
        setMetrics(getSystemCoverageMetrics())
      }
    }
  }

  const handleExportDataset = () => {
    const jsonStr = collectorRef.current.exportDatasetJSON()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uzsl_dataset_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteSample = (id: string) => {
    collectorRef.current.deleteSample(id)
    setRecordedSamples(collectorRef.current.getSavedSamples())
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vocabCount={UZSL_COMPREHENSIVE_VOCABULARY.length}
        sampleCount={recordedSamples.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {modelError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/30 flex items-start space-x-3 text-red-200">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="font-semibold block text-red-100">Xatolik yuz berdi:</strong>
              {modelError}
            </div>
          </div>
        )}

        {/* Tab 1: Live Continuous Translation */}
        {activeTab === 'app' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Video Feed with Broadcast Captions */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center group">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 transition-opacity duration-200 ${
                    isCameraActive ? 'opacity-90' : 'opacity-0'
                  }`}
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none transition-opacity duration-200 ${
                    isCameraActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {!isCameraActive && (
                  <div className="flex flex-col items-center justify-center p-8 text-center z-10 max-w-md">
                    <div className="h-16 w-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-teal-400">
                      <Camera className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Uzluksiz jonli kamera rejimi</h3>
                    <p className="text-sm text-slate-400 mb-6">
                      Harflar va so‘zlar orasida to‘xtamasdan erkin muloqot qiling. Tizim dinamik harakatlarni va daktil so‘zlarni uzluksiz oqimda avtomatik segmentatsiyalaydi.
                    </p>
                    <button
                      onClick={startCamera}
                      disabled={isLoadingModel}
                      className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-lg shadow-teal-500/25 transition-all transform active:scale-95 disabled:opacity-50"
                    >
                      {isLoadingModel ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Model yuklanmoqda...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          <span>Kamerani yoqish</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {isCameraActive && (
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                    <div className="flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50 text-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-slate-200 font-medium">Uzluksiz oqim</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-teal-400 font-mono font-bold">{fps} FPS</span>
                    </div>

                    <div className="flex items-center space-x-2 pointer-events-auto">
                      <button
                        onClick={() => setShowCaptions(!showCaptions)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center space-x-1.5 backdrop-blur-md transition-all ${
                          showCaptions
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                            : 'bg-slate-950/80 text-slate-400 border-slate-700'
                        }`}
                        title="Subtitrlarni yoqish/o‘chirish"
                      >
                        <Subtitles className="w-3.5 h-3.5" />
                        <span>Subtitr {showCaptions ? 'ON' : 'OFF'}</span>
                      </button>

                      <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/50 text-xs text-slate-300 flex items-center space-x-1">
                        <Flame className="w-3 h-3 text-pink-400" />
                        <span>Pauzasiz</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Broadcast Subtitle Bar */}
                {isCameraActive && showCaptions && (
                  <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none flex flex-col items-center">
                    <div className="mb-2">
                      <span
                        ref={motionBadgeDomRef}
                        className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-950/90 text-teal-300 border border-teal-500/30 backdrop-blur shadow-md uppercase tracking-wide"
                      >
                        Kuzatilmoqda
                      </span>
                    </div>

                    <div className="w-full max-w-xl bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl flex flex-col items-center text-center">
                      <div className="flex items-center justify-center space-x-3 mb-1">
                        <span className="px-2 py-0.5 rounded bg-teal-500 text-slate-950 font-black text-[11px] font-mono uppercase tracking-wider">
                          Jonli
                        </span>
                        <span
                          ref={captionGlossDomRef}
                          className={`font-black tracking-wide text-teal-300 drop-shadow-[0_2px_8px_rgba(20,184,166,0.6)] ${
                            captionSize === 'huge'
                              ? 'text-3xl sm:text-4xl'
                              : captionSize === 'large'
                              ? 'text-2xl sm:text-3xl'
                              : 'text-xl sm:text-2xl'
                          }`}
                        >
                          {currentResult.gloss || 'Qo‘lingizni ko‘rsating...'}
                        </span>
                        <span ref={captionConfidenceDomRef} className="text-xs text-slate-400 font-medium">
                          {currentResult.confidence > 0 ? `(${Math.round(currentResult.confidence * 100)}%)` : ''}
                        </span>
                      </div>

                      <div className="w-full pt-2 border-t border-slate-800/80 mt-1">
                        <p
                          ref={captionTextDomRef}
                          className={`font-semibold tracking-normal text-white drop-shadow-md break-words ${
                            captionSize === 'huge'
                              ? 'text-lg sm:text-xl'
                              : captionSize === 'large'
                              ? 'text-base sm:text-lg'
                              : 'text-sm sm:text-base'
                          }`}
                        >
                          {translationResult.fluentUzbek || recognizedText || '[Subtitr matni shu yerda uzluksiz chiqadi]'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 gap-2">
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span>21 Landmark</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-pink-400" />
                    <span>Dinamik Harakat</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-xs text-slate-300 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 px-1 font-semibold uppercase">Shrift:</span>
                  <button
                    onClick={() => setCaptionSize('normal')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      captionSize === 'normal' ? 'bg-teal-500 text-slate-950 font-bold' : 'hover:text-white'
                    }`}
                  >
                    Oddiy
                  </button>
                  <button
                    onClick={() => setCaptionSize('large')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      captionSize === 'large' ? 'bg-teal-500 text-slate-950 font-bold' : 'hover:text-white'
                    }`}
                  >
                    Katta
                  </button>
                  <button
                    onClick={() => setCaptionSize('huge')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      captionSize === 'huge' ? 'bg-teal-500 text-slate-950 font-bold' : 'hover:text-white'
                    }`}
                  >
                    Ulkan
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {isCameraActive ? (
                    <button
                      onClick={stopCamera}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-all"
                    >
                      <CameraOff className="w-3.5 h-3.5" />
                      <span>Kamerani o‘chirish</span>
                    </button>
                  ) : (
                    <button
                      onClick={startCamera}
                      disabled={isLoadingModel}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 text-xs font-medium transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Kamerani yoqish</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Multi-Layer Translation Cards */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              {/* Fluent Uzbek Output Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-teal-500/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1.5">
                    <Languages className="w-4 h-4" />
                    <span>Yozma O‘zbekcha Tarjima (Grammatika)</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => speakText(translationResult.fluentUzbek)}
                      disabled={!translationResult.fluentUzbek || speechActive}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors"
                      title="Ovoz chiqarib o‘qish"
                    >
                      <Volume2 className={`w-4 h-4 ${speechActive ? 'text-teal-400 animate-pulse' : ''}`} />
                    </button>
                    <button
                      onClick={() => copyToClipboard(translationResult.fluentUzbek)}
                      disabled={!translationResult.fluentUzbek}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors"
                      title="Nusxa olish"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="min-h-[70px] p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center mb-2">
                  <p className="text-base font-semibold text-white leading-relaxed">
                    {translationResult.fluentUzbek || (
                      <span className="text-slate-600 italic font-normal text-sm">
                        Imo-ishora ketma-ketligi aniqlangach, bu yerda tabiiy o‘zbek tilidagi gap hosil bo‘ladi...
                      </span>
                    )}
                  </p>
                </div>

                {translationResult.appliedGrammarRule && (
                  <div className="text-[11px] text-teal-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-teal-400 flex-shrink-0" />
                    <span>Qoida: {translationResult.appliedGrammarRule}</span>
                  </div>
                )}
              </div>

              {/* Raw Sequence Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Aniqlangan Ishoralar Ketma-ketligi (Glosses)
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ({recognizedTokens.length} ta ishora)
                    </span>
                  </div>
                  <button
                    onClick={handleClear}
                    disabled={recognizedTokens.length === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Tozalash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="min-h-[60px] p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap gap-1.5 items-center mb-3">
                  {recognizedTokens.length === 0 ? (
                    <span className="text-xs text-slate-600 italic">
                      Hozircha ishoralar oqimi boshlanmadi...
                    </span>
                  ) : (
                    recognizedTokens.map((token, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800/80 font-mono text-xs font-bold"
                      >
                        {token}
                      </span>
                    ))
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleAddSpace}
                    className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all active:scale-95"
                  >
                    <Space className="w-3.5 h-3.5" />
                    <span>Bo‘sh joy</span>
                  </button>
                  <button
                    onClick={handleBackspace}
                    disabled={recognizedTokens.length === 0 && !recognizedText}
                    className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all active:scale-95 disabled:opacity-40"
                  >
                    <Delete className="w-3.5 h-3.5" />
                    <span>O‘chirish</span>
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={recognizedTokens.length === 0}
                    className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-900/40 transition-all active:scale-95 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Tozalash</span>
                  </button>
                </div>
              </div>

              {/* Supported Quick Reference Card */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-300">Faol modeldagi ishoralar:</span>
                  <button
                    onClick={() => setActiveTab('vocabulary')}
                    className="text-teal-400 hover:underline flex items-center space-x-1"
                  >
                    <span>To‘liq lug‘at</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {UZSL_COMPREHENSIVE_VOCABULARY.filter((s) => s.isSupportedInCurrentModel).map((item) => (
                    <span
                      key={item.gloss}
                      className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono font-medium hover:border-teal-500 transition-colors cursor-pointer"
                      onClick={() => setActiveTab('vocabulary')}
                      title={item.uzbekName}
                    >
                      {item.gloss}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Vocabulary Database */}
        {activeTab === 'vocabulary' && <VocabularyView />}

        {/* Tab 3: Grammar & Synthesis */}
        {activeTab === 'grammar' && <GrammarView />}

        {/* Tab 4: Dashboard & Metrics */}
        {activeTab === 'dashboard' && <DashboardView metrics={metrics} fps={fps} />}

        {/* Tab 5: Dataset Studio */}
        {activeTab === 'dataset' && (
          <DatasetStudioView
            recordedSamples={recordedSamples}
            isCameraActive={isCameraActive}
            isRecording={isRecording}
            datasetConsent={datasetConsent}
            recordingLabel={recordingLabel}
            setRecordingLabel={setRecordingLabel}
            setDatasetConsent={setDatasetConsent}
            onToggleRecording={handleToggleRecording}
            onExportDataset={handleExportDataset}
            onDeleteSample={handleDeleteSample}
          />
        )}

        {/* Tab 6: Sources Register */}
        {activeTab === 'sources' && <SourcesView />}

        {/* Tab 7: Privacy Policy */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-teal-400" />
                <span>{PRIVACY_POLICY.title}</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                iFlevox SignBridge foydalanuvchilarning shaxsiy daxlsizligi va maxfiyligini eng oliy qadriyat deb biladi. Kamera oqimi hech qachon tashqi serverga yuklanmaydi.
              </p>

              <div className="space-y-4">
                {PRIVACY_POLICY.commitments.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">{item.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 iFlevox SignBridge. O‘zbek imo-ishora tilini qo‘llab-quvvatlash platformasi.</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Uzluksiz va xolis AI</span>
            <span>•</span>
            <span>Lokal kompyuter ko‘rish</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
