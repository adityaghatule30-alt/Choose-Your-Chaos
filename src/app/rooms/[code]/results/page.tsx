'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Room } from '@/types/rooms'
import { Trophy, Medal, Sparkles, Home, RotateCcw, Flame } from 'lucide-react'

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

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-16 text-center">
      {/* Trophy Header */}
      <div className="inline-flex p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-3xl mb-4 shadow-xl">
        <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
        CHAOS CHAMPION
      </h1>
      <p className="text-xs text-neutral-400 mb-8">
        The match is concluded. Here is how your squad ranked in the arena:
      </p>

      {/* Podium Cards */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
        <div className="space-y-3">
          {members.map((m, index) => {
            const isWinner = index === 0
            const isSecond = index === 1
            const isThird = index === 2

            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  isWinner
                    ? 'bg-yellow-500/15 border-yellow-400/50 shadow-xl shadow-yellow-500/10'
                    : isSecond
                    ? 'bg-neutral-800/80 border-neutral-700'
                    : isThird
                    ? 'bg-neutral-850/60 border-neutral-800'
                    : 'bg-neutral-950/60 border-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs">
                    {isWinner ? (
                      <Medal className="w-6 h-6 text-yellow-400" />
                    ) : isSecond ? (
                      <Medal className="w-6 h-6 text-neutral-300" />
                    ) : isThird ? (
                      <Medal className="w-6 h-6 text-amber-600" />
                    ) : (
                      <span className="text-neutral-500">#{index + 1}</span>
                    )}
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{m.display_name}</span>
                      {m.is_host && (
                        <span className="text-[9px] bg-neutral-800 text-yellow-400 px-1.5 py-0.2 rounded">
                          HOST
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-yellow-400">{m.score} PTS</div>
                  <div className="text-[10px] text-neutral-500">+25 XP MATCH REWARD</div>
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
          className="w-full sm:w-auto px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> PLAY ANOTHER MATCH
        </Link>
        <Link
          href="/rooms"
          className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4 text-neutral-400" /> ROOMS HUB
        </Link>
      </div>
    </div>
  )
}
