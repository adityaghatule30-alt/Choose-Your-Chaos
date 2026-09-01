'use client'

import { useEffect, useState, use, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Room } from '@/types/rooms'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/Avatar'
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
  WifiOff,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

type RealtimeStatus = 'CONNECTING' | 'LIVE REALTIME' | 'RECONNECTING' | 'OFFLINE'

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
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('CONNECTING')

  const isMountedRef = useRef(true)
  const roomRef = useRef<Room | null>(null)
  const isInflightRef = useRef(false)
  roomRef.current = room

  const loadRoomState = useCallback(async (showLoading = false) => {
    if (isInflightRef.current) return
    isInflightRef.current = true

    if (showLoading && isMountedRef.current) {
      setLoading(true)
    }
    try {
      const res = await fetch(`/api/rooms/state?code=${roomCode}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      const data = await res.json()

      if (!isMountedRef.current) return

      if (data.room) {
        setRoom(data.room)
        setErrorMsg(null)

        // If room moved to playing or finished, automatically transition
        if (data.room.status === 'playing') {
          router.push(`/rooms/${roomCode}/game`)
        } else if (data.room.status === 'finished') {
          router.push(`/rooms/${roomCode}/results`)
        }
      } else {
        setErrorMsg('Room not found or no longer available.')
      }
    } catch {
      if (isMountedRef.current) {
        setErrorMsg('Connection error fetching lobby state.')
      }
    } finally {
      isInflightRef.current = false
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [roomCode, router])

  useEffect(() => {
    isMountedRef.current = true

    if (!user) {
      router.push(`/login?redirectTo=/rooms/${roomCode}`)
      return
    }

    // 1. Initial Authoritative Fetch
    loadRoomState(true)

    // 2. Setup Supabase Realtime Channel
    const supabase = createClient()
    setRealtimeStatus('CONNECTING')

    const channel = supabase
      .channel(`room_lobby_${roomCode}`)
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
        (payload: any) => {
          const currentRoomId = roomRef.current?.id
          if (!currentRoomId || payload.new?.room_id === currentRoomId || payload.old?.room_id === currentRoomId) {
            loadRoomState()
          }
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('LIVE REALTIME')
          loadRoomState()
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('RECONNECTING')
        } else if (status === 'CLOSED') {
          setRealtimeStatus('OFFLINE')
        }
      })

    // 3. Fallback Resync Interval (every 4 seconds) to guarantee consistency in unstable networks
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadRoomState()
      }
    }, 4000)

    // 4. Handle Window Focus & Network Reconnect
    const handleVisibilityOrOnline = () => {
      if (document.visibilityState === 'visible') {
        loadRoomState()
      }
    }
    window.addEventListener('visibilitychange', handleVisibilityOrOnline)
    window.addEventListener('online', handleVisibilityOrOnline)

    return () => {
      isMountedRef.current = false
      clearInterval(pollInterval)
      window.removeEventListener('visibilitychange', handleVisibilityOrOnline)
      window.removeEventListener('online', handleVisibilityOrOnline)
      supabase.removeChannel(channel)
    }
  }, [user, roomCode, router, loadRoomState])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareInvite = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Join my Choose Your Chaos Match!`,
          text: `Join room ${roomCode} in Choose Your Chaos! 🔥`,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      handleCopyCode()
    }
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
      setErrorMsg('Failed to start game. Please try again.')
    } finally {
      if (isMountedRef.current) {
        setStarting(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3">
        <Flame className="w-12 h-12 text-yellow-400 animate-bounce" />
        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
          Entering Chaos Lobby...
        </span>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-pop-in">
        <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl">
          💀
        </div>
        <h2 className="text-2xl font-black text-white">Room Not Found</h2>
        <p className="text-neutral-400 text-xs mt-2 mb-6 leading-relaxed">
          This room code might have expired, the match concluded, or does not exist.
        </p>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-600/25 transition-all hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Rooms Hub
        </Link>
      </div>
    )
  }

  const isHost = room.is_host
  const members = room.members || []
  const memberCount = members.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-pop-in">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Lobby
        </Link>

        {/* Realtime Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full border text-[11px] font-black flex items-center gap-1.5 transition-all ${
              realtimeStatus === 'LIVE REALTIME'
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400 shadow-sm'
                : realtimeStatus === 'CONNECTING'
                ? 'bg-yellow-950/60 border-yellow-800/80 text-yellow-400 animate-pulse'
                : 'bg-red-950/60 border-red-800/80 text-red-400'
            }`}
          >
            {realtimeStatus === 'LIVE REALTIME' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE REALTIME</span>
              </>
            ) : realtimeStatus === 'CONNECTING' ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>CONNECTING</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>{realtimeStatus}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 via-pink-500/10 to-transparent rounded-full blur-3xl -z-10" />

        {/* Match Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-full text-purple-400 text-xs font-black uppercase tracking-widest mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" /> {room.total_rounds} ROUNDS MATCH
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1 mb-6">
            {room.name}
          </h1>

          {/* Room Code Badge */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-3xl p-3 sm:px-6 shadow-inner max-w-full">
            <div className="text-center sm:text-left">
              <div className="text-[10px] uppercase font-black text-neutral-500 tracking-wider">
                ROOM CODE
              </div>
              <div className="font-mono font-black text-3xl sm:text-4xl text-yellow-400 tracking-widest leading-none mt-0.5">
                {roomCode}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-4">
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 rounded-2xl text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95"
                title="Copy Room Code"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPY</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShareInvite}
                className="p-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 rounded-2xl text-neutral-200 hover:text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                title="Share Invite"
              >
                <Share2 className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Players in Lobby Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-black text-neutral-400 uppercase tracking-wider mb-4 px-1">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              PLAYERS IN LOBBY ({memberCount}/10)
            </span>
            <span className="text-[11px] font-bold text-neutral-500">
              {10 - memberCount} SLOTS OPEN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.map((m) => {
              const isUserHost = m.is_host
              const isCurrentUser = user && m.user_id === user.id

              return (
                <div
                  key={m.id || m.user_id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 animate-slide-up shadow-md ${
                    isCurrentUser
                      ? 'bg-purple-950/30 border-purple-500/50 ring-1 ring-purple-500/20'
                      : 'bg-neutral-950/70 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={m.avatar_url}
                      fallback={m.display_name || 'Agent'}
                      size="sm"
                      glow={isUserHost}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white truncate max-w-[140px] sm:max-w-[160px] flex items-center gap-1.5">
                        <span>{m.display_name}</span>
                        {isCurrentUser && (
                          <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-950/80 px-1.5 py-0.2 rounded border border-purple-800">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-bold">
                        {isUserHost ? 'Lobby Creator' : 'Chaos Agent'}
                      </div>
                    </div>
                  </div>

                  {isUserHost && (
                    <span className="px-2.5 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-black rounded-full flex items-center gap-1 shrink-0 shadow-sm">
                      <Crown className="w-3 h-3 fill-current" /> HOST
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Controls */}
        {isHost ? (
          <div className="space-y-3">
                  <button
                    onClick={handleStartGame}
                    disabled={starting || memberCount < 2}
                    className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:opacity-95 text-neutral-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-yellow-500/20 transition-all duration-200 active-press disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {starting
                      ? 'SUMMONING ROUND 1...'
                      : memberCount < 2
                      ? 'WAITING FOR 1 MORE PLAYER...'
                      : 'START CHAOS MATCH 🔥'}
                  </button>
            {memberCount < 2 && (
              <p className="text-[11px] text-neutral-500 text-center font-bold">
                Share your room code <span className="text-yellow-400 font-mono font-black">{roomCode}</span> to invite a friend.
              </p>
            )}
          </div>
        ) : (
          <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 text-center space-y-1">
            <div className="text-sm font-black text-purple-400 animate-pulse flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 text-yellow-400" />
              WAITING FOR HOST TO START... 💀
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Match will launch automatically the instant the host clicks start.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}