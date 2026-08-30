import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_REACTIONS = ['😂', '💀', '😭', '🔥', '🤨']

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
    const { comment_id, reaction } = body

    if (!comment_id || !ALLOWED_REACTIONS.includes(reaction)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_REACTION', message: 'Allowed reactions: 😂, 💀, 😭, 🔥, 🤨' },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from('judge_reactions')
      .select('id')
      .eq('comment_id', comment_id)
      .eq('user_id', user.id)
      .eq('reaction', reaction)
      .maybeSingle()

    if (existing) {
      await supabase.from('judge_reactions').delete().eq('id', existing.id)
      return NextResponse.json({ success: true, action: 'removed' })
    } else {
      const { error } = await supabase.from('judge_reactions').insert({
        comment_id,
        user_id: user.id,
        reaction,
      })

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: 'added', xp_awarded: 1 })
    }
  } catch {
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}
