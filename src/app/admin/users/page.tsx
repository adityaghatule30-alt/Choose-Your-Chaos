'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Shield, ArrowLeft, Search } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const loadUsers = async (q = search) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data.users) {
        setUsers(data.users)
        setIsAdmin(Boolean(data.isAdmin))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role }),
      })
      const data = await res.json()
      if (data.success) {
        loadUsers()
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
          <h1 className="text-2xl font-black text-white">USER & ROLE REGISTRY</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage agent permissions, roles, and view player accounts.
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username..."
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-400 w-full sm:w-64"
          />
          <button
            onClick={() => loadUsers(search)}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 text-xs font-bold rounded-xl cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-neutral-900 rounded-2xl animate-pulse border border-neutral-800" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-500 text-xs">
          No chaos agents found.
        </div>
      ) : (
        <div className="space-y-2.5">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-red-500 flex items-center justify-center font-bold text-xs text-neutral-950">
                  {u.username[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <span>@{u.username}</span>
                    <span
                      className={`px-2 py-0.2 text-[9px] font-black rounded-full uppercase ${
                        u.role === 'admin'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : u.role === 'moderator'
                          ? 'bg-purple-950 text-purple-400 border border-purple-800'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    {u.xp || 0} XP • Chaos Score: {u.chaos_score || 0} 🔥
                  </div>
                </div>
              </div>

              {/* Role Select (Admin Only) */}
              {isAdmin && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[11px] text-neutral-400 font-bold">Role:</span>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
