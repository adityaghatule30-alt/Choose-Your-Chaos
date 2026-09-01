'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Question, VoteResultResponse } from '@/types/game'
import { generateVoteReaction } from '@/lib/services/reactions'
import { AdSlot } from '@/components/ads/AdSlot'
import {
  Flame,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

export default function PlayPage() {
  const { user, profile, isLoading, refreshProfile } = useAuth()
  const router = useRouter()

  const [question, setQuestion] = useState<Question | null>(null)
  const [loadingQuestion, setLoadingQuestion] = useState(true)
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null)
  const [voting, setVoting] = useState(false)
  const [voteResult, setVoteResult] = useState<VoteResultResponse | null>(null)
  const [reactionText, setReactionText] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)

  const answeredIdsRef = useRef<string[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirectTo=/play')
    }
  }, [user, isLoading, router])

  const loadNextQuestion = async () => {
    setLoadingQuestion(true)
    setSelectedChoice(null)
    setVoteResult(null)
    setReactionText(null)
    setErrorMessage(null)
    setIsEmpty(false)

    try {
      const res = await fetch('/api/game/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excludeIds: answeredIdsRef.current }),
      })

      if (!res.ok) {
        throw new Error('Failed to fetch next question.')
      }

      const data = await res.json()

      if (data.empty) {
        setIsEmpty(true)
        setQuestion(null)
      } else if (data.question) {
        setQuestion(data.question)
      } else {
        throw new Error('Unexpected question payload.')
      }
    } catch {
      setErrorMessage('The chaos servers are having a moment. Try again. 😭')
    } finally {
      setLoadingQuestion(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadNextQuestion()
    }
  }, [user])

  const handleVote = async (choice: 'A' | 'B') => {
    if (!question || voting || selectedChoice || voteResult) return

    setSelectedChoice(choice)
    setVoting(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/game/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          choice,
        }),
      })

      const data: VoteResultResponse = await res.json()

      if (data.success || data.error === 'DUPLICATE_VOTE') {
        setVoteResult(data)
        answeredIdsRef.current.push(question.id)

        if (data.stats) {
          const percent = choice === 'A' ? data.stats.percent_a : data.stats.percent_b
          const rx = generateVoteReaction({
            choice,
            percentChosen: percent,
            humorLevel: profile?.humor_level || 'sarcastic',
          })
          setReactionText(rx)
        }

        if (data.success) {
          refreshProfile()
        }
      } else {
        setErrorMessage(data.message || "That vote didn't count. Try again.")
        setSelectedChoice(null)
      }
    } catch {
      setErrorMessage("That vote didn't count. Try again.")
      setSelectedChoice(null)
    } finally {
      setVoting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Flame className="w-10 h-10 text-yellow-400 animate-bounce" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {errorMessage && (
        <div className="w-full mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-sm flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={loadNextQuestion}
            className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 border border-red-700/60 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {loadingQuestion && (
        <div className="w-full flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 shadow-xl">
            <Flame className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
          <h3 className="text-lg font-black text-white tracking-wide">SUMMONING DILEMMA... 💀</h3>
          <p className="text-xs text-neutral-500 mt-1">Calculating the most chaotic scenario</p>
        </div>
      )}

      {!loadingQuestion && isEmpty && (
        <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
          <h2 className="text-2xl font-black text-white">You reached the end of the chaos! 💀</h2>
          <p className="text-neutral-400 text-sm mt-2 max-w-md mx-auto mb-8">
            You've answered every active question in the archives. Check back soon for fresh dilemmas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                answeredIdsRef.current = []
                loadNextQuestion()
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/20"
            >
              <RefreshCw className="w-4 h-4" /> PLAY AGAIN
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              BACK HOME
            </Link>
          </div>
        </div>
      )}

      {!loadingQuestion && question && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex items-center justify-between px-2 mb-3">
            {question.categories && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-full uppercase tracking-wider">
                <span>{question.categories.emoji || '🔥'}</span>
                <span>{question.categories.name}</span>
              </span>
            )}
            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> +5 XP per decision
            </span>
          </div>

          <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center mb-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -z-10" />
            <span className="text-xs font-black uppercase text-yellow-400 tracking-widest block mb-2">
              WOULD YOU RATHER...
            </span>
            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
              "{question.question}"
            </h1>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleVote('A')}
              disabled={voting || Boolean(voteResult)}
              className={`p-6 sm:p-8 rounded-3xl border text-left font-bold transition-all duration-200 active-press relative overflow-hidden flex flex-col justify-between min-h-[180px] shadow-xl ${
                selectedChoice === 'A'
                  ? 'bg-yellow-400 text-neutral-950 border-yellow-300 ring-4 ring-yellow-400/30 scale-[1.02]'
                  : voteResult
                  ? 'bg-neutral-900/90 border-neutral-800 text-neutral-300'
                  : 'bg-neutral-900 hover:bg-neutral-850 text-white border-neutral-800 hover:border-yellow-400/60 cursor-pointer hover:scale-[1.01]'
              }`}
            >
              <div>
                <span className={`text-xs font-black uppercase tracking-wider block mb-2 ${
                  selectedChoice === 'A' ? 'text-neutral-950' : 'text-yellow-400'
                }`}>
                  OPTION A
                </span>
                <span className="text-lg sm:text-xl font-bold leading-snug">
                  {question.option_a}
                </span>
              </div>

              {voteResult?.stats && (
                <div className="mt-6 pt-4 border-t border-neutral-800/80 animate-fade-in">
                  <div className="flex justify-between items-center text-xs font-black mb-1.5">
                    <span>{voteResult.stats.percent_a}% CHOSE THIS</span>
                    <span className="text-[10px] opacity-80">({voteResult.stats.count_a} votes)</span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-700 ease-out animate-progress-fill"
                      style={{ width: `${voteResult.stats.percent_a}%` }}
                    />
                  </div>
                </div>
              )}
            </button>

            <button
              onClick={() => handleVote('B')}
              disabled={voting || Boolean(voteResult)}
              className={`p-6 sm:p-8 rounded-3xl border text-left font-bold transition-all duration-200 active-press relative overflow-hidden flex flex-col justify-between min-h-[180px] shadow-xl ${
                selectedChoice === 'B'
                  ? 'bg-red-500 text-white border-red-400 ring-4 ring-red-500/30 scale-[1.02]'
                  : voteResult
                  ? 'bg-neutral-900/90 border-neutral-800 text-neutral-300'
                  : 'bg-neutral-900 hover:bg-neutral-850 text-white border-neutral-800 hover:border-red-400/60 cursor-pointer hover:scale-[1.01]'
              }`}
            >
              <div>
                <span className={`text-xs font-black uppercase tracking-wider block mb-2 ${
                  selectedChoice === 'B' ? 'text-white' : 'text-red-400'
                }`}>
                  OPTION B
                </span>
                <span className="text-lg sm:text-xl font-bold leading-snug">
                  {question.option_b}
                </span>
              </div>

              {voteResult?.stats && (
                <div className="mt-6 pt-4 border-t border-neutral-800/80 animate-fade-in">
                  <div className="flex justify-between items-center text-xs font-black mb-1.5">
                    <span>{voteResult.stats.percent_b}% CHOSE THIS</span>
                    <span className="text-[10px] opacity-80">({voteResult.stats.count_b} votes)</span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-700 ease-out animate-progress-fill"
                      style={{ width: `${voteResult.stats.percent_b}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          </div>

          {reactionText && (
            <div className="w-full p-4 mb-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl text-center shadow-lg animate-pop-in">
              <span className="text-sm font-black text-yellow-400">{reactionText}</span>
            </div>
          )}

          {voteResult && (
            <AdSlot placement="game-result" className="my-3" />
          )}

          {voteResult && (
            <button
              onClick={loadNextQuestion}
              className="w-full py-4 px-6 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-yellow-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>NEXT ONE</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
