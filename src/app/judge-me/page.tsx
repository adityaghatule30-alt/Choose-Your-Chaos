'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { JudgeCase } from '@/types/judge'
import {
  ShieldAlert,
  Flame,
  Plus,
  MessageSquare,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Gavel,
} from 'lucide-react'

export default function JudgeMeFeedPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [cases, setCases] = useState<JudgeCase[]>([])
  const [filter, setFilter] = useState<'trending' | 'new' | 'controversial'>('trending')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadFeed = async (activeFilter = filter) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/judge/cases?filter=${activeFilter}`)
      const data = await res.json()
      if (data.cases) {
        setCases(data.cases)
      } else {
        throw new Error('Failed to load cases.')
      }
    } catch {
      setErrorMsg('The courtroom is having a moment. 😭')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeed(filter)
  }, [filter])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -z-10" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            <Gavel className="w-3.5 h-3.5" /> High Court of Chaos
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            ⚖️ JUDGE ME
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Present your case. The court has no mercy.
          </p>
        </div>

        <Link
          href="/judge-me/submit"
          className="w-full sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-600/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> SUBMIT A CASE
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('trending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            filter === 'trending'
              ? 'bg-yellow-400 text-neutral-950 shadow-md shadow-yellow-500/20 font-black'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Trending
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            filter === 'new'
              ? 'bg-yellow-400 text-neutral-950 shadow-md shadow-yellow-500/20 font-black'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> New Cases
        </button>
        <button
          onClick={() => setFilter('controversial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            filter === 'controversial'
              ? 'bg-yellow-400 text-neutral-950 shadow-md shadow-yellow-500/20 font-black'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Most Controversial
        </button>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-sm mb-6 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => loadFeed(filter)}
            className="px-3 py-1 bg-red-900/60 rounded-xl text-xs font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 h-44 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && cases.length === 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 text-center shadow-xl">
          <ShieldAlert className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No cases yet.</h3>
          <p className="text-xs text-neutral-400 mt-1 mb-6">
            Someone needs to make a questionable decision.
          </p>
          <Link
            href="/judge-me/submit"
            className="px-6 py-3 bg-yellow-400 text-neutral-950 font-black text-xs rounded-xl"
          >
            Submit First Case
          </Link>
        </div>
      )}

      {/* Feed Case Cards */}
      {!loading && cases.length > 0 && (
        <div className="space-y-4">
          {cases.map((c) => {
            const hasVoted = Boolean(c.user_voted)
            return (
              <Link
                key={c.id}
                href={`/judge-me/${c.id}`}
                className="block bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 rounded-3xl p-6 transition-all duration-200 shadow-xl group cursor-pointer"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-500 to-red-500 flex items-center justify-center font-bold text-[10px] text-neutral-950">
                      {c.author?.username?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <span className="font-bold text-neutral-300">
                      @{c.author?.username || 'anonymous'}
                    </span>
                    {c.category && (
                      <span className="bg-neutral-950 px-2.5 py-0.5 rounded-full text-neutral-400 border border-neutral-800 text-[10px] font-semibold">
                        {c.category.emoji} {c.category.name}
                      </span>
                    )}
                  </div>

                  <span className="text-neutral-500 text-[11px]">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Case Title & Preview */}
                <h3 className="text-lg font-black text-white group-hover:text-yellow-400 transition-colors leading-snug mb-2">
                  {c.title}
                </h3>
                <p className="text-sm text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
                  {c.description}
                </p>

                {/* Verdict Distribution Preview / Total Votes */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800/80 text-xs">
                  {/* Stats Bar */}
                  {hasVoted && c.stats ? (
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold">
                        {c.stats.percent_not_guilty}% Not Guilty
                      </span>
                      <span className="text-yellow-400 font-bold">
                        {c.stats.percent_guilty}% Guilty
                      </span>
                      <span className="text-red-400 font-bold">
                        {c.stats.percent_criminal}% Criminal
                      </span>
                    </div>
                  ) : (
                    <div className="text-neutral-500 flex items-center gap-1.5">
                      <Gavel className="w-3.5 h-3.5" />
                      <span>{c.stats?.total || 0} verdicts cast • Vote to reveal</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-neutral-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> {c.comments_count || 0}
                    </span>
                    <span className="text-yellow-400 group-hover:translate-x-1 transition-transform flex items-center">
                      View Case <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
