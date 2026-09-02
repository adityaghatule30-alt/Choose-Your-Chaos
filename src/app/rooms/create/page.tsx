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
  UserCheck,
  HelpCircle,
  Check,
  Image as ImageIcon,
  Flame,
} from 'lucide-react'

const ICONS_MAP: Record<string, any> = {
  UserCheck,
  Play,
  Sparkles,
  HelpCircle,
  Image: ImageIcon,
  Flame,
}

export default function CreateRoomPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [name, setName] = useState('')
  const [selectedGame, setSelectedGame] = useState<GameMode>('either_or')
  const [rounds, setRounds] = useState(5)
  const [creating, setCreating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const availableGameModes = Object.values(GAME_DEFINITIONS)
  const totalModesCount = availableGameModes.length

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
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-pop-in">
      <Link
        href="/rooms"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white mb-3 sm:mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Rooms Hub
      </Link>

      <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-4 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 via-pink-500/10 to-transparent rounded-full blur-3xl -z-10" />

        {/* Compact Header */}
        <div className="text-center mb-5">
          <div className="inline-flex p-2.5 bg-purple-950/60 border border-purple-800/80 rounded-2xl mb-2 shadow-inner">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">CREATE CHAOS MATCH</h1>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">Select a game mode and launch a private squad room</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs font-bold flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-5">
          {/* Game Mode Selector */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Select Game Mode
              </label>
              <span className="text-[10px] sm:text-[11px] font-bold text-neutral-500">
                {totalModesCount} MODES AVAILABLE
              </span>
            </div>

            {/* Compact 2-column arcade grid on desktop / single column on mobile */}
            <div
              role="radiogroup"
              aria-label="Game modes"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {availableGameModes.map((g) => {
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
                    className={`group min-h-[48px] sm:min-h-[52px] py-2 px-3 rounded-2xl border text-left transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/30'
                        : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border shrink-0 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-purple-900/50 border-purple-500/50 text-purple-300'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 group-hover:text-neutral-200 group-hover:border-neutral-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate leading-tight group-hover:text-purple-300 transition-colors">
                          {cleanTitle}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-medium leading-none mt-0.5 truncate">
                          {g.shortDescription}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'border border-neutral-750 group-hover:border-neutral-600'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Room Configuration Section with compact inputs */}
          <div className="pt-4 border-t border-neutral-800/80 space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5 px-1">
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
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 sm:py-3 text-white text-xs sm:text-sm placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5 px-1">
                Number of Rounds
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {[3, 5, 10].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRounds(r)}
                    className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider border transition-all active-press cursor-pointer ${
                      rounds === r
                        ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/25'
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
            className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:opacity-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-600/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {creating ? 'GENERATING MATCH LOBBY...' : 'LAUNCH MATCH LOBBY 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}


