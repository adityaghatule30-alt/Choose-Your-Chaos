import Link from 'next/link'
import { Flame } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-400 py-12 px-4 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="flex items-center gap-2 mb-2 group">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              CHOOSE YOUR <span className="text-yellow-400">CHAOS</span>
            </span>
            <Flame className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
          </Link>
          <p className="text-xs text-neutral-500 max-w-sm">
            The social game platform for unhinged dilemmas, daring truths, and merciless trials.
          </p>
        </div>

        {/* Links Navigation */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-bold text-neutral-300">
          <Link href="/about" className="hover:text-yellow-400 transition-colors">
            About
          </Link>
          <Link href="/faq" className="hover:text-yellow-400 transition-colors">
            FAQ
          </Link>
          <Link href="/contact" className="hover:text-yellow-400 transition-colors">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-yellow-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-yellow-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/cookie-policy" className="hover:text-yellow-400 transition-colors">
            Cookie Policy
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-neutral-900 text-center text-[11px] text-neutral-600">
        © {currentYear} Choose Your Chaos. All rights reserved. Play responsibly.
      </div>
    </footer>
  )
}
