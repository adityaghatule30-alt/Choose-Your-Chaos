'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Users, Plus, ArrowRight, Flame, Sparkles } from 'lucide-react'

export default function RoomsHubPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login?redirectTo=/rooms')
      return
    }

    if (!joinCode.trim()) return

    setJoining(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/rooms/${data.code}`)
      } else {
        setErrorMsg(data.message || 'Room not found or closed.')
      }
    } catch {
      setErrorMsg('Failed to join room. Try again.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/60 border border-purple-800/80 text-purple-400 text-xs font-bold rounded-full uppercase tracking-wider mb-6">
        <Users className="w-3.5 h-3.5" /> Multiplayer Friend Rooms
      </div>

      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
        PLAY TOGETHER. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          COMPETE IN CHAOS.
        </span>
      </h1>

      <p className="text-neutral-400 text-sm sm:text-base max-w-md mx-auto mb-10">
        Host a private room for your squad or enter an invite code to join a live game.
      </p>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
        {/* Create Room Card */}
        <Link
          href="/rooms/create"
          className="bg-neutral-900 border border-neutral-800 hover:border-purple-500/60 rounded-3xl p-6 sm:p-8 transition-all duration-300 transform hover:scale-[1.02] shadow-2xl group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-1 group-hover:text-purple-400 transition-colors">
              Host a Room
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Create a custom match with 3, 5, or 10 rounds and share your room code.
            </p>
          </div>

          <div className="mt-6 flex items-center text-xs font-black text-purple-400 group-hover:translate-x-1 transition-transform">
            CREATE NOW <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Join Room Form Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mb-4 text-yellow-400">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">Join with Code</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Enter the 6-character room code shared by your friend.
            </p>

            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. CHAOS7"
                maxLength={8}
                disabled={joining}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-center font-mono font-black text-base tracking-widest focus:outline-none focus:border-yellow-400 transition-colors uppercase disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={joining || !joinCode.trim()}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs rounded-xl shadow-lg shadow-yellow-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {joining ? 'JOINING ROOM...' : 'ENTER ROOM →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
