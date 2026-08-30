'use client'

import Link from 'next/link'
import {
  Gamepad2,
  Play,
  Flame,
  ShieldAlert,
  Heart,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

export default function GamesHubPage() {
  const games = [
    {
      title: '🎲 EITHER / OR',
      subtitle: 'Binary Dilemmas & Global Votes',
      description: 'Vote on impossible scenarios. Reveal global statistics and deterministic witty reactions.',
      href: '/play',
      color: 'yellow',
      border: 'hover:border-yellow-400/60',
      badge: 'SOLO & SQUAD',
      accentText: 'text-yellow-400',
      bgGlow: 'bg-yellow-400/10',
      icon: Play,
    },
    {
      title: '🔥 TRUTH CHAOS',
      subtitle: 'Multiplayer Interrogation & Skips',
      description: 'The spotlight wheel chooses one target. Everyone else asks spicy questions with live reactions and AI interruptions.',
      href: '/spotlight',
      color: 'orange',
      border: 'hover:border-orange-500/60',
      badge: 'SPOTLIGHT MULTIPLAYER',
      accentText: 'text-orange-400',
      bgGlow: 'bg-orange-500/10',
      icon: Flame,
    },
    {
      title: '⚖️ JUDGE ME COURT',
      subtitle: 'Public Trials & Moral Verdicts',
      description: 'File your drama for public trial. The community casts verdicts: Innocent 😇, Guilty 😬, or Criminal 💀.',
      href: '/judge-me',
      color: 'red',
      border: 'hover:border-red-500/60',
      badge: 'SOCIAL COURTROOM',
      accentText: 'text-red-400',
      bgGlow: 'bg-red-500/10',
      icon: ShieldAlert,
    },
    {
      title: '❤️ COUPLES & DUOS',
      subtitle: 'Memory Lane, Couple Chaos, Ship or Skip',
      description: 'Test your shared memory, match simultaneous choices, and discover dramatic compatibility ratings.',
      href: '/couples',
      color: 'pink',
      border: 'hover:border-pink-500/60',
      badge: 'PAIRS & COUPLES',
      accentText: 'text-pink-400',
      bgGlow: 'bg-pink-500/10',
      icon: Heart,
    },
    {
      title: '👥 FRIEND ROOMS',
      subtitle: 'Live Custom Match Lobby',
      description: 'Host private matches for your friends. Simultaneous hidden voting with match leaderboards and XP rewards.',
      href: '/rooms',
      color: 'purple',
      border: 'hover:border-purple-500/60',
      badge: 'PRIVATE LOBBY',
      accentText: 'text-purple-400',
      bgGlow: 'bg-purple-500/10',
      icon: Users,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-black text-purple-400 uppercase tracking-widest mb-4">
          <Gamepad2 className="w-3.5 h-3.5" /> All Game Modes
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          THE CHAOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-yellow-400">ARCADE</span>
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-2">
          Choose a game mode to play solo, with a partner, or live with your entire friend group.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {games.map((g) => {
          const Icon = g.icon
          return (
            <Link
              key={g.href}
              href={g.href}
              className={`bg-neutral-900 border border-neutral-800 ${g.border} rounded-3xl p-6 sm:p-7 transition-all duration-300 transform hover:scale-[1.02] shadow-2xl flex flex-col justify-between group`}
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl ${g.bgGlow} border border-neutral-750 flex items-center justify-center ${g.accentText} mb-4 shadow`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1">
                  {g.badge}
                </span>
                <h2 className="text-lg font-black text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {g.title}
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {g.description}
                </p>
              </div>

              <div className={`mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs font-black ${g.accentText}`}>
                <span>ENTER GAME</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
