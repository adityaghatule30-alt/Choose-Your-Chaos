'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Flame, AlertCircle } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/play'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!email.trim()) {
      setErrorMsg('That email doesn’t look quite right.')
      return
    }

    if (!password) {
      setErrorMsg('Password is required to enter the chaos.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        if (
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid credentials')
        ) {
          setErrorMsg("Those credentials didn't survive the chaos. 💀")
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMsg('Please confirm your email address to enter the chaos.')
        } else {
          setErrorMsg(error.message)
        }
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch {
      setErrorMsg("An unexpected glitch occurred in the chaos. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl -z-10" />

      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-neutral-800/80 rounded-2xl border border-neutral-700 mb-3 shadow-inner">
          <Flame className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">WELCOME BACK</h1>
        <p className="text-sm text-neutral-400 mt-1">Ready to embrace more chaos?</p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-red-950/50 border border-red-800/70 rounded-xl text-red-300 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
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
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
              Password
            </label>
          </div>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black tracking-wide rounded-xl shadow-lg shadow-yellow-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
        >
          {loading ? 'ENTERING THE CHAOS... 💀' : 'LOGIN TO CHAOS'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-400">
        New to the game?{' '}
        <Link href="/signup" className="text-yellow-400 hover:underline font-bold">
          Create your Chaos ID
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-neutral-400">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
