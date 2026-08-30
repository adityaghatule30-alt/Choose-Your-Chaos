'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Flame, Sparkles, Users, Plus, ArrowRight, ShieldAlert } from 'lucide-react'

export default function SpotlightHubPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!user) {
      router.push('/login?redirectTo=/spotlight')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/spotlight/create', {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success && data.code) {
        router.push(`/spotlight/${data.code}`)
      } else {
        setErrorMsg(data.message || 'Failed to create Spotlight room.')
      }
    } catch {
      setErrorMsg('Server error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login?redirectTo=/spotlight')
      return
    }

    if (!joinCode.trim()) return

    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/spotlight/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      })
      const data = await res.json()

      if (data.success && data.code) {
        router.push(`/spotlight/${data.code}`)
      } else {
        setErrorMsg(data.message || 'Room not found. Check the code.')
      }
    } catch {
      setErrorMsg('Failed to join room.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 text-center">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-950/60 border border-orange-800/80 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider mb-6 shadow-inner">
        <Flame className="w-4 h-4 text-orange-500 animate-pulse" /> Multiplayer Social Interrogation
      </div>

      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
        CHAOS <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-red-500">
          SPOTLIGHT 🔥
        </span>
      </h1>

      <p className="text-neutral-400 text-sm sm:text-base max-w-lg mx-auto mb-10 leading-relaxed">
        One player gets chosen. Everyone else asks the questions. Unfiltered answers, limited skips, and AI commentary. 💀
      </p>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-sm max-w-md mx-auto">
          {errorMsg}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-12">
        {/* Create Lobby Card */}
        <div className="bg-neutral-900 border border-neutral-800 hover:border-orange-500/60 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-2xl flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4 text-orange-400">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-1 group-hover:text-orange-400 transition-colors">
              Host Spotlight
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Create a live room for your squad. Spin the spotlight and start the interrogation.
            </p>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-6 w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> {loading ? 'CREATING...' : 'CREATE ROOM'}
          </button>
        </div>

        {/* Join Lobby Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mb-4 text-yellow-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">Join Room</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Enter the 6-character room code from your squad.
            </p>

            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. SPOT99"
                maxLength={8}
                disabled={loading}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-center font-mono font-black text-base tracking-widest focus:outline-none focus:border-yellow-400 transition-colors uppercase disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={loading || !joinCode.trim()}
                className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'JOINING...' : 'ENTER LOBBY →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
