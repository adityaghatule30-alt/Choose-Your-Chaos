'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getLevelFromXP } from '@/lib/progression'
import { Avatar } from '@/components/Avatar'
import {
  Flame,
  User as UserIcon,
  LogOut,
  Settings,
  Gamepad2,
  Users,
  Heart,
  Trophy,
  Award,
  BookOpen,
  Info,
  Zap,
  Shield,
  Menu,
  X,
  Plus,
} from 'lucide-react'

export function Navbar() {
  const { user, profile, isLoading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
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
      setMobileNavOpen(false)
    }
  }

  const levelInfo = getLevelFromXP(profile?.xp || 0)

  const navLinks = [
    { href: '/', label: 'HOME', icon: Flame },
    { href: '/games', label: 'GAMES', icon: Gamepad2 },
    { href: '/rooms', label: 'ROOMS', icon: Users },
    { href: '/couples', label: 'COUPLES', icon: Heart },
    { href: '/leaderboard', label: 'RANKINGS', icon: Trophy },
    { href: '/profile', label: 'PROFILE', icon: UserIcon },
  ]

  const secondaryLinks = [
    { href: '/guide', label: 'GUIDE', icon: BookOpen },
    { href: '/about', label: 'ABOUT', icon: Info },
    { href: '/fuel', label: 'FUEL MADNESS 💸', icon: Zap },
  ]

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-neutral-950/85 border-b border-neutral-800/80 px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
              <Flame className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">CHAOS</span>
          </span>
        </Link>

        {/* Desktop Primary Nav Links */}
        <div className="hidden lg:flex items-center gap-1 bg-neutral-900/60 p-1 rounded-2xl border border-neutral-800/60 text-xs font-bold tracking-wider">
          {navLinks.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Auth CTA & User Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Fuel CTA for desktop */}
          <Link
            href="/fuel"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 rounded-xl text-xs font-black transition-all hover:scale-105"
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> FUEL 💸
          </Link>

          {isLoading ? (
            <div className="h-9 w-24 bg-neutral-800 animate-pulse rounded-2xl" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 rounded-full py-1 px-2.5 sm:px-3 transition-all cursor-pointer shadow-md"
              >
                <Avatar src={profile?.avatar_url} fallback={profile?.username || 'U'} size="sm" />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                    {profile?.display_name || profile?.username || 'Agent'}
                  </div>
                  <div className="text-[10px] text-yellow-400 font-bold">
                    LVL {levelInfo.level} • {profile?.xp || 0} XP
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-2 z-50 text-sm animate-pop-in">
                  <div className="px-3.5 py-2.5 border-b border-neutral-800 mb-1.5">
                    <div className="font-black text-white truncate text-sm">
                      {profile?.display_name || profile?.username || 'Chaos Agent'}
                    </div>
                    <div className="text-xs text-neutral-400 truncate">{user.email}</div>
                    <div className="mt-2 flex items-center justify-between text-xs bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                      <span className="text-neutral-400">Chaos Score:</span>
                      <span className="font-bold text-red-400">{profile?.chaos_score || 0} 🔥</span>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors font-semibold text-xs"
                  >
                    <UserIcon className="w-4 h-4 text-purple-400" /> My Profile
                  </Link>

                  <Link
                    href="/achievements"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors font-semibold text-xs"
                  >
                    <Award className="w-4 h-4 text-pink-400" /> Badges & Mugshots
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors font-semibold text-xs"
                  >
                    <Settings className="w-4 h-4 text-yellow-400" /> Choose Avatar & Edit Profile
                  </Link>

                  {profile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-950/40 rounded-xl transition-colors font-bold text-xs"
                    >
                      <Shield className="w-4 h-4" /> Admin Command
                    </Link>
                  )}

                  <div className="h-px bg-neutral-800 my-1" />

                  <button
                    onClick={handleSignOut}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition-colors font-bold text-xs text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    {loggingOut ? 'ESCAPING...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="text-xs font-bold text-neutral-300 hover:text-white px-3 py-2 transition-colors"
              >
                LOGIN
              </Link>
              <Link
                href="/signup"
                className="text-xs font-black bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-400 hover:opacity-90 text-white px-3.5 py-2 rounded-xl transition-all shadow-md shadow-purple-500/20"
              >
                SIGN UP
              </Link>
            </div>
          )}

          {/* Mobile Navigation Toggle Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileNavOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-neutral-800/80 space-y-2 animate-pop-in">
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-black flex items-center gap-2 ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs">
            {secondaryLinks.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                onClick={() => setMobileNavOpen(false)}
                className="text-neutral-400 hover:text-yellow-400 font-bold p-1"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
