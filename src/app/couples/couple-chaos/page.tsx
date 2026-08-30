'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flame, Sparkles, ArrowLeft, ArrowRight, Bot, AlertTriangle } from 'lucide-react'

export default function CoupleChaosPage() {
  const [currentPrompt, setCurrentPrompt] = useState('Who is more dramatic when they get sick?')
  const [choice1, setChoice1] = useState<string | null>(null)
  const [choice2, setChoice2] = useState<string | null>(null)
  const [revealing, setRevealing] = useState(false)
  const [result, setResult] = useState<{
    verdict: string
    verdictEmoji: string
    alertType: string
    chaosAi: string
  } | null>(null)

  const handleReveal = async () => {
    if (!choice1 || !choice2 || revealing) return
    setRevealing(true)

    try {
      const res = await fetch('/api/couples/couple-chaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice1, choice2 }),
      })
      const data = await res.json()
      setResult(data)
    } finally {
      setRevealing(false)
    }
  }

  const handleNext = async () => {
    setChoice1(null)
    setChoice2(null)
    setResult(null)
    try {
      const res = await fetch('/api/couples/couple-chaos')
      const data = await res.json()
      if (data.item?.question) setCurrentPrompt(data.item.question)
    } catch {}
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/couples"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Couples
      </Link>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="inline-flex p-3 bg-purple-950/60 border border-purple-800 rounded-2xl mb-3 shadow-inner">
          <Flame className="w-8 h-8 text-purple-400 animate-pulse" />
        </div>
        <span className="text-xs font-black uppercase text-purple-400 tracking-widest block mb-1">
          COUPLE CHAOS ACCUSATIONS
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-white leading-snug mb-8">
          "{currentPrompt}"
        </h1>

        {!result ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {/* Partner 1 Choice */}
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                <span className="text-xs font-black uppercase text-pink-400 block mb-2">
                  Partner 1 Votes:
                </span>
                <div className="space-y-2">
                  {['Partner 1 (You)', 'Partner 2 (Them)'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setChoice1(opt)}
                      className={`w-full p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        choice1 === opt
                          ? 'bg-pink-600 border-pink-400 text-white shadow-lg'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Partner 2 Choice */}
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                <span className="text-xs font-black uppercase text-purple-400 block mb-2">
                  Partner 2 Votes:
                </span>
                <div className="space-y-2">
                  {['Partner 1 (You)', 'Partner 2 (Them)'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setChoice2(opt)}
                      className={`w-full p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        choice2 === opt
                          ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleReveal}
              disabled={!choice1 || !choice2 || revealing}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-400 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-600/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {revealing ? 'REVEALING ACCUSATIONS...' : 'REVEAL VOTES SIMULTANEOUSLY 🚀'}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-pop-in">
            <div className={`p-6 rounded-3xl border ${
              result.alertType === 'accusation'
                ? 'bg-red-950/40 border-red-500 shadow-red-500/20 shadow-xl'
                : 'bg-purple-950/40 border-purple-500 shadow-purple-500/20 shadow-xl'
            }`}>
              <div className="text-4xl mb-2">{result.verdictEmoji}</div>
              <h2 className="text-2xl font-black text-white mb-2">
                {result.verdict}
              </h2>

              <div className="grid grid-cols-2 gap-3 text-left mt-4">
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-[10px] font-black uppercase text-pink-400 block mb-1">PARTNER 1 CHOSE:</span>
                  <p className="text-xs font-bold text-white">{choice1}</p>
                </div>
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-[10px] font-black uppercase text-purple-400 block mb-1">PARTNER 2 CHOSE:</span>
                  <p className="text-xs font-bold text-white">{choice2}</p>
                </div>
              </div>
            </div>

            {/* Chaos AI Interruption */}
            {result.chaosAi && (
              <div className="p-4 bg-purple-950/40 border border-purple-800 rounded-2xl flex items-start gap-3 text-xs text-purple-300 text-left">
                <Bot className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-purple-400 block text-[10px] uppercase">CHAOS AI COMMENTARY</span>
                  <span>{result.chaosAi}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              NEXT QUESTION <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
