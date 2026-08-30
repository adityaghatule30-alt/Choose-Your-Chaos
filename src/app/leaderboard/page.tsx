'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { LeaderboardUser } from '@/types/progression'
import { Trophy, Medal, Flame, TrendingUp, Sparkles, ArrowLeft } from 'lucide-react'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState<'all_time' | 'weekly' | 'daily'>('all_time')
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  const loadLeaderboard = async (tf = timeframe) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?timeframe=${tf}`)
      const data = await res.json()
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaderboard(timeframe)
  }, [timeframe])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      {/* Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-6 text-center sm:text-left">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/60 border border-purple-800/80 text-purple-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5" /> Rankings
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">LEADERBOARD</h1>
            <p className="text-xs text-neutral-400 mt-1">
              The highest ranking chaos agents across the platform.
            </p>
          </div>
        </div>
      </div>

      {/* Timeframe Tabs */}
      <div className="flex items-center gap-2 mb-6 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
        <button
          onClick={() => setTimeframe('all_time')}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            timeframe === 'all_time'
              ? 'bg-yellow-400 text-neutral-950 shadow-md shadow-yellow-500/20'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          ALL TIME
        </button>
        <button
          onClick={() => setTimeframe('weekly')}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            timeframe === 'weekly'
              ? 'bg-yellow-400 text-neutral-950 shadow-md shadow-yellow-500/20'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          THIS WEEK
        </button>
        <button
          onClick={() => setTimeframe('daily')}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            timeframe === 'daily'
              ? 'bg-yellow-400 text-neutral-950 shadow-md shadow-yellow-500/20'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          TODAY
        </button>
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="space-y-2 py-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-neutral-900 rounded-2xl animate-pulse border border-neutral-800" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 text-center text-neutral-500 text-xs">
          No chaos agents found.
        </div>
      ) : (
        <div className="space-y-2.5">
          {leaderboard.map((u) => {
            const isFirst = u.rank === 1
            const isSecond = u.rank === 2
            const isThird = u.rank === 3

            return (
              <div
                key={u.id}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  u.is_current_user
                    ? 'bg-purple-950/40 border-purple-500/60 ring-2 ring-purple-500/20'
                    : isFirst
                    ? 'bg-yellow-500/10 border-yellow-500/40'
                    : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs">
                    {isFirst ? (
                      <Medal className="w-5 h-5 text-yellow-400" />
                    ) : isSecond ? (
                      <Medal className="w-5 h-5 text-neutral-300" />
                    ) : isThird ? (
                      <Medal className="w-5 h-5 text-amber-600" />
                    ) : (
                      <span className="text-neutral-500 text-xs font-bold">#{u.rank}</span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-red-500 flex items-center justify-center font-bold text-xs text-neutral-950 overflow-hidden">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      u.username[0]?.toUpperCase()
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{u.display_name || u.username}</span>
                      {u.is_current_user && (
                        <span className="px-1.5 py-0.2 bg-purple-500 text-white text-[9px] font-bold rounded">
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
                  <div className="text-sm font-black text-yellow-400">{u.xp.toLocaleString()} XP</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
