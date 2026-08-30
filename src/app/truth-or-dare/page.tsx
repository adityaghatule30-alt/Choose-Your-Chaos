'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { TruthDareItem, CompleteTruthDareResponse } from '@/types/truth-dare'
import { createClient } from '@/lib/supabase/client'
import {
  Flame,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Flag,
  Skull,
  Smile,
  Zap,
  Home,
  Check,
} from 'lucide-react'

export default function TruthOrDarePage() {
  const { user, profile, isLoading, refreshProfile } = useAuth()
  const router = useRouter()

  const [mode, setMode] = useState<'truth' | 'dare'>('truth')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'chaos'>('easy')
  const [item, setItem] = useState<TruthDareItem | null>(null)
  const [loadingItem, setLoadingItem] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completionResult, setCompletionResult] = useState<CompleteTruthDareResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState<string>('inappropriate')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportMessage, setReportMessage] = useState<string | null>(null)

  const answeredIdsRef = useRef<string[]>([])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirectTo=/truth-or-dare')
    }
  }, [user, isLoading, router])

  // Initialize Game Session in Supabase
  useEffect(() => {
    if (user && !sessionId) {
      const initSession = async () => {
        const supabase = createClient()
        const { data } = await supabase
          .from('game_sessions')
          .insert({
            user_id: user.id,
            game_type: mode === 'truth' ? 'truth' : 'dare',
          })
          .select('id')
          .single()

        if (data) {
          setSessionId(data.id)
        }
      }
      initSession()
    }
  }, [user, mode, sessionId])

  // Fetch Next Prompt
  const loadNextItem = async (targetMode = mode, targetDiff = difficulty) => {
    setLoadingItem(true)
    setCompletionResult(null)
    setErrorMessage(null)
    setIsEmpty(false)

    try {
      const res = await fetch('/api/truth-dare/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: targetMode,
          difficulty: targetDiff,
          excludeIds: answeredIdsRef.current,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to fetch prompt.')
      }

      const data = await res.json()

      if (data.empty) {
        setIsEmpty(true)
        setItem(null)
      } else if (data.item) {
        setItem(data.item)
      } else {
        throw new Error('Unexpected payload.')
      }
    } catch {
      setErrorMessage('Chaos servers are having a moment. Try again. 😭')
    } finally {
      setLoadingItem(false)
    }
  }

  // Load item on mount or mode/diff change
  useEffect(() => {
    if (user) {
      loadNextItem(mode, difficulty)
    }
  }, [user, mode, difficulty])

  // Handle Completion Action
  const handleComplete = async () => {
    if (!item || completing || completionResult) return

    setCompleting(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/truth-dare/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.id,
          session_id: sessionId,
        }),
      })

      const data: CompleteTruthDareResponse = await res.json()

      if (data.success) {
        setCompletionResult(data)
        answeredIdsRef.current.push(item.id)
        refreshProfile()
      } else {
        setErrorMessage(data.message || "That completion didn't stick. Try again.")
      }
    } catch {
      setErrorMessage("That completion didn't stick. Try again.")
    } finally {
      setCompleting(false)
    }
  }

  // Handle Submit Report
  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    setReportSubmitting(true)
    setReportMessage(null)

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'truth_dare',
          target_id: item.id,
          reason: reportReason,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setReportMessage('Report submitted. Thank you for keeping the chaos safe!')
        setTimeout(() => {
          setReportModalOpen(false)
          setReportMessage(null)
          loadNextItem()
        }, 1500)
      } else {
        setReportMessage('Failed to submit report.')
      }
    } catch {
      setReportMessage('Error sending report.')
    } finally {
      setReportSubmitting(false)
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
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {/* Mode Switcher Toggle */}
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-1.5 rounded-2xl flex items-center mb-6 shadow-xl">
        <button
          onClick={() => {
            setMode('truth')
          }}
          className={`flex-1 py-3 rounded-xl font-black text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'truth'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>🎭</span> TRUTH
        </button>
        <button
          onClick={() => {
            setMode('dare')
          }}
          className={`flex-1 py-3 rounded-xl font-black text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'dare'
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/25 scale-[1.02]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>😈</span> DARE
        </button>
      </div>

      {/* Difficulty Selector */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setDifficulty('easy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            difficulty === 'easy'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md shadow-emerald-500/10'
              : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
          }`}
        >
          <Smile className="w-3.5 h-3.5" /> EASY
        </button>
        <button
          onClick={() => setDifficulty('medium')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            difficulty === 'medium'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 shadow-md shadow-yellow-500/10'
              : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> MEDIUM
        </button>
        <button
          onClick={() => setDifficulty('chaos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            difficulty === 'chaos'
              ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-md shadow-red-500/10'
              : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
          }`}
        >
          <Skull className="w-3.5 h-3.5" /> CHAOS
        </button>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="w-full mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-sm flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => loadNextItem()}
            className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 border border-red-700/60 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loadingItem && (
        <div className="w-full flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 shadow-xl">
            <Flame className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
          <h3 className="text-lg font-black text-white tracking-wide">SUMMONING CHAOS... 💀</h3>
          <p className="text-xs text-neutral-500 mt-1">Drawing the next {mode.toUpperCase()} challenge</p>
        </div>
      )}

      {/* Empty State */}
      {!loadingItem && isEmpty && (
        <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
          <h2 className="text-2xl font-black text-white">Chaos is temporarily out of this one. 💀</h2>
          <p className="text-neutral-400 text-sm mt-2 max-w-md mx-auto mb-8">
            You have conquered all active {mode.toUpperCase()} challenges in this difficulty!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => loadNextItem()}
              className="w-full sm:w-auto px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/20"
            >
              <RefreshCw className="w-4 h-4" /> TRY AGAIN
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-neutral-400" /> BACK HOME
            </Link>
          </div>
        </div>
      )}

      {/* Active Truth / Dare Card */}
      {!loadingItem && item && (
        <div className="w-full flex flex-col items-center">
          {/* Card Meta Header */}
          <div className="w-full flex items-center justify-between px-2 mb-3">
            <div className="flex items-center gap-2">
              {item.categories && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-full uppercase tracking-wider">
                  <span>{item.categories.emoji || '🔥'}</span>
                  <span>{item.categories.name}</span>
                </span>
              )}
            </div>

            {/* Report Button */}
            <button
              onClick={() => setReportModalOpen(true)}
              className="text-neutral-500 hover:text-red-400 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" /> Report
            </button>
          </div>

          {/* Main Challenge Card */}
          <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center mb-6">
            <div
              className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -z-10 ${
                mode === 'truth' ? 'bg-purple-500/10' : 'bg-red-500/10'
              }`}
            />

            <div
              className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center justify-center gap-1.5 ${
                mode === 'truth' ? 'text-purple-400' : 'text-red-400'
              }`}
            >
              <span>{mode === 'truth' ? '🎭' : '😈'}</span>
              <span>{mode.toUpperCase()} CHALLENGE</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed my-4">
              "{item.prompt}"
            </h2>

            {/* Completion Pill */}
            {completionResult && (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-sm font-black rounded-full uppercase tracking-wide mt-4 shadow-sm animate-bounce">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                +{completionResult.xp_awarded} XP EARNED 🔥
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-3">
            {!completionResult ? (
              <button
                onClick={handleComplete}
                disabled={completing}
                className={`w-full sm:flex-1 py-4 px-6 rounded-2xl font-black text-base transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
                  mode === 'truth'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/25'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>{mode === 'truth' ? 'I ANSWERED' : 'I DID IT'}</span>
              </button>
            ) : null}

            <button
              onClick={() => loadNextItem()}
              className="w-full sm:flex-1 py-4 px-6 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 text-white font-black text-base rounded-2xl transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>NEXT ONE</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" /> Report Content
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Help keep Choose Your Chaos safe and respectful.
            </p>

            {reportMessage ? (
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-yellow-400 mb-4">
                {reportMessage}
              </div>
            ) : null}

            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="inappropriate">Inappropriate / Unsafe</option>
                  <option value="dangerous">Dangerous Physical Challenge</option>
                  <option value="harassment">Harassment / Bullying</option>
                  <option value="offensive">Offensive / Hate</option>
                  <option value="spam">Spam / Low Quality</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {reportSubmitting ? 'Sending...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
