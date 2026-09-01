'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { GAME_DEFINITIONS, GameMode } from '@/lib/games/definitions'
import {
  Users,
  ArrowLeft,
  Play,
  Sparkles,
  Skull,
  ShieldAlert,
  UserCheck,
  Eye,
  Flame,
  HelpCircle,
  Camera,
  Check,
} from 'lucide-react'

const ICONS_MAP: Record<string, any> = {
  Play,
  Sparkles,
  Skull,
  ShieldAlert,
  UserCheck,
  Eye,
  Flame,
  HelpCircle,
  Camera,
}

export default function CreateRoomPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [name, setName] = useState('')
  const [selectedGame, setSelectedGame] = useState<GameMode>('either_or')
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
          name: name.trim() || `${GAME_DEFINITIONS[selectedGame].title.replace(/^[^\w\s'?/]+/g, '').trim()} Match`,
          game_mode: selectedGame,
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
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-pop-in">
      <Link
        href="/rooms"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Rooms Hub
      </Link>

      <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 via-pink-500/10 to-transparent rounded-full blur-3xl -z-10" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-purple-950/60 border border-purple-800 rounded-2xl mb-3 shadow-inner">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">CREATE CHAOS MATCH</h1>
          <p className="text-xs text-neutral-400 mt-1">Select a game mode and host a private match with your squad</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs font-bold flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-8">
          {/* Game Mode Selector */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Select Game Mode
              </label>
              <span className="text-[11px] font-bold text-neutral-500">
                {Object.keys(GAME_DEFINITIONS).length} MODES AVAILABLE
              </span>
            </div>

            {/* Natural responsive grid without internal scrollbar */}
            <div
              role="radiogroup"
              aria-label="Game modes"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {Object.values(GAME_DEFINITIONS).map((g) => {
                const Icon = ICONS_MAP[g.iconName] || Play
                const isSelected = selectedGame === g.id
                const cleanTitle = g.title.replace(/^[^\w\s'?/]+/g, '').trim()

                return (
                  <button
                    key={g.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedGame(g.id)}
                    className={`group p-3.5 rounded-2xl border text-left transition-all duration-200 active-press cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30'
                        : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950/90'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-purple-900/50 border-purple-500/50 text-purple-300'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 group-hover:text-neutral-200 group-hover:border-neutral-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate flex items-center gap-1.5 group-hover:text-purple-300 transition-colors">
                          {cleanTitle}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-medium leading-snug mt-0.5 truncate">
                          {g.shortDescription}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'border border-neutral-750 group-hover:border-neutral-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Room Configuration Section with clear separation */}
          <div className="pt-6 border-t border-neutral-800/80 space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-2 px-1">
                Room Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="The Unhinged Squad"
                disabled={creating}
                maxLength={40}
                aria-label="Room name"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3.5 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-2 px-1">
                Number of Rounds
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[3, 5, 10].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRounds(r)}
                    className={`py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all active-press cursor-pointer ${
                      rounds === r
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/25'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    {r} Rounds
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-600/25 transition-all active-press disabled:opacity-50 cursor-pointer"
          >
            {creating ? 'GENERATING MATCH LOBBY...' : 'LAUNCH MATCH LOBBY 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}

