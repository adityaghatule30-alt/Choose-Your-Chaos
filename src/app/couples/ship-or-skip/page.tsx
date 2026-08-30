'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ship, Heart, Sparkles, ArrowLeft, ArrowRight, Bot, ShieldCheck } from 'lucide-react'

export default function ShipOrSkipPage() {
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState<{
    compatPercent: number
    chemistryScore: number
    chaosScore: number
    finalVerdict: string
    summary: string
    chaosAi: string
  } | null>(null)

  const handleShip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!player1.trim() || !player2.trim() || !agreed || calculating) return

    setCalculating(true)

    try {
      const res = await fetch('/api/couples/ship-or-skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner1: player1.trim(),
          partner2: player2.trim(),
        }),
      })
      const data = await res.json()

      setTimeout(() => {
        setResult(data)
        setCalculating(false)
      }, 1500)
    } catch {
      setCalculating(false)
    }
  }

  const handleReset = () => {
    setPlayer1('')
    setPlayer2('')
    setAgreed(false)
    setResult(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/couples"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Couples
      </Link>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -z-10" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-red-950/60 border border-red-800 rounded-2xl mb-3 shadow-inner">
            <Ship className="w-8 h-8 text-red-400 animate-pulse" />
          </div>
          <span className="text-xs font-black uppercase text-red-400 tracking-widest block mb-1">
            CONSENT-BASED COMPATIBILITY SIMULATION
          </span>
          <h1 className="text-2xl font-black text-white">
            💘 SHIP OR SKIP
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
            Both players must voluntarily agree to calculate chaotic chemistry.
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleShip} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Participant 1 Name
                </label>
                <input
                  type="text"
                  required
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Participant 2 Name
                </label>
                <input
                  type="text"
                  required
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                  placeholder="e.g. Jordan"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Consent agreement */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center gap-3">
              <input
                type="checkbox"
                id="consent"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor="consent" className="text-xs text-neutral-300 cursor-pointer font-medium">
                Both {player1 || 'Participant 1'} and {player2 || 'Participant 2'} willingly agree to this simulation.
              </label>
            </div>

            <button
              type="submit"
              disabled={calculating || !player1.trim() || !player2.trim() || !agreed}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-red-600/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {calculating ? 'CALCULATING CHAOTIC CHEMISTRY...' : 'CALCULATE COMPATIBILITY 💘'}
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-pop-in text-center">
            <div className="p-8 bg-neutral-950 rounded-3xl border border-neutral-800 shadow-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-red-400 block mb-1">
                FINAL VERDICT
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
                {result.finalVerdict}
              </h2>
              <p className="text-xs text-neutral-300 max-w-md mx-auto mb-6">
                {result.summary}
              </p>

              {/* Meters */}
              <div className="space-y-3 text-left">
                <div>
                  <div className="flex justify-between text-xs font-black mb-1">
                    <span className="text-pink-400">Compatibility:</span>
                    <span className="text-white">{result.compatPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full transition-all duration-1000"
                      style={{ width: `${result.compatPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black mb-1">
                    <span className="text-yellow-400">Chaos Index:</span>
                    <span className="text-white">{result.chaosScore}%</span>
                  </div>
                  <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000"
                      style={{ width: `${result.chaosScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chaos AI Interruption */}
            {result.chaosAi && (
              <div className="p-4 bg-purple-950/40 border border-purple-800 rounded-2xl flex items-start gap-3 text-xs text-purple-300 text-left">
                <Bot className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-purple-400 block text-[10px] uppercase">CHAOS AI VERDICT</span>
                  <span>{result.chaosAi}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              TEST ANOTHER PAIR 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
