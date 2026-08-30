'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Zap, Heart, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react'

export default function FuelPage() {
  const { user, refreshProfile } = useAuth()
  const [selectedAmount, setSelectedAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [funding, setFunding] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const amounts = [50, 100, 250, 500]

  const handleFuel = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalAmount = customAmount ? parseInt(customAmount, 10) : selectedAmount

    if (!finalAmount || isNaN(finalAmount) || finalAmount < 10) {
      setErrorMsg('Please enter a valid amount (minimum ₹10).')
      return
    }

    setFunding(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        if (user) refreshProfile()
      } else {
        setErrorMsg(data.message || 'Support processing failed.')
      }
    } catch {
      setErrorMsg('Failed to process contribution.')
    } finally {
      setFunding(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-16">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -z-10" />

        <div className="inline-flex p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl mb-3 shadow-inner text-yellow-400">
          <Zap className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          FUEL THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">MADNESS 💸</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-2 mb-8">
          "Had fun? Help keep the chaos servers alive." All games remain 100% free to play.
        </p>

        {success ? (
          <div className="p-8 bg-neutral-950 rounded-3xl border border-neutral-800 text-center animate-pop-in space-y-4">
            <div className="w-16 h-16 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
              🎉
            </div>
            <h2 className="text-2xl font-black text-white">CHAOS FUELED!</h2>
            <p className="text-xs text-neutral-300 max-w-sm mx-auto">
              Your contribution helps pay for database capacity, AI commentary, and server bandwidth. You received +100 XP! 🔥
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs rounded-xl"
            >
              DONE
            </button>
          </div>
        ) : (
          <form onSubmit={handleFuel} className="space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-yellow-400 mb-3">
                Select Support Amount
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt)
                      setCustomAmount('')
                    }}
                    className={`py-3.5 rounded-2xl font-black text-sm border transition-all cursor-pointer ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-yellow-400 border-yellow-300 text-neutral-950 shadow-lg shadow-yellow-500/30'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 text-left">
                Or Custom Amount (₹)
              </label>
              <input
                type="number"
                min={10}
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(0)
                }}
                placeholder="Enter custom amount (e.g. 1000)"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={funding}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:opacity-95 text-neutral-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-yellow-500/20 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {funding ? 'PROCESSING SUPPORT...' : 'FUEL THE CHAOS 🔥'}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secure contribution integration. Gameplay stays 100% free.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
