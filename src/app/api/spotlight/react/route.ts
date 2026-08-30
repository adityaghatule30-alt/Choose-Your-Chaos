import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_REACTIONS = ['😂', '💀', '👀', '🔥', '❤️']

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
    const { question_id, reaction } = body

    if (!question_id || !ALLOWED_REACTIONS.includes(reaction)) {
      return NextResponse.json({ success: false, message: 'Invalid reaction.' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('spotlight_reactions')
      .select('id')
      .eq('question_id', question_id)
      .eq('user_id', user.id)
      .eq('reaction', reaction)
      .maybeSingle()

    if (existing) {
      await supabase.from('spotlight_reactions').delete().eq('id', existing.id)
      return NextResponse.json({ success: true, action: 'removed' })
    } else {
      await supabase.from('spotlight_reactions').insert({
        question_id,
        user_id: user.id,
        reaction,
      })
      return NextResponse.json({ success: true, action: 'added' })
    }
  } catch (err) {
    console.error('Error toggling spotlight reaction:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
