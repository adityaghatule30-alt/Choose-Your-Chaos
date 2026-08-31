'use client'

import { useEffect, useState, use, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Room } from '@/types/rooms'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/Avatar'
import {
  Flame,
  Crown,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Users,
  Eye,
  WifiOff,
  RefreshCw,
} from 'lucide-react'

type RealtimeStatus = 'CONNECTING' | 'LIVE REALTIME' | 'RECONNECTING' | 'OFFLINE'

export default function RoomGameplayPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params)
  const roomCode = resolvedParams.code.toUpperCase()

  const { user } = useAuth()
  const router = useRouter()

  const [room, setRoom] = useState<Room | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null)
  const [answering, setAnswering] = useState(false)
  const [revealing, setRevealing] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('CONNECTING')

  const isMountedRef = useRef(true)

  const loadRoomState = useCallback(async (showLoading = false) => {
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
        if (data.room.user_answer) {
          setSelectedChoice(data.room.user_answer)
        }
        if (data.room.status === 'finished') {
          router.push(`/rooms/${roomCode}/results`)
        }
      } else {
        setErrorMsg('Room not found.')
      }
    } catch {
      if (isMountedRef.current) {
        setErrorMsg('Failed to load live game state.')
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [roomCode, router])

  useEffect(() => {
    isMountedRef.current = true

    if (!user) {
      router.push(`/login?redirectTo=/rooms/${roomCode}/game`)
      return
    }

    loadRoomState(true)

    const supabase = createClient()
    setRealtimeStatus('CONNECTING')

    const channel = supabase
      .channel(`room_game_${roomCode}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_rounds' }, () => {
        loadRoomState()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_answers' }, () => {
        loadRoomState()
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}` },
        (payload: any) => {
          if (payload.new?.status === 'finished') {
            router.push(`/rooms/${roomCode}/results`)
          } else {
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

    // Resync every 4s for network resilience
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadRoomState()
      }
    }, 4000)

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        loadRoomState()
      }
    }
    window.addEventListener('visibilitychange', handleFocus)
    window.addEventListener('online', handleFocus)

    return () => {
      isMountedRef.current = false
      clearInterval(pollInterval)
      window.removeEventListener('visibilitychange', handleFocus)
      window.removeEventListener('online', handleFocus)
      supabase.removeChannel(channel)
    }
  }, [user, roomCode, router, loadRoomState])

  // Handle player choice submission
  const handleSelectChoice = async (choice: 'A' | 'B') => {
    if (!room?.current_round_data || answering || selectedChoice) return

    setSelectedChoice(choice)
    setAnswering(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/rooms/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          round_id: room.current_round_data.id,
          answer: choice,
        }),
      })

      const data = await res.json()
      if (!data.success) {
        setErrorMsg(data.message || 'Failed to submit answer.')
        setSelectedChoice(null)
      } else {
        loadRoomState()
      }
    } catch {
      setErrorMsg('Network error locking in answer.')
      setSelectedChoice(null)
    } finally {
      if (isMountedRef.current) {
        setAnswering(false)
      }
    }
  }

  // Host action to reveal votes
  const handleRevealRound = async () => {
    if (!room?.current_round_data || revealing || !room.is_host) return
    setRevealing(true)

    try {
      const res = await fetch('/api/rooms/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round_id: room.current_round_data.id }),
      })
      const data = await res.json()
      if (data.success) {
        loadRoomState()
      }
    } catch {} finally {
      if (isMountedRef.current) {
        setRevealing(false)
      }
    }
  }

  // Host action to advance to next round
  const handleAdvanceRound = async () => {
    if (!room || advancing || !room.is_host) return
    setAdvancing(true)

    try {
      const res = await fetch('/api/rooms/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: room.id }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.finished) {
          router.push(`/rooms/${roomCode}/results`)
        } else {
          setSelectedChoice(null)
          loadRoomState()
        }
      }
    } catch {} finally {
      if (isMountedRef.current) {
        setAdvancing(false)
      }
    }
  }

  if (loading || !room?.current_round_data) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3">
        <Flame className="w-12 h-12 text-yellow-400 animate-bounce" />
        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
          Loading Round Arena...
        </span>
      </div>
    )
  }

  const round = room.current_round_data
  const isRevealed = round.status === 'revealing' || round.status === 'completed'
  const isHost = room.is_host
  const totalMembers = room.members?.length || 0
  const answersCount = round.answers_count || 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-pop-in">
      {/* Top Game Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-3xl px-5 py-3 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black bg-yellow-400 text-neutral-950 px-3 py-1 rounded-xl shadow-sm">
            ROUND {round.round_number} / {room.total_rounds}
          </span>
          <span className="text-xs font-black text-white truncate max-w-[140px] sm:max-w-[200px]">
            {room.name}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-neutral-400">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-950 rounded-full border border-neutral-800">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-white font-black">{answersCount}</span>
            <span>/ {totalMembers} Answered</span>
          </div>

          <div
            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black flex items-center gap-1 ${
              realtimeStatus === 'LIVE REALTIME'
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400'
                : 'bg-yellow-950/60 border-yellow-800/80 text-yellow-400'
            }`}
          >
            {realtimeStatus === 'LIVE REALTIME' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE</span>
              </>
            ) : (
              <span>SYNC</span>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black rounded-full uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" /> CHOOSE YOUR SIDE
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-white leading-relaxed">
          "{round.question?.question}"
        </h2>
      </div>

      {/* Choices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* OPTION A */}
        <button
          onClick={() => handleSelectChoice('A')}
          disabled={answering || Boolean(selectedChoice) || isRevealed}
          className={`p-6 sm:p-8 rounded-3xl border text-left font-bold transition-all transform active:scale-98 relative overflow-hidden flex flex-col justify-between min-h-[170px] ${
            selectedChoice === 'A'
              ? 'bg-yellow-400 text-neutral-950 border-yellow-300 ring-4 ring-yellow-400/30 scale-[1.02] shadow-xl'
              : isRevealed
              ? 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
              : 'bg-neutral-900 hover:bg-neutral-850 text-white border-neutral-800 hover:border-yellow-400/60 cursor-pointer shadow-lg hover:scale-[1.01]'
          }`}
        >
          <div>
            <div
              className={`text-xs font-black uppercase tracking-wider mb-2 flex justify-between ${
                selectedChoice === 'A' ? 'text-neutral-950' : 'text-yellow-400'
              }`}
            >
              <span>OPTION A</span>
              {selectedChoice === 'A' && (
                <span className="text-[10px] font-black bg-neutral-950 text-yellow-400 px-2 py-0.5 rounded-full">
                  LOCKED IN
                </span>
              )}
            </div>
            <div className="text-base sm:text-lg font-bold leading-snug">
              {round.question?.option_a}
            </div>
          </div>

          {/* Reveal stats */}
          {isRevealed && round.stats && (
            <div className="mt-4 pt-3 border-t border-neutral-800/60">
              <div className="flex justify-between items-center text-xs font-black mb-1">
                <span>{round.stats.percent_a}% CHOSE A</span>
                <span className="text-[10px] opacity-70">({round.stats.count_a} votes)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                  style={{ width: `${round.stats.percent_a}%` }}
                />
              </div>
            </div>
          )}
        </button>

        {/* OPTION B */}
        <button
          onClick={() => handleSelectChoice('B')}
          disabled={answering || Boolean(selectedChoice) || isRevealed}
          className={`p-6 sm:p-8 rounded-3xl border text-left font-bold transition-all transform active:scale-98 relative overflow-hidden flex flex-col justify-between min-h-[170px] ${
            selectedChoice === 'B'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400 ring-4 ring-pink-500/30 scale-[1.02] shadow-xl'
              : isRevealed
              ? 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
              : 'bg-neutral-900 hover:bg-neutral-850 text-white border-neutral-800 hover:border-pink-400/60 cursor-pointer shadow-lg hover:scale-[1.01]'
          }`}
        >
          <div>
            <div
              className={`text-xs font-black uppercase tracking-wider mb-2 flex justify-between ${
                selectedChoice === 'B' ? 'text-white' : 'text-pink-400'
              }`}
            >
              <span>OPTION B</span>
              {selectedChoice === 'B' && (
                <span className="text-[10px] font-black bg-neutral-950 text-pink-400 px-2 py-0.5 rounded-full">
                  LOCKED IN
                </span>
              )}
            </div>
            <div className="text-base sm:text-lg font-bold leading-snug">
              {round.question?.option_b}
            </div>
          </div>

          {/* Reveal stats */}
          {isRevealed && round.stats && (
            <div className="mt-4 pt-3 border-t border-neutral-800/60">
              <div className="flex justify-between items-center text-xs font-black mb-1">
                <span>{round.stats.percent_b}% CHOSE B</span>
                <span className="text-[10px] opacity-70">({round.stats.count_b} votes)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all duration-700"
                  style={{ width: `${round.stats.percent_b}%` }}
                />
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Players Selection Breakdown after Reveal */}
      {isRevealed && round.answers && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl mb-6 animate-pop-in">
          <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-4 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-yellow-400" /> SQUAD VOTES REVEALED
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {round.answers.map((ans, idx) => (
              <div
                key={idx}
                className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between"
              >
                <span className="text-xs font-bold text-white truncate max-w-[100px]">
                  {ans.display_name}
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                    ans.answer === 'A'
                      ? 'bg-yellow-400 text-neutral-950'
                      : 'bg-pink-600 text-white'
                  }`}
                >
                  {ans.answer}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Host Controls & Readiness Indicators */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {!selectedChoice ? (
            <div className="text-xs font-bold text-yellow-400 animate-pulse">
              Lock in your choice above! ⚡
            </div>
          ) : !isRevealed ? (
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Your vote is locked. Waiting for other players...
            </div>
          ) : (
            <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Round complete! Points & XP distributed.
            </div>
          )}
        </div>

        {isHost && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isRevealed ? (
              <button
                onClick={handleRevealRound}
                disabled={revealing}
                className="w-full sm:w-auto px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-yellow-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {revealing ? 'REVEALING...' : 'REVEAL VOTES 👁️'}
              </button>
            ) : (
              <button
                onClick={handleAdvanceRound}
                disabled={advancing}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>
                  {round.round_number === room.total_rounds ? 'SEE FINAL RESULTS 🏆' : 'NEXT ROUND →'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}