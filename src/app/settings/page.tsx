'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { CHAOS_AVATARS } from '@/lib/avatars'
import { Settings, Shield, Lock, User, Check, Sparkles, ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, isLoading, refreshProfile } = useAuth()
  const router = useRouter()

  const [selectedAvatar, setSelectedAvatar] = useState<string>('')
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
      setSelectedAvatar(profile.avatar_url || CHAOS_AVATARS[0].path)
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
          avatar_url: selectedAvatar,
          display_name: displayName,
          bio,
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
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-yellow-400" /> Chaos Customization
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Choose your 14 official Chaos Avatars and update your public identity.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" /> Identity saved! Your new avatar is live across all game modes.
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl text-red-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Avatar Selection Grid */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-yellow-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Choose Your Chaos Avatar (14 Available)
            </label>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 bg-neutral-950 p-4 rounded-3xl border border-neutral-800">
              {CHAOS_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.path
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.path)}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer p-1 group flex items-center justify-center ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/20 scale-105 shadow-lg shadow-yellow-500/30 ring-2 ring-yellow-400/50'
                        : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:scale-105'
                    }`}
                  >
                    <img
                      src={av.path}
                      alt={av.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 text-neutral-950 stroke-[3]" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Profile Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={30}
                placeholder="e.g. ChaosMaster"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-2">
                Bio / Catchphrase
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                placeholder="e.g. Unhinged choices only."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-yellow-500/20 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? 'UPDATING IDENTITY...' : 'SAVE CHAOS IDENTITY 💾'}
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
