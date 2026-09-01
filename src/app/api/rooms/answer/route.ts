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
    const { round_id, answer, metadata } = body

    if (!round_id || !answer || typeof answer !== 'string') {
      return NextResponse.json({ success: false, error: 'INVALID_INPUT' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('submit_room_answer', {
      p_round_id: round_id,
      p_answer: answer.trim(),
      p_metadata: metadata || {},
    })

    if (error) {
      console.error('[Rooms API] submit_room_answer RPC error:', error)
      return NextResponse.json({ success: false, error: error.message, message: error.message }, { status: 500 })
    }

    if (!data.success) {
      console.warn('[Rooms API] submit_room_answer rejected:', data)
      return NextResponse.json(data, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[Rooms API] submit_room_answer server error:', err?.message || err)
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: 'Failed to record answer.' }, { status: 500 })
  }
}
