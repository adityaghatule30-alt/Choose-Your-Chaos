import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyStaffRole, logAdminAudit } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user, isAuthorized } = await verifyStaffRole(supabase, 'moderator')
    if (!isAuthorized || !user) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const body = await request.json()
    const { question, option_a, option_b, category_id, difficulty, humor_level, language } = body

    if (!question || !option_a || !option_b) {
      return NextResponse.json({ error: 'INVALID_INPUT', message: 'Question, option A, and option B are required.' }, { status: 400 })
    }

    const { data: newQ, error } = await supabase.from('questions').insert({
      question: question.trim(),
      option_a: option_a.trim(),
      option_b: option_b.trim(),
      category_id: category_id || null,
      difficulty: difficulty || 'medium',
      humor_level: humor_level || 'light',
      language: language || 'en',
      source: 'curated',
      safety_status: 'approved',
      content_status: 'active',
      active: true,
      quality_score: 95,
      safety_score: 100,
    }).select('id').single()

    if (error) {
      return NextResponse.json({ error: 'DB_ERROR', message: error.message }, { status: 500 })
    }

    await logAdminAudit(supabase, user.id, 'create_question', 'questions', newQ.id)

    return NextResponse.json({ success: true, message: 'Question created and activated.' })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
