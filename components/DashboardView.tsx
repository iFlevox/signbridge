'use client'

import React from 'react'
import { getSystemCoverageMetrics } from '@/lib/coverage-metrics'
import { AUDITED_UZSL_SOURCES } from '@/lib/source-register'

export function DashboardView() {
  const metrics = getSystemCoverageMetrics()

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/40 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Ochiq va Halol Qamrov Xaritasi (Honest Coverage Audit)
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              O‘zbek Imo-Ishoʻra Tili (UzSL) Qamrov Paneli
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
              SignBridge platformasida lug‘at qidiruvi (Dictionary Lookup) va jonli kamerada tanib olish (Real-time Vision Inference)
              qat’iy ajratilgan. Quyidagi ko‘rsatkichlar sun’iy ravishda oshirilmagan va qayta tekshiriladigan haqiqiy ma’lumotlarga asoslanadi.
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Birlashgan Lug‘at</span>
            <span className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">{metrics.totalImportedEntries}</span>
            <span className="text-xs text-slate-400 mt-1">tasdiqlangan imo-ishoralar</span>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars of Integration: Imported vs Trainable vs Camera Recognizable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Birlashgan Lug‘at</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Audit qilingan</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">{metrics.totalImportedEntries} ta</div>
          <p className="text-xs text-slate-400 mt-2">
            28 ta daktil harf + 50 ta UzSLR dinamik imo-ishora + 6 ta kundalik nutq birikmasi.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">O‘rgatishga Tayyor</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ochiq Dataset</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">{metrics.trainableDatasetEntries} ta</div>
          <p className="text-xs text-slate-400 mt-2">
            MediaPipe Hand (2,800 namuna) hamda 32-kadrli Holistic Transformer vaznlari bilan ta’minlangan.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jonli Kamera Modeli</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Haqiqiy Vaqtda</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">{metrics.cameraRecognizedEntries} ta</div>
          <p className="text-xs text-slate-400 mt-2">
            {metrics.cameraDynamicSignsCount} ta dinamik harakat + {metrics.cameraDactylLettersCount} ta daktil harf to‘liq brauzerda 30 FPS bilan ishlaydi.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Video & Havolalar</span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Namoyish</span>
          </div>
          <div className="text-3xl font-extrabold text-purple-400 mt-1">{metrics.videoDemonstrationsCount} ta video</div>
          <p className="text-xs text-slate-400 mt-2">
            Imo-ishora.uz CloudFront daktil videolari va ilmiy ma’lumotlar bazasi havolalari.
          </p>
        </div>
      </div>

      {/* Audited External Sources & Legal Status */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Audit qilingan Tashqi Manbalar va Huquqiy Holat (6 ta manba)
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Har bir manbaning mualliflik huquqlari, ochiq litsenziyalari va qayta tarqatish ruxsatnomalari to‘liq tekshirildi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUDITED_UZSL_SOURCES.map((src) => (
            <div key={src.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-white text-sm">{src.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{src.organizationOrAuthor} ({src.year})</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  src.redistributionPermitted 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {src.redistributionPermitted ? 'Ochiq Dataset' : 'Faqat Havola'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-3 line-clamp-2">{src.scopeAndDescription}</p>
              
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Litsenziya: <strong className="text-slate-300">{src.licenseAndRights}</strong></span>
                <a 
                  href={src.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  Manbani ko‘rish
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Benchmark & Reproducibility Metrics */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-2">Haqiqiy Vaqtdagi Samaradorlik (Benchmark)</h3>
        <p className="text-xs text-slate-400 mb-6">
          Natijalar soxtalashtirilmagan. Model sinovi mustaqil sinov to‘plamida olingan.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Daktil Harflar Aniqligi</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {(metrics.reproducibleBenchmarkAccuracy.isolatedDactylAccuracy * 100).toFixed(1)}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">21 ta MediaPipe Landmark normalizatsiyasi asosida</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Dinamik Belgilar Aniqligi</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">
              {(metrics.reproducibleBenchmarkAccuracy.dynamicSignAccuracy * 100).toFixed(1)}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Traektoriya apelsisi va tezlanish tahlili bilan</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Soxta Imo-ishorani Rad Etish</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              {(metrics.reproducibleBenchmarkAccuracy.falsePositiveRejectionRate * 100).toFixed(1)}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Kundalik tasodifiy harakatlarni to‘g‘ri filtrlaydi</p>
          </div>
        </div>
      </div>
    </div>
  )
}
