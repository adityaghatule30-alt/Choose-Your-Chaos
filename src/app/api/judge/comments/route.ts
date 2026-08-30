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

    // Rate limit: 20 comments per minute per user
    const rateCheck = checkRateLimit(`comment:${user.id}`, 20, 60000)
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'RATE_LIMITED', message: `Too many comments. Please wait ${rateCheck.reset}s.` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { case_id, comment } = body

    if (!case_id || !comment || comment.trim().length < 2 || comment.trim().length > 500) {
      return NextResponse.json(
        { success: false, error: 'INVALID_COMMENT', message: 'Comment must be between 2 and 500 characters.' },
        { status: 400 }
      )
    }

    const { data: newComment, error } = await supabase
      .from('judge_comments')
      .insert({
        case_id,
        user_id: user.id,
        comment: comment.trim(),
        status: 'approved',
      })
      .select('id, comment, created_at')
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      comment: newComment,
      xp_awarded: 2,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: "The jury's comment box is temporarily broken. 💀" },
      { status: 500 }
    )
  }
}
