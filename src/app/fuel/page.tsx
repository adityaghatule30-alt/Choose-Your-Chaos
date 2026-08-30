'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { UPIPaymentModal } from '@/components/UPIPayment'
import { Zap, Heart, Sparkles, Check, ArrowRight, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function FuelPage() {
  const { user, refreshProfile } = useAuth()
  const [selectedAmount, setSelectedAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [utrNumber, setUtrNumber] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [funding, setFunding] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const amounts = [50, 100, 250, 500]

  const activeAmount = customAmount && !isNaN(parseInt(customAmount, 10)) ? parseInt(customAmount, 10) : selectedAmount

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeAmount || activeAmount < 10) {
      setErrorMsg('Please enter a valid amount (minimum ₹10).')
      return
    }
    setErrorMsg(null)
    setShowQR(true)
  }

  const handleConfirmPaid = async () => {
    setFunding(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: activeAmount,
          utr: utrNumber.trim(),
        }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setShowQR(false)
        if (user) refreshProfile()
      } else {
        setErrorMsg(data.message || 'Support confirmation failed.')
      }
    } catch {
      setErrorMsg('Failed to confirm contribution.')
    } finally {
      setFunding(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-6">
        {!showQR && !success && (
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

            <form onSubmit={handleFuelSubmit} className="space-y-6 text-left">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
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
                className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:opacity-95 text-neutral-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-yellow-500/20 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                GENERATE UPI QR CODE (₹{activeAmount}) 🔥
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 pt-2 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Instant QR via GPay, PhonePe, Paytm, BHIM, Axis & any UPI app.</span>
              </div>
            </form>
          </div>
        )}

        {/* Dynamic UPI Modal */}
        {showQR && !success && (
          <div className="space-y-4">
            <UPIPaymentModal
              amount={activeAmount}
              payeeName="Choose-Your-Chaos"
              payeeVpa="adityaghatule30@okaxis"
            />

            {/* Optional UTR / Reference Input */}
            <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-xl">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5 text-left flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-yellow-400" /> UPI Reference / UTR Number (Optional)
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 423589123456"
                maxLength={20}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-yellow-400 transition-colors"
              />
              <p className="text-[10px] text-neutral-500 mt-1 text-left">
                Found on your payment confirmation screen in GPay, PhonePe, or Paytm.
              </p>
            </div>

            {errorMsg && (
              <div className="max-w-md mx-auto p-4 bg-red-950/60 border border-red-800 rounded-2xl text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setShowQR(false)}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 font-bold text-xs rounded-2xl transition-all cursor-pointer"
              >
                Change Amount
              </button>

              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={funding}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {funding ? 'VERIFYING...' : "I'VE COMPLETED PAYMENT"}
              </button>
            </div>
          </div>
        )}

        {/* Success Confirmation */}
        {success && (
          <div className="p-8 sm:p-12 bg-neutral-900 border border-neutral-800 rounded-3xl text-center animate-pop-in space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto text-3xl animate-bounce">
              🎉
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">CHAOS FUELED!</h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-sm mx-auto leading-relaxed">
              Your contribution helps pay for database capacity, AI commentary, and server bandwidth. You received +100 XP! 🔥
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-8 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs rounded-2xl shadow-lg shadow-yellow-500/20 transition-all"
              >
                BACK TO CHAOS ARENA
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
