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
  Sliders
} from 'lucide-react'
import {
  DACTYL_ALPHABET,
  CORE_SIGNS,
  TECHNICAL_ARCHITECTURE,
  PRIVACY_POLICY,
  UzbekSignDefinition
} from '../lib/vocabulary'
import { classifyHandLandmarks } from '../lib/sign-classifier'
import { SignSequenceBuffer } from '../lib/text-buffer'
import { ClassificationResult, Landmark3D } from '../lib/recognition-types'

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
    description: 'Kamera yoqilmagan. Boshlash uchun "Kamerani yoqish" tugmasini bosing.',
  })
  const [holdProgress, setHoldProgress] = useState(0)
  const [recognizedText, setRecognizedText] = useState('')
  const [lastCommittedSign, setLastCommittedSign] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [speechActive, setSpeechActive] = useState(false)
  const [activeTab, setActiveTab] = useState<'app' | 'vocabulary' | 'architecture' | 'privacy'>('app')
  const [selectedVocab, setSelectedVocab] = useState<UzbekSignDefinition | null>(null)

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const handLandmarkerRef = useRef<any>(null)
  const animationFrameRef = useRef<number | null>(null)
  const signBufferRef = useRef<SignSequenceBuffer>(new SignSequenceBuffer({ stableFramesThreshold: 8, cooldownMs: 1200 }))
  const lastTimeRef = useRef<number>(performance.now())
  const frameCountRef = useRef<number>(0)

  // Initialize MediaPipe HandLandmarker
  const initHandLandmarker = useCallback(async () => {
    if (handLandmarkerRef.current) return handLandmarkerRef.current

    try {
      setIsLoadingModel(true)
      setModelError(null)

      const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
      
      // Load wasm locally
      const vision = await FilesetResolver.forVisionTasks('/wasm')

      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      handLandmarkerRef.current = landmarker
      setIsLoadingModel(false)
      return landmarker
    } catch (err: any) {
      console.warn('GPU delegate failed or WASM loading issue, falling back to CPU:', err)
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
          minHandDetectionConfidence: 0.45,
          minHandPresenceConfidence: 0.45,
          minTrackingConfidence: 0.45,
        })
        handLandmarkerRef.current = landmarker
        setIsLoadingModel(false)
        return landmarker
      } catch (fallbackErr: any) {
        console.error('Failed to load MediaPipe model:', fallbackErr)
        setModelError('MediaPipe kompyuter ko‘rish modelini yuklab bo‘lmadi. Brauzer WebAssembly yoki WebGL ni qo‘llab-quvvatlashini tekshiring.')
        setIsLoadingModel(false)
        return null
      }
    }
  }, [])

  // Start Camera
  const startCamera = async () => {
    try {
      setModelError(null)
      const landmarker = await initHandLandmarker()
      if (!landmarker) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
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
      setModelError('Kameraga ulanishda xatolik yuz berdi. Iltimos, brauzerda kamera ruxsatini bering.')
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

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }

    setIsCameraActive(false)
    setHoldProgress(0)
    setCurrentResult({
      state: 'no_hand',
      gloss: null,
      confidence: 0,
      category: null,
      description: 'Kamera o‘chirilgan. Ishni davom ettirish uchun kamerani yoqing.',
    })
  }

  // Main Detection Loop
  useEffect(() => {
    if (!isCameraActive) return

    let isRunning = true

    const renderLoop = () => {
      if (!isRunning) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const landmarker = handLandmarkerRef.current

      if (video && video.readyState >= 2 && canvas && landmarker) {
        // Sync canvas size
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          const startTimeMs = performance.now()
          const detections = landmarker.detectForVideo(video, startTimeMs)

          // Measure FPS
          frameCountRef.current++
          if (startTimeMs - lastTimeRef.current >= 1000) {
            setFps(frameCountRef.current)
            frameCountRef.current = 0
            lastTimeRef.current = startTimeMs
          }

          if (detections.landmarks && detections.landmarks.length > 0) {
            const rawLandmarks = detections.landmarks[0]
            const landmarks3D: Landmark3D[] = rawLandmarks.map((pt: any) => ({
              x: pt.x,
              y: pt.y,
              z: pt.z || 0,
            }))

            // Draw Skeleton
            ctx.save()
            ctx.strokeStyle = '#06b6d4' // Teal-cyan
            ctx.lineWidth = 3

            for (const [start, end] of HAND_CONNECTIONS) {
              const p1 = landmarks3D[start]
              const p2 = landmarks3D[end]
              ctx.beginPath()
              ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height)
              ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height)
              ctx.stroke()
            }

            // Draw Landmark Points
            for (let i = 0; i < landmarks3D.length; i++) {
              const pt = landmarks3D[i]
              ctx.beginPath()
              ctx.arc(pt.x * canvas.width, pt.y * canvas.height, i % 4 === 0 ? 6 : 4, 0, 2 * Math.PI)
              ctx.fillStyle = i === 4 || i === 8 || i === 12 || i === 16 || i === 20 ? '#10b981' : '#38bdf8'
              ctx.fill()
              ctx.strokeStyle = '#ffffff'
              ctx.lineWidth = 1.5
              ctx.stroke()
            }
            ctx.restore()

            // Run Layer B: Sign Classification
            const classification = classifyHandLandmarks(landmarks3D)
            setCurrentResult(classification)

            // Run Layer C: Buffer & Debouncing
            const bufferRes = signBufferRef.current.processFrame(
              classification.state,
              classification.gloss,
              classification.category,
              startTimeMs
            )

            setHoldProgress(bufferRes.holdProgress)
            if (bufferRes.committed) {
              setRecognizedText(bufferRes.currentText)
              setLastCommittedSign(bufferRes.newChar)
            }
          } else {
            // No hand detected
            setCurrentResult({
              state: 'no_hand',
              gloss: null,
              confidence: 0,
              category: null,
              description: 'Qo‘l ko‘rinmayapti. Kameraga qo‘lingizni ko‘rsating.',
            })
            signBufferRef.current.processFrame('no_hand', null)
            setHoldProgress(0)
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop)
    }

    renderLoop()

    return () => {
      isRunning = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isCameraActive])

  // Speech synthesis in Uzbek / international fallback
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
    const updated = signBufferRef.current.addSpace()
    setRecognizedText(updated)
  }

  const handleBackspace = () => {
    const updated = signBufferRef.current.backspace()
    setRecognizedText(updated)
  }

  const handleClear = () => {
    signBufferRef.current.clear()
    setRecognizedText('')
    setLastCommittedSign(null)
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
                  UzSL v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                O‘zbek imo-ishora tilini kompyuter ko‘rish orqali matnga aylantirish tizimi
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('app')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'app'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Kamera & Subtitr
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
              <span>Lug‘at ({DACTYL_ALPHABET.length + CORE_SIGNS.length})</span>
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

        {/* Tab 1: Main Camera & Real Subtitle/Caption Interface */}
        {activeTab === 'app' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Camera with Real-Time Bottom Captions Overlay */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center group">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                    isCameraActive ? 'opacity-90' : 'opacity-0'
                  }`}
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none transition-opacity duration-300 ${
                    isCameraActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Inactive State Overlay */}
                {!isCameraActive && (
                  <div className="flex flex-col items-center justify-center p-8 text-center z-10 max-w-md">
                    <div className="h-16 w-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-teal-400">
                      <Camera className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Jonli kamera faollashtirilmagan</h3>
                    <p className="text-sm text-slate-400 mb-6">
                      O‘zbek daktil alifbosi va ishoralarini ko‘rsating — ekranning pastida real vaqtda haqiqiy subtitr (caption) paydo bo‘ladi.
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
                      <span className="text-slate-200 font-medium">Jonli tahlil</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-400 font-mono">{fps} FPS</span>
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
                        <Lock className="w-3 h-3 text-teal-400" />
                        <span>Lokal</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* REAL-TIME SCREEN BOTTOM CAPTION (HAQIQIY JONLI SUBTITR PANELI) */}
                {isCameraActive && showCaptions && (
                  <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none flex flex-col items-center">
                    {/* Live Hold Progress Bar */}
                    {holdProgress > 0 && (
                      <div className="w-full max-w-lg mb-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-teal-300 px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur border border-teal-500/30 mb-1">
                          <span className="flex items-center space-x-1.5">
                            <Activity className="w-3 h-3 animate-pulse text-teal-400" />
                            <span>Aniqlanmoqda: "{currentResult.gloss}"</span>
                          </span>
                          <span>{Math.round(holdProgress * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-teal-400 to-cyan-300 transition-all duration-75 shadow-sm"
                            style={{ width: `${holdProgress * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* CINEMATIC BROADCAST SUBTITLES / CAPTION BAR */}
                    <div className="w-full max-w-xl bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl flex flex-col items-center text-center">
                      {/* Active Live Word / Letter Display */}
                      <div className="flex items-center justify-center space-x-3 mb-1">
                        {currentResult.state === 'recognized' ? (
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-teal-500 text-slate-950 font-black text-xs font-mono uppercase tracking-wider">
                              Jonli
                            </span>
                            <span
                              className={`font-black tracking-wide text-teal-300 drop-shadow-[0_2px_8px_rgba(20,184,166,0.6)] ${
                                captionSize === 'huge'
                                  ? 'text-3xl sm:text-4xl'
                                  : captionSize === 'large'
                                  ? 'text-2xl sm:text-3xl'
                                  : 'text-xl sm:text-2xl'
                              }`}
                            >
                              {currentResult.gloss}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              ({Math.round(currentResult.confidence * 100)}%)
                            </span>
                          </div>
                        ) : currentResult.state === 'unknown_gesture' ? (
                          <div className="flex items-center space-x-2 text-amber-400 text-xs sm:text-sm font-medium">
                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                            <span>Noma’lum ishora (lug‘atda yo‘q)</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                            <span>Qo‘lingizni kameraga ko‘rsating...</span>
                          </div>
                        )}
                      </div>

                      {/* Cumulative Real-Time Sentence Transcript (Pastki doimiy subtitr matni) */}
                      <div className="w-full pt-2 border-t border-slate-800/80 mt-1">
                        <p
                          className={`font-semibold tracking-normal text-white drop-shadow-md break-words ${
                            captionSize === 'huge'
                              ? 'text-lg sm:text-xl'
                              : captionSize === 'large'
                              ? 'text-base sm:text-lg'
                              : 'text-sm sm:text-base'
                          }`}
                        >
                          {recognizedText ? (
                            <>
                              <span className="text-slate-100">{recognizedText}</span>
                              <span className="inline-block w-1.5 h-4 ml-1 bg-teal-400 animate-pulse align-middle" />
                            </>
                          ) : (
                            <span className="text-slate-400 italic font-normal text-xs sm:text-sm">
                              [Subtitr matni shu yerda jonli chiqadi]
                            </span>
                          )}
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
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Barmoq uchlari</span>
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

            {/* Right Column: Recognition Dashboard & Full Text Log */}
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
                    Zero-fabrication kafolati: Ishora ekranning pastiga haqiqiy kompyuter ko‘rish modeli orqali ishonchli aniqlangandagina subtitr sifatida chiqariladi.
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
                  {CORE_SIGNS.map((item) => (
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

        {/* Tab 2: Vocabulary Explorer & Research Documentation */}
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

            {/* Core Signs Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span>Asosiy muloqot ishoralari (So‘zlar)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CORE_SIGNS.map((item) => (
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
                        So‘z ishorasi
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
          </div>
        )}

        {/* Tab 3: Technical Architecture & Real CV Transparency */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-2">
                Haqiqiy kompyuter ko‘rish tizimi arxitekturasi
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                {TECHNICAL_ARCHITECTURE.overview}
              </p>
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
                  <li>Barmoqlar egriligi (curl ratio), barmoqlararo masofalar</li>
                  <li>Kaft miqyosiga moslangan nisbatlar</li>
                  <li>Noma’lum holatda soxta natija berilmaydi</li>
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
                  <li>Takroriy tebranishlarni (jitter) bartaraf etish</li>
                  <li>Matnni uzluksiz so‘zlarga jamlash</li>
                </ul>
              </div>
            </div>

            {/* Zero Fake AI Commitment */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <span>Soxta sun’iy intellektga qarshi muhandislik tamoyillari</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-slate-100 block mb-1">Haqiqiy ishonchlilik ko‘rsatkichi:</strong>
                  Confidence ko‘rsatkichlari Math.random() yoki tasodifiy sonlar generatori orqali yozilmaydi. Ular geometrik chegaralar va modelning haqiqiy signal aniqligiga tayanadi.
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-slate-100 block mb-1">To‘g‘ri rad etish (Honest fallback):</strong>
                  Agar kadrda noaniq harakat bo‘lsa, tizim "tushundim" deb yolg‘on tarjima qilmaydi, balki to‘g‘ridan-to‘g‘ri "noma’lum ishora" deb xabar beradi.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Privacy & Ethics */}
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

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2">Qurilmada to‘liq mustaqil ishlash</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tizimning barcha komponentlari (WebAssembly, MediaPipe modeli va klassifikator) brauzeringiz xotirasida ishlaydi. Internet aloqasi uzilgan holatda ham (sahifa bir marta yuklangandan so‘ng) tizim kamera bilan to‘laqonli ishlashda davom eta oladi.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 iFlevox SignBridge. O‘zbek imo-ishora tilini qo‘llab-quvvatlash tashabbusi.</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Ochiq kodli va xolis AI</span>
            <span>•</span>
            <span>Lokal kompyuter ko‘rish</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
