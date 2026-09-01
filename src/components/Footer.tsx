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

      {/* The Chaos Crew Section */}
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-neutral-900/90">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-black text-yellow-400 uppercase tracking-widest mb-2 shadow-inner">
            <Zap className="w-3.5 h-3.5 fill-current" /> THE CHAOS CREW
          </div>
          <p className="text-xs text-neutral-400 font-medium">
            Built by <span className="text-white font-bold">Aditya</span> & a suspiciously overpowered AI team.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 max-w-5xl mx-auto text-left">
          <div className="bg-neutral-900/60 border border-neutral-850 hover:border-yellow-400/40 p-3 rounded-2xl transition-all duration-200 active-press shadow-sm hover:scale-[1.02]">
            <div className="text-sm font-black text-white flex items-center gap-1">
              👑 Aditya
            </div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Founder / Dev</div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-850 hover:border-purple-500/40 p-3 rounded-2xl transition-all duration-200 active-press shadow-sm hover:scale-[1.02]">
            <div className="text-sm font-black text-white flex items-center gap-1">
              🎨 Stitch
            </div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Design</div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-850 hover:border-purple-500/40 p-3 rounded-2xl transition-all duration-200 active-press shadow-sm hover:scale-[1.02]">
            <div className="text-sm font-black text-white flex items-center gap-1">
              🧠 Antigravity
            </div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Dev Co-Founder</div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-850 hover:border-emerald-500/40 p-3 rounded-2xl transition-all duration-200 active-press shadow-sm hover:scale-[1.02]">
            <div className="text-sm font-black text-white flex items-center gap-1">
              🤖 ChatGPT
            </div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Helping Partner</div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-850 hover:border-pink-500/40 p-3 rounded-2xl transition-all duration-200 active-press shadow-sm hover:scale-[1.02]">
            <div className="text-sm font-black text-white flex items-center gap-1">
              🐇 CodeRabbit
            </div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Code Reviewer</div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-850 hover:border-emerald-500/40 p-3 rounded-2xl transition-all duration-200 active-press shadow-sm hover:scale-[1.02]">
            <div className="text-sm font-black text-white flex items-center gap-1">
              🐆 Supabase
            </div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Database Partner</div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-850 hover:border-neutral-700 p-3 rounded-2xl transition-all duration-200 active-press shadow-sm hover:scale-[1.02]">
            <div className="text-sm font-black text-white flex items-center gap-1">
              🐙 GitHub
            </div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Version Control</div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-850 hover:border-blue-500/40 p-3 rounded-2xl transition-all duration-200 active-press shadow-sm hover:scale-[1.02]">
            <div className="text-sm font-black text-white flex items-center gap-1">
              🚀 Vercel
            </div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Deployment</div>
          </div>
        </div>

        <div className="text-center mt-4 text-[11px] font-bold text-neutral-400">
          "One human. Seven tools. Zero sleep. 💀"
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-neutral-900 text-center text-[11px] text-neutral-600 flex items-center justify-center gap-1">
        <span>© {currentYear} Choose Your Chaos. Built for multiplayer glory and unfiltered laughs.</span>
      </div>
    </footer>
  )
}
