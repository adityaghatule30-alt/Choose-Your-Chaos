import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ success: false, message: 'Room code is required.' }, { status: 400 })
    }

    const cleanCode = code.trim().toUpperCase()

    const { data: room, error: roomError } = await supabase
      .from('spotlight_rooms')
      .select('id, code, status')
      .eq('code', cleanCode)
      .maybeSingle()

    if (roomError || !room) {
      return NextResponse.json({ success: false, message: 'Room not found. Check code.' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username, avatar_url')
      .eq('id', user.id)
      .single()

    const displayName = profile?.display_name || profile?.username || 'Agent'

    // Upsert membership
    await supabase.from('spotlight_members').upsert(
      {
        room_id: room.id,
        user_id: user.id,
        display_name: displayName,
        avatar_url: profile?.avatar_url || null,
        is_host: false,
      },
      { onConflict: 'room_id,user_id' }
    )

    return NextResponse.json({ success: true, code: room.code, room_id: room.id })
  } catch (err) {
    console.error('Error joining spotlight room:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
