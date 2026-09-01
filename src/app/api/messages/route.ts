import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DirectMessage, ConversationSummary } from '@/types/social'

// GET /api/messages - Fetch conversation list or specific conversation messages
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')
    const friendId = searchParams.get('friend_id')

    // 1. Fetch specific conversation messages
    if (conversationId || friendId) {
      let activeConvId = conversationId

      if (!activeConvId && friendId) {
        const { data: convData, error: convErr } = await supabase.rpc('get_or_create_direct_conversation', {
          p_friend_id: friendId,
        })
        if (convErr) {
          console.error('[/api/messages GET] RPC error:', convErr)
          return NextResponse.json({ error: convErr.message }, { status: 500 })
        }
        if (!convData?.success) {
          console.error('[/api/messages GET] RPC failed:', convData)
          return NextResponse.json(
            { error: convData?.error || 'CONVERSATION_FAILED', message: convData?.message || 'Could not start conversation.' },
            { status: 400 }
          )
        }
        activeConvId = convData.conversation_id
      }

      // Fetch messages — join to profiles via the FK (messages.sender_id → profiles.id)
      const { data: messages, error: msgErr } = await supabase
        .from('messages')
        .select(`
          id, conversation_id, sender_id, content, created_at,
          profiles:sender_id (display_name, username, avatar_url)
        `)
        .eq('conversation_id', activeConvId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (msgErr) {
        console.error('[/api/messages GET] messages fetch error:', msgErr)
        return NextResponse.json({ error: msgErr.message }, { status: 500 })
      }

      // Update last read timestamp for the current user
      await supabase
        .from('conversation_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', activeConvId)
        .eq('user_id', user.id)

      const formattedMessages: DirectMessage[] = (messages || []).map((m: any) => ({
        id: m.id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_id,
        content: m.content,
        created_at: m.created_at,
        sender: m.profiles,
      }))

      return NextResponse.json({
        conversation_id: activeConvId,
        messages: formattedMessages,
      })
    }

    // 2. Fetch all active conversations for current user
    const { data: myMemberships, error: memErr } = await supabase
      .from('conversation_members')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id)

    if (memErr) {
      return NextResponse.json({ error: memErr.message }, { status: 500 })
    }

    const conversationIds = (myMemberships || []).map((m) => m.conversation_id)

    if (conversationIds.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    // Fetch conversation other members & last messages
    const { data: convMembers } = await supabase
      .from('conversation_members')
      .select(`
        conversation_id,
        profile:user_id (id, username, display_name, avatar_url, xp, chaos_score, bio)
      `)
      .in('conversation_id', conversationIds)
      .neq('user_id', user.id)

    const summaries: ConversationSummary[] = []

    for (const cm of convMembers || []) {
      const friendData = cm.profile as any
      if (!friendData) continue

      // Fetch last message for each conversation
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, created_at')
        .eq('conversation_id', cm.conversation_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      summaries.push({
        id: cm.conversation_id,
        friend: {
          id: friendData.id,
          username: friendData.username,
          display_name: friendData.display_name || friendData.username,
          avatar_url: friendData.avatar_url,
          bio: friendData.bio,
          xp: friendData.xp || 0,
          chaos_score: friendData.chaos_score || 0,
        },
        last_message: lastMsg || null,
        updated_at: lastMsg?.created_at || new Date().toISOString(),
      })
    }

    // Sort by most recent message
    summaries.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    return NextResponse.json({ conversations: summaries })
  } catch (err) {
    console.error('[/api/messages GET] unexpected error:', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

// POST /api/messages - Send a direct message
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const body = await request.json()
    const { conversation_id, friend_id, content } = body

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'INVALID_CONTENT', message: 'Message cannot be empty.' }, { status: 400 })
    }

    const cleanContent = content.trim().slice(0, 1000)

    let activeConvId = conversation_id

    if (!activeConvId && friend_id) {
      const { data: convData, error: convErr } = await supabase.rpc('get_or_create_direct_conversation', {
        p_friend_id: friend_id,
      })
      if (convErr) {
        console.error('[/api/messages POST] RPC error:', convErr)
        return NextResponse.json({ error: convErr.message }, { status: 500 })
      }
      if (!convData?.success) {
        console.error('[/api/messages POST] RPC failed:', convData)
        return NextResponse.json(
          { error: convData?.error || 'CONVERSATION_FAILED', message: convData?.message || 'Could not start conversation.' },
          { status: 400 }
        )
      }
      activeConvId = convData.conversation_id
    }

    if (!activeConvId) {
      return NextResponse.json({ error: 'MISSING_CONVERSATION_ID' }, { status: 400 })
    }

    // sender_id is always auth.uid() — never trusted from client body
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConvId,
        sender_id: user.id,
        content: cleanContent,
      })
      .select(`
        id, conversation_id, sender_id, content, created_at,
        profiles:sender_id (display_name, username, avatar_url)
      `)
      .single()

    if (msgError) {
      console.error('[/api/messages POST] insert error:', msgError)
      return NextResponse.json({ error: msgError.message, message: 'Failed to send message.' }, { status: 500 })
    }

    const formattedMessage: DirectMessage = {
      id: (message as any).id,
      conversation_id: (message as any).conversation_id,
      sender_id: (message as any).sender_id,
      content: (message as any).content,
      created_at: (message as any).created_at,
      sender: (message as any).profiles,
    }

    return NextResponse.json({ success: true, message: formattedMessage })
  } catch (err) {
    console.error('[/api/messages POST] unexpected error:', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
