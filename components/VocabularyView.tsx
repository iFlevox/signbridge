'use client'

import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { UZSL_COMPREHENSIVE_VOCABULARY, UzSLSignEntry } from '../lib/vocabulary'

interface VocabularyViewProps {
  onSelectSign?: (sign: UzSLSignEntry) => void
}

export function VocabularyView({ onSelectSign }: VocabularyViewProps) {
  const [vocabSearch, setVocabSearch] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [selectedVocab, setSelectedVocab] = useState<UzSLSignEntry | null>(null)

  const filteredVocab = UZSL_COMPREHENSIVE_VOCABULARY.filter((sign) => {
    const matchesSearch =
      sign.gloss.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      sign.uzbekName.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      sign.description.toLowerCase().includes(vocabSearch.toLowerCase())
    const matchesDomain = selectedDomain === 'all' || sign.domain === selectedDomain
    return matchesSearch && matchesDomain
  })

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              O‘zbek Imo-Ishora Tili (UzSL) Lug‘at Bazasi
            </h2>
            <p className="text-xs text-slate-400">
              Barcha sohalar bo‘yicha tizimlashtirilgan, manbalari tekshirilgan va lingvistik tahlil qilingan ishoralar.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold">
              Jami: {UZSL_COMPREHENSIVE_VOCABULARY.length} ta yozuv
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
              Faol modelda: {UZSL_COMPREHENSIVE_VOCABULARY.filter((s) => s.isSupportedInCurrentModel).length} ta
            </span>
          </div>
        </div>

        {/* Search & Domain Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={vocabSearch}
              onChange={(e) => setVocabSearch(e.target.value)}
              placeholder="Ishorani nomi, ma’nosi yoki tavsifi bo‘yicha izlash..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="all">Barcha sohalar (All Domains)</option>
            <option value="dactyl">Daktil alifbosi</option>
            <option value="greetings">Salomlashuv</option>
            <option value="polite_conversation">Xushmuomalalik</option>
            <option value="education_school">Ta’lim va maktab</option>
            <option value="health_emergency">Salomatlik va favqulodda</option>
            <option value="family_people">Oila va insonlar</option>
            <option value="weather_nature">Ob-havo va tabiat</option>
          </select>
        </div>
      </div>

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVocab.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl bg-slate-900 border transition-all cursor-pointer ${
              selectedVocab?.id === item.id
                ? 'border-teal-500 shadow-lg shadow-teal-500/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
            onClick={() => {
              setSelectedVocab(item)
              if (onSelectSign) onSelectSign(item)
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-black text-teal-400 font-mono">
                {item.gloss}
              </span>
              <div className="flex items-center space-x-1">
                {item.isSupportedInCurrentModel ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    Faol Modelda
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Rejalashtirilgan
                  </span>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                  {item.verificationTier === 'verified_primary' ? '1-daraja' : '2-daraja'}
                </span>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-white mb-1">{item.uzbekName}</h4>
            <p className="text-xs text-slate-400 mb-2 leading-relaxed">
              {item.description}
            </p>

            <div className="text-[11px] text-teal-300 font-mono bg-slate-950/60 p-2 rounded border border-slate-800/80 mb-2">
              <strong>Shakl:</strong> {item.dominantHandShape}
              {item.twoHanded && ' (Ikki qo‘lli)'}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Manba: {item.sourceReference}</span>
              <span className="capitalize">{item.grammaticalCategory}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
