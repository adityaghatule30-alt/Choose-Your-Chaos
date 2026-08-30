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
    const { item_id, session_id } = body

    if (!item_id) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT', message: 'Item ID is required.' },
        { status: 400 }
      )
    }

    // Call trusted Supabase RPC function complete_truth_dare
    const { data, error } = await supabase.rpc('complete_truth_dare', {
      p_item_id: item_id,
      p_session_id: session_id || null,
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: 'RPC_ERROR', message: "That completion didn't stick. Try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: "That completion didn't stick. Try again." },
      { status: 500 }
    )
  }
}
