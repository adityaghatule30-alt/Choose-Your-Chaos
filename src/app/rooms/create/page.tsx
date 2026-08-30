'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Users, Plus, ArrowLeft, Flame, Sparkles } from 'lucide-react'

export default function CreateRoomPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [name, setName] = useState('')
  const [rounds, setRounds] = useState(5)
  const [creating, setCreating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login?redirectTo=/rooms/create')
      return
    }

    setCreating(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Chaos Arena',
          total_rounds: rounds,
        }),
      })

      const data = await res.json()

      if (data.success && data.room?.code) {
        router.push(`/rooms/${data.room.code}`)
      } else {
        setErrorMsg(data.message || 'Failed to create room.')
      }
    } catch {
      setErrorMsg('Failed to create room. Try again.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-16">
      <Link
        href="/rooms"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Rooms Hub
      </Link>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-purple-950/60 border border-purple-800 rounded-2xl mb-3 shadow-inner">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">CREATE CHAOS ROOM</h1>
          <p className="text-xs text-neutral-400 mt-1">Host a private match with your squad</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Room Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="The Unhinged Squad"
              disabled={creating}
              maxLength={40}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
              Number of Rounds
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[3, 5, 10].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRounds(r)}
                  className={`py-3 rounded-xl font-black text-sm border transition-all cursor-pointer ${
                    rounds === r
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/25'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {r} Rounds
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-purple-600/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {creating ? 'GENERATING ROOM...' : 'CREATE ROOM LOBBY 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}
