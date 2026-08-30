'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  Users,
  MessageSquare,
  FileQuestion,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Eye,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadStats = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()

      if (res.status === 403) {
        setErrorMsg('You don’t have permission to enter the chaos control room.')
        return
      }

      if (data.stats) {
        setStats(data.stats)
        setRole(data.role)
      }
    } catch {
      setErrorMsg('Failed to load control room telemetry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Flame className="w-10 h-10 text-red-500 animate-bounce" />
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-black text-white">Access Denied</h2>
        <p className="text-xs text-neutral-400 mt-2 mb-6">{errorMsg}</p>
        <Link href="/" className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 text-white font-bold text-xs rounded-xl">
          Back Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -z-10" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Staff Control Center • {role?.toUpperCase()}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">CHAOS OVERWATCH</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Realtime database telemetry, content approval pipeline, and moderation tools.
          </p>
        </div>

        <button
          onClick={loadStats}
          className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
          <div className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-yellow-400" /> Total Agents
          </div>
          <div className="text-2xl font-black text-white">{stats?.total_users || 0}</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
          <div className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FileQuestion className="w-3.5 h-3.5 text-yellow-400" /> Active Dilemmas
          </div>
          <div className="text-2xl font-black text-white">{stats?.active_questions || 0}</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
          <div className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Truth & Dares
          </div>
          <div className="text-2xl font-black text-white">
            {(stats?.active_truth_items || 0) + (stats?.active_dare_items || 0)}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
          <div className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Pending Reports
          </div>
          <div className="text-2xl font-black text-red-400">{stats?.pending_reports || 0}</div>
        </div>
      </div>

      {/* Pool Health Monitor */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
        <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" /> Content Pool Health Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
            <div className="text-xs font-bold text-neutral-400">Either / Or Pool</div>
            <div className="text-lg font-black text-white mt-1">
              {stats?.pool_health?.either_or?.count} Active
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">
              Threshold: {stats?.pool_health?.either_or?.threshold} • Status:{' '}
              <span className="text-emerald-400 font-bold">{stats?.pool_health?.either_or?.status}</span>
            </div>
          </div>

          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
            <div className="text-xs font-bold text-neutral-400">Truth Pool</div>
            <div className="text-lg font-black text-white mt-1">
              {stats?.pool_health?.truth?.count} Active
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">
              Threshold: {stats?.pool_health?.truth?.threshold} • Status:{' '}
              <span className="text-emerald-400 font-bold">{stats?.pool_health?.truth?.status}</span>
            </div>
          </div>

          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
            <div className="text-xs font-bold text-neutral-400">Dare Pool</div>
            <div className="text-lg font-black text-white mt-1">
              {stats?.pool_health?.dare?.count} Active
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">
              Threshold: {stats?.pool_health?.dare?.threshold} • Status:{' '}
              <span className="text-emerald-400 font-bold">{stats?.pool_health?.dare?.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modules Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/content"
          className="bg-neutral-900 border border-neutral-800 hover:border-yellow-500/50 rounded-3xl p-6 transition-all duration-200 transform hover:scale-[1.02] shadow-xl group"
        >
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center mb-3">
            <FileQuestion className="w-5 h-5" />
          </div>
          <h4 className="text-base font-black text-white group-hover:text-yellow-400 transition-colors">
            Content Review
          </h4>
          <p className="text-xs text-neutral-400 mt-1">
            Approve, reject, or retire Either/Or and Truth/Dare candidates.
          </p>
        </Link>

        <Link
          href="/admin/judge-me"
          className="bg-neutral-900 border border-neutral-800 hover:border-red-500/50 rounded-3xl p-6 transition-all duration-200 transform hover:scale-[1.02] shadow-xl group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h4 className="text-base font-black text-white group-hover:text-red-400 transition-colors">
            Court Moderation
          </h4>
          <p className="text-xs text-neutral-400 mt-1">
            Review user-submitted Judge Me situations and court cases.
          </p>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 rounded-3xl p-6 transition-all duration-200 transform hover:scale-[1.02] shadow-xl group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-base font-black text-white group-hover:text-purple-400 transition-colors">
            Report Center
          </h4>
          <p className="text-xs text-neutral-400 mt-1">
            Review user flagged content across questions, dares, and cases.
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-3xl p-6 transition-all duration-200 transform hover:scale-[1.02] shadow-xl group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
            User & Role Registry
          </h4>
          <p className="text-xs text-neutral-400 mt-1">
            Search registered agents and manage staff permissions.
          </p>
        </Link>
      </div>
    </div>
  )
}
