'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { AchievementItem } from '@/types/progression'
import { Award, Lock, Sparkles, Flame, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function AchievementsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirectTo=/achievements')
      return
    }

    const loadAchievements = async () => {
      try {
        const res = await fetch('/api/achievements')
        const data = await res.json()
        if (data.achievements) {
          setAchievements(data.achievements)
        }
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadAchievements()
    }
  }, [user, isLoading, router])

  if (isLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Flame className="w-10 h-10 text-yellow-400 animate-bounce" />
      </div>
    )
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      {/* Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" /> Hall of Chaos
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">ACHIEVEMENTS</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Unlock badges through questionable decisions and unwavering chaos.
            </p>
          </div>

          <div className="px-5 py-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-center self-stretch sm:self-auto">
            <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Unlocked</div>
            <div className="text-xl font-black text-yellow-400">
              {unlockedCount} / {achievements.length}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map((ach) => {
          return (
            <div
              key={ach.id}
              className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                ach.unlocked
                  ? 'bg-neutral-900 border-yellow-500/40 shadow-xl shadow-yellow-500/5'
                  : 'bg-neutral-950/80 border-neutral-800/80 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md ${
                      ach.unlocked
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                        : 'bg-neutral-900 text-neutral-600 border border-neutral-800'
                    }`}
                  >
                    {ach.icon || (ach.unlocked ? '🏆' : <Lock className="w-5 h-5" />)}
                  </div>

                  {ach.unlocked ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[10px] font-black rounded-full uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-500 text-[10px] font-black rounded-full uppercase tracking-wider">
                      <Lock className="w-3 h-3" /> LOCKED
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-white mb-1.5">{ach.name}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  {ach.description}
                </p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                  <span className="text-neutral-400">Progress</span>
                  <span className={ach.unlocked ? 'text-yellow-400' : 'text-neutral-500'}>
                    {ach.progress} / {ach.requirement_value}
                  </span>
                </div>

                <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.unlocked ? 'bg-yellow-400' : 'bg-neutral-700'
                    }`}
                    style={{ width: `${ach.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
