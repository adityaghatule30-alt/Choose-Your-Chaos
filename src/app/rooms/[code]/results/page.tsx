'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Room } from '@/types/rooms'
import { GAME_DEFINITIONS } from '@/lib/games/definitions'
import { Trophy, Medal, Sparkles, Home, RotateCcw, Flame, Crown, Target, Bot } from 'lucide-react'

export default function RoomResultsPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params)
  const roomCode = resolvedParams.code.toUpperCase()

  const { user } = useAuth()
  const router = useRouter()

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiReaction, setAiReaction] = useState<string | null>(null)
  const [pickForMeStats, setPickForMeStats] = useState<Array<{
    userId: string
    displayName: string
    correct: number
    total: number
    score: number
  }> | null>(null)

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

        // Fetch contextual Chaos AI reaction & specific stats
        const reactionRes = await fetch(`/api/rooms/results/reaction?code=${roomCode}`)
        const reactionData = await reactionRes.json()
        if (reactionData.success) {
          if (reactionData.reaction) setAiReaction(reactionData.reaction)
          if (reactionData.pickForMeStats) setPickForMeStats(reactionData.pickForMeStats)
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
  const isPickForMe = room?.game_mode === 'pick_for_me'
  const totalRounds = room?.total_rounds || 10
  const gameDef = room ? (GAME_DEFINITIONS[room.game_mode] || GAME_DEFINITIONS.either_or) : GAME_DEFINITIONS.either_or

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-14 text-center animate-pop-in">
      {/* Header Icon */}
      <div className="inline-flex p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-3xl mb-4 shadow-xl">
        {isPickForMe ? (
          <Target className="w-12 h-12 text-pink-400 animate-bounce" />
        ) : (
          <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
        )}
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-purple-400 text-xs font-black uppercase tracking-wider mb-2">
        <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> {gameDef.title} • {totalRounds} ROUNDS MATCH
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
        MATCH COMPLETE
      </h1>

      <p className="text-xs text-neutral-400 mb-6 font-medium">
        {isPickForMe
          ? 'Here is how accurately you predicted each other:'
          : 'Here is how your squad ranked in the arena:'}
      </p>

      {/* Pick For Me Specialized Stats Cards */}
      {isPickForMe && pickForMeStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {pickForMeStats.map((p) => (
            <div key={p.userId} className="bg-pink-950/25 border border-pink-800/60 rounded-2xl p-4 text-left shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 block mb-0.5">
                {p.displayName} PREDICTIONS
              </span>
              <div className="text-xl font-black text-white">
                {p.correct} / {p.total || Math.ceil(totalRounds / 2)} <span className="text-pink-400 text-xs font-bold">CORRECT</span>
              </div>
              <div className="text-xs text-neutral-400 mt-1 font-semibold">
                Score: <span className="text-yellow-400 font-bold">{p.score} PTS</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chaos AI Dynamic Match Reaction Box */}
      {aiReaction && (
        <div className="bg-neutral-900/95 border border-yellow-500/30 rounded-3xl p-4 sm:p-5 mb-6 shadow-xl text-left flex items-start gap-3.5 animate-pop-in">
          <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl shrink-0 text-yellow-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 block mb-0.5">
              CHAOS AI VERDICT
            </span>
            <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
              "{aiReaction}"
            </p>
          </div>
        </div>
      )}

      {/* Scoreboard Cards */}
      <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl mb-8">
        <div className="text-left text-xs font-black uppercase tracking-wider text-neutral-400 mb-3 px-1">
          Final Squad Scores
        </div>
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
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
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
          <RotateCcw className="w-4 h-4" /> PLAY AGAIN
        </Link>
        <Link
          href="/games"
          className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 active-press cursor-pointer"
        >
          <Home className="w-4 h-4 text-neutral-400" /> BACK TO ARCADE
        </Link>
      </div>
    </div>
  )
}


