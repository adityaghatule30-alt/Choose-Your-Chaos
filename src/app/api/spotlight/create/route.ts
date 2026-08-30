import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username, avatar_url')
      .eq('id', user.id)
      .single()

    const displayName = profile?.display_name || profile?.username || 'Host'

    let code = generateRoomCode()
    let attempts = 0
    let createdRoom = null

    while (!createdRoom && attempts < 5) {
      const { data: room, error } = await supabase
        .from('spotlight_rooms')
        .insert({
          code,
          host_id: user.id,
          status: 'lobby',
          skips_remaining: 2,
        })
        .select('id, code')
        .single()

      if (!error && room) {
        createdRoom = room
      } else {
        code = generateRoomCode()
        attempts++
      }
    }

    if (!createdRoom) {
      return NextResponse.json({ success: false, message: 'Failed to create room code. Try again.' }, { status: 500 })
    }

    // Add host as member
    await supabase.from('spotlight_members').insert({
      room_id: createdRoom.id,
      user_id: user.id,
      display_name: displayName,
      avatar_url: profile?.avatar_url || null,
      is_host: true,
    })

    return NextResponse.json({ success: true, code: createdRoom.code, room_id: createdRoom.id })
  } catch (err) {
    console.error('Error creating spotlight room:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
