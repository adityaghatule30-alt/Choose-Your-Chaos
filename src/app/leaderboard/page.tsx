'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Trophy, Medal, Flame, Sparkles, Users, Award, Shield, Crown } from 'lucide-react'

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
    const loadLeaderboard = async () => {
      try {
        const res = await fetch(`/api/leaderboard?tab=${tab}`)
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

    loadLeaderboard()
  }, [tab])

  const top3 = leaderboard.slice(0, 3)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="text-center max-w-xl mx-auto mb-8 animate-pop-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 rounded-full text-xs font-black uppercase tracking-wider mb-3">
          <Trophy className="w-3.5 h-3.5" /> TOP CHAOS AGENTS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">RANKINGS</span>
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-2">
          Climb the leaderboards by voting on unhinged dilemmas, surviving trials, and dominating squad rooms.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto py-1">
        {[
          { id: 'global', label: '🔥 GLOBAL' },
          { id: 'weekly', label: '⚡ THIS WEEK' },
          { id: 'friends', label: '👥 SQUAD ONLY' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap active-press ${
              tab === t.id
                ? 'bg-yellow-400 text-neutral-950 shadow-lg shadow-yellow-500/20'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Flame className="w-10 h-10 text-yellow-400 mx-auto animate-bounce mb-3" />
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Loading Leaderboard...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-pop-in">
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mb-8 pt-6">
              {/* #2 Second Place */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center justify-between min-h-[160px] shadow-lg">
                <div className="w-8 h-8 rounded-full bg-neutral-300 text-neutral-950 font-black text-sm flex items-center justify-center shadow">
                  2
                </div>
                <div className="mt-3 w-full">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate">
                    {top3[1]?.display_name || top3[1]?.username}
                  </h3>
                  <div className="text-[10px] text-yellow-400 font-bold mt-0.5">{top3[1]?.xp.toLocaleString()} XP</div>
                  <div className="text-[9px] text-neutral-500 font-semibold mt-0.5">LVL {top3[1]?.level}</div>
                </div>
              </div>

              {/* #1 First Place (Center & Taller) */}
              <div className="bg-gradient-to-b from-amber-500/20 via-neutral-900 to-neutral-950 border-2 border-amber-400 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center justify-between min-h-[190px] shadow-2xl shadow-amber-500/20">
                <div className="w-9 h-9 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg font-black text-base">
                  <Crown className="w-5 h-5 fill-current" />
                </div>
                <div className="mt-3 w-full">
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">CHAMPION</span>
                  <h3 className="text-sm sm:text-base font-black text-white truncate">
                    {top3[0]?.display_name || top3[0]?.username}
                  </h3>
                  <div className="text-xs text-yellow-400 font-black mt-0.5">{top3[0]?.xp.toLocaleString()} XP</div>
                  <div className="text-[10px] text-neutral-400 font-bold mt-0.5">LVL {top3[0]?.level} • {top3[0]?.chaos_score} 🔥</div>
                </div>
              </div>

              {/* #3 Third Place */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center justify-between min-h-[150px] shadow-lg">
                <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow">
                  3
                </div>
                <div className="mt-3 w-full">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate">
                    {top3[2]?.display_name || top3[2]?.username}
                  </h3>
                  <div className="text-[10px] text-yellow-400 font-bold mt-0.5">{top3[2]?.xp.toLocaleString()} XP</div>
                  <div className="text-[9px] text-neutral-500 font-semibold mt-0.5">LVL {top3[2]?.level}</div>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard List */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-2">
            {leaderboard.map((u) => (
              <div
                key={u.id}
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  u.is_current_user
                    ? 'bg-purple-950/40 border-purple-500/60 ring-2 ring-purple-500/20'
                    : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-6 text-center font-black text-xs text-neutral-500">
                    #{u.rank}
                  </span>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <span>{u.display_name || u.username}</span>
                      {u.is_current_user && (
                        <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[9px] font-black rounded-full leading-none">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
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
