'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Room } from '@/types/rooms'
import { GAME_DEFINITIONS } from '@/lib/games/definitions'
import { Avatar } from '@/components/Avatar'
import { Trophy, Medal, Sparkles, Home, RotateCcw, Flame, Crown } from 'lucide-react'

export default function RoomResultsPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params)
  const roomCode = resolvedParams.code.toUpperCase()

  const { user } = useAuth()
  const router = useRouter()

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirectTo=/rooms/${roomCode}/results`)
      return
    }

    const loadResults = async () => {
      try {
        const res = await fetch(`/api/rooms/state?code=${roomCode}`)
        const data = await res.json()
        if (data.room) {
          setRoom(data.room)
        }
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [user, roomCode, router])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Flame className="w-10 h-10 text-yellow-400 animate-bounce" />
      </div>
    )
  }

  const members = room?.members || []
  const winner = members[0]
  const gameDef = room ? (GAME_DEFINITIONS[room.game_mode] || GAME_DEFINITIONS.either_or) : GAME_DEFINITIONS.either_or

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-14 text-center animate-pop-in">
      {/* Trophy Header */}
      <div className="inline-flex p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-3xl mb-4 shadow-xl">
        <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-purple-400 text-xs font-black uppercase tracking-wider mb-2">
        <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> {gameDef.title} • {room?.total_rounds || 5} ROUNDS MATCH
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
        {winner ? `${winner.display_name} WINS!` : 'CHAOS CHAMPION'}
      </h1>
      <p className="text-xs text-neutral-400 mb-8 font-medium">
        The match has concluded. Here is how your squad ranked in the arena:
      </p>

      {/* Podium Cards */}
      <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
        <div className="space-y-3">
          {members.map((m, index) => {
            const isWinner = index === 0
            const isSecond = index === 1
            const isThird = index === 2
            const isCurrentUser = user && m.user_id === user.id
            const profileHref = m.username ? `/user/${m.username}` : undefined

            // Dynamic tiered XP reward calculation
            const xpReward = isWinner ? 50 : isSecond ? 35 : isThird ? 25 : 20

            return (
              <div
                key={m.id || m.user_id}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
                  isWinner
                    ? 'bg-yellow-500/15 border-yellow-400/50 shadow-xl shadow-yellow-500/10'
                    : isSecond
                    ? 'bg-neutral-800/70 border-neutral-700'
                    : isThird
                    ? 'bg-neutral-850/60 border-neutral-800'
                    : 'bg-neutral-950/60 border-neutral-800/60'
                } ${isCurrentUser ? 'ring-1 ring-purple-500/40' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                    {isWinner ? (
                      <Medal className="w-6 h-6 text-yellow-400" />
                    ) : isSecond ? (
                      <Medal className="w-6 h-6 text-neutral-300" />
                    ) : isThird ? (
                      <Medal className="w-6 h-6 text-amber-600" />
                    ) : (
                      <span className="text-neutral-500 font-bold">#{index + 1}</span>
                    )}
                  </div>

                  {profileHref ? (
                    <Link
                      href={profileHref}
                      className="flex items-center gap-2.5 min-w-0 group cursor-pointer"
                    >
                      <Avatar
                        src={m.avatar_url}
                        fallback={m.display_name || 'A'}
                        size="sm"
                        glow={isWinner}
                      />
                      <div className="text-left min-w-0">
                        <div className="text-sm font-black text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5 truncate">
                          <span className="truncate">{m.display_name}</span>
                          {isCurrentUser && (
                            <span className="text-[8px] font-black uppercase text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800 leading-none">
                              YOU
                            </span>
                          )}
                          {m.is_host && (
                            <span className="text-[8px] font-black uppercase text-yellow-400 bg-yellow-950/80 px-1.5 py-0.5 rounded border border-yellow-800 leading-none flex items-center gap-0.5">
                              <Crown className="w-2 h-2 fill-current" /> HOST
                            </span>
                          )}
                        </div>
                        {m.username && (
                          <div className="text-[10px] text-neutral-500 font-medium truncate">
                            @{m.username}
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        src={m.avatar_url}
                        fallback={m.display_name || 'A'}
                        size="sm"
                        glow={isWinner}
                      />
                      <div className="text-left min-w-0">
                        <div className="text-sm font-black text-white flex items-center gap-1.5 truncate">
                          <span className="truncate">{m.display_name}</span>
                          {isCurrentUser && (
                            <span className="text-[8px] font-black uppercase text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800 leading-none">
                              YOU
                            </span>
                          )}
                          {m.is_host && (
                            <span className="text-[8px] font-black uppercase text-yellow-400 bg-yellow-950/80 px-1.5 py-0.5 rounded border border-yellow-800 leading-none flex items-center gap-0.5">
                              <Crown className="w-2 h-2 fill-current" /> HOST
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0 pl-2">
                  <div className="text-base sm:text-lg font-black text-yellow-400 leading-tight">
                    {m.score} PTS
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold">
                    +{xpReward} XP REWARD
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/rooms/create"
          className="w-full sm:w-auto px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2 active-press cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> PLAY ANOTHER MATCH
        </Link>
        <Link
          href="/rooms"
          className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 active-press cursor-pointer"
        >
          <Home className="w-4 h-4 text-neutral-400" /> ROOMS HUB
        </Link>
      </div>
    </div>
  )
}

