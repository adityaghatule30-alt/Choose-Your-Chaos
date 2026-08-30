import Link from 'next/link'
import { Flame, Sparkles, Play, ShieldAlert, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-bold text-neutral-300 uppercase tracking-widest mb-6 shadow-inner">
        <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Powered by Real Supabase Auth & Realtime
      </div>

      <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight max-w-4xl leading-tight">
        UNHINGED CHOICES. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
          ZERO SURVIVORS.
        </span>
      </h1>

      <p className="mt-6 text-base sm:text-lg text-neutral-400 max-w-2xl">
        Either/Or dilemmas, brutally honest Judge Me cases, and live friend multiplayer rooms.
        Sign up with your Chaos ID to rank up on the chaos leaderboard.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/play"
          className="w-full sm:w-auto px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-base rounded-2xl shadow-xl shadow-yellow-500/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" /> PLAY NOW
        </Link>
        <Link
          href="/judge-me"
          className="w-full sm:w-auto px-8 py-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <ShieldAlert className="w-5 h-5 text-red-500" /> JUDGE ME COURT
        </Link>
      </div>
    </div>
  )
}
