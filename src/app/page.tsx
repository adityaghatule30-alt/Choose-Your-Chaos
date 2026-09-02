'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getLevelFromXP } from '@/lib/progression'
import {
  Flame,
  Sparkles,
  Play,
  ShieldAlert,
  Users,
  Trophy,
  Zap,
  Award,
  ArrowRight,
  Plus,
  Crown,
  Lock,
  Gamepad2,
} from 'lucide-react'

export default function DashboardHubPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetch('/api/user/stats')
        .then((res) => res.json())
        .then((d) => {
          if (d.stats) setStats(d.stats)
        })
        .catch(() => {})
    }
  }, [user])

  const levelInfo = getLevelFromXP(profile?.xp || 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-950/80 border border-neutral-800 rounded-full text-xs font-black text-yellow-400 uppercase tracking-widest mb-6 shadow-inner">
            <Flame className="w-3.5 h-3.5 fill-current" /> Multiplayer Social Chaos Platform
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4">
            CHOOSE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">
              CHAOS 🔥
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 font-medium max-w-xl leading-relaxed mb-8">
            "Your friends are here. Your good decisions are not." 💀
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/play"
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-400 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-600/25 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> PLAY NOW 🔥
            </Link>

            <Link
              href="/rooms/create"
              className="px-5 sm:px-6 py-3.5 sm:py-4 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-purple-500 text-white font-bold text-sm rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Users className="w-4 h-4 text-purple-400" /> CREATE ROOM
            </Link>

            <Link
              href="/rooms"
              className="px-5 sm:px-6 py-3.5 sm:py-4 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-bold text-sm rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              JOIN WITH CODE
            </Link>
          </div>
        </div>
      </div>

      {/* Personal Stats Bar */}
      {user && profile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 sm:p-5 bg-neutral-900/80 border border-neutral-800 rounded-3xl text-center shadow-lg">
            <div className="text-yellow-400 text-xs font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Level & XP
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              LVL {levelInfo.level} <span className="text-xs font-normal text-neutral-400">({profile.xp || 0} XP)</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-neutral-900/80 border border-neutral-800 rounded-3xl text-center shadow-lg">
            <div className="text-red-400 text-xs font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Chaos Score
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{profile.chaos_score || 0} ⚡</div>
          </div>

          <div className="p-4 sm:p-5 bg-neutral-900/80 border border-neutral-800 rounded-3xl text-center shadow-lg">
            <div className="text-purple-400 text-xs font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Global Rank
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats?.rank ? `#${stats.rank}` : 'Top 100'} 👑
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-neutral-900/80 border border-neutral-800 rounded-3xl text-center shadow-lg">
            <div className="text-pink-400 text-xs font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5" /> Achievements
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats?.unlocked_achievements || 3} Unlocked
            </div>
          </div>
        </div>
      )}

      {/* Main Game Modes Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-purple-400" /> CHAOS GAME MODES
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">Pick your poison and start playing with your squad.</p>
          </div>

          <Link
            href="/games"
            className="text-xs font-black text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            VIEW ALL ARCADE <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Either / Or */}
          <Link
            href="/play"
            className="group bg-neutral-900/90 border border-neutral-800 hover:border-yellow-400/60 rounded-3xl p-6 sm:p-8 transition-all duration-300 transform hover:scale-[1.01] shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-4 shadow">
                <Play className="w-6 h-6 fill-current" />
              </div>
              <div className="inline-flex px-2.5 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-black uppercase tracking-wider mb-2">
                SOLO & SQUAD
              </div>
              <h3 className="text-xl font-black text-white mb-2 group-hover:text-yellow-400 transition-colors">
                🎮 EITHER / OR
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Brutal binary dilemmas. Choose your side, lock in your vote, and reveal what percentage of players agree with your chaotic mindset.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-black text-yellow-400">
              <span>PLAY EITHER / OR</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Truth Chaos (Spotlight) */}
          <Link
            href="/spotlight"
            className="group bg-neutral-900/90 border border-neutral-800 hover:border-orange-500/60 rounded-3xl p-6 sm:p-8 transition-all duration-300 transform hover:scale-[1.01] shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4 shadow">
                <Flame className="w-6 h-6" />
              </div>
              <div className="inline-flex px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-wider mb-2">
                MULTIPLAYER SPOTLIGHT
              </div>
              <h3 className="text-xl font-black text-white mb-2 group-hover:text-orange-400 transition-colors">
                🔥 TRUTH CHAOS
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                One player is chosen by the spotlight wheel. Everyone else asks unfiltered questions. Limited skips, live reactions, and AI commentary.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-black text-orange-400">
              <span>ENTER TRUTH CHAOS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Judge Me Court */}
          <Link
            href="/judge-me"
            className="group bg-neutral-900/90 border border-neutral-800 hover:border-red-500/60 rounded-3xl p-6 sm:p-8 transition-all duration-300 transform hover:scale-[1.01] shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="inline-flex px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider mb-2">
                SOCIAL COURTROOM
              </div>
              <h3 className="text-xl font-black text-white mb-2 group-hover:text-red-400 transition-colors">
                ⚖️ JUDGE ME COURT
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Submit your real-life moral conflicts to the community jury. Watch them cast verdicts: Innocent 🕊️, Guilty ⚖️, or Criminal 🚨.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-black text-red-400">
              <span>ENTER THE COURTROOM</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Friend Rooms */}
          <Link
            href="/rooms"
            className="group bg-neutral-900/90 border border-neutral-800 hover:border-purple-500/60 rounded-3xl p-6 sm:p-8 transition-all duration-300 transform hover:scale-[1.01] shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 shadow">
                <Users className="w-6 h-6" />
              </div>
              <div className="inline-flex px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-wider mb-2">
                CUSTOM MATCH LOBBY
              </div>
              <h3 className="text-xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">
                👥 FRIEND ROOMS
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Create a private room with 3, 5, or 10 rounds. Share the room code, vote in secret, and compete for victory on the room leaderboard.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-black text-purple-400">
              <span>CREATE OR JOIN ROOM</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
