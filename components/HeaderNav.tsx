'use client'

import React from 'react'
import { Sparkles, BookOpen, ShieldCheck, Database, BarChart3, Languages, Layers } from 'lucide-react'

export type TabKey = 'app' | 'vocabulary' | 'grammar' | 'dashboard' | 'dataset' | 'sources' | 'privacy'

interface HeaderNavProps {
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void
  vocabCount: number
  sampleCount: number
}

export function HeaderNav({ activeTab, setActiveTab, vocabCount, sampleCount }: HeaderNavProps) {
  const tabs: Array<{ id: TabKey; label: string; icon: React.ReactNode }> = [
    { id: 'app', label: 'Jonli Tarjima', icon: null },
    { id: 'vocabulary', label: `Lug‘at (${vocabCount})`, icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'grammar', label: 'Grammatika', icon: <Languages className="w-3.5 h-3.5" /> },
    { id: 'dashboard', label: 'Metrika', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'dataset', label: `Dataset (${sampleCount})`, icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'sources', label: 'Manbalar', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'privacy', label: 'Maxfiylik', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ]

  return (
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
                UzSL v2.0 Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              O‘zbek imo-ishora tili (UzSL) uzluksiz tarjima va milliy korpus platformasi
            </p>
          </div>
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center space-x-1 transition-all ${
                activeTab === t.id
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
