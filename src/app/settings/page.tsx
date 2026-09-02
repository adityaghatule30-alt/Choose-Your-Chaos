'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Settings, Shield, Lock, Check, ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, isLoading, refreshProfile } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirectTo=/settings')
    }
    if (profile) {
      setDisplayName(profile.display_name || profile.username || '')
      setBio(profile.bio || '')
    }
  }, [user, profile, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg(null)
    setSaveSuccess(false)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio.trim(),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSaveSuccess(true)
        refreshProfile()
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setErrorMsg(data.message || 'Failed to save changes.')
      }
    } catch {
      setErrorMsg('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 animate-pop-in">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-yellow-400" /> CHAOS CUSTOMIZATION
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Update your public identity.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Chaos identity saved successfully!
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl text-red-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
              placeholder="e.g. mistermeow"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-2">
              Bio / Catchphrase
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="e.g. Unhinged choices only."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-yellow-500/20 transition-all active-press disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? 'SAVING IDENTITY...' : 'SAVE CHAOS IDENTITY 💾'}
          </button>
        </form>

        {/* Security Info */}
        <div className="pt-6 border-t border-neutral-800 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-neutral-500">
            Account Credentials
          </div>

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
                <div className="text-xs text-neutral-400">Authenticated via Supabase RLS</div>
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

