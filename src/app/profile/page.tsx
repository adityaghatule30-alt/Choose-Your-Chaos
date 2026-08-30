'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getLevelFromXP } from '@/lib/progression'
import { UserStats } from '@/types/progression'
import { Avatar } from '@/components/Avatar'
import {
  Flame,
  Trophy,
  Award,
  Sparkles,
  Settings,
  ShieldAlert,
  Play,
  Users,
  Zap,
  CheckCircle2,
  Lock,
  Heart,
} from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState<UserStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirectTo=/profile')
      return
    }

    const loadStats = async () => {
      try {
        const res = await fetch('/api/user/stats')
        const data = await res.json()
        if (data.stats) {
          setStats(data.stats)
        }
      } finally {
        setLoadingStats(false)
      }
    }

    if (user) {
      loadStats()
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Flame className="w-10 h-10 text-yellow-400 animate-bounce" />
      </div>
    )
  }

  if (!user || !profile) return null

  const levelInfo = getLevelFromXP(profile.xp || 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Profile Banner Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 via-pink-500/10 to-transparent rounded-full blur-3xl -z-10" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Level Badge */}
          <div className="relative">
            <Avatar
              src={profile.avatar_url}
              fallback={profile.username || 'U'}
              size="2xl"
              glow
            />
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-yellow-400 text-neutral-950 text-[11px] font-black rounded-full shadow-lg">
              LVL {levelInfo.level}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profile.display_name || profile.username}
                </h1>
                <div className="text-xs font-bold text-neutral-400 mt-0.5">
                  @{profile.username}
                </div>
              </div>

              <Link
                href="/settings"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white rounded-2xl text-xs font-black transition-all self-center sm:self-auto shadow-md"
              >
                <Settings className="w-3.5 h-3.5" /> Customize Identity
              </Link>
            </div>

            {profile.bio && (
              <p className="text-xs text-neutral-300 mt-3 max-w-lg leading-relaxed italic">
                "{profile.bio}"
              </p>
            )}

            {/* Level & XP Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center text-xs font-black mb-1.5">
                <span className="text-yellow-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" /> LEVEL {levelInfo.level}
                </span>
                <span className="text-neutral-400">
                  {levelInfo.currentXP.toLocaleString()} XP{' '}
                  <span className="text-neutral-600 font-normal">
                    / {levelInfo.xpForNextLevel.toLocaleString()} XP
                  </span>
                </span>
              </div>

              <div className="w-full h-3 bg-neutral-950 rounded-full border border-neutral-800/80 p-0.5 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${levelInfo.percentProgress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-neutral-500 mt-1.5 font-bold">
                <span>{levelInfo.percentProgress}% to Level {levelInfo.level + 1}</span>
                <span>{levelInfo.neededXPForNextLevel.toLocaleString()} XP remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center shadow-lg">
          <div className="text-red-400 text-xs font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Chaos Score
          </div>
          <div className="text-2xl font-black text-white">{profile.chaos_score || 0} 🔥</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center shadow-lg">
          <div className="text-yellow-400 text-xs font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Play className="w-3.5 h-3.5" /> Dilemmas
          </div>
          <div className="text-2xl font-black text-white">{stats?.either_or_votes || 0}</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center shadow-lg">
          <div className="text-pink-400 text-xs font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Heart className="w-3.5 h-3.5" /> Duos Played
          </div>
          <div className="text-2xl font-black text-white">
            {(stats?.truth_completed || 0) + (stats?.dare_completed || 0) + 4}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center shadow-lg">
          <div className="text-emerald-400 text-xs font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Court Verdicts
          </div>
          <div className="text-2xl font-black text-white">{stats?.judge_votes || 0}</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/achievements"
          className="bg-neutral-900 border border-neutral-800 hover:border-yellow-500/50 rounded-3xl p-6 transition-all duration-300 transform hover:scale-[1.02] shadow-xl group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-yellow-400 transition-colors">
                Badges & Chaos Mugshots
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                View unlocked badges & title status
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-yellow-400">VIEW →</span>
        </Link>

        <Link
          href="/leaderboard"
          className="bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 rounded-3xl p-6 transition-all duration-300 transform hover:scale-[1.02] shadow-xl group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors">
                Leaderboards
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Check top chaos rankings
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-400">VIEW →</span>
        </Link>
      </div>
    </div>
  )
}
