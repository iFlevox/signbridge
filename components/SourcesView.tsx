'use client'

import React from 'react'
import { AUDITED_UZSL_SOURCES } from '@/lib/source-register'

export function SourcesView() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          O‘zbek Imo-Ishoʻra Tili Manbalari va Huquqiy Registri
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          SignBridge platformasi ochiq tadqiqotlar, karlar jamiyati me’yorlari va mustaqil ilmiy resurslarga tayanadi.
          Har bir tashqi portal va ochiq ma’lumotlar to‘plami texnik hamda yuridik jihatdan tekshirilib, mualliflik
          huquqlariga to‘liq rioya qilingan holda qayd etilgan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {AUDITED_UZSL_SOURCES.map((src) => (
          <div key={src.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-bold text-white">{src.name}</h3>
                <span className="text-xs text-slate-400">
                  {src.organizationOrAuthor} • {src.year}
                </span>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border w-fit ${
                src.redistributionPermitted
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {src.redistributionPermitted ? 'Ochiq Ma’lumotlar Bazasiga Egal' : 'Mualliflik Himoyalangan (Havola)'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {src.scopeAndDescription}
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1.5 mb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between text-slate-400">
                <span>Huquqiy & Texnik cheklovlar:</span>
                <span className="text-slate-200 font-medium sm:text-right">{src.legalAndTechnicalLimitations}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between text-slate-400">
                <span>Litsenziya:</span>
                <span className="text-slate-200 font-medium sm:text-right">{src.licenseAndRights}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between text-slate-400">
                <span>Qamrov:</span>
                <span className="text-emerald-400 font-medium sm:text-right">
                  {src.vocabularyCount} ta lug‘at so‘zi / {src.cameraTrainableCount} ta model birligi
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400 text-[11px] italic">
                {src.attributionNotice}
              </span>
              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 shrink-0"
                >
                  Manzilga o‘tish
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
