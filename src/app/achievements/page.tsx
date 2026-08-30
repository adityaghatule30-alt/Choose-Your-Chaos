'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Award, Sparkles, Flame, Lock, CheckCircle2, Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface Achievement {
  id: string
  code: string
  name: string
  description: string
  badge_emoji: string
  xp_reward: number
  unlocked?: boolean
  unlocked_at?: string | null
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    code: 'first_decision',
    name: 'First Blood',
    description: 'Cast your very first Either / Or dilemma vote.',
    badge_emoji: '🩸',
    xp_reward: 20,
    unlocked: true,
  },
  {
    id: '2',
    code: 'court_juror',
    name: 'Jury Duty Survivor',
    description: 'Cast verdicts on 5 different courtroom trials.',
    badge_emoji: '⚖️',
    xp_reward: 50,
    unlocked: true,
  },
  {
    id: '3',
    code: 'certified_menace',
    name: '💀 Certified Menace',
    description: 'Voted with the chaotic minority in 10 separate dilemmas.',
    badge_emoji: '💀',
    xp_reward: 100,
    unlocked: true,
  },
  {
    id: '4',
    code: 'spotlight_target',
    name: 'Target Acquired',
    description: 'Survived the spotlight wheel and answered all squad questions.',
    badge_emoji: '🎯',
    xp_reward: 75,
    unlocked: false,
  },
  {
    id: '5',
    code: 'chaos_ai_endorsed',
    name: 'AI Certified Legend',
    description: 'Received a direct witty interruption from Chaos AI.',
    badge_emoji: '🤖',
    xp_reward: 50,
    unlocked: false,
  },
  {
    id: '6',
    code: 'couples_telepathy',
    name: 'Telepathic Duo',
    description: 'Achieved a 100% memory match in Couples Memory Lane.',
    badge_emoji: '❤️',
    xp_reward: 150,
    unlocked: false,
  },
]

export default function AchievementsPage() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS)
  const [loading, setLoading] = useState(false)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-black text-yellow-400 uppercase tracking-widest mb-4">
          <Award className="w-3.5 h-3.5" /> Badges & Chaos Mugshots
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          ACHIEVEMENTS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">MUGSHOTS 📸</span>
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-2">
          Unlock titles and badges as you progress through multiplayer trials and dilemmas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
              ach.unlocked
                ? 'bg-neutral-900 border-yellow-400/30 shadow-xl shadow-yellow-500/5'
                : 'bg-neutral-950/80 border-neutral-850 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-2xl shadow-inner">
                  {ach.badge_emoji}
                </div>
                {ach.unlocked ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> UNLOCKED
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-500 border border-neutral-800 text-[10px] font-black flex items-center gap-1">
                    <Lock className="w-3 h-3" /> LOCKED
                  </span>
                )}
              </div>

              <h3 className="text-base font-black text-white mb-1">{ach.name}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{ach.description}</p>
            </div>

            <div className="mt-6 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-black text-yellow-400">
              <span>+{ach.xp_reward} XP</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
