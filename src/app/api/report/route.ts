import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    // Rate limit: 10 reports per minute per user
    const rateCheck = checkRateLimit(`report:${user.id}`, 10, 60000)
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'RATE_LIMITED', message: `Too many reports submitted. Please wait ${rateCheck.reset}s.` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { target_type, target_id, reason, details } = body

    if (!target_type || !target_id || !reason) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT', message: 'Target and reason are required.' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      target_type,
      target_id,
      reason,
      details: details?.trim() || null,
      status: 'pending',
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Report submitted for review.' })
  } catch {
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}
