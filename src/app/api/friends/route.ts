import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FriendProfile } from '@/types/social'

// GET /api/friends - List all accepted friends & pending incoming/outgoing requests
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    // 1. Fetch all friendships involving the current user
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select(`
        id, user_id, friend_id, status, created_at,
        sender:user_id (id, username, display_name, avatar_url, xp, chaos_score, bio, socials),
        receiver:friend_id (id, username, display_name, avatar_url, xp, chaos_score, bio, socials)
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const acceptedFriends: FriendProfile[] = []
    const pendingIncoming: FriendProfile[] = []
    const pendingOutgoing: FriendProfile[] = []

    for (const f of friendships || []) {
      const isSender = f.user_id === user.id
      const targetData = isSender ? (f.receiver as any) : (f.sender as any)

      if (!targetData) continue

      const friendItem: FriendProfile = {
        id: targetData.id,
        username: targetData.username,
        display_name: targetData.display_name || targetData.username,
        avatar_url: targetData.avatar_url,
        bio: targetData.bio,
        xp: targetData.xp || 0,
        chaos_score: targetData.chaos_score || 0,
        socials: targetData.socials || {},
        friendship_id: f.id,
        created_at: f.created_at,
      }

      if (f.status === 'accepted') {
        friendItem.friendship_status = 'accepted'
        acceptedFriends.push(friendItem)
      } else if (f.status === 'pending') {
        if (isSender) {
          friendItem.friendship_status = 'pending_sent'
          pendingOutgoing.push(friendItem)
        } else {
          friendItem.friendship_status = 'pending_received'
          pendingIncoming.push(friendItem)
        }
      }
    }

    return NextResponse.json({
      friends: acceptedFriends,
      pending_incoming: pendingIncoming,
      pending_outgoing: pendingOutgoing,
    })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

// POST /api/friends - Send or respond to a friend request
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
    const { action, target_user_id, friendship_id } = body

    if (!action) {
      return NextResponse.json({ error: 'MISSING_ACTION' }, { status: 400 })
    }

    // 1. Send Friend Request
    if (action === 'send') {
      if (!target_user_id || target_user_id === user.id) {
        return NextResponse.json({ error: 'INVALID_TARGET', message: 'You cannot add yourself.' }, { status: 400 })
      }

      // Check existing relationship
      const { data: existing } = await supabase
        .from('friendships')
        .select('id, status, user_id')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${target_user_id}),and(user_id.eq.${target_user_id},friend_id.eq.${user.id})`)
        .maybeSingle()

      if (existing) {
        if (existing.status === 'accepted') {
          return NextResponse.json({ error: 'ALREADY_FRIENDS', message: 'You are already friends!' }, { status: 400 })
        }
        if (existing.status === 'pending') {
          if (existing.user_id === user.id) {
            return NextResponse.json({ error: 'REQUEST_ALREADY_SENT', message: 'Request already sent.' }, { status: 400 })
          } else {
            // Auto-accept if target already sent a request to user
            await supabase
              .from('friendships')
              .update({ status: 'accepted', updated_at: new Date().toISOString() })
              .eq('id', existing.id)
            return NextResponse.json({ success: true, status: 'accepted' })
          }
        }
      }

      const { data: newFriendship, error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: target_user_id,
          status: 'pending',
        })
        .select('id')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, status: 'pending_sent', friendship_id: newFriendship.id })
    }

    // 2. Accept Friend Request
    if (action === 'accept') {
      if (!friendship_id) return NextResponse.json({ error: 'MISSING_FRIENDSHIP_ID' }, { status: 400 })

      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendship_id)
        .eq('friend_id', user.id) // Only recipient can accept

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, status: 'accepted' })
    }

    // 3. Decline / Cancel / Remove Friend
    if (action === 'remove' || action === 'decline' || action === 'cancel') {
      if (!friendship_id && !target_user_id) {
        return NextResponse.json({ error: 'MISSING_PARAMS' }, { status: 400 })
      }

      let query = supabase.from('friendships').delete()

      if (friendship_id) {
        query = query.eq('id', friendship_id)
      } else if (target_user_id) {
        query = query.or(`and(user_id.eq.${user.id},friend_id.eq.${target_user_id}),and(user_id.eq.${target_user_id},friend_id.eq.${user.id})`)
      }

      const { error } = await query
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, status: 'none' })
    }

    return NextResponse.json({ error: 'UNKNOWN_ACTION' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
