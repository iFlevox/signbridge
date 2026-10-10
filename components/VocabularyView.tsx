'use client'

import React, { useState, useMemo } from 'react'
import { UNIFIED_UZSL_VOCABULARY } from '@/lib/vocabulary'
import { UnifiedUzSLSign, VerificationTier, LexicalDomain } from '@/lib/unified-types'

export function VocabularyView() {
  const [search, setSearch] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [onlyCameraReady, setOnlyCameraReady] = useState(false)
  const [onlyTrainable, setOnlyTrainable] = useState(false)
  const [selectedSign, setSelectedSign] = useState<UnifiedUzSLSign | null>(null)

  const filteredSigns = useMemo(() => {
    return UNIFIED_UZSL_VOCABULARY.filter((sign) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchesUz = sign.uzbekName.toLowerCase().includes(q)
        const matchesGloss = sign.gloss.toLowerCase().includes(q)
        const matchesDesc = sign.description.toLowerCase().includes(q)
        if (!matchesUz && !matchesGloss && !matchesDesc) return false
      }
      if (selectedDomain !== 'all' && sign.domain !== selectedDomain) return false
      if (selectedTier !== 'all' && sign.verificationTier !== selectedTier) return false
      if (onlyCameraReady && !sign.isRecognizedInLiveCamera) return false
      if (onlyTrainable && !sign.hasTrainableDataset) return false
      return true
    })
  }, [search, selectedDomain, selectedTier, onlyCameraReady, onlyTrainable])

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Filter Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Birlashgan O‘zbek Imo-Ishoʻra Tili Lug‘ati
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Jami {UNIFIED_UZSL_VOCABULARY.length} ta tekshirilgan birlik. imo-ishora.uz, UzSLR-50 va ochiq daktil to‘plamlari birlashtirildi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {filteredSigns.length} ta imo-ishora ko‘rsatilmoqda
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="So‘z yoki harfni qidiring..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="all">Barcha mavzular (Barchasi)</option>
            <option value="dactyl_alphabet">Daktil Alifbosi (A-Z, G‘, O‘)</option>
            <option value="social_polite">Salomlashuv & Odob</option>
            <option value="education_culture">Ta’lim & Madaniyat</option>
            <option value="family_people">Oila & Insonlar</option>
            <option value="work_services">Kasb & Xizmatlar</option>
            <option value="emergency_health">Favqulodda & Sog‘liq</option>
            <option value="actions_verbs">Harakatlar & Fe’llar</option>
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="all">Barcha tasdiq darajalari</option>
            <option value="verified_primary">Asosiy Tasdiqlangan (Primary)</option>
            <option value="verified_secondary">Qo‘shimcha Tasdiqlangan (Secondary)</option>
            <option value="provisional">Sinovdagi (Provisional)</option>
          </select>

          <div className="flex items-center gap-3 px-2 py-1 bg-slate-950/60 border border-slate-800 rounded-xl">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyCameraReady}
                onChange={(e) => setOnlyCameraReady(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
              />
              <span>Jonli Kamera</span>
            </label>
            <span className="text-slate-600">|</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyTrainable}
                onChange={(e) => setOnlyTrainable(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
              />
              <span>Dataset Mavjud</span>
            </label>
          </div>
        </div>
      </div>

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSigns.map((sign) => (
          <div
            key={sign.id}
            onClick={() => setSelectedSign(sign)}
            className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition">
                    {sign.uzbekName}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">{sign.gloss}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {sign.isRecognizedInLiveCamera ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Jonli Kamera Modeli
                    </span>
                  ) : sign.hasTrainableDataset ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Ochiq Dataset
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Lug‘at Birligi
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                {sign.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate max-w-[140px]">{sign.sourceProvenance}</span>
              {sign.videoDemoUrl ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Video Mavjud
                </span>
              ) : (
                <span className="text-slate-500">Video yo‘q</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedSign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  {selectedSign.domain.replace('_', ' ')}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">{selectedSign.uzbekName}</h3>
                <p className="text-sm font-mono text-emerald-400">{selectedSign.gloss}</p>
              </div>
              <button
                onClick={() => setSelectedSign(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Demo if available */}
            {selectedSign.videoDemoUrl && (
              <div className="rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 flex items-center justify-center">
                <video
                  src={selectedSign.videoDemoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Tavsif va Ijro usuli:</span>
                <p className="text-slate-200 mt-1">{selectedSign.description}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Lingvistik Izoh:</span>
                <p className="text-slate-300 mt-1">{selectedSign.linguisticNotes}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Manba:</span>
                  <span className="font-medium text-slate-200">{selectedSign.sourceReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Litsenziya:</span>
                  <span className="font-medium text-slate-200">{selectedSign.licenseAndRights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kamera holati:</span>
                  <span className={selectedSign.isRecognizedInLiveCamera ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {selectedSign.isRecognizedInLiveCamera ? 'Haqiqiy vaqtda tanib olinadi' : 'Faqat lug‘at va o‘rganish uchun'}
                  </span>
                </div>
                {selectedSign.datasetSampleCount && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mavjud namunalar:</span>
                    <span className="font-mono text-cyan-400">{selectedSign.datasetSampleCount} ta kadr/namuna</span>
                  </div>
                )}
              </div>

              {selectedSign.externalDictionaryUrl && (
                <div className="pt-2">
                  <a
                    href={selectedSign.externalDictionaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    imo-ishora.uz manzilida ko‘rish
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
