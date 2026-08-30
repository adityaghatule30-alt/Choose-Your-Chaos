'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Flame, Lock, Mail, User, Sparkles, AlertCircle, Check } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !username) return

    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            display_name: username.trim(),
            avatar_url: '/avatars/avatar-01.png',
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErrorMsg('An account with this email already exists.')
        } else {
          setErrorMsg(error.message || 'Could not create account.')
        }
      } else {
        setSuccessMsg('Account created! Welcome to Choose Your Chaos.')
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1200)
      }
    } catch {
      setErrorMsg('Failed to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-lg bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl animate-pop-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 p-0.5 mx-auto mb-4 shadow-xl shadow-purple-600/30 animate-spotlight-glow">
            <div className="w-full h-full bg-neutral-950 rounded-[22px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-yellow-400" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            CREATE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">CHAOS IDENTITY</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-2 font-medium">
            Join the multiplayer arena and claim your squad rank. 💀
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-emerald-300 text-xs flex items-center gap-2.5 animate-bounce">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
              Chaos Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="AgentChaos"
                maxLength={20}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chaosagent@example.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                minLength={6}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-400 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-600/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'CREATING AGENT...' : 'CREATE IDENTITY & PLAY 🚀'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center">
          <p className="text-xs text-neutral-400">
            Already have a Chaos account?{' '}
            <Link href="/login" className="text-yellow-400 hover:underline font-bold">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
