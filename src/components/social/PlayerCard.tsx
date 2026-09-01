'use client'

/**
 * PlayerCard — Reusable player card for multiplayer lobby and game screens.
 *
 * Layout:
 *  ┌───────────────────────────────────────────────┐
 *  │  [Link to /user/username]  │  HOST badge       │
 *  │  Avatar  Name   YOU        │  (not in link)    │
 *  │          Role label        │                   │
 *  └───────────────────────────────────────────────┘
 *
 * The avatar + name region is a Next.js <Link>. The HOST badge and any
 * action buttons are rendered outside the link to avoid nested interactive
 * elements and accidental navigation.
 *
 * Security: no auth actions here — profile link is read-only navigation.
 * Friendship / chat actions live on the public profile page itself.
 */

import Link from 'next/link'
import { Crown } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { RoomMember } from '@/types/rooms'

interface PlayerCardProps {
  member: RoomMember
  isCurrentUser: boolean
  /** 'lobby' = standard padding card; 'game' = compact scoreboard row */
  variant?: 'lobby' | 'game'
}

export function PlayerCard({ member, isCurrentUser, variant = 'lobby' }: PlayerCardProps) {
  const profileHref = member.username ? `/user/${member.username}` : undefined
  const roleLabel = member.is_host ? 'Lobby Creator' : 'Chaos Agent'

  if (variant === 'game') {
    // Compact row for game scoreboard / player list
    return (
      <div
        className={`flex items-center justify-between py-2 px-3 rounded-xl border transition-all duration-200 ${
          isCurrentUser
            ? 'bg-purple-950/30 border-purple-500/40'
            : 'bg-neutral-950/60 border-neutral-800'
        }`}
      >
        {/* Clickable identity */}
        {profileHref ? (
          <Link
            href={profileHref}
            className="flex items-center gap-2.5 min-w-0 flex-1 group cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-label={`View ${member.display_name}'s profile`}
          >
            <Avatar src={member.avatar_url} fallback={member.display_name || 'A'} size="xs" glow={member.is_host} />
            <div className="min-w-0">
              <div className="text-xs font-black text-white group-hover:text-purple-300 transition-colors truncate flex items-center gap-1.5">
                {member.display_name}
                {isCurrentUser && (
                  <span className="text-[8px] font-black text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800 leading-none">
                    YOU
                  </span>
                )}
              </div>
              <div className="text-[10px] text-neutral-500 font-bold">{member.score ?? 0} pts</div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Avatar src={member.avatar_url} fallback={member.display_name || 'A'} size="xs" glow={member.is_host} />
            <div className="min-w-0">
              <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                {member.display_name}
                {isCurrentUser && (
                  <span className="text-[8px] font-black text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800 leading-none">
                    YOU
                  </span>
                )}
              </div>
              <div className="text-[10px] text-neutral-500 font-bold">{member.score ?? 0} pts</div>
            </div>
          </div>
        )}

        {/* HOST badge — outside link */}
        {member.is_host && (
          <span className="ml-2 px-2 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[9px] font-black rounded-full flex items-center gap-1 shrink-0 shadow-sm">
            <Crown className="w-2.5 h-2.5 fill-current" /> HOST
          </span>
        )}
      </div>
    )
  }

  // ── Lobby variant ─────────────────────────────────────────────────────────
  return (
    <div
      className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-200 shadow-md group ${
        isCurrentUser
          ? 'bg-purple-950/30 border-purple-500/50 ring-1 ring-purple-500/20'
          : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950/90'
      }`}
    >
      {/* Clickable identity area — avatar + name + role */}
      {profileHref ? (
        <Link
          href={profileHref}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-xl"
          aria-label={`View ${member.display_name}'s public profile`}
        >
          {/* Avatar with optional glow for host */}
          <div className="transition-transform duration-150 group-hover:scale-105 shrink-0">
            <Avatar
              src={member.avatar_url}
              fallback={member.display_name || 'Agent'}
              size="sm"
              glow={member.is_host}
            />
          </div>

          {/* Name + role */}
          <div className="min-w-0">
            <div className="text-sm font-black truncate max-w-[140px] sm:max-w-[180px] flex items-center gap-1.5 transition-colors duration-150 text-white group-hover:text-purple-300">
              {member.display_name}
              {isCurrentUser && (
                <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800 leading-none">
                  YOU
                </span>
              )}
            </div>
            <div className="text-[10px] text-neutral-500 font-bold mt-0.5">
              {roleLabel}
              {member.username && (
                <span className="ml-1.5 text-neutral-600 font-medium">@{member.username}</span>
              )}
            </div>
          </div>
        </Link>
      ) : (
        /* Fallback when username is not available — non-clickable */
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar
            src={member.avatar_url}
            fallback={member.display_name || 'Agent'}
            size="sm"
            glow={member.is_host}
          />
          <div className="min-w-0">
            <div className="text-sm font-black text-white truncate max-w-[140px] sm:max-w-[180px] flex items-center gap-1.5">
              {member.display_name}
              {isCurrentUser && (
                <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800 leading-none">
                  YOU
                </span>
              )}
            </div>
            <div className="text-[10px] text-neutral-500 font-bold mt-0.5">{roleLabel}</div>
          </div>
        </div>
      )}

      {/* HOST badge — outside the clickable link */}
      {member.is_host && (
        <span className="ml-3 px-2.5 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-black rounded-full flex items-center gap-1 shrink-0 shadow-sm">
          <Crown className="w-3 h-3 fill-current" /> HOST
        </span>
      )}
    </div>
  )
}
