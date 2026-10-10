'use client'

import React from 'react'
import { Layers } from 'lucide-react'
import { UZSL_SOURCE_REGISTER } from '../lib/source-register'

export function SourcesView() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-teal-400" />
          <span>O‘zbek Imo-Ishora Tili Manbalar va Dalillar Reestri</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          O‘zbekistondagi kar-soqovlar hamjamiyati, maxsus maktablar, akademik nashrlar va ochiq ma’lumotlar to‘plamlarining shaffof hujjatlashtirilgan ro‘yxati.
        </p>
      </div>

      <div className="space-y-4">
        {UZSL_SOURCE_REGISTER.map((src) => (
          <div key={src.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-bold text-white">{src.title}</h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 w-fit">
                {src.validationStatus}
              </span>
            </div>
            <div className="text-xs text-slate-400 mb-3 space-y-1">
              <p><strong>Muallif / Muassasa:</strong> {src.authorOrInstitution} ({src.year})</p>
              <p><strong>Kelib chiqishi:</strong> {src.provenance}</p>
              <p><strong>Litsenziya:</strong> {src.licenseOrTerms}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <strong className="text-slate-300 block mb-1">Qamrov va hajm:</strong>
                <p className="text-slate-400 leading-relaxed">{src.scopeAndCoverage}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <strong className="text-amber-400 block mb-1">Cheklovlar va izoh:</strong>
                <p className="text-slate-400 leading-relaxed">{src.limitations}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
