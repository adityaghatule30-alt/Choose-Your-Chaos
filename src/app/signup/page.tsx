'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Flame, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    // Form Validations
    const cleanUsername = username.trim().toLowerCase()
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg('Username must be at least 3 characters long.')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('That email doesn’t look quite right.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg("Those passwords aren't choosing the same team.")
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // 1. Check if username is already taken in profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', cleanUsername)
        .maybeSingle()

      if (existingProfile) {
        setErrorMsg('Looks like this chaos agent already exists.')
        setLoading(false)
        return
      }

      // 2. Call Supabase Auth signUp
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: username.trim(),
          },
        },
      })

      if (error) {
        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already exists')
        ) {
          setErrorMsg('Looks like this chaos agent already exists.')
        } else {
          setErrorMsg(error.message)
        }
        return
      }

      if (data.session) {
        // Direct authenticated session established (email confirmation disabled/auto-confirmed)
        router.push('/play')
        router.refresh()
      } else if (data.user && !data.session) {
        // Email confirmation is required by Supabase Auth config
        setSuccessMsg(
          'Chaos ID created! Please check your email inbox to confirm your account before logging in.'
        )
      }
    } catch {
      setErrorMsg('Failed to create account due to a chaos glitch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl -z-10" />

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-neutral-800/80 rounded-2xl border border-neutral-700 mb-3 shadow-inner">
            <Flame className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">JOIN THE CHAOS</h1>
          <p className="text-sm text-neutral-400 mt-1">Claim your identity in the arena</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-950/50 border border-red-800/70 rounded-xl text-red-300 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-950/50 border border-emerald-800/70 rounded-xl text-emerald-300 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Chaos Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="chaos_master_99"
              disabled={loading}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@chaos.io"
              disabled={loading}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors disabled:opacity-50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black tracking-wide rounded-xl shadow-lg shadow-yellow-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {loading ? 'CREATING YOUR CHAOS ID...' : 'ENTER THE CHAOS'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-400">
          Already have an identity?{' '}
          <Link href="/login" className="text-yellow-400 hover:underline font-bold">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
