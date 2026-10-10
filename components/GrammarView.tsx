'use client'

import React from 'react'
import { Languages, CheckCircle2 } from 'lucide-react'

export function GrammarView() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
          <Languages className="w-5 h-5 text-teal-400" />
          <span>O‘zbek Imo-Ishora Tili (UzSL) Grammatikasi va Sintaksisi</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Imo-ishora tili faqatgina so‘zma-so‘z harakatlar majmui emas. U o‘zining mustaqil tabiiy grammatikasi, mavzu-fikr (Topic-Comment) tuzilishi va fazoviy (spatial) munosabatlariga ega to‘laqonli til hisoblanadi.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-sm font-bold text-teal-400 mb-1">1. Mavzu va Izoh (Topic - Comment)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              UzSL da gapning predmeti (mavzusi) birinchi ko‘rsatiladi, keyin esa unga nisbatan fikr bildiriladi. Masalan: <em>[KITOB MEN O‘QIDIM]</em> yozma o‘zbek tilidagi <em>"Men kitobni o‘qidim"</em> ga to‘g‘ri keladi.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-sm font-bold text-cyan-400 mb-1">2. Inkor Inkorporatsiyasi (Negation)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ko‘pincha inkor harakati fe’l bilan birikadi. Masalan, <em>[TUSHUNDIM]</em> ishorasi davomida bosh chayqalishi yoki <em>[YO‘Q]</em> ishorasi qo‘shilishi orqali <em>"Tushunmadim"</em> ma’nosi hosil bo‘ladi.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-sm font-bold text-pink-400 mb-1">3. Yuz va Qosh Ifodalari (Non-Manual Markers)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              So‘roq gaplarda qoshlar ko‘tariladi yoki chimiriladi. Faqat qo‘l harakatining o‘zi so‘roq yoki tasdiq ekanligini to‘liq ajratib bera olmaydi.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-sm font-bold text-amber-400 mb-1">4. Daktilologiya O‘rni</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Daktil faqat maxsus ismlar, geografik nomlar yoki muayyan tushuncha uchun mustaqil ishora mavjud bo‘lmaganda qo‘llaniladi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
