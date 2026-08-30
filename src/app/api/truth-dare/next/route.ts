import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { selectActiveTruthDare } from '@/lib/content/truth-dare-selector'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const type = body.type === 'dare' ? 'dare' : 'truth'
    const difficulty = ['easy', 'medium', 'chaos'].includes(body.difficulty)
      ? body.difficulty
      : undefined
    const excludeIds = Array.isArray(body.excludeIds) ? body.excludeIds : []

    const item = await selectActiveTruthDare(supabase, user.id, {
      type,
      difficulty,
      excludeIds,
    })

    if (!item) {
      return NextResponse.json({
        empty: true,
        message: 'Chaos is temporarily out of this one. 💀',
      })
    }

    return NextResponse.json({ item })
  } catch {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Chaos servers are having a moment. Try again. 😭' },
      { status: 500 }
    )
  }
}
