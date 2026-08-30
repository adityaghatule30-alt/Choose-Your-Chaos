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
    const { question_id, room_id } = body

    const { data: room, error: roomErr } = await supabase
      .from('spotlight_rooms')
      .select('current_spotlight_user_id, skips_remaining')
      .eq('id', room_id)
      .single()

    if (roomErr || !room) {
      return NextResponse.json({ success: false, message: 'Room not found.' }, { status: 404 })
    }

    if (room.current_spotlight_user_id !== user.id) {
      return NextResponse.json({ success: false, message: 'Only spotlight player can skip.' }, { status: 403 })
    }

    if (room.skips_remaining <= 0) {
      return NextResponse.json({ success: false, message: 'No skips remaining! You must answer. 💀' }, { status: 400 })
    }

    // Decrement room skips
    await supabase
      .from('spotlight_rooms')
      .update({
        skips_remaining: room.skips_remaining - 1,
      })
      .eq('id', room_id)

    // Mark question as skipped
    const { data: updatedQ, error } = await supabase
      .from('spotlight_questions')
      .update({
        status: 'skipped',
        answer: '💀 Used a skip! The allegations remain unanswered.',
      })
      .eq('id', question_id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, question: updatedQ, skips_remaining: room.skips_remaining - 1 })
  } catch (err) {
    console.error('Error skipping question:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
