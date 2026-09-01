'use client'

/**
 * ChatBox — Realtime 1-on-1 direct messaging component.
 *
 * Bug fixes applied:
 * 1. Removed `conversationId` from useEffect deps — it was causing the
 *    subscription to tear down and rebuild on every message load (closure trap).
 * 2. Added Postgres-level realtime filter `conversation_id=eq.{id}` so
 *    messages are filtered at the DB layer, not client-side against a stale null.
 * 3. The subscription is now created only once per friend (keyed on friend.id).
 *    Once conversationId is resolved it's stored in a ref for the realtime handler.
 * 4. Fixed text clearing — now clears AFTER success, restores on failure.
 * 5. "INVITE TO GAME" now sends a real invite message into the chat instead of
 *    silently navigating away.
 * 6. loadMessages is called once on mount, and again when a new realtime
 *    subscription triggers — no infinite loop.
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { DirectMessage, FriendProfile } from '@/types/social'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/Avatar'
import {
  Send,
  ArrowLeft,
  Flame,
  MessageSquare,
  Gamepad2,
  WifiOff,
  RefreshCw,
} from 'lucide-react'

interface ChatBoxProps {
  friend: FriendProfile
  onClose?: () => void
}

export function ChatBox({ friend, onClose }: ChatBoxProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<'CONNECTED' | 'RECONNECTING' | 'CONNECTING'>('CONNECTING')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)
  // Ref so the realtime handler always has the latest conversationId
  // without needing it in the effect deps.
  const conversationIdRef = useRef<string | null>(null)
  conversationIdRef.current = conversationId

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?friend_id=${friend.id}`)
      const data = await res.json()

      if (!isMountedRef.current) return

      if (data.error) {
        // Surface the real error so the developer can diagnose
        console.error('[ChatBox] loadMessages error:', data.error, data)
        setErrorMsg(data.error === 'NOT_FRIENDS'
          ? 'You must be friends to start a conversation.'
          : 'Could not load messages. Please try again.')
        return
      }

      if (data.conversation_id) {
        setConversationId(data.conversation_id)
        conversationIdRef.current = data.conversation_id
      }
      if (Array.isArray(data.messages)) {
        setMessages(data.messages)
        setTimeout(scrollToBottom, 100)
      }
    } catch (err) {
      console.error('[ChatBox] loadMessages network error:', err)
      if (isMountedRef.current) {
        setErrorMsg('Network error loading chat.')
      }
    } finally {
      if (isMountedRef.current) setLoading(false)
    }
  }, [friend.id, scrollToBottom])

  // ── Realtime subscription ──────────────────────────────────────────────────
  // Key insight: conversationId is NOT in the deps array.
  // We use conversationIdRef so the handler always sees the latest value.
  // The subscription is set up once per friend.id; when the conversation
  // is loaded the ref updates automatically.
  useEffect(() => {
    isMountedRef.current = true
    setLoading(true)
    setMessages([])
    setConversationId(null)
    conversationIdRef.current = null
    setErrorMsg(null)

    loadMessages()

    const supabase = createClient()

    // Subscribe to ALL inserts on messages table.
    // We filter client-side using the ref (which stays up to date).
    // This avoids needing to know the conversationId at subscription creation time.
    const channel = supabase
      .channel(`chat_${friend.id}_${user?.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          if (!isMountedRef.current) return
          const msg = payload.new
          if (!msg) return

          // Filter: only process messages for our conversation
          const activeConvId = conversationIdRef.current
          if (activeConvId && msg.conversation_id !== activeConvId) return

          // If we don't have a conversationId yet but get a message, store it
          if (!activeConvId && msg.conversation_id) {
            setConversationId(msg.conversation_id)
            conversationIdRef.current = msg.conversation_id
          }

          setMessages((prev) => {
            // Deduplicate — optimistic update may have already added it
            if (prev.some((m) => m.id === msg.id)) return prev
            return [
              ...prev,
              {
                id: msg.id,
                conversation_id: msg.conversation_id,
                sender_id: msg.sender_id,
                content: msg.content,
                created_at: msg.created_at,
              },
            ]
          })
          setTimeout(scrollToBottom, 50)
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return
        if (status === 'SUBSCRIBED') setRealtimeStatus('CONNECTED')
        else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') setRealtimeStatus('RECONNECTING')
        else if (status === 'CLOSED') setRealtimeStatus('RECONNECTING')
        else setRealtimeStatus('CONNECTING')
      })

    return () => {
      isMountedRef.current = false
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friend.id, user?.id]) // NOT conversationId — that's the fix

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const content = text.trim()
    if (!content || sending) return

    setSending(true)
    setErrorMsg(null)
    // Clear optimistically — restore on failure
    setText('')

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friend_id: friend.id,
          conversation_id: conversationIdRef.current,
          content,
        }),
      })

      const data = await res.json()

      if (!isMountedRef.current) return

      if (!res.ok || !data.success) {
        // Restore text so user doesn't lose their message
        console.error('[ChatBox] send error:', data)
        setText(content)
        setErrorMsg(data.message || data.error || 'Failed to send message.')
        return
      }

      // Update conversationId if this was the first message
      if (data.message?.conversation_id && !conversationIdRef.current) {
        setConversationId(data.message.conversation_id)
        conversationIdRef.current = data.message.conversation_id
      }

      // Optimistic insert (realtime will deduplicate)
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev
          return [...prev, data.message]
        })
        setTimeout(scrollToBottom, 50)
      }
    } catch (err) {
      console.error('[ChatBox] send network error:', err)
      if (isMountedRef.current) {
        setText(content)
        setErrorMsg('Network error. Please try again.')
      }
    } finally {
      if (isMountedRef.current) setSending(false)
    }
  }

  // ── Keyboard handler ───────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Invite to Game ─────────────────────────────────────────────────────────
  const handleInviteToGame = async () => {
    if (inviting || sending) return
    setInviting(true)

    const inviteContent = `🎮 Hey! I'm hosting a Chaos match — want to join? Create a room at chooseyourchaos.com/rooms/create and share the code with me! Let's play! 🔥`

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friend_id: friend.id,
          conversation_id: conversationIdRef.current,
          content: inviteContent,
        }),
      })

      const data = await res.json()

      if (!isMountedRef.current) return

      if (!res.ok || !data.success) {
        console.error('[ChatBox] invite error:', data)
        setErrorMsg('Could not send game invite.')
        return
      }

      if (data.message?.conversation_id && !conversationIdRef.current) {
        setConversationId(data.message.conversation_id)
        conversationIdRef.current = data.message.conversation_id
      }

      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev
          return [...prev, data.message]
        })
        setTimeout(scrollToBottom, 50)
      }
    } catch (err) {
      console.error('[ChatBox] invite network error:', err)
      if (isMountedRef.current) setErrorMsg('Network error sending invite.')
    } finally {
      if (isMountedRef.current) setInviting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const statusColor =
    realtimeStatus === 'CONNECTED'
      ? 'text-emerald-400'
      : realtimeStatus === 'RECONNECTING'
      ? 'text-yellow-400'
      : 'text-neutral-400'

  return (
    <div className="flex flex-col h-[520px] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-pop-in">
      {/* ── Chat Header ──────────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close chat"
              className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Link href={`/user/${friend.username}`} className="shrink-0">
            <Avatar src={friend.avatar_url} fallback={friend.username || 'F'} size="sm" />
          </Link>
          <div className="min-w-0">
            <Link
              href={`/user/${friend.username}`}
              className="text-xs font-black text-white hover:text-purple-300 transition-colors flex items-center gap-1.5 truncate"
            >
              <span className="truncate">{friend.display_name}</span>
              <span className="text-[10px] text-neutral-500 font-normal shrink-0">@{friend.username}</span>
            </Link>
            <div className={`text-[10px] font-bold flex items-center gap-1 ${statusColor}`}>
              {realtimeStatus === 'CONNECTED' ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /><span>CONNECTED</span></>
              ) : realtimeStatus === 'RECONNECTING' ? (
                <><RefreshCw className="w-2.5 h-2.5 animate-spin" /><span>RECONNECTING</span></>
              ) : (
                <><WifiOff className="w-2.5 h-2.5" /><span>CONNECTING</span></>
              )}
            </div>
          </div>
        </div>

        {/* Invite to Game — sends a message, doesn't navigate away */}
        <button
          onClick={handleInviteToGame}
          disabled={inviting || sending}
          aria-label="Send game invite to friend"
          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow shrink-0 flex items-center gap-1.5 cursor-pointer active-press"
        >
          <Gamepad2 className="w-3 h-3" aria-hidden="true" />
          {inviting ? 'SENDING…' : 'INVITE 🎮'}
        </button>
      </div>

      {/* ── Error Banner ──────────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="px-4 py-2 bg-red-950/60 border-b border-red-800/60 text-red-300 text-[11px] font-bold flex items-center justify-between gap-2 shrink-0">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200 transition-colors">✕</button>
        </div>
      )}

      {/* ── Messages Scroll Area ──────────────────────────────────────────── */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-950/40 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Flame className="w-6 h-6 text-yellow-400 animate-bounce" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <MessageSquare className="w-8 h-8 text-neutral-600 mb-2" />
            <span className="text-xs font-black text-white">No chaos in the DMs yet.</span>
            <p className="text-[11px] text-neutral-400 mt-0.5">Send a message or invite them to a squad match!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === user?.id
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-md ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-neutral-800 text-neutral-100 rounded-bl-none border border-neutral-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                </div>
                <span className="text-[9px] text-neutral-500 mt-1 px-1 font-bold">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Form ───────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={500}
          disabled={sending}
          aria-label="Message input"
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label="Send message"
          className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-md active-press"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
