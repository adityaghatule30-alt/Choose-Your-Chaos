import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchEligibleQuestion } from '@/lib/services/questions'

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
    const excludeIds = Array.isArray(body.excludeIds) ? body.excludeIds : []

    const question = await fetchEligibleQuestion(supabase, user.id, excludeIds)

    if (!question) {
      return NextResponse.json({
        empty: true,
        message: 'No more chaos for now. 😭',
      })
    }

    return NextResponse.json({ question })
  } catch {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Chaos temporarily malfunctioned. 💀' },
      { status: 500 }
    )
  }
}
