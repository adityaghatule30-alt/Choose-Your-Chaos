'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { Settings, Shield, Bell, Lock } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirectTo=/settings')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
          <Settings className="w-6 h-6 text-yellow-400" /> Account Settings
        </h1>
        <p className="text-neutral-400 text-sm mb-6">Manage security and session preferences</p>

        <div className="space-y-4">
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-neutral-400" />
              <div>
                <div className="text-sm font-bold text-white">Email Address</div>
                <div className="text-xs text-neutral-400">{user.email}</div>
              </div>
            </div>
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2.5 py-1 rounded-full font-bold">
              Active
            </span>
          </div>

          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-neutral-400" />
              <div>
                <div className="text-sm font-bold text-white">Security Role</div>
                <div className="text-xs text-neutral-400">Determined server-side via Supabase RLS</div>
              </div>
            </div>
            <span className="text-xs bg-neutral-800 text-yellow-400 border border-neutral-700 px-2.5 py-1 rounded-full font-bold uppercase">
              {profile?.role || 'User'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
