'use client'

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
  Sparkles,
  WifiOff,
  CheckCircle2,
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
  const [loading, setLoading] = useState(true)
  const [realtimeStatus, setRealtimeStatus] = useState<'CONNECTED' | 'RECONNECTING'>('CONNECTED')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?friend_id=${friend.id}`)
      const data = await res.json()

      if (!isMountedRef.current) return

      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }
      if (data.messages) {
        setMessages(data.messages)
        setTimeout(scrollToBottom, 100)
      }
    } finally {
      if (isMountedRef.current) setLoading(false)
    }
  }, [friend.id])

  useEffect(() => {
    isMountedRef.current = true
    loadMessages()

    const supabase = createClient()
    const channel = supabase
      .channel(`chat_${friend.id}_${user?.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        if (payload.new && (!conversationId || payload.new.conversation_id === conversationId)) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [
              ...prev,
              {
                id: payload.new.id,
                conversation_id: payload.new.conversation_id,
                sender_id: payload.new.sender_id,
                content: payload.new.content,
                created_at: payload.new.created_at,
              },
            ]
          })
          setTimeout(scrollToBottom, 50)
        }
      })
      .subscribe((status) => {
        if (!isMountedRef.current) return
        if (status === 'SUBSCRIBED') setRealtimeStatus('CONNECTED')
        else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') setRealtimeStatus('RECONNECTING')
      })

    return () => {
      isMountedRef.current = false
      supabase.removeChannel(channel)
    }
  }, [friend.id, user?.id, conversationId, loadMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || sending) return

    const content = text.trim()
    setText('')
    setSending(true)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friend_id: friend.id,
          conversation_id: conversationId,
          content,
        }),
      })

      const data = await res.json()
      if (data.success && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev
          return [...prev, data.message]
        })
        setTimeout(scrollToBottom, 50)
      }
    } finally {
      if (isMountedRef.current) setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[520px] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-pop-in">
      {/* Chat Header */}
      <div className="px-5 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Avatar
            src={friend.avatar_url}
            fallback={friend.username || 'F'}
            size="sm"
          />
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{friend.display_name}</span>
              <span className="text-[10px] text-neutral-400">@{friend.username}</span>
            </div>
            <div className="text-[10px] font-bold flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{realtimeStatus}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/rooms/create`}
          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow"
        >
          INVITE TO GAME 🎮
        </Link>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-950/40">
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
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-md ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-neutral-800 text-neutral-100 rounded-bl-none border border-neutral-750'
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

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          maxLength={500}
          disabled={sending}
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
