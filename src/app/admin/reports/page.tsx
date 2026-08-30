'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft, Eye, RefreshCw } from 'lucide-react'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const loadReports = async () => {
    setLoading(true)
    try {
      const url = statusFilter ? `/api/admin/reports?status=${statusFilter}` : '/api/admin/reports'
      const res = await fetch(url)
      const data = await res.json()
      if (data.reports) {
        setReports(data.reports)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [statusFilter])

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, status }),
      })
      const data = await res.json()
      if (data.success) {
        loadReports()
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
          <h1 className="text-2xl font-black text-white">REPORT CENTER</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Review user-reported cases, comments, and game content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-neutral-900 rounded-2xl animate-pulse border border-neutral-800" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-500 text-xs">
          No reports. The courtroom is surprisingly peaceful. 😌
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 text-[10px] font-black rounded-md uppercase">
                    {r.reason}
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-[10px] font-bold rounded-md">
                    Target: {r.target_type}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase ${
                      r.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        : r.status === 'resolved'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {r.status}
                  </span>
                  <span className="text-neutral-500 text-[10px]">
                    Filed by @{r.profiles?.username || 'user'} • {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>

                {r.details && (
                  <p className="text-xs text-neutral-300 mt-1 italic">
                    "{r.details}"
                  </p>
                )}
                <div className="text-[11px] text-neutral-500 font-mono mt-1">
                  ID: {r.target_id}
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                {r.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'reviewing')}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Mark Reviewing
                  </button>
                )}
                <button
                  onClick={() => handleUpdateStatus(r.id, 'resolved')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Resolve
                </button>
                <button
                  onClick={() => handleUpdateStatus(r.id, 'dismissed')}
                  className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
