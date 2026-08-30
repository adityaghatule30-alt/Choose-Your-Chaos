'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Room } from '@/types/rooms'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Copy,
  Check,
  Play,
  Share2,
  Crown,
  Flame,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react'

export default function RoomLobbyPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params)
  const roomCode = resolvedParams.code.toUpperCase()

  const { user } = useAuth()
  const router = useRouter()

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadRoomState = async () => {
    try {
      const res = await fetch(`/api/rooms/state?code=${roomCode}`)
      const data = await res.json()

      if (data.room) {
        setRoom(data.room)
        // If room has already moved to playing, route to game screen
        if (data.room.status === 'playing') {
          router.push(`/rooms/${roomCode}/game`)
        } else if (data.room.status === 'finished') {
          router.push(`/rooms/${roomCode}/results`)
        }
      } else {
        throw new Error('Room not found.')
      }
    } catch {
      setErrorMsg('Room not found or no longer available.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirectTo=/rooms/${roomCode}`)
      return
    }

    loadRoomState()

    // Setup Supabase Realtime Subscription for room members and room state changes
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}` },
        (payload: any) => {
          if (payload.new?.status === 'playing') {
            router.push(`/rooms/${roomCode}/game`)
          } else if (payload.new?.status === 'finished') {
            router.push(`/rooms/${roomCode}/results`)
          } else {
            loadRoomState()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_members' },
        () => {
          loadRoomState()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, roomCode, router])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartGame = async () => {
    if (!room || starting || !room.is_host) return
    setStarting(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/rooms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: room.id }),
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/rooms/${roomCode}/game`)
      } else {
        setErrorMsg(data.message || 'You need at least one other chaos agent. 💀')
      }
    } catch {
      setErrorMsg('Failed to start game.')
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Flame className="w-10 h-10 text-purple-400 animate-bounce" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-white">Room Not Found 💀</h2>
        <p className="text-neutral-400 text-xs mt-2 mb-6">
          This room code might have expired or does not exist.
        </p>
        <Link href="/rooms" className="px-6 py-3 bg-purple-600 text-white font-bold text-xs rounded-xl">
          Back to Rooms
        </Link>
      </div>
    )
  }

  const isHost = room.is_host
  const memberCount = room.members?.length || 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/rooms"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Exit Lobby
      </Link>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        {/* Room Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
            {room.total_rounds} ROUNDS MATCH
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-4">
            {room.name}
          </h1>

          {/* Room Code Badge */}
          <div className="inline-flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-2xl p-2 px-4 shadow-inner">
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Room Code</div>
              <div className="font-mono font-black text-2xl text-yellow-400 tracking-widest leading-none">
                {roomCode}
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="p-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 rounded-xl text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Copy Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Players List */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
            <span>Players in Lobby ({memberCount}/10)</span>
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Realtime
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {room.members?.map((m) => (
              <div
                key={m.id}
                className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                    {m.display_name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-white truncate max-w-[140px]">
                    {m.display_name}
                  </span>
                </div>

                {m.is_host && (
                  <span className="px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-black rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" /> HOST
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Host Start or Waiting message */}
        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={starting || memberCount < 2}
            className="w-full py-4 px-6 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-yellow-500/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            {starting
              ? 'SUMMONING ROUND 1...'
              : memberCount < 2
              ? 'WAITING FOR 1 MORE PLAYER...'
              : 'START CHAOS 🚀'}
          </button>
        ) : (
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-center">
            <div className="text-sm font-black text-purple-400 animate-pulse">
              WAITING FOR HOST TO START... 💀
            </div>
            <p className="text-xs text-neutral-500 mt-1">Get ready to choose your side</p>
          </div>
        )}
      </div>
    </div>
  )
}
