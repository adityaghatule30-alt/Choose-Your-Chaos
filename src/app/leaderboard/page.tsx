'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Trophy, Medal, Flame, Sparkles, Users, Award, Shield } from 'lucide-react'
import { Avatar } from '@/components/Avatar'

interface LeaderboardUser {
  rank: number
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  xp: number
  level: number
  chaos_score: number
  is_current_user: boolean
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'global' | 'weekly' | 'friends' | 'alltime'>('global')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard')
        const data = await res.json()
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard)
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest mb-4">
          <Trophy className="w-3.5 h-3.5" /> Hall of Chaos
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          CHAOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500">RANKINGS</span>
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-2">
          The most unhinged decision makers, courtroom judges, and spotlight survivors.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { id: 'global', label: '🌎 GLOBAL' },
          { id: 'weekly', label: '🔥 WEEKLY' },
          { id: 'friends', label: '👥 FRIENDS' },
          { id: 'alltime', label: '🏆 ALL TIME' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
              tab === t.id
                ? 'bg-amber-500 border-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="min-h-[250px] flex items-center justify-center">
          <Flame className="w-10 h-10 text-yellow-400 animate-bounce" />
        </div>
      ) : (
        <div className="space-y-6 animate-pop-in">
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mb-8 pt-6">
              {/* #2 Second Place */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center justify-between min-h-[190px]">
                <div className="relative">
                  <Avatar src={top3[1]?.avatar_url} fallback={top3[1]?.username} size="lg" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neutral-300 text-neutral-950 font-black text-xs flex items-center justify-center">
                    2
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate max-w-[100px]">
                    {top3[1]?.display_name || top3[1]?.username}
                  </h3>
                  <div className="text-[10px] text-yellow-400 font-bold">{top3[1]?.xp.toLocaleString()} XP</div>
                </div>
              </div>

              {/* #1 First Place (Center & Taller) */}
              <div className="bg-gradient-to-b from-amber-500/20 via-neutral-900 to-neutral-950 border-2 border-amber-400 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center justify-between min-h-[230px] shadow-2xl shadow-amber-500/20">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center absolute -top-3 left-1/2 -translate-x-1/2 shadow">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <Avatar src={top3[0]?.avatar_url} fallback={top3[0]?.username} size="xl" glow />
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">CHAOS CHAMPION</span>
                  <h3 className="text-sm sm:text-base font-black text-white truncate max-w-[120px]">
                    {top3[0]?.display_name || top3[0]?.username}
                  </h3>
                  <div className="text-xs text-yellow-400 font-black">{top3[0]?.xp.toLocaleString()} XP</div>
                </div>
              </div>

              {/* #3 Third Place */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center justify-between min-h-[170px]">
                <div className="relative">
                  <Avatar src={top3[2]?.avatar_url} fallback={top3[2]?.username} size="lg" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center">
                    3
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate max-w-[100px]">
                    {top3[2]?.display_name || top3[2]?.username}
                  </h3>
                  <div className="text-[10px] text-yellow-400 font-bold">{top3[2]?.xp.toLocaleString()} XP</div>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard List */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-2">
            {leaderboard.map((u) => (
              <div
                key={u.id}
                className={`p-3 sm:p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  u.is_current_user
                    ? 'bg-purple-950/40 border-purple-500/60 ring-2 ring-purple-500/20'
                    : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-black text-xs text-neutral-500">
                    #{u.rank}
                  </span>
                  <Avatar src={u.avatar_url} fallback={u.username} size="sm" />
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <span>{u.display_name || u.username}</span>
                      {u.is_current_user && (
                        <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[9px] font-black rounded-full">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      LVL {u.level} • {u.chaos_score} 🔥
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs sm:text-sm font-black text-yellow-400">{u.xp.toLocaleString()} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
