import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { JudgeComment } from '@/types/judge'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('case_id')

    if (!caseId) {
      return NextResponse.json({ error: 'INVALID_CASE_ID' }, { status: 400 })
    }

    // Fetch approved comments for this case
    const { data: comments, error } = await supabase
      .from('judge_comments')
      .select(`
        id, case_id, user_id, comment, status, created_at,
        profiles:user_id (id, username, display_name, avatar_url)
      `)
      .eq('case_id', caseId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching judge comments:', error)
      return NextResponse.json({ error: 'DB_ERROR', comments: [] }, { status: 500 })
    }

    const commentIds = (comments || []).map((c) => c.id)

    // Fetch reactions for these comments
    const { data: reactions } =
      commentIds.length > 0
        ? await supabase
            .from('judge_reactions')
            .select('comment_id, user_id, reaction')
            .in('comment_id', commentIds)
        : { data: [] }

    const formattedComments: JudgeComment[] = (comments || []).map((c) => {
      const commReactions = (reactions || []).filter((r) => r.comment_id === c.id)

      const reactions_count: Record<string, number> = {}
      for (const r of commReactions) {
        reactions_count[r.reaction] = (reactions_count[r.reaction] || 0) + 1
      }

      const user_reactions = user
        ? commReactions.filter((r) => r.user_id === user.id).map((r) => r.reaction)
        : []

      return {
        id: c.id,
        case_id: c.case_id,
        user_id: c.user_id,
        comment: c.comment,
        status: c.status,
        created_at: c.created_at,
        author: c.profiles as any,
        reactions_count,
        user_reactions,
      }
    })

    return NextResponse.json({ comments: formattedComments })
  } catch (err) {
    console.error('Judge comments GET failed:', err)
    return NextResponse.json({ error: 'SERVER_ERROR', comments: [] }, { status: 500 })
  }
}

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
      console.error('Error inserting judge comment:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      comment: newComment,
      xp_awarded: 2,
    })
  } catch (err) {
    console.error('Judge comments POST failed:', err)
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: "The jury's comment box is temporarily broken. 💀" },
      { status: 500 }
    )
  }
}
