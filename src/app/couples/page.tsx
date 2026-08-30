'use client'

import Link from 'next/link'
import { Heart, Sparkles, Flame, Ship, ArrowRight, ShieldAlert } from 'lucide-react'

export default function CouplesHubPage() {
  const modes = [
    {
      title: '💌 MEMORY LANE',
      subtitle: 'Shared Memory & Telepathy',
      description: 'Answer questions about your history, first impressions, and relationship milestones. Lock in your answers secretly and reveal your match percentage.',
      href: '/couples/memory-lane',
      color: 'pink',
      badge: '2 PLAYERS',
      icon: Heart,
    },
    {
      title: '🔥 COUPLE CHAOS',
      subtitle: 'Who Is More...?',
      description: 'Simultaneously vote on who is more chaotic, dramatic, stubborn, or romantic. Watch out for mutual accusations and same brain cell moments.',
      href: '/couples/couple-chaos',
      color: 'purple',
      badge: 'SPEED DECISIONS',
      icon: Flame,
    },
    {
      title: '💘 SHIP OR SKIP',
      subtitle: 'Chaotic Compatibility Verdict',
      description: 'Two willing players enter. Answer rapid personality compatibility prompts to reveal if you are a Ship It 🚢, Friendship Boat 🛶, or Shipwrecked 💥.',
      href: '/couples/ship-or-skip',
      color: 'red',
      badge: 'CONSENT-BASED DUO',
      icon: Ship,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-pink-950/60 border border-pink-800/80 rounded-full text-xs font-black text-pink-400 uppercase tracking-widest mb-4">
          <Heart className="w-3.5 h-3.5 fill-current" /> Pairs, Duos & Couples
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          COUPLES <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-red-400">CHAOS</span>
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-2">
          Playful, funny, and unpredictable duo games for couples, besties, and chaotic pairs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {modes.map((m) => {
          const Icon = m.icon
          return (
            <Link
              key={m.href}
              href={m.href}
              className="bg-neutral-900 border border-neutral-800 hover:border-pink-500/60 rounded-3xl p-6 sm:p-7 transition-all duration-300 transform hover:scale-[1.02] shadow-2xl flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4 shadow">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-pink-400 uppercase tracking-wider block mb-1">
                  {m.badge}
                </span>
                <h2 className="text-lg font-black text-white mb-2 group-hover:text-pink-400 transition-colors">
                  {m.title}
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs font-black text-pink-400">
                <span>START DUO</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl text-center text-xs text-neutral-500 max-w-xl mx-auto">
        ℹ️ All couples games are social entertainment party games designed for laughs and friendly banter.
      </div>
    </div>
  )
}
