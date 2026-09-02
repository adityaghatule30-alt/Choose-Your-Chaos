'use client'

import { useEffect, useState, use, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Room } from '@/types/rooms'
import { GAME_DEFINITIONS } from '@/lib/games/definitions'
import { createClient } from '@/lib/supabase/client'
import { PlayerCard } from '@/components/social/PlayerCard'
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Users,
  Send,
} from 'lucide-react'

type RealtimeStatus = 'CONNECTING' | 'LIVE REALTIME' | 'RECONNECTING' | 'OFFLINE'

export default function RoomGameplayPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params)
  const roomCode = resolvedParams.code.toUpperCase()

  const { user } = useAuth()
  const router = useRouter()

  const [room, setRoom] = useState<Room | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('CONNECTING')
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null)

  const isMountedRef = useRef(true)
  const isInflightRef = useRef(false)

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
        setSelectedChoice(data.room.user_answer || null)
        setSelectedVote(data.room.user_vote || null)

        // Handle synchronized countdown calculation from server reveal_at timestamp
        const round = data.room.current_round_data
        if (round?.status === 'active' && round?.reveal_at) {
          const diffMs = new Date(round.reveal_at).getTime() - new Date().getTime()
          const secondsLeft = Math.max(0, Math.ceil(diffMs / 1000))
          setCountdownSeconds(secondsLeft)
        } else {
          setCountdownSeconds(null)
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
      isInflightRef.current = false
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [roomCode, router])

  // Live countdown timer ticking effect
  useEffect(() => {
    if (countdownSeconds === null || countdownSeconds <= 0) return

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          loadRoomState()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdownSeconds, loadRoomState])

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_votes' }, () => {
        loadRoomState()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_members' }, () => {
        loadRoomState()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_round_scores' }, () => {
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

    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadRoomState()
      }
    }, 3000)

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

  // Submit text or choice answer
  const handleSubmitAnswer = async (answerVal: string) => {
    if (!room?.current_round_data || submitting || selectedChoice) return
    if (!answerVal.trim()) return

    setSelectedChoice(answerVal)
    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/rooms/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          round_id: room.current_round_data.id,
          answer: answerVal.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setTextInput('')
        loadRoomState()
      } else {
        setErrorMsg(data.message || 'Failed to record answer.')
        setSelectedChoice(null)
      }
    } catch {
      setErrorMsg('Network error submitting answer.')
      setSelectedChoice(null)
    } finally {
      if (isMountedRef.current) setSubmitting(false)
    }
  }

  // Advance to next round (Host only)
  const handleNextRound = async () => {
    if (!room || advancing || !room.is_host) return
    setAdvancing(true)
    setSelectedChoice(null)
    setSelectedVote(null)
    setTextInput('')
    setCountdownSeconds(null)
    setErrorMsg(null)

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
          loadRoomState()
        }
      } else {
        setErrorMsg(data.message || 'Failed to advance to next round.')
      }
    } catch {
      setErrorMsg('Network error advancing round.')
    } finally {
      if (isMountedRef.current) setAdvancing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3">
        <Flame className="w-12 h-12 text-yellow-400 animate-bounce" />
        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
          Summoning Chaos Match...
        </span>
      </div>
    )
  }

  if (!room || !room.current_round_data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-pop-in">
        <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl">
          💀
        </div>
        <h2 className="text-2xl font-black text-white">Round Not Found</h2>
        <p className="text-neutral-400 text-xs mt-2 mb-6">
          This match might have ended or is waiting for players in the lobby.
        </p>
        <Link
          href={`/rooms/${roomCode}`}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-yellow-500/20 transition-all hover:scale-105"
        >
          Return to Room Lobby
        </Link>
      </div>
    )
  }

  const isHost = room.is_host
  const currentRound = room.current_round_data
  const isRevealed = currentRound.status === 'revealing' || currentRound.status === 'completed'
  const members = room.members || []
  const totalMembers = members.length
  const answersCount = currentRound.answers_count || 0
  const allAnswered = answersCount >= totalMembers
  const isCountingDown = !isRevealed && (currentRound.reveal_at !== undefined && currentRound.reveal_at !== null)
  const gameMode = room.game_mode || 'either_or'
  const gameDef = GAME_DEFINITIONS[gameMode] || GAME_DEFINITIONS.either_or
  const isTarget = currentRound.target_user_id === user?.id
  const promptData = currentRound.prompt_data || {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 animate-pop-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-white font-black text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            {gameDef.title} • ROUND {room.current_round}/{room.total_rounds}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full border text-[11px] font-black flex items-center gap-1.5 transition-all ${
              realtimeStatus === 'LIVE REALTIME'
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400'
                : 'bg-yellow-950/60 border-yellow-800/80 text-yellow-400'
            }`}
          >
            {realtimeStatus === 'LIVE REALTIME' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SYNCED</span>
              </>
            ) : (
              <span>{realtimeStatus}</span>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Game Screen */}
      <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        {/* 1. Pick For Me Mode */}
        {gameMode === 'pick_for_me' && (
          <div className="text-center mb-6">
            <span className="text-[10px] font-black uppercase text-pink-400 tracking-widest block mb-1">
              {isTarget ? '🔮 YOU ARE THE TARGET' : `🎯 YOU ARE PREDICTING: ${currentRound.target_user_name}`}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {isTarget
                ? 'Choose what YOU would honestly pick:'
                : `Choose what ${currentRound.target_user_name} will pick:`}
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-bold">
              "{currentRound.question?.question || 'Would you rather...'}"
            </p>
          </div>
        )}

        {/* 2. Either / Or Mode */}
        {gameMode === 'either_or' && (
          <div className="text-center mb-6">
            <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest block mb-1">
              WOULD YOU RATHER...
            </span>
            <h1 className="text-xl sm:text-3xl font-black text-white leading-snug">
              "{currentRound.question?.question}"
            </h1>
          </div>
        )}

        {/* 3. Mind Reader Mode */}
        {gameMode === 'mind_reader' && (
          <div className="text-center mb-6">
            <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest block mb-1">
              {isTarget ? '🎯 YOU ARE THE SPOTLIGHT TARGET' : `🧠 TARGET: ${currentRound.target_user_name}`}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {isTarget
                ? `Choose what YOU would do:`
                : `What will ${currentRound.target_user_name} choose?`}
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-bold">
              "{currentRound.question?.question || 'Would you rather...'}"
            </p>
          </div>
        )}

        {/* 4. Two Truths, One Chaos Mode */}
        {gameMode === 'two_truths' && (
          <div className="text-center mb-6">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block mb-1">
              🃏 TWO TRUTHS, ONE CHAOS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
              "{promptData.situation || 'Spot the fake statement among the truths'}"
            </h1>
          </div>
        )}

        {/* Binary Choices (Either/Or, Pick For Me, Mind Reader) */}
        {(gameMode === 'either_or' || gameMode === 'pick_for_me' || gameMode === 'mind_reader') && currentRound.question && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleSubmitAnswer('A')}
              disabled={submitting || Boolean(selectedChoice)}
              className={`p-6 rounded-3xl border text-left font-bold transition-all duration-200 active-press relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-xl ${
                selectedChoice === 'A'
                  ? 'bg-yellow-400 text-neutral-950 border-yellow-300 ring-4 ring-yellow-400/30 scale-[1.02]'
                  : 'bg-neutral-950 hover:bg-neutral-850 text-white border-neutral-800 hover:border-yellow-400/60 cursor-pointer'
              }`}
            >
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                  selectedChoice === 'A' ? 'text-neutral-950' : 'text-yellow-400'
                }`}>
                  OPTION A
                </span>
                <span className="text-base sm:text-lg font-bold leading-snug">
                  {currentRound.question.option_a}
                </span>
              </div>
            </button>

            <button
              onClick={() => handleSubmitAnswer('B')}
              disabled={submitting || Boolean(selectedChoice)}
              className={`p-6 rounded-3xl border text-left font-bold transition-all duration-200 active-press relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-xl ${
                selectedChoice === 'B'
                  ? 'bg-red-500 text-white border-red-400 ring-4 ring-red-500/30 scale-[1.02]'
                  : 'bg-neutral-950 hover:bg-neutral-850 text-white border-neutral-800 hover:border-red-400/60 cursor-pointer'
              }`}
            >
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                  selectedChoice === 'B' ? 'text-white' : 'text-red-400'
                }`}>
                  OPTION B
                </span>
                <span className="text-base sm:text-lg font-bold leading-snug">
                  {currentRound.question.option_b}
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Text / Statements Input for Two Truths */}
        {gameMode === 'two_truths' && !selectedChoice && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmitAnswer(textInput)
            }}
            className="mb-6 space-y-3"
          >
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type which statement is the lie..."
              disabled={submitting}
              maxLength={200}
              rows={3}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={submitting || !textInput.trim()}
              className="w-full py-3.5 px-6 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all active-press disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/20"
            >
              <Send className="w-4 h-4" /> LOCK IN MY ANSWER 🔥
            </button>
          </form>
        )}

        {/* Synchronized Automatic Countdown Banner */}
        {isCountingDown && (
          <div className="p-6 bg-gradient-to-r from-purple-950/80 via-neutral-900 to-pink-950/80 border border-purple-500/50 rounded-3xl mb-6 text-center shadow-2xl animate-pop-in">
            <span className="text-xs font-black uppercase tracking-widest text-purple-400 block mb-1">
              REVEALING IN
            </span>
            <div className="text-5xl font-black text-white tracking-tight my-2 animate-bounce">
              {countdownSeconds ?? 5}
            </div>
            <p className="text-xs text-neutral-300 font-bold">
              Squad answers incoming 👀
            </p>
          </div>
        )}

        {/* Locked State when waiting for others */}
        {selectedChoice && !isRevealed && !isCountingDown && (
          <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl mb-6 text-center animate-fade-in">
            <span className="text-xs font-black text-yellow-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> YOUR ANSWER IS LOCKED IN
            </span>
            <p className="text-[11px] text-neutral-400 mt-1">
              Waiting for other players... ({answersCount}/{totalMembers} answered)
            </p>
          </div>
        )}

        {/* Revealed Results Grid */}
        {isRevealed && currentRound.answers && currentRound.answers.length > 0 && (
          <div className="space-y-3 mb-6 animate-pop-in">
            {/* Pick For Me Reveal Banner */}
            {gameMode === 'pick_for_me' && (
              <div className="text-center p-3.5 bg-pink-950/40 border border-pink-800/80 rounded-2xl mb-3">
                {(() => {
                  const targetAns = currentRound.answers.find((a) => a.user_id === currentRound.target_user_id)?.answer
                  const predictorAns = currentRound.answers.find((a) => a.user_id !== currentRound.target_user_id)?.answer
                  const isMatch = targetAns && predictorAns && targetAns === predictorAns

                  return isMatch ? (
                    <div className="text-emerald-400 font-black text-sm sm:text-base flex items-center justify-center gap-2">
                      <span>🎯 PREDICTION CORRECT!</span>
                      <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-xs border border-emerald-800">+20 PTS 🔥</span>
                    </div>
                  ) : (
                    <div className="text-red-400 font-black text-sm flex items-center justify-center gap-2">
                      <span>❌ PREDICTION MISSED!</span>
                      <span className="text-neutral-400 text-xs font-semibold">(0 PTS)</span>
                    </div>
                  )
                })()}
              </div>
            )}

            <span className="text-[11px] font-black uppercase text-neutral-400 tracking-wider block mb-2 text-center">
              🎉 SQUAD ANSWERS & REVEAL
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentRound.answers.map((ans, idx) => {
                const optText = ans.answer === 'A'
                  ? currentRound.question?.option_a
                  : ans.answer === 'B'
                  ? currentRound.question?.option_b
                  : ans.answer

                return (
                  <div
                    key={idx}
                    className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] text-purple-400 font-bold uppercase block">
                        {ans.display_name}
                      </span>
                      <span className="text-sm font-black text-white">
                        {ans.answer === 'A' || ans.answer === 'B' ? `Option ${ans.answer}: ${optText}` : ans.answer}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Host Next Round Controls */}
        {isHost && isRevealed && (
          <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
            <div className="text-xs text-neutral-400 font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Round complete</span>
            </div>

            <button
              onClick={handleNextRound}
              disabled={advancing}
              className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all active-press flex items-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/20"
            >
              <span>{room.current_round >= room.total_rounds ? 'VIEW RESULTS 🏆' : 'NEXT ROUND ➔'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Compact Player Scoreboard — outside main card */}
      {members.length > 0 && (
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
              SQUAD SCORES
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {members.map((m) => (
              <PlayerCard
                key={m.id || m.user_id}
                member={m}
                isCurrentUser={user?.id === m.user_id}
                variant="game"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}