'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileQuestion,
  CheckCircle2,
  XCircle,
  Power,
  RefreshCw,
  ArrowLeft,
  Filter,
  Sparkles,
} from 'lucide-react'

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'truth_dare' | 'questions'>('truth_dare')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const loadContent = async (tab = activeTab, p = page) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/content?type=${tab}&page=${p}`)
      const data = await res.json()
      if (data.items) {
        setItems(data.items)
        setTotal(data.total || 0)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContent(activeTab, page)
  }, [activeTab, page])

  const handleAction = async (id: string, action: string) => {
    try {
      const targetType = activeTab === 'questions' ? 'questions' : 'truth_dare_items'
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: id, action }),
      })
      const data = await res.json()
      if (data.success) {
        loadContent()
      }
    } catch {}
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Overwatch
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">CONTENT MANAGEMENT & REVIEW</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Audit and approve candidates across Either/Or and Truth/Dare content libraries.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-neutral-900 border border-neutral-800 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => {
              setActiveTab('truth_dare')
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'truth_dare' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Truth & Dare ({total})
          </button>
          <button
            onClick={() => {
              setActiveTab('questions')
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'questions' ? 'bg-yellow-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Either / Or Dilemmas
          </button>
        </div>
      </div>

      {/* Content List Table / Cards */}
      {loading ? (
        <div className="space-y-3 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-neutral-900 rounded-2xl animate-pulse border border-neutral-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-500 text-xs">
          No content waiting for review.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isQuestion = activeTab === 'questions'
            const isAI = item.source === 'ai'

            return (
              <div
                key={item.id}
                className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {isAI ? (
                      <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-black rounded-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI GENERATED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-[10px] font-bold rounded-md">
                        {item.source || 'CURATED'}
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase ${
                        item.active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {item.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>

                    {item.categories && (
                      <span className="text-neutral-400 text-[11px] font-semibold">
                        {item.categories.emoji} {item.categories.name}
                      </span>
                    )}

                    <span className="text-neutral-500 text-[10px]">
                      QS: {item.quality_score || 90} • SS: {item.safety_score || 100}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-white leading-snug">
                    {isQuestion ? (
                      <div>
                        <div className="text-yellow-400 text-xs mb-0.5 font-normal">Would you rather...</div>
                        <span className="text-white">A: {item.option_a}</span>
                        <span className="text-neutral-400 mx-2">OR</span>
                        <span className="text-white">B: {item.option_b}</span>
                      </div>
                    ) : (
                      <span>
                        <strong className="text-purple-400 uppercase mr-1.5">[{item.type}]</strong>
                        "{item.prompt}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  {item.safety_status !== 'approved' ? (
                    <button
                      onClick={() => handleAction(item.id, 'approve')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  ) : item.active ? (
                    <button
                      onClick={() => handleAction(item.id, 'deactivate')}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Power className="w-3.5 h-3.5" /> Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(item.id, 'activate')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Power className="w-3.5 h-3.5" /> Activate
                    </button>
                  )}

                  <button
                    onClick={() => handleAction(item.id, 'retire')}
                    className="px-3 py-1.5 bg-neutral-950 hover:bg-red-950/60 border border-neutral-800 hover:border-red-800 text-neutral-400 hover:text-red-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Retire
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
