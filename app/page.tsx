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
  Cpu,
  RefreshCw,
  Info,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Subtitles,
  Activity,
  Zap,
  Flame,
  Download,
  Database,
  Radio,
  Sliders
} from 'lucide-react'
import {
  DACTYL_ALPHABET,
  DYNAMIC_SIGNS,
  TECHNICAL_ARCHITECTURE,
  PRIVACY_POLICY,
  CONTINUOUS_RECOGNITION_ARCHITECTURE,
  UzbekSignDefinition
} from '../lib/vocabulary'
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
  // Camera & MediaPipe State
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoadingModel, setIsLoadingModel] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)
  const [fps, setFps] = useState(0)

  // Subtitles / Captions UI controls
  const [showCaptions, setShowCaptions] = useState(true)
  const [captionSize, setCaptionSize] = useState<'normal' | 'large' | 'huge'>('large')

  // Recognition Output
  const [currentResult, setCurrentResult] = useState<ClassificationResult>({
    state: 'no_hand',
    gloss: null,
    confidence: 0,
    category: null,
    description: 'Kamera yoqilmagan. Uzluksiz muloqotni boshlash uchun "Kamerani yoqish" tugmasini bosing.',
  })
  const [holdProgress, setHoldProgress] = useState(0)
  const [recognizedText, setRecognizedText] = useState('')
  const [copied, setCopied] = useState(false)
  const [speechActive, setSpeechActive] = useState(false)
  const [activeTab, setActiveTab] = useState<'app' | 'dataset' | 'vocabulary' | 'architecture' | 'privacy'>('app')
  const [selectedVocab, setSelectedVocab] = useState<UzbekSignDefinition | null>(null)

  // Dataset Studio / Informed Consent State
  const [datasetConsent, setDatasetConsent] = useState(false)
  const [recordingLabel, setRecordingLabel] = useState('SALOM')
  const [isRecording, setIsRecording] = useState(false)
  const [recordedSamples, setRecordedSamples] = useState<RecordedSequenceSample[]>([])

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const handLandmarkerRef = useRef<any>(null)
  const animationFrameRef = useRef<number | null>(null)
  
  // Continuous recognition instances
  const decoderRef = useRef<ContinuousSignDecoder>(new ContinuousSignDecoder({
    staticDebounceFrames: 3,        // ~90ms, user does not need to pause!
    dynamicApexCooldownMs: 650,
    duplicateSignCooldownMs: 900,
    autoSpaceTimeoutMs: 1800,
  }))
  const collectorRef = useRef<LocalDatasetCollector>(new LocalDatasetCollector())
  const temporalFramesRef = useRef<TemporalFrame[]>([])

  // Throttle and performance refs
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
      console.warn('GPU delegate failed, falling back to CPU:', err)
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

  // Start Camera with optimal resolution (480x360 for high FPS on any device)
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

  // High-Performance Smooth Animation Loop (Continuous Adaptive Temporal Recognition)
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

          // Throttle CV inference to every 33ms (~30 FPS)
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

                // Update continuous temporal sliding window (last 16 frames ~ 500ms)
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

                // If dataset recorder is active, record frame coordinates
                if (collectorRef.current.isCurrentlyRecording()) {
                  collectorRef.current.captureFrame(landmarks3D)
                }

                // Extract Dynamic Kinematic Features
                const motionFeatures = extractMotionFeatures(temporalFramesRef.current)

                // Render Optimized Skeleton
                ctx.save()
                ctx.strokeStyle = motionFeatures.isReciprocatingHorizontal || motionFeatures.isReciprocatingVertical
                  ? '#ec4899' // Pink highlight on dynamic waving
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

                // Render Landmark Points in single batch
                for (let i = 0; i < landmarks3D.length; i++) {
                  const pt = landmarks3D[i]
                  const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20
                  ctx.beginPath()
                  ctx.arc(pt.x * canvas.width, pt.y * canvas.height, isTip ? 5 : 3.5, 0, 2 * Math.PI)
                  ctx.fillStyle = isTip ? '#10b981' : '#38bdf8'
                  ctx.fill()
                }
                ctx.restore()

                // Layer B: Continuous Kinematic Classification
                const classification = classifyContinuousHand(landmarks3D, motionFeatures)
                lastResultRef.current = classification

                // Layer C: Continuous Decoder & Auto-Debounce (NO pauses needed!)
                const decoderOutput = decoderRef.current.processContinuousFrame(
                  classification.state,
                  classification.gloss,
                  classification.category,
                  classification.isDynamicStroke,
                  timestamp
                )

                lastProgressRef.current = decoderOutput.holdProgress

                // Zero-lag direct DOM updates for bottom caption
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

                // If a new character/word is committed incrementally, update text
                if (decoderOutput.committed) {
                  setRecognizedText(decoderOutput.currentText)
                  if (captionTextDomRef.current) {
                    captionTextDomRef.current.innerText = decoderOutput.currentText
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

                if (captionGlossDomRef.current) {
                  captionGlossDomRef.current.innerText = 'Qo‘lingizni ko‘rsating...'
                }
                if (captionConfidenceDomRef.current) {
                  captionConfidenceDomRef.current.innerText = ''
                }
                if (motionBadgeDomRef.current) {
                  motionBadgeDomRef.current.innerText = 'Kutish rejimi'
                }
                if (holdProgressDomRef.current) {
                  holdProgressDomRef.current.style.width = '0%'
                }
                if (holdProgressTextDomRef.current) {
                  holdProgressTextDomRef.current.innerText = '0%'
                }
              }
            } catch (err) {
              console.error('Frame detection error:', err)
            } finally {
              isDetectingRef.current = false
            }

            // Sync React State at smooth 10 Hz (every 100ms)
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
  }, [isCameraActive])

  // Speech synthesis in Uzbek
  const speakText = () => {
    if (!recognizedText.trim() || typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(recognizedText)
    utterance.lang = 'uz-UZ'
    utterance.rate = 0.95

    utterance.onstart = () => setSpeechActive(true)
    utterance.onend = () => setSpeechActive(false)
    utterance.onerror = () => setSpeechActive(false)

    window.speechSynthesis.speak(utterance)
  }

  const copyToClipboard = () => {
    if (!recognizedText) return
    navigator.clipboard.writeText(recognizedText)
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
    if (captionTextDomRef.current) captionTextDomRef.current.innerText = updated
  }

  const handleClear = () => {
    decoderRef.current.clear()
    setRecognizedText('')
    if (captionTextDomRef.current) captionTextDomRef.current.innerText = ''
  }

  // Dataset recording controls
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
        setRecordedSamples(collectorRef.current.getSavedSamples())
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
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">iFlevox SignBridge</h1>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  Continuous UzSL
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                O‘zbek imo-ishora tilini pauzasiz, uzluksiz oqimda matnga aylantirish
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('app')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'app'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Uzluksiz Tarjima
            </button>
            <button
              onClick={() => setActiveTab('dataset')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'dataset'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Dataset Studio ({recordedSamples.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('vocabulary')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'vocabulary'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lug‘at ({DACTYL_ALPHABET.length + DYNAMIC_SIGNS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hidden md:flex items-center space-x-1.5 transition-all ${
                activeTab === 'architecture'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Arxitektura</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'privacy'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Maxfiylik</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error notification banner */}
        {modelError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/30 flex items-start space-x-3 text-red-200">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="font-semibold block text-red-100">Xatolik yuz berdi:</strong>
              {modelError}
            </div>
          </div>
        )}

        {/* Tab 1: Continuous Natural Camera & Zero-Lag Real Subtitle Interface */}
        {activeTab === 'app' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Camera with Real-Time Continuous Subtitles Overlay */}
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

                {/* Inactive State Overlay */}
                {!isCameraActive && (
                  <div className="flex flex-col items-center justify-center p-8 text-center z-10 max-w-md">
                    <div className="h-16 w-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-teal-400">
                      <Camera className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Uzluksiz jonli kamera rejimi</h3>
                    <p className="text-sm text-slate-400 mb-6">
                      Harflar orasida to‘xtamasdan tabiiy muloqot qiling. Tizim dinamik harakatlarni va daktil so‘zlarni uzluksiz oqimda avtomatik segmentatsiyalaydi.
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

                {/* Live Top Status Overlays */}
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

                {/* REAL-TIME SCREEN BOTTOM CAPTION (CONTINUOUS BROADCAST SUBTITLES) */}
                {isCameraActive && showCaptions && (
                  <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none flex flex-col items-center">
                    {/* Live Kinematic Stream Status Badge */}
                    <div className="mb-2">
                      <span
                        ref={motionBadgeDomRef}
                        className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-950/90 text-teal-300 border border-teal-500/30 backdrop-blur shadow-md uppercase tracking-wide"
                      >
                        Kuzatilmoqda
                      </span>
                    </div>

                    {/* CINEMATIC BROADCAST SUBTITLES / CAPTION BAR */}
                    <div className="w-full max-w-xl bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl flex flex-col items-center text-center">
                      {/* Active Live Word / Letter Display */}
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

                      {/* Cumulative Real-Time Continuous Transcript */}
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
                          {recognizedText || '[Subtitr matni shu yerda uzluksiz chiqadi]'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera & Caption Controls Bar */}
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

                {/* Caption size switch */}
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

            {/* Right Column: Continuous Recognition Dashboard & Full Text Log */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              {/* Current Detection State Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Joriy aniqlash holati
                  </span>
                  {currentResult.state === 'recognized' && (
                    <span className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Aniqlik: {Math.round(currentResult.confidence * 100)}%</span>
                    </span>
                  )}
                  {currentResult.state === 'transition' && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                      O‘tish harakati...
                    </span>
                  )}
                  {currentResult.state === 'unknown_gesture' && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      Noma’lum ishora
                    </span>
                  )}
                  {currentResult.state === 'no_hand' && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                      Kutish rejimi
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-inner">
                    {currentResult.state === 'recognized' ? (
                      <span className="text-3xl font-black text-teal-400 font-mono">
                        {currentResult.gloss}
                      </span>
                    ) : (
                      <HelpCircle className="w-7 h-7 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white">
                      {currentResult.state === 'recognized'
                        ? `Ishora: ${currentResult.gloss}`
                        : currentResult.state === 'transition'
                        ? 'Oraliq harakat'
                        : currentResult.state === 'unknown_gesture'
                        ? 'Model lug‘atida yo‘q'
                        : 'Qo‘l kutilmoqda'}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                      {currentResult.description}
                    </p>
                  </div>
                </div>

                {/* Honest Transparency Note */}
                <div className="pt-3 border-t border-slate-800/80 flex items-start space-x-2 text-[11px] text-slate-400">
                  <Info className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Zero-fabrication & Continuous Flow: Foydalanuvchi sun’iy ravishda to‘xtab qolishi shart emas. Ishoralar tezlanish va apels (kinematic peak) asosida darhol tan olinadi.
                  </span>
                </div>
              </div>

              {/* Text Output & Transcription Buffer */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Yig‘ilgan O‘zbekcha matn
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ({recognizedText.length} belgi)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={speakText}
                      disabled={!recognizedText.trim() || speechActive}
                      title="Ovoz chiqarib o‘qish"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors disabled:opacity-30"
                    >
                      <Volume2 className={`w-4 h-4 ${speechActive ? 'text-teal-400 animate-pulse' : ''}`} />
                    </button>
                    <button
                      onClick={copyToClipboard}
                      disabled={!recognizedText.trim()}
                      title="Nusxa olish"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors disabled:opacity-30"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={!recognizedText}
                      title="Tozalash"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Textarea representation */}
                <div className="min-h-[140px] p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-sans leading-relaxed text-slate-100 flex flex-col justify-between mb-3 shadow-inner">
                  <div className="break-words whitespace-pre-wrap">
                    {recognizedText || (
                      <span className="text-slate-600 italic">
                        Kameraga O‘zbek daktil harflari yoki ishoralarini ko‘rsatib, matn hosil qiling...
                      </span>
                    )}
                  </div>
                  {recognizedText && (
                    <div className="self-end text-[10px] text-slate-500 font-mono mt-2">
                      Tayyor
                    </div>
                  )}
                </div>

                {/* Buffer quick controls (Space, Backspace, Clear) */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleAddSpace}
                    className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all active:scale-95"
                  >
                    <Space className="w-3.5 h-3.5" />
                    <span>Bo‘sh joy (Space)</span>
                  </button>
                  <button
                    onClick={handleBackspace}
                    disabled={!recognizedText}
                    className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all active:scale-95 disabled:opacity-40"
                  >
                    <Delete className="w-3.5 h-3.5" />
                    <span>O‘chirish</span>
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={!recognizedText}
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
                  <span className="font-semibold text-slate-300">Tezkor tavsiya etilgan ishoralar:</span>
                  <button
                    onClick={() => setActiveTab('vocabulary')}
                    className="text-teal-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Barchasini ko‘rish</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DACTYL_ALPHABET.map((item) => (
                    <span
                      key={item.gloss}
                      className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono font-medium hover:border-teal-500 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedVocab(item)
                        setActiveTab('vocabulary')
                      }}
                      title={item.name}
                    >
                      {item.gloss}
                    </span>
                  ))}
                  {DYNAMIC_SIGNS.map((item) => (
                    <span
                      key={item.gloss}
                      className="px-2 py-0.5 rounded bg-teal-950/50 border border-teal-800/50 text-teal-300 font-mono text-[11px] hover:border-teal-400 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedVocab(item)
                        setActiveTab('vocabulary')
                      }}
                      title={item.description}
                    >
                      {item.gloss}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dataset Studio & Informed Consent Collection */}
        {activeTab === 'dataset' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
                    <Database className="w-5 h-5 text-teal-400" />
                    <span>Lokal O‘zbek Imo-ishora Ma’lumotlar To‘plami (Dataset Studio)</span>
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                    Kelgusida kengroq temporal modellarni (LSTM/Transformer) o‘qitish uchun haqiqiy imo-ishora 3D koordinatalarini to‘plash moduli. Hech qanday video yoki kadr serverga ketmaydi — faqat matematik nuqtalar brauzerda saqlanadi.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportDataset}
                    disabled={recordedSamples.length === 0}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-40"
                  >
                    <Download className="w-4 h-4" />
                    <span>JSON Eksport ({recordedSamples.length})</span>
                  </button>
                </div>
              </div>

              {/* Informed Consent Agreement */}
              <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={datasetConsent}
                    onChange={(e) => {
                      setDatasetConsent(e.target.checked)
                      collectorRef.current.setConsent(e.target.checked)
                    }}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-400"
                  />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white block mb-0.5">Xabardor qilingan rozilik (Informed Consent):</strong>
                    Men kameram orqali olingan qo‘l koordinatalari faqat O‘zbek imo-ishora tilini o‘rganuvchi ochiq kodli modelni rivojlantirish uchun lokal saqlanishiga roziman. Shaxsiy video tasvirlarim saqlanmasligi va istalgan payt ma’lumotlarni o‘chirib tashlash huquqim borligini tushunaman.
                  </div>
                </label>
              </div>

              {/* Recorder Toolbar */}
              <div className="mt-5 flex flex-wrap items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800 gap-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Yoziladigan ishora:</span>
                  <select
                    value={recordingLabel}
                    onChange={(e) => setRecordingLabel(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  >
                    {DYNAMIC_SIGNS.map((s) => (
                      <option key={s.gloss} value={s.gloss}>
                        {s.gloss} — {s.name}
                      </option>
                    ))}
                    {DACTYL_ALPHABET.map((s) => (
                      <option key={s.gloss} value={s.gloss}>
                        {s.gloss} (Daktil)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleToggleRecording}
                    disabled={!isCameraActive || !datasetConsent}
                    className={`inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                        : 'bg-teal-500 hover:bg-teal-400 text-slate-950 disabled:opacity-40'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>{isRecording ? 'Yozishni to‘xtatish' : 'Namuna yozishni boshlash'}</span>
                  </button>
                  {!isCameraActive && (
                    <span className="text-[11px] text-amber-400">Avval kamerani yoqing</span>
                  )}
                </div>
              </div>
            </div>

            {/* Saved Samples Grid */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-3">
                Lokal saqlangan ketma-ketliklar ({recordedSamples.length} ta namuna)
              </h3>
              {recordedSamples.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Hozircha yozib olingan namunalar yo‘q. Yuqoridagi tugma orqali o‘z ishoralaringizni yozib olishingiz mumkin.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {recordedSamples.map((sample) => (
                    <div
                      key={sample.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono text-teal-400 font-bold text-sm block">
                          {sample.label}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {sample.frames.length} kadr ({sample.fps} FPS) • {new Date(sample.recordedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteSample(sample.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Vocabulary Explorer */}
        {activeTab === 'vocabulary' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-2">
                O‘zbek imo-ishora tili (UzSL) — Qo‘llab-quvvatlanuvchi lug‘at
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mb-4">
                Ushbu tizim O‘zbekiston Kar-soqovlar jamiyati (UzbOI), 101-sonli ixtisoslashtirilgan maktab-internati va O‘zbek imo-ishora tili (UzSL) bo‘yicha ilmiy tadqiqotlar asosida shakllantirilgan.
              </p>
              <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/30 text-xs text-teal-200">
                <strong className="font-semibold block mb-1">Akademik va etik halollik bildirishnomasi:</strong>
                Amerika imo-ishora tili (ASL) yoki Koreys imo-ishora tili (KSL) O‘zbek imo-ishora tili deb soxtalashtirilmagan. Daktil harflari va so‘zlar mustaqil ilmiy manbalar bilan solishtirilib, faqat 100% tasdiqlangan pozalar kiritilgan.
              </div>
            </div>

            {/* Dynamic Signs Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span>Uzluksiz dinamik muloqot ishoralari (Dynamic Words)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DYNAMIC_SIGNS.map((item) => (
                  <div
                    key={item.gloss}
                    className={`p-4 rounded-xl bg-slate-900 border transition-all cursor-pointer ${
                      selectedVocab?.gloss === item.gloss
                        ? 'border-cyan-500 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => setSelectedVocab(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-cyan-400 font-mono">
                        {item.gloss}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium">
                        Dinamik so‘z
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1">{item.name}</h4>
                    <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                      <strong>Harakat:</strong> {item.motionType}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dactyl Alphabet Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                <span>O‘zbek daktil alifbosi (Barmoq harflari)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {DACTYL_ALPHABET.map((item) => (
                  <div
                    key={item.gloss}
                    className={`p-4 rounded-xl bg-slate-900 border transition-all cursor-pointer ${
                      selectedVocab?.gloss === item.gloss
                        ? 'border-teal-500 shadow-lg shadow-teal-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => setSelectedVocab(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-black text-teal-400 font-mono">
                        {item.gloss}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                        Daktil
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1">{item.name}</h4>
                    <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="text-[11px] text-teal-300 font-mono bg-slate-950/60 p-2 rounded border border-slate-800/80">
                      {item.handshapeDescription}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Technical Architecture & Continuous Recognition */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-2">
                {CONTINUOUS_RECOGNITION_ARCHITECTURE.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mb-4">
                {CONTINUOUS_RECOGNITION_ARCHITECTURE.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {CONTINUOUS_RECOGNITION_ARCHITECTURE.phases.map((ph, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-teal-400 block text-xs uppercase font-bold mb-1">
                      {ph.name}
                    </strong>
                    <p className="text-xs text-slate-400 leading-relaxed">{ph.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold mb-4 border border-teal-500/20">
                  A
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Qatlam 1: {TECHNICAL_ARCHITECTURE.layerA.name}
                </h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {TECHNICAL_ARCHITECTURE.layerA.model}
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>{TECHNICAL_ARCHITECTURE.layerA.landmarks}</li>
                  <li>{TECHNICAL_ARCHITECTURE.layerA.execution}</li>
                  <li>Hech qanday kadr serverga yuborilmaydi</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4 border border-cyan-500/20">
                  B
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Qatlam 2: {TECHNICAL_ARCHITECTURE.layerB.name}
                </h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {TECHNICAL_ARCHITECTURE.layerB.description}
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Tezlik (velocity) va yo‘nalish o‘zgarishlari</li>
                  <li>Stroke apex (kinematik cho‘qqi) tahlili</li>
                  <li>Soxta oraliq harakatlarni 'transition' sifatida ajratish</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-4 border border-indigo-500/20">
                  C
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Qatlam 3: {TECHNICAL_ARCHITECTURE.layerC.name}
                </h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {TECHNICAL_ARCHITECTURE.layerC.description}
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>{TECHNICAL_ARCHITECTURE.layerC.mechanism}</li>
                  <li>Takroriy soxta harflarni bostirish</li>
                  <li>Tabiiy pauzada avtomatik bo‘sh joy (space) kiritish</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Privacy & Ethics */}
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
          <p>© 2026 iFlevox SignBridge. O‘zbek imo-ishora tilini qo‘llab-quvvatlash tashabbusi.</p>
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
