'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Sparkles, ArrowLeft, ArrowRight, Bot, Check, AlertCircle } from 'lucide-react'

export default function MemoryLanePage() {
  const [question, setQuestion] = useState('Where was your very first date or real hangout?')
  const [player1Answer, setPlayer1Answer] = useState('')
  const [player2Answer, setPlayer2Answer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [result, setResult] = useState<{ isMatch: boolean; scoreAwarded: number; chaosAi: string } | null>(null)

  const loadNewQuestion = async () => {
    setPlayer1Answer('')
    setPlayer2Answer('')
    setResult(null)
    setCountdown(null)
    try {
      const res = await fetch('/api/couples/memory-lane')
      const data = await res.json()
      if (data.question) setQuestion(data.question)
    } catch {}
  }

  const handleReveal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!player1Answer.trim() || !player2Answer.trim() || submitting) return

    setSubmitting(true)

    // Animated 3..2..1.. countdown
    setCountdown(3)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          return null
        }
        return prev - 1
      })
    }, 800)

    try {
      const res = await fetch('/api/couples/memory-lane', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1_answer: player1Answer,
          player2_answer: player2Answer,
          question,
        }),
      })
      const data = await res.json()

      setTimeout(() => {
        setResult(data)
        setSubmitting(false)
      }, 2400)
    } catch {
      setSubmitting(false)
    }
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
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl -z-10" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-pink-950/60 border border-pink-800 rounded-2xl mb-3 shadow-inner">
            <Heart className="w-8 h-8 text-pink-400 animate-heart-pulse" />
          </div>
          <span className="text-xs font-black uppercase text-pink-400 tracking-widest block mb-1">
            SHARED MEMORY TELEPATHY
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
            "{question}"
          </h1>
        </div>

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="py-12 text-center animate-pop-in">
            <div className="text-xs font-black uppercase text-pink-400 tracking-widest mb-2">
              REVEALING MEMORIES IN...
            </div>
            <div className="text-6xl font-black text-white animate-bounce">
              {countdown} ❤️
            </div>
          </div>
        )}

        {/* Inputs View */}
        {countdown === null && !result && (
          <form onSubmit={handleReveal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Partner 1 Secret Answer 🤫
              </label>
              <input
                type="text"
                required
                value={player1Answer}
                onChange={(e) => setPlayer1Answer(e.target.value)}
                placeholder="Type your answer without letting them see..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Partner 2 Secret Answer 🤫
              </label>
              <input
                type="text"
                required
                value={player2Answer}
                onChange={(e) => setPlayer2Answer(e.target.value)}
                placeholder="Type your answer without letting them see..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !player1Answer.trim() || !player2Answer.trim()}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-pink-600/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              LOCK & REVEAL MEMORIES ❤️
            </button>
          </form>
        )}

        {/* Results View */}
        {result && (
          <div className="space-y-6 animate-pop-in">
            <div className={`p-6 rounded-3xl border text-center ${
              result.isMatch
                ? 'bg-pink-950/40 border-pink-500/50 shadow-pink-500/20 shadow-xl'
                : 'bg-neutral-950 border-neutral-800 animate-shake'
            }`}>
              <div className="text-3xl mb-2">{result.isMatch ? '❤️ MATCH!' : '💀 DISAGREEMENT'}</div>
              <h2 className="text-xl font-black text-white mb-4">
                {result.isMatch ? 'MEMORY MATCH ❤️' : 'MEMORY DISAGREEMENT 💀'}
              </h2>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-[10px] font-black uppercase text-pink-400 block mb-1">PARTNER 1:</span>
                  <p className="text-xs font-bold text-white">"{player1Answer}"</p>
                </div>
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-[10px] font-black uppercase text-purple-400 block mb-1">PARTNER 2:</span>
                  <p className="text-xs font-bold text-white">"{player2Answer}"</p>
                </div>
              </div>

              <div className="mt-4 text-xs font-black text-yellow-400">
                +{result.scoreAwarded} XP Awarded 🔥
              </div>
            </div>

            {/* Chaos AI Interruption */}
            {result.chaosAi && (
              <div className="p-4 bg-purple-950/40 border border-purple-800 rounded-2xl flex items-start gap-3 text-xs text-purple-300">
                <Bot className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-purple-400 block text-[10px] uppercase">CHAOS AI COMMENTARY</span>
                  <span>{result.chaosAi}</span>
                </div>
              </div>
            )}

            <button
              onClick={loadNewQuestion}
              className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              NEXT MEMORY PROMPT <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
