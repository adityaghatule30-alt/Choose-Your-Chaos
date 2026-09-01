'use client'

import { useState } from 'react'
import { UserPlus, UserCheck, Clock, Check, X, UserMinus, ShieldAlert } from 'lucide-react'
import { FriendshipStatus } from '@/types/social'

interface FriendActionButtonProps {
  targetUserId: string
  friendshipId?: string
  initialStatus: FriendshipStatus
  onStatusChange?: (newStatus: FriendshipStatus) => void
}

export function FriendActionButton({
  targetUserId,
  friendshipId,
  initialStatus,
  onStatusChange,
}: FriendActionButtonProps) {
  const [status, setStatus] = useState<FriendshipStatus>(initialStatus)
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'send' | 'accept' | 'decline' | 'remove' | 'cancel') => {
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          target_user_id: targetUserId,
          friendship_id: friendshipId,
        }),
      })

      const data = await res.json()
      if (data.success) {
        const nextStatus = data.status || (action === 'send' ? 'pending_sent' : action === 'accept' ? 'accepted' : 'none')
        setStatus(nextStatus)
        onStatusChange?.(nextStatus)
      }
    } finally {
      setLoading(false)
    }
  }

  if (status === 'accepted') {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled
          className="px-4 py-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-black text-xs rounded-xl flex items-center gap-1.5 shadow"
        >
          <UserCheck className="w-3.5 h-3.5" /> FRIENDS
        </button>
        <button
          onClick={() => handleAction('remove')}
          disabled={loading}
          title="Remove Friend"
          className="p-2 hover:bg-red-950/60 border border-neutral-800 hover:border-red-800 text-neutral-400 hover:text-red-400 rounded-xl transition-all"
        >
          <UserMinus className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  if (status === 'pending_sent') {
    return (
      <button
        onClick={() => handleAction('cancel')}
        disabled={loading}
        className="px-4 py-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow"
      >
        <Clock className="w-3.5 h-3.5 text-yellow-400" /> CANCEL REQUEST
      </button>
    )
  }

  if (status === 'pending_received') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAction('accept')}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
        >
          <Check className="w-3.5 h-3.5" /> ACCEPT
        </button>
        <button
          onClick={() => handleAction('decline')}
          disabled={loading}
          className="px-3 py-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => handleAction('send')}
      disabled={loading}
      className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-yellow-500/20 active-press cursor-pointer"
    >
      <UserPlus className="w-4 h-4" /> ADD FRIEND
    </button>
  )
}
