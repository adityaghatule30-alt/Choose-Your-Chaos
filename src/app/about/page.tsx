import { Metadata } from 'next'
import Link from 'next/link'
import { Flame, Play, Sparkles, ShieldAlert, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About — Choose Your Chaos',
  description: 'Learn about Choose Your Chaos, the ultimate social party dilemma game built for friends and chaotic squads.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <div className="inline-flex p-3 bg-red-950/60 border border-red-800 rounded-2xl mb-4 shadow-lg">
          <Flame className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
          ABOUT CHOOSE YOUR CHAOS
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
          We built Choose Your Chaos for the late-night group chats, questionable decisions, and unapologetic party debates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl">
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center mb-3">
            <Play className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white mb-1">Either / Or Dilemmas</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Vote on impossible, funny, and controversial scenarios. Reveal how the rest of the world answered and earn server-backed XP.
          </p>
        </div>

        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white mb-1">Chaos Spotlight</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            One player gets randomly chosen. Everyone else asks the questions. Unfiltered interrogation with limited skips and AI commentary.
          </p>
        </div>

        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white mb-1">Judge Me Court</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Present your real-life moral conflicts to the public jury and watch them cast verdicts: Not Guilty, Guilty, or Absolutely Criminal.
          </p>
        </div>

        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white mb-1">Multiplayer Friend Rooms</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Host a private lobby, lock in secret answers in real-time, reveal squad votes simultaneously, and crown the Chaos Champion.
          </p>
        </div>
      </div>

      <div className="text-center bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl">
        <h3 className="text-lg font-black text-white mb-2">Ready to test your instincts?</h3>
        <p className="text-xs text-neutral-400 mb-6">Join thousands of chaos agents playing right now.</p>
        <Link
          href="/play"
          className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs rounded-xl shadow-lg shadow-yellow-500/20 transition-all inline-block"
        >
          START PLAYING NOW 🔥
        </Link>
      </div>
    </div>
  )
}
