'use client'

import React, { useState } from 'react'
import { Database, Download, Radio, Trash2 } from 'lucide-react'
import { RecordedSequenceSample } from '../lib/recognition-types'
import { DYNAMIC_SIGNS, DACTYL_ALPHABET } from '../lib/vocabulary'

interface DatasetStudioViewProps {
  recordedSamples: RecordedSequenceSample[]
  isCameraActive: boolean
  isRecording: boolean
  datasetConsent: boolean
  recordingLabel: string
  setRecordingLabel: (val: string) => void
  setDatasetConsent: (val: boolean) => void
  onToggleRecording: () => void
  onExportDataset: () => void
  onDeleteSample: (id: string) => void
}

export function DatasetStudioView({
  recordedSamples,
  isCameraActive,
  isRecording,
  datasetConsent,
  recordingLabel,
  setRecordingLabel,
  setDatasetConsent,
  onToggleRecording,
  onExportDataset,
  onDeleteSample,
}: DatasetStudioViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <Database className="w-5 h-5 text-teal-400" />
              <span>Lokal O‘zbek Imo-ishora Ma’lumotlar To‘plami (Dataset Studio)</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              Kelgusida kengroq temporal modellarni (LSTM/Transformer) o‘qitish uchun haqiqiy imo-ishora 3D koordinatalarini to‘plash moduli. Hech qanday video serverga ketmaydi — faqat matematik nuqtalar brauzerda saqlanadi.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onExportDataset}
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
              onChange={(e) => setDatasetConsent(e.target.checked)}
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
                  {s.gloss} — {s.uzbekName}
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
              onClick={onToggleRecording}
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
                  onClick={() => onDeleteSample(sample.id)}
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
  )
}
