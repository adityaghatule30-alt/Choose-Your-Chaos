import Link from 'next/link'
import { Flame, Heart, Zap } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 py-12 px-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="flex items-center gap-2 mb-2 group">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-yellow-400">CHAOS</span>
            </span>
            <Flame className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
          </Link>
          <p className="text-xs text-neutral-500 max-w-sm">
            The social multiplayer party game for questionable dilemmas, unhinged trials, and honest revelations.
          </p>
        </div>

        {/* Links Navigation */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-bold text-neutral-300">
          <Link href="/guide" className="hover:text-purple-400 transition-colors">
            Game Guide
          </Link>
          <Link href="/about" className="hover:text-pink-400 transition-colors">
            About Chaos
          </Link>
          <Link href="/fuel" className="text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-current" /> Fuel the Madness 💸
          </Link>
          <Link href="/privacy" className="hover:text-neutral-200 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-neutral-200 transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-neutral-200 transition-colors">
            Contact
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-neutral-900 text-center text-[11px] text-neutral-600 flex items-center justify-center gap-1">
        <span>© {currentYear} Choose Your Chaos. Built for multiplayer glory and unfiltered laughs.</span>
      </div>
    </footer>
  )
}
