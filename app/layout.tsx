import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'iFlevox SignBridge — O‘zbek imo-ishora tilini matnga aylantirish tizimi',
  description: 'Jonli kamera oqimidan O‘zbek imo-ishora tili (UzSL daktil va asosiy so‘zlar)ni aniqlab, haqiqiy kompyuter ko‘rish modeli asosida matnga o‘giruvchi innovatsion tizim.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  )
}
