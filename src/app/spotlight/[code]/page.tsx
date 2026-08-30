'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { SpotlightRoom, SpotlightQuestion, SpotlightMember } from '@/types/spotlight'
import { createClient } from '@/lib/supabase/client'
import {
  Flame,
  Users,
  Copy,
  Check,
  Play,
  ArrowLeft,
  Sparkles,
  Send,
  HelpCircle,
  Crown,
  AlertCircle,
  MessageSquare,
  Bot,
  RotateCw,
  FastForward,
} from 'lucide-react'

const SUGGESTED_QUESTIONS = [
  "Who in this room would you never date? ??",
  "What's your most embarrassing moment you've never told anyone?",
  "Who do you secretly think is the funniest in this group?",
  "What's something you've lied about to someone in this room?",
  "Who here would survive the longest in a zombie apocalypse? ??",
  "If you had to delete one contact from your phone forever, who is it?",
]

const EMOJI_REACTIONS = ['??', '??', '??', '??', '??']

export default function SpotlightRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params)
  const roomCode = resolvedParams.code.toUpperCase()

  const { user } = useAuth()
  const router = useRouter()

  const [room, setRoom] = useState<SpotlightRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [spunMember, setSpunMember] = useState<SpotlightMember | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [submittingQ, setSubmittingQ] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const loadRoomState = async () => {
    try {
      const res = await fetch(`/api/spotlight/state?code=${roomCode}`)
      const data = await res.json()

      if (data.success && data.room) {
        setRoom(data.room)
      } else {
        setErrorMsg(data.message || 'Room not found.')
      }
    } catch {
      setErrorMsg('Failed to load room.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirectTo=/spotlight/${roomCode}`)
      return
    }

    loadRoomState()

    const supabase = createClient()
    const channel = supabase
      .channel(`spotlight:${roomCode}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spotlight_rooms' },
        () => {
          loadRoomState()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spotlight_members' },
        () => {
          loadRoomState()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spotlight_questions' },
        () => {
          loadRoomState()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spotlight_reactions' },
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

  const handleSpinSpotlight = async () => {
    if (!room || !room.is_host) return
    setErrorMsg(null)
    setSpinning(true)

    // Dramatic client-side spin simulation
    let counter = 0
    const members = room.members || []
    const spinInterval = setInterval(() => {
      setSpunMember(members[counter % members.length])
      counter++
    }, 120)

    try {
      const res = await fetch('/api/spotlight/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: room.id }),
      })
      const data = await res.json()

      setTimeout(() => {
        clearInterval(spinInterval)
        setSpinning(false)
        if (data.success) {
          loadRoomState()
        } else {
          setErrorMsg(data.message || 'Failed to spin spotlight.')
        }
      }, 2000)
    } catch {
      clearInterval(spinInterval)
      setSpinning(false)
      setErrorMsg('Failed to spin spotlight.')
    }
  }

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!room || !questionText.trim() || submittingQ) return

    setSubmittingQ(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/spotlight/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: room.id, question: questionText.trim() }),
      })
      const data = await res.json()

      if (data.success) {
        setQuestionText('')
        loadRoomState()
      } else {
        setErrorMsg(data.message || 'Failed to submit question.')
      }
    } catch {
      setErrorMsg('Failed to ask question.')
    } finally {
      setSubmittingQ(false)
    }
  }

  const handleAnswerQuestion = async (questionId: string) => {
    if (!answerText.trim() || submittingAnswer) return

    setSubmittingAnswer(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/spotlight/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId, answer: answerText.trim() }),
      })
      const data = await res.json()

      if (data.success) {
        setAnswerText('')
        loadRoomState()
      } else {
        setErrorMsg(data.message || 'Failed to submit answer.')
      }
    } catch {
      setErrorMsg('Failed to submit answer.')
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const handleSkipQuestion = async (questionId: string) => {
    if (skipping || !room) return

    setSkipping(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/spotlight/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId, room_id: room.id }),
      })
      const data = await res.json()

      if (data.success) {
        loadRoomState()
      } else {
        setErrorMsg(data.message || 'Could not skip question.')
      }
    } catch {
      setErrorMsg('Failed to skip question.')
    } finally {
      setSkipping(false)
    }
  }

  const handleToggleReaction = async (questionId: string, reaction: string) => {
    try {
      const res = await fetch('/api/spotlight/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId, reaction }),
      })
      const data = await res.json()
      if (data.success) {
        loadRoomState()
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Flame className="w-10 h-10 text-orange-500 animate-bounce" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-white">Room Not Found ??</h2>
        <p className="text-neutral-400 text-xs mt-2 mb-6">
          This room code might have expired or does not exist.
        </p>
        <Link href="/spotlight" className="px-6 py-3 bg-orange-500 text-neutral-950 font-black text-xs rounded-xl">
          Back to Spotlight Hub
        </Link>
      </div>
    )
  }

  const isHost = room.is_host
  const isSpotlight = room.is_spotlight
  const spotlightUser = room.spotlight_user
  const memberCount = room.members?.length || 0
  const questions = room.questions || []

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/spotlight"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Room
        </Link>

        {/* Room Code Badge */}
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full px-3 py-1.5 shadow-md">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">ROOM:</span>
          <span className="font-mono font-black text-sm text-yellow-400 tracking-widest">{roomCode}</span>
          <button
            onClick={handleCopyCode}
            className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. LOBBY STATE */}
      {room.status === 'lobby' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center mb-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -z-10" />

          <div className="inline-flex p-3 bg-orange-950/60 border border-orange-800 rounded-2xl mb-3 shadow-inner">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            CHAOS SPOTLIGHT
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto mb-8">
            Someone is about to get interrogated. ?? Share the room code with your squad.
          </p>

          {/* Members List in Lobby */}
          <div className="mb-8 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
              <span>Players in Lobby ({memberCount})</span>
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center font-bold text-xs text-neutral-950">
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

          {/* Start Game CTA */}
          {isHost ? (
            <button
              onClick={handleSpinSpotlight}
              disabled={spinning || memberCount < 2}
              className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-400 text-neutral-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              {spinning
                ? 'SPINNING THE SPOTLIGHT...'
                : memberCount < 2
                ? 'NEED AT LEAST 2 PLAYERS TO START'
                : 'START CHAOS SPOTLIGHT ??'}
            </button>
          ) : (
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-center">
              <div className="text-sm font-black text-orange-400 animate-pulse">
                WAITING FOR HOST TO SPIN THE SPOTLIGHT... ??
              </div>
              <p className="text-xs text-neutral-500 mt-1">Get your spicy questions ready</p>
            </div>
          )}
        </div>
      )}

      {/* 2. DRAMATIC SPINNING / SELECTING STATE */}
      {spinning && (
        <div className="bg-neutral-900 border border-orange-500/50 rounded-3xl p-8 sm:p-14 shadow-2xl text-center mb-8 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4 animate-spin">
            <RotateCw className="w-8 h-8" />
          </div>
          <span className="text-xs font-black uppercase text-orange-400 tracking-widest block mb-2">
            SPINNING / SELECTING... ??
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {spunMember ? spunMember.display_name : 'CHOOSING NEXT TARGET...'}
          </h2>
        </div>
      )}

      {/* 3. ACTIVE SPOTLIGHT REVEAL & GAMEPLAY */}
      {room.status === 'questioning' && !spinning && (
        <div className="space-y-6">
          {/* Spotlight Hero Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl -z-10" />

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-950/80 border border-orange-800/80 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> THE SPOTLIGHT HAS LANDED ON
            </div>

            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-400 via-yellow-400 to-red-500 flex items-center justify-center font-black text-2xl text-neutral-950 mx-auto mb-3 shadow-xl ring-4 ring-orange-500/30 animate-bounce">
              {spotlightUser?.display_name?.[0]?.toUpperCase() || 'S'}
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white mb-1">
              {spotlightUser?.display_name || 'Agent'}
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              {isSpotlight
                ? "?? YOU'RE IN THE SPOTLIGHT! Answer incoming questions or use your skips wisely."
                : `You've been chosen. Everyone else... ASK AWAY. ??`}
            </p>

            {/* Skips Indicator */}
            <div className="inline-flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-full px-4 py-1.5 text-xs font-bold text-neutral-300 shadow-inner">
              <FastForward className="w-3.5 h-3.5 text-yellow-400" />
              <span>SKIPS REMAINING:</span>
              <span className="font-black text-yellow-400">{room.skips_remaining || 0} / 2</span>
            </div>

            {/* Host Next Player Trigger */}
            {isHost && (
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <button
                  onClick={handleSpinSpotlight}
                  disabled={spinning}
                  className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCw className="w-3.5 h-3.5 text-orange-400" /> NEXT SPOTLIGHT PLAYER
                </button>
              </div>
            )}
          </div>

          {/* 4. ASKING VIEW (For everyone EXCEPT spotlight user) */}
          {!isSpotlight && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-base font-black text-white mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-orange-400" />
                ASK {spotlightUser?.display_name?.toUpperCase() || 'THEM'} ANYTHING ??
              </h3>

              <form onSubmit={handleAskQuestion} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Type your spicy interrogation question..."
                    maxLength={300}
                    disabled={submittingQ}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-orange-400 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={submittingQ || !questionText.trim()}
                    className="px-6 py-3.5 bg-orange-500 hover:bg-orange-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-lg shadow-orange-500/20"
                  >
                    <Send className="w-4 h-4" /> {submittingQ ? 'SENDING...' : 'ASK ??'}
                  </button>
                </div>

                {/* Suggested Prompts */}
                <div>
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                    Or choose a chaos question:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuestionText(sug)}
                        className="text-left text-xs bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-xl px-3 py-1.5 text-neutral-300 transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* 5. SPOTLIGHT PLAYER ANSWERING QUEUE */}
          {isSpotlight && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-base font-black text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-400" />
                ANSWER THE SQUAD
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                Choose a question from the queue below to answer or skip.
              </p>

              {questions.filter((q) => q.status === 'pending').length === 0 ? (
                <div className="text-center py-8 bg-neutral-950 rounded-2xl border border-neutral-800 text-neutral-500 text-xs">
                  Waiting for your squad to submit questions... ??
                </div>
              ) : (
                <div className="space-y-4">
                  {questions
                    .filter((q) => q.status === 'pending')
                    .map((q) => (
                      <div
                        key={q.id}
                        className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 text-left space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-orange-400">Asked by @{q.asker_name}</span>
                          <span className="text-neutral-500 text-[10px]">
                            {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-base font-bold text-white">"{q.question}"</p>

                        <div className="space-y-2 pt-2">
                          <input
                            type="text"
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Type your unfiltered truth..."
                            maxLength={500}
                            disabled={submittingAnswer}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-yellow-400 transition-colors"
                          />

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAnswerQuestion(q.id)}
                              disabled={submittingAnswer || !answerText.trim()}
                              className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            >
                              SUBMIT ANSWER ??
                            </button>

                            <button
                              onClick={() => handleSkipQuestion(q.id)}
                              disabled={skipping || (room.skips_remaining || 0) <= 0}
                              className="px-4 py-2.5 bg-neutral-800 hover:bg-red-950/60 border border-neutral-700 hover:border-red-600 text-neutral-300 hover:text-red-400 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              SKIP ({room.skips_remaining || 0} LEFT)
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* 6. LIVE QUESTION & ANSWER REACTION FEED */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-base font-black text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              Live Interrogation Feed ({questions.length})
            </h3>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs">
                No questions asked yet. Be the first to drop one! ??
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 bg-neutral-950/70 border border-neutral-800 rounded-2xl text-left space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-400">@{q.asker_name} asked:</span>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-base font-bold text-white leading-snug">"{q.question}"</p>

                    {/* Answer Display */}
                    {q.status === 'answered' && (
                      <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-xl">
                        <span className="text-[10px] font-black uppercase text-yellow-400 block mb-1">
                          {spotlightUser?.display_name?.toUpperCase()}'S ANSWER:
                        </span>
                        <p className="text-sm font-semibold text-neutral-200">{q.answer}</p>
                      </div>
                    )}

                    {/* Skipped Notice */}
                    {q.status === 'skipped' && (
                      <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 italic">
                        {q.answer || '?? Used a skip. The allegations remain unanswered.'}
                      </div>
                    )}

                    {/* Chaos AI Interruption */}
                    {q.chaos_ai_comment && (
                      <div className="p-3 bg-purple-950/40 border border-purple-800/80 rounded-xl flex items-start gap-2 text-xs text-purple-300">
                        <Bot className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-black text-purple-400 uppercase tracking-wider block text-[10px]">
                            CHAOS AI COMMENTARY
                          </span>
                          <span>{q.chaos_ai_comment}</span>
                        </div>
                      </div>
                    )}

                    {/* Emoji Reaction Bar */}
                    {q.status === 'answered' && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {EMOJI_REACTIONS.map((emoji) => {
                          const count = q.reactions_count?.[emoji] || 0
                          const userReacted = q.user_reactions?.includes(emoji)
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleToggleReaction(q.id, emoji)}
                              className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 border transition-all cursor-pointer ${
                                userReacted
                                  ? 'bg-neutral-800 border-orange-500/50 text-white'
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                              }`}
                            >
                              <span>{emoji}</span>
                              {count > 0 && <span className="text-[10px] font-bold">{count}</span>}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
