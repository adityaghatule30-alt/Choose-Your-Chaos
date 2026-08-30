'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getLevelFromXP } from '@/lib/progression'
import {
  Flame,
  User as UserIcon,
  LogOut,
  Settings,
  Play,
  ShieldAlert,
  Sparkles,
  Users,
  Trophy,
  Award,
} from 'lucide-react'

export function Navbar() {
  const { user, profile, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setLoggingOut(true)
      await signOut()
      router.push('/login')
      router.refresh()
    } finally {
      setLoggingOut(false)
      setMenuOpen(false)
    }
  }

  const levelInfo = getLevelFromXP(profile?.xp || 0)

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-neutral-950/80 border-b border-neutral-800 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            CHOOSE YOUR <span className="text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]">CHAOS</span>
          </span>
          <Flame className="w-6 h-6 text-red-500 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold tracking-wide text-neutral-300">
          <Link href="/play" className="hover:text-yellow-400 transition-colors flex items-center gap-1.5">
            <Play className="w-4 h-4 text-yellow-400" /> Either / Or
          </Link>
          <Link href="/truth-or-dare" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" /> Truth & Dare
          </Link>
          <Link href="/judge-me" className="hover:text-red-400 transition-colors flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" /> Judge Me
          </Link>
          <Link href="/rooms" className="hover:text-pink-400 transition-colors flex items-center gap-1.5">
            <Users className="w-4 h-4 text-pink-400" /> Rooms
          </Link>
          <Link href="/leaderboard" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" /> Rankings
          </Link>
        </div>

        {/* Auth CTA / User Controls */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-24 bg-neutral-800 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-full py-1.5 px-3 transition-all duration-200 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 to-red-500 flex items-center justify-center font-bold text-xs text-neutral-950 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (profile?.username?.[0] || user.email?.[0] || 'U').toUpperCase()
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">
                    {profile?.username || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-yellow-400 font-medium">
                    LVL {levelInfo.level} • {profile?.xp || 0} XP
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 text-sm">
                  <div className="px-3 py-2 border-b border-neutral-800 mb-1">
                    <div className="font-bold text-white truncate">
                      {profile?.display_name || profile?.username || 'Chaos Agent'}
                    </div>
                    <div className="text-xs text-neutral-400 truncate">{user.email}</div>
                    <div className="mt-2 flex items-center justify-between text-xs bg-neutral-950 p-2 rounded border border-neutral-800">
                      <span className="text-neutral-400">Chaos Score:</span>
                      <span className="font-bold text-red-400">{profile?.chaos_score || 0} 🔥</span>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-yellow-400" />
                    Profile
                  </Link>

                  <Link
                    href="/achievements"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Award className="w-4 h-4 text-purple-400" />
                    Achievements
                  </Link>

                  <Link
                    href="/leaderboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Leaderboard
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-neutral-400" />
                    Settings
                  </Link>

                  <div className="h-px bg-neutral-800 my-1" />

                  <button
                    onClick={handleSignOut}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors font-medium text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    {loggingOut ? 'ESCAPING THE CHAOS...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-bold text-neutral-300 hover:text-white px-3 py-2 transition-colors"
              >
                LOGIN
              </Link>
              <Link
                href="/signup"
                className="text-sm font-bold bg-yellow-400 hover:bg-yellow-300 text-neutral-950 px-4 py-2 rounded-lg transition-all transform hover:scale-105 duration-200 shadow-md shadow-yellow-500/20"
              >
                SIGN UP
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
