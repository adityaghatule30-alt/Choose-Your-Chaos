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
    const code = body.code?.trim().toUpperCase()

    if (!code || code.length < 4) {
      return NextResponse.json(
        { success: false, error: 'INVALID_CODE', message: 'Please enter a valid room code.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.rpc('join_room_by_code', {
      p_code: code,
    })

    if (error) {
      return NextResponse.json({ success: false, error: 'RPC_ERROR', message: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}
