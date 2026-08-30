'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { JudgeCase, JudgeComment } from '@/types/judge'
import {
  Gavel,
  ShieldAlert,
  Flame,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Flag,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ThumbsUp,
} from 'lucide-react'

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const caseId = resolvedParams.id

  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()

  const [caseData, setCaseData] = useState<JudgeCase | null>(null)
  const [comments, setComments] = useState<JudgeComment[]>([])
  const [newCommentText, setNewCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [voting, setVoting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [xpNotice, setXpNotice] = useState<string | null>(null)

  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ type: 'judge_case' | 'comment'; id: string }>({
    type: 'judge_case',
    id: caseId,
  })
  const [reportReason, setReportReason] = useState('inappropriate')
  const [reporting, setReporting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  // Load Case & Comments
  const loadCaseDetails = async () => {
    try {
      const caseRes = await fetch(`/api/judge/cases?id=${caseId}`)
      const cData = await caseRes.json()

      if (cData.case) {
        setCaseData(cData.case)
      } else {
        setErrorMsg(cData.message || 'This case may have been dismissed or removed from public record.')
        setCaseData(null)
      }

      // Fetch comments gracefully without throwing if comments fail
      try {
        const commentsRes = await fetch(`/api/judge/comments?case_id=${caseId}`)
        const cmData = await commentsRes.json()
        if (cmData.comments) {
          setComments(cmData.comments)
        }
      } catch (cErr) {
        console.warn('Could not load comments:', cErr)
      }
    } catch (err) {
      console.error('Failed to load case details:', err)
      setErrorMsg('The courtroom is having a moment. ??')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCaseDetails()
  }, [caseId])

  // Handle Vote Action
  const handleVote = async (verdict: 'not_guilty' | 'guilty' | 'criminal') => {
    if (!user) {
      router.push(`/login?redirectTo=/judge-me/${caseId}`)
      return
    }

    if (voting || caseData?.user_voted) return

    setVoting(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/judge/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          verdict,
        }),
      })

      const data = await res.json()

      if (data.success || data.error === 'DUPLICATE_VOTE') {
        if (data.success && data.xp_awarded) {
          setXpNotice(`+${data.xp_awarded} XP Awarded! ??`)
          refreshProfile()
          setTimeout(() => setXpNotice(null), 3000)
        }
        setCaseData((prev) =>
          prev
            ? {
                ...prev,
                user_voted: verdict,
                stats: data.stats,
              }
            : null
        )
      } else {
        setErrorMsg(data.message || 'Your verdict got lost. Try again.')
      }
    } catch {
      setErrorMsg('Your verdict got lost. Try again.')
    } finally {
      setVoting(false)
    }
  }

  // Handle Comment Submission
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push(`/login?redirectTo=/judge-me/${caseId}`)
      return
    }

    if (!newCommentText.trim() || submittingComment) return

    setSubmittingComment(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/judge/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          comment: newCommentText.trim(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setNewCommentText('')
        loadCaseDetails()
        refreshProfile()
        setXpNotice('+2 XP for Commenting! ??')
        setTimeout(() => setXpNotice(null), 3000)
      } else {
        setErrorMsg(data.message || "The jury's comment box is temporarily broken. ??")
      }
    } catch {
      setErrorMsg("The jury's comment box is temporarily broken. ??")
    } finally {
      setSubmittingComment(false)
    }
  }

  // Handle Reaction Toggle
  const handleToggleReaction = async (commentId: string, reaction: string) => {
    if (!user) {
      router.push(`/login?redirectTo=/judge-me/${caseId}`)
      return
    }

    try {
      const res = await fetch('/api/judge/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment_id: commentId,
          reaction,
        }),
      })

      const data = await res.json()
      if (data.success) {
        loadCaseDetails()
        if (data.action === 'added') {
          refreshProfile()
        }
      }
    } catch {}
  }

  // Handle Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setReporting(true)

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: reportTarget.type,
          target_id: reportTarget.id,
          reason: reportReason,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setReportSuccess(true)
        setTimeout(() => {
          setReportModalOpen(false)
          setReportSuccess(false)
        }, 1500)
      }
    } catch {} finally {
      setReporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Flame className="w-10 h-10 text-red-500 animate-bounce" />
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-white">Case Not Found ??</h2>
        <p className="text-neutral-400 text-xs mt-2 mb-6">
          {errorMsg || 'This case may have been dismissed or removed from public record.'}
        </p>
        <Link href="/judge-me" className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors">
          Back to Court Feed
        </Link>
      </div>
    )
  }

  const hasVoted = Boolean(caseData.user_voted)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/judge-me"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Court Feed
        </Link>

        <button
          onClick={() => {
            setReportTarget({ type: 'judge_case', id: caseId })
            setReportModalOpen(true)
          }}
          className="text-neutral-500 hover:text-red-400 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Flag className="w-3.5 h-3.5" /> Report Case
        </button>
      </div>

      {/* XP Toast Notification */}
      {xpNotice && (
        <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl text-yellow-400 text-xs font-black flex items-center justify-center gap-2 shadow-lg animate-bounce">
          <Sparkles className="w-4 h-4" /> {xpNotice}
        </div>
      )}

      {/* Main Case Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -z-10" />

        {/* Author Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-red-500 flex items-center justify-center font-bold text-xs text-neutral-950">
              {caseData.author?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">
                @{caseData.author?.username || 'anonymous'}
              </div>
              <div className="text-[10px] text-neutral-400">
                Filed on {new Date(caseData.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {caseData.category && (
            <span className="bg-neutral-950 px-3 py-1 rounded-full text-neutral-300 border border-neutral-800 text-xs font-bold flex items-center gap-1">
              <span>{caseData.category.emoji}</span>
              <span>{caseData.category.name}</span>
            </span>
          )}
        </div>

        {/* Case Title & Full Situation */}
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug mb-4">
          "{caseData.title}"
        </h1>
        <p className="text-base text-neutral-300 leading-relaxed whitespace-pre-wrap mb-8 bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/80">
          {caseData.description}
        </p>

        {/* Voting UI & Verdict Reveal */}
        <div className="pt-6 border-t border-neutral-800">
          <div className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-4 text-center">
            {hasVoted ? 'JURY VERDICT RESULTS' : 'DELIVER YOUR VERDICT'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* NOT GUILTY */}
            <button
              onClick={() => handleVote('not_guilty')}
              disabled={voting || hasVoted}
              className={`p-4 rounded-2xl border text-center font-bold transition-all transform active:scale-95 cursor-pointer relative overflow-hidden ${
                caseData.user_voted === 'not_guilty'
                  ? 'bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-500/30'
                  : hasVoted
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-300'
                  : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 hover:border-emerald-500 text-emerald-400'
              }`}
            >
              <div className="text-xs font-black uppercase mb-1">?? NOT GUILTY</div>
              {hasVoted && caseData.stats && (
                <div className="text-xl font-black text-white">
                  {caseData.stats.percent_not_guilty}%
                </div>
              )}
            </button>

            {/* GUILTY */}
            <button
              onClick={() => handleVote('guilty')}
              disabled={voting || hasVoted}
              className={`p-4 rounded-2xl border text-center font-bold transition-all transform active:scale-95 cursor-pointer relative overflow-hidden ${
                caseData.user_voted === 'guilty'
                  ? 'bg-yellow-500 text-neutral-950 border-yellow-300 ring-4 ring-yellow-400/30'
                  : hasVoted
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-300'
                  : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 hover:border-yellow-400 text-yellow-400'
              }`}
            >
              <div className="text-xs font-black uppercase mb-1">?? GUILTY</div>
              {hasVoted && caseData.stats && (
                <div className="text-xl font-black text-white">
                  {caseData.stats.percent_guilty}%
                </div>
              )}
            </button>

            {/* CRIMINAL */}
            <button
              onClick={() => handleVote('criminal')}
              disabled={voting || hasVoted}
              className={`p-4 rounded-2xl border text-center font-bold transition-all transform active:scale-95 cursor-pointer relative overflow-hidden ${
                caseData.user_voted === 'criminal'
                  ? 'bg-red-600 text-white border-red-400 ring-4 ring-red-500/30'
                  : hasVoted
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-300'
                  : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 hover:border-red-500 text-red-400'
              }`}
            >
              <div className="text-xs font-black uppercase mb-1">?? CRIMINAL</div>
              {hasVoted && caseData.stats && (
                <div className="text-xl font-black text-white">
                  {caseData.stats.percent_criminal}%
                </div>
              )}
            </button>
          </div>

          {hasVoted && (
            <div className="text-center text-xs text-neutral-500 mt-4">
              Total verdicts cast: {caseData.stats?.total || 0}
            </div>
          )}
        </div>
      </div>

      {/* Jury Comments Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-yellow-400" />
          The Jury Speaks ({comments.length})
        </h3>

        {/* Comment input form */}
        <form onSubmit={handleAddComment} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="State your justification or roast this decision..."
              maxLength={500}
              disabled={submittingComment}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={submittingComment || !newCommentText.trim()}
              className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs rounded-2xl transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" /> {submittingComment ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            Nobody has judged this yet. Be the first. ??
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((cm) => (
              <div
                key={cm.id}
                className="p-4 bg-neutral-950/60 rounded-2xl border border-neutral-800/80 text-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-[9px]">
                      {cm.author?.username?.[0]?.toUpperCase() || 'J'}
                    </div>
                    <span className="font-bold text-xs text-neutral-300">
                      @{cm.author?.username || 'juror'}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(cm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setReportTarget({ type: 'comment', id: cm.id })
                      setReportModalOpen(true)
                    }}
                    className="text-neutral-600 hover:text-red-400 text-[10px] cursor-pointer"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-neutral-300 text-xs leading-relaxed mb-3">
                  {cm.comment}
                </p>

                {/* Reactions bar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['😂', '💀', '😭', '🔥', '🤨'].map((emoji) => {
                    const count = cm.reactions_count?.[emoji] || 0
                    const userReacted = cm.user_reactions?.includes(emoji)
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleToggleReaction(cm.id, emoji)}
                        className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 border transition-all cursor-pointer ${
                          userReacted
                            ? 'bg-neutral-800 border-yellow-500/50 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <span>{emoji}</span>
                        {count > 0 && <span className="text-[10px] font-bold">{count}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" /> Report Content
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Help keep Judge Me court civil and appropriate.
            </p>

            {reportSuccess ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-400 mb-4">
                Report submitted for moderation.
              </div>
            ) : null}

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="inappropriate">Inappropriate / Obscene</option>
                  <option value="harassment">Harassment / Doxxing</option>
                  <option value="offensive">Hate Speech / Offensive</option>
                  <option value="spam">Spam / Promotion</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl"
                >
                  {reporting ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
