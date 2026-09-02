'use client'

import Link from 'next/link'
import { GAME_DEFINITIONS } from '@/lib/games/definitions'
import {
  Gamepad2,
  Play,
  Flame,
  ShieldAlert,
  Users,
  Sparkles,
  ArrowRight,
  Skull,
  UserCheck,
  Eye,
  HelpCircle,
  Camera,
} from 'lucide-react'

const ICONS_MAP: Record<string, any> = {
  Play,
  Sparkles,
  Skull,
  ShieldAlert,
  UserCheck,
  Eye,
  Flame,
  HelpCircle,
  Camera,
  Users,
}

export default function GamesHubPage() {
  // 4 Core Standalone & Custom Lobby games
  const coreGames = [
    {
      title: '🎮 EITHER / OR',
      subtitle: 'Binary Dilemmas & Global Votes',
      description: 'Vote on impossible scenarios. Reveal global statistics and witty Chaos AI roasts.',
      href: '/play',
      border: 'hover:border-yellow-400/60',
      badge: 'SOLO & SQUAD',
      accentText: 'text-yellow-400',
      bgGlow: 'bg-yellow-400/10',
      icon: Play,
    },
    {
      title: '🔥 TRUTH CHAOS',
      subtitle: 'Multiplayer Interrogation & Skips',
      description: 'The spotlight wheel chooses one target. Everyone else asks unfiltered questions with live reactions.',
      href: '/spotlight',
      border: 'hover:border-orange-500/60',
      badge: 'SPOTLIGHT MULTIPLAYER',
      accentText: 'text-orange-400',
      bgGlow: 'bg-orange-500/10',
      icon: Flame,
    },
    {
      title: '⚖️ JUDGE ME COURT',
      subtitle: 'Public Trials & Moral Verdicts',
      description: 'File your drama for public trial. The community casts verdicts: Innocent 🕊️, Guilty ⚖️, or Criminal 🚨.',
      href: '/judge-me',
      border: 'hover:border-red-500/60',
      badge: 'SOCIAL COURTROOM',
      accentText: 'text-red-400',
      bgGlow: 'bg-red-500/10',
      icon: ShieldAlert,
    },
    {
      title: 'Chaos Room Arena',
      badge: 'MULTIPLAYER PARTY',
      description: 'Host private multiplayer matches across all 10 game modes with instant codes and sync.',
      href: '/rooms',
      icon: Users,
      accentText: 'text-purple-400',
      border: 'hover:border-purple-500/60',
      bgGlow: 'bg-purple-950/60',
    },
  ]

  // All Multiplayer Party Game Modes
  const allPartyGames = Object.values(GAME_DEFINITIONS)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-black text-purple-400 uppercase tracking-widest mb-4 shadow-inner">
          <Gamepad2 className="w-3.5 h-3.5" /> {allPartyGames.length} Party Squad Game Modes Available
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          THE CHAOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">ARCADE</span>
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-2">
          Play quick solo dilemmas, host multiplayer interrogation sessions, or launch an 8-player party room.
        </p>
      </div>

      {/* Primary Game Platforms */}
      <div>
        <h2 className="text-sm font-black text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" /> Featured Game Hubs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreGames.map((g) => {
            const Icon = g.icon
            return (
              <Link
                key={g.href}
                href={g.href}
                className={`bg-neutral-900 border border-neutral-800 ${g.border} rounded-3xl p-5 transition-all duration-200 active-press shadow-xl flex flex-col justify-between group hover:scale-[1.02]`}
              >
                <div>
                  <div className={`w-10 h-10 rounded-2xl ${g.bgGlow} border border-neutral-750 flex items-center justify-center ${g.accentText} mb-3 shadow`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1">
                    {g.badge}
                  </span>
                  <h3 className="text-base font-black text-white mb-1.5 group-hover:text-yellow-400 transition-colors">
                    {g.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {g.description}
                  </p>
                </div>

                <div className={`mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-black ${g.accentText}`}>
                  <span>ENTER HUB</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 10 Multiplayer Squad Game Modes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" /> {allPartyGames.length} Party Squad Game Modes (2-10 Players)
          </h2>
          <Link
            href="/rooms/create"
            className="text-xs font-black text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            CREATE PARTY ROOM ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allPartyGames.map((g) => {
            const Icon = ICONS_MAP[g.iconName] || Play
            return (
              <Link
                key={g.id}
                href={`/rooms/create`}
                className="bg-neutral-900/90 border border-neutral-800 hover:border-purple-500/60 rounded-3xl p-5 transition-all duration-200 active-press shadow-xl flex flex-col justify-between group hover:scale-[1.02]"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-purple-400 mb-3 shadow">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1">
                    {g.badge}
                  </span>
                  <h3 className="text-base font-black text-white mb-1.5 group-hover:text-purple-400 transition-colors">
                    {g.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {g.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-black text-purple-400">
                  <span>HOST MATCH</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
