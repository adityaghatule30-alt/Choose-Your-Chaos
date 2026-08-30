import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRandomChaosAIComment, shouldTriggerChaosAI } from '@/lib/services/chaos-ai'

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
    const { question_id, answer } = body

    if (!question_id || !answer || answer.trim().length < 1 || answer.trim().length > 500) {
      return NextResponse.json(
        { success: false, message: 'Answer must be between 1 and 500 characters.' },
        { status: 400 }
      )
    }

    const { data: q, error: qErr } = await supabase
      .from('spotlight_questions')
      .select('spotlight_user_id, status')
      .eq('id', question_id)
      .single()

    if (qErr || !q) {
      return NextResponse.json({ success: false, message: 'Question not found.' }, { status: 404 })
    }

    if (q.spotlight_user_id !== user.id) {
      return NextResponse.json({ success: false, message: 'Only the spotlight player can answer.' }, { status: 403 })
    }

    const chaosAiComment = shouldTriggerChaosAI() ? getRandomChaosAIComment() : null

    const { data: updatedQ, error } = await supabase
      .from('spotlight_questions')
      .update({
        answer: answer.trim(),
        status: 'answered',
        chaos_ai_comment: chaosAiComment,
      })
      .eq('id', question_id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, question: updatedQ })
  } catch (err) {
    console.error('Error answering spotlight question:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
