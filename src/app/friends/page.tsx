'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { FriendProfile } from '@/types/social'
import { Avatar } from '@/components/Avatar'
import { ChatBox } from '@/components/social/ChatBox'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  MessageSquare,
  UserPlus,
  Check,
  X,
  Flame,
  ArrowRight,
  Sparkles,
  Gamepad2,
} from 'lucide-react'

export default function FriendsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [friends, setFriends] = useState<FriendProfile[]>([])
  const [incoming, setIncoming] = useState<FriendProfile[]>([])
  const [outgoing, setOutgoing] = useState<FriendProfile[]>([])
  const [activeChatFriend, setActiveChatFriend] = useState<FriendProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadFriendsData = useCallback(async () => {
    try {
      const res = await fetch('/api/friends')
      const data = await res.json()
      if (data.friends) setFriends(data.friends)
      if (data.pending_incoming) setIncoming(data.pending_incoming)
      if (data.pending_outgoing) setOutgoing(data.pending_outgoing)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirectTo=/friends')
      return
    }

    if (user) {
      loadFriendsData()

      const supabase = createClient()
      const channel = supabase
        .channel('user_friendships_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
          loadFriendsData()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, isLoading, router, loadFriendsData])

  const handleAccept = async (friendshipId?: string) => {
    if (!friendshipId) return
    await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept', friendship_id: friendshipId }),
    })
    loadFriendsData()
  }

  const handleDecline = async (friendshipId?: string) => {
    if (!friendshipId) return
    await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'decline', friendship_id: friendshipId }),
    })
    loadFriendsData()
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Flame className="w-10 h-10 text-yellow-400 animate-bounce" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/60 border border-purple-800 rounded-full text-xs font-black text-purple-400 uppercase tracking-widest mb-2 shadow-inner">
            <Users className="w-3.5 h-3.5" /> Chaos Squad
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            FRIENDS & DIRECT MESSAGES
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Connect with friends, chat in realtime, and host party matches.</p>
        </div>

        <Link
          href="/rooms/create"
          className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2 cursor-pointer active-press"
        >
          <Gamepad2 className="w-4 h-4" /> HOST SQUAD MATCH
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Requests & Friends List */}
        <div className={activeChatFriend ? 'lg:col-span-6' : 'lg:col-span-12'}>
          {/* Pending Requests */}
          {incoming.length > 0 && (
            <div className="bg-neutral-900 border border-purple-500/40 rounded-3xl p-5 mb-6 shadow-xl animate-pop-in">
              <span className="text-xs font-black uppercase text-purple-400 tracking-wider block mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Pending Requests ({incoming.length})
              </span>
              <div className="space-y-3">
                {incoming.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={req.avatar_url} fallback={req.username || 'U'} size="sm" />
                      <div>
                        <div className="text-xs font-black text-white">{req.display_name}</div>
                        <div className="text-[10px] text-neutral-400">@{req.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(req.friendship_id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1 transition-all shadow"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleDecline(req.friendship_id)}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                YOUR SQUAD ({friends.length})
              </span>
            </div>

            {friends.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Users className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                <h3 className="text-sm font-black text-white">Your chaos squad is empty.</h3>
                <p className="text-xs text-neutral-400 mt-1 mb-4">
                  Add friends from their public profile or invite players to a multiplayer match!
                </p>
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-950 border border-neutral-800 text-yellow-400 font-black text-xs rounded-xl hover:border-yellow-400/60 transition-all shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" /> EXPLORE LEADERBOARD
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {friends.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-2xl flex items-center justify-between transition-all group"
                  >
                    <Link
                      href={`/user/${f.username}`}
                      className="flex items-center gap-3 min-w-0"
                    >
                      <Avatar src={f.avatar_url} fallback={f.username || 'F'} size="md" />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white group-hover:text-yellow-400 transition-colors truncate">
                          {f.display_name}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">@{f.username}</div>
                      </div>
                    </Link>

                    <button
                      onClick={() => setActiveChatFriend(f)}
                      className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> CHAT
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Box */}
        {activeChatFriend && (
          <div className="lg:col-span-6">
            <ChatBox
              friend={activeChatFriend}
              onClose={() => setActiveChatFriend(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
