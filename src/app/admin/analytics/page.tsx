'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  BarChart3,
  Users,
  Play,
  Sparkles,
  ShieldAlert,
  Calendar,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('all_time')

  const loadAnalytics = async (tf = timeframe) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?timeframe=${tf}`)
      const json = await res.json()
      if (json.analytics) {
        setData(json.analytics)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics(timeframe)
  }, [timeframe])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Overwatch
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-yellow-400" /> PLATFORM ANALYTICS
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            First-party gameplay metrics, audience activity, and conversion telemetry.
          </p>
        </div>

        {/* Date Filter */}
        <div className="bg-neutral-900 border border-neutral-800 p-1 rounded-2xl flex gap-1 self-stretch sm:self-auto overflow-x-auto">
          {[
            { key: 'today', label: 'Today' },
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' },
            { key: 'all_time', label: 'All Time' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTimeframe(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                timeframe === item.key
                  ? 'bg-yellow-400 text-neutral-950 font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-neutral-900 rounded-3xl animate-pulse border border-neutral-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-lg">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Total Agents
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {data?.overview?.total_registered_users || 0}
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-lg">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Either/Or Votes
              </div>
              <div className="text-2xl sm:text-3xl font-black text-yellow-400">
                {data?.overview?.either_or_votes || 0}
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-lg">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Rooms Created
              </div>
              <div className="text-2xl sm:text-3xl font-black text-pink-400">
                {data?.overview?.rooms_created || 0}
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-lg">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Telemetry Events
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-400">
                {data?.overview?.events_recorded || 0}
              </div>
            </div>
          </div>

          {/* Game Modes Deep Dive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Either / Or Split Chart */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                <Play className="w-4 h-4 text-yellow-400" /> Either / Or Choices Ratio
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-yellow-400">OPTION A ({data?.either_or?.percent_a}%)</span>
                    <span className="text-neutral-400">{data?.either_or?.choice_a_count} votes</span>
                  </div>
                  <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                      style={{ width: `${data?.either_or?.percent_a || 50}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-red-400">OPTION B ({data?.either_or?.percent_b}%)</span>
                    <span className="text-neutral-400">{data?.either_or?.choice_b_count} votes</span>
                  </div>
                  <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-700"
                      style={{ width: `${data?.either_or?.percent_b || 50}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Multiplayer Rooms Conversion */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-400" /> Multiplayer Match Telemetry
              </h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Created</div>
                  <div className="text-xl font-black text-white mt-1">{data?.rooms?.created || 0}</div>
                </div>
                <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Completed</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">{data?.rooms?.finished || 0}</div>
                </div>
                <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Completion</div>
                  <div className="text-xl font-black text-yellow-400 mt-1">{data?.rooms?.completion_rate || 0}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
