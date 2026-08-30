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
    const { case_id, verdict } = body

    if (!case_id || !['not_guilty', 'guilty', 'criminal'].includes(verdict)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT', message: 'Valid case ID and verdict required.' },
        { status: 400 }
      )
    }

    // Execute trusted RPC function submit_judge_vote
    const { data, error } = await supabase.rpc('submit_judge_vote', {
      p_case_id: case_id,
      p_verdict: verdict,
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: 'RPC_ERROR', message: 'Your verdict got lost. Try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Your verdict got lost. Try again.' },
      { status: 500 }
    )
  }
}
