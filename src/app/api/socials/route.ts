import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/socials - Fetch public user profile and friendship status
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const userId = searchParams.get('user_id')

    let query = supabase.from('profiles').select('id, username, display_name, avatar_url, bio, xp, chaos_score, socials, created_at')

    if (username) {
      query = query.eq('username', username)
    } else if (userId) {
      query = query.eq('id', userId)
    } else if (user) {
      query = query.eq('id', user.id)
    } else {
      return NextResponse.json({ error: 'MISSING_USER_IDENTIFIER' }, { status: 400 })
    }

    const { data: profile, error } = await query.single()

    if (error || !profile) {
      return NextResponse.json({ error: 'PROFILE_NOT_FOUND' }, { status: 404 })
    }

    let friendshipStatus: string = 'none'
    let friendshipId: string | undefined = undefined

    if (user && user.id !== profile.id) {
      const { data: friendship } = await supabase
        .from('friendships')
        .select('id, status, user_id, friend_id')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${user.id})`)
        .maybeSingle()

      if (friendship) {
        friendshipId = friendship.id
        if (friendship.status === 'accepted') {
          friendshipStatus = 'accepted'
        } else if (friendship.status === 'pending') {
          friendshipStatus = friendship.user_id === user.id ? 'pending_sent' : 'pending_received'
        }
      }
    }

    return NextResponse.json({
      profile: {
        ...profile,
        friendship_status: friendshipStatus,
        friendship_id: friendshipId,
      },
      is_self: user?.id === profile.id,
    })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

// POST /api/socials - Update authenticated user's social links
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
    const { socials } = body

    if (!socials || typeof socials !== 'object') {
      return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 })
    }

    // Clean & normalize social links
    const cleanSocials: Record<string, string> = {}
    const allowedKeys = ['instagram', 'twitter', 'youtube', 'discord', 'github', 'linkedin', 'custom']

    for (const key of allowedKeys) {
      if (typeof socials[key] === 'string' && socials[key].trim().length > 0) {
        let val = socials[key].trim()
        // Strip out tracking params or dangerous schemes
        if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('@') || !val.includes('://')) {
          cleanSocials[key] = val.slice(0, 100)
        }
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ socials: cleanSocials, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, socials: cleanSocials })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
