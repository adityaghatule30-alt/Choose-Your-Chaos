import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRandomMeme } from '@/lib/services/memes'

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
    const { room_id } = body

    if (!room_id) {
      return NextResponse.json({ success: false, error: 'MISSING_ROOM_ID' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('start_room_game', {
      p_room_id: room_id,
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (data?.success && data?.round_id && (data.game_mode === 'who_sent_this' || data.game_mode === 'caption_battle')) {
      try {
        const meme = await getRandomMeme([])
        await supabase
          .from('room_rounds')
          .update({ prompt_data: { meme } })
          .eq('id', data.round_id)
      } catch (err) {
        console.warn('[Rooms Start API] Failed to attach meme to round 1:', err)
      }
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}
