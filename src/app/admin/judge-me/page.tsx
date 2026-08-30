'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldAlert, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

export default function AdminJudgePage() {
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const loadCases = async () => {
    setLoading(true)
    try {
      const url = statusFilter ? `/api/admin/judge?status=${statusFilter}` : '/api/admin/judge'
      const res = await fetch(url)
      const data = await res.json()
      if (data.cases) {
        setCases(data.cases)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [statusFilter])

  const handleUpdateStatus = async (caseId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId, status }),
      })
      const data = await res.json()
      if (data.success) {
        loadCases()
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
          <h1 className="text-2xl font-black text-white">JUDGE ME COURT MODERATION</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Review community filed trials and flag inappropriate situations.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none"
        >
          <option value="">All Cases</option>
          <option value="pending">Pending Cases</option>
          <option value="approved">Approved Cases</option>
          <option value="reported">Reported Cases</option>
          <option value="removed">Removed Cases</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-neutral-900 rounded-2xl animate-pulse border border-neutral-800" />
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-500 text-xs">
          No cases found in this view.
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <div
              key={c.id}
              className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase ${
                      c.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : c.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-neutral-400 text-xs font-bold">
                    Filed by @{c.profiles?.username || 'user'}
                  </span>
                  {c.categories && (
                    <span className="text-neutral-500 text-[11px]">
                      {c.categories.emoji} {c.categories.name}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-black text-white mb-1">"{c.title}"</h4>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                {c.status !== 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'approved')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {c.status !== 'removed' && (
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'removed')}
                    className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 border border-red-700/60 text-red-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
