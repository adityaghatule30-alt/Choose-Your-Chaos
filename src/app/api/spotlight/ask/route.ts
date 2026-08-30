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
    const { room_id, question } = body

    if (!room_id || !question || question.trim().length < 3 || question.trim().length > 300) {
      return NextResponse.json(
        { success: false, message: 'Question must be between 3 and 300 characters.' },
        { status: 400 }
      )
    }

    const { data: room } = await supabase
      .from('spotlight_rooms')
      .select('current_spotlight_user_id, status')
      .eq('id', room_id)
      .single()

    if (!room || room.status !== 'questioning') {
      return NextResponse.json({ success: false, message: 'Room is not in questioning state.' }, { status: 400 })
    }

    if (room.current_spotlight_user_id === user.id) {
      return NextResponse.json(
        { success: false, message: 'You cannot ask questions to yourself while in the spotlight! 💀' },
        { status: 400 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .single()

    const askerName = profile?.display_name || profile?.username || 'Agent'

    const { data: newQ, error } = await supabase
      .from('spotlight_questions')
      .insert({
        room_id,
        asker_id: user.id,
        asker_name: askerName,
        spotlight_user_id: room.current_spotlight_user_id,
        question: question.trim(),
        status: 'pending',
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, question: newQ })
  } catch (err) {
    console.error('Error asking spotlight question:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
