'use client'

import { useState } from 'react'
import { QrCode, Smartphone, Copy, Check, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react'

interface UPIPaymentProps {
  amount: number
  payeeName?: string
  payeeVpa?: string
  onPaymentSuccess?: () => void
}

export function UPIPaymentModal({
  amount,
  payeeName = 'Choose-Your-Chaos',
  payeeVpa = 'adityaghatule30@okaxis',
  onPaymentSuccess,
}: UPIPaymentProps) {
  const [copied, setCopied] = useState(false)
  const [qrLoaded, setQrLoaded] = useState(false)

  // Ensure positive number formatted
  const formattedAmount = Math.max(1, amount).toFixed(2)

  // Raw UPI deep-link URI
  const rawUpiUri = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR`

  // QuickChart QR generation URL with custom styling matching dark theme
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    rawUpiUri
  )}&size=260&ecLevel=M&dark=111827&dotStyle=rounded&finderStyle=circle`

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(payeeVpa)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-neutral-900/95 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center max-w-md mx-auto animate-pop-in">
      <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black rounded-full uppercase tracking-wider mb-4">
        <Sparkles className="w-3.5 h-3.5" /> Instant UPI Payment
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
        Pay ₹{formattedAmount}
      </h3>
      <p className="text-xs text-neutral-400 mb-6">
        Scan with GPay, PhonePe, Paytm or any UPI App
      </p>

      {/* QR Code Container */}
      <div className="relative mx-auto w-[240px] h-[240px] sm:w-[260px] sm:h-[260px] bg-white p-3.5 rounded-3xl shadow-2xl flex items-center justify-center mb-6 ring-4 ring-yellow-400/20">
        {!qrLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 rounded-2xl text-xs text-neutral-400 font-bold gap-2">
            <QrCode className="w-8 h-8 text-yellow-400 animate-spin" />
            <span>Generating UPI QR Code...</span>
          </div>
        )}
        <img
          src={qrCodeUrl}
          alt={`UPI QR Code for ₹${formattedAmount}`}
          className={`w-full h-full object-contain rounded-xl transition-opacity duration-300 ${
            qrLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setQrLoaded(true)}
        />
      </div>

      {/* Payee Info & Copy VPA */}
      <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80 mb-5 flex items-center justify-between text-left">
        <div>
          <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
            Payee UPI ID
          </div>
          <div className="font-mono text-xs font-black text-yellow-400 truncate max-w-[180px] sm:max-w-[220px]">
            {payeeVpa}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyVpa}
          className="p-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 rounded-xl text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
          title="Copy UPI ID"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[10px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Direct Mobile Deep Link Button */}
      <a
        href={rawUpiUri}
        className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:opacity-95 text-neutral-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-yellow-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer mb-3"
      >
        <Smartphone className="w-4 h-4" />
        <span>Pay via UPI App (Mobile)</span>
        <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
      </a>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Official Payee: <strong className="text-neutral-400">{payeeName}</strong></span>
      </div>
    </div>
  )
}
