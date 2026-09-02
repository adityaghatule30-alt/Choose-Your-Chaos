'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { FriendProfile } from '@/types/social'
import { SocialLinks } from '@/components/social/SocialLinks'
import { FriendActionButton } from '@/components/social/FriendActionButton'
import { getLevelFromXP } from '@/lib/progression'
import {
  Flame,
  Zap,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Gamepad2,
} from 'lucide-react'

export default function UserPublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params)
  const username = resolvedParams.username

  const { user } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<FriendProfile | null>(null)
  const [isSelf, setIsSelf] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/socials?username=${username}`)
        const data = await res.json()
        if (data.profile) {
          setProfile(data.profile)
          setIsSelf(data.is_self)
        }
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [username])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Flame className="w-10 h-10 text-yellow-400 animate-bounce" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-pop-in">
        <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl">
          💀
        </div>
        <h2 className="text-2xl font-black text-white">Player Not Found</h2>
        <p className="text-neutral-400 text-xs mt-2 mb-6">
          This user does not exist or has changed their username.
        </p>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-yellow-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-yellow-500/20"
        >
          Explore Leaderboard
        </Link>
      </div>
    )
  }

  const levelInfo = getLevelFromXP(profile.xp || 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 animate-pop-in">
      <Link
        href="/friends"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Friends & Squad
      </Link>

      {/* Main Profile Card */}
      <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profile.display_name}
                </h1>
                <span className="px-2.5 py-0.5 bg-yellow-400 text-neutral-950 text-xs font-black rounded-full shadow">
                  LVL {levelInfo.level}
                </span>
              </div>
              <div className="text-xs font-bold text-neutral-400 mt-1">
                @{profile.username}
              </div>
            </div>

            {!isSelf && user && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <FriendActionButton
                  targetUserId={profile.id}
                  friendshipId={profile.friendship_id}
                  initialStatus={profile.friendship_status || 'none'}
                />
                {profile.friendship_status === 'accepted' && (
                  <Link
                    href="/friends"
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> CHAT
                  </Link>
                )}
              </div>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-neutral-300 max-w-lg leading-relaxed italic">
              "{profile.bio}"
            </p>
          )}

          {/* Level Bar */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-xs font-black mb-1.5">
              <span className="text-yellow-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" /> LEVEL {levelInfo.level}
              </span>
              <span className="text-neutral-400">
                {levelInfo.currentXP.toLocaleString()} XP
              </span>
            </div>

            <div className="w-full h-2.5 bg-neutral-950 rounded-full border border-neutral-800/80 p-0.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-yellow-400 rounded-full"
                style={{ width: `${levelInfo.percentProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Links Section */}
      <SocialLinks socials={profile.socials} isEditable={false} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center shadow-lg">
          <div className="text-red-400 text-xs font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Chaos Score
          </div>
          <div className="text-2xl font-black text-white">{profile.chaos_score || 0} 🔥</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center shadow-lg">
          <div className="text-yellow-400 text-xs font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Total XP
          </div>
          <div className="text-2xl font-black text-white">{(profile.xp || 0).toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
