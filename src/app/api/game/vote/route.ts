import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateVoteReaction } from '@/lib/services/reactions'

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
    const { question_id, choice, session_id } = body

    if (!question_id || (choice !== 'A' && choice !== 'B')) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT', message: 'Valid question ID and choice (A/B) required.' },
        { status: 400 }
      )
    }

    // Call trusted Supabase RPC function submit_question_vote
    const { data, error } = await supabase.rpc('submit_question_vote', {
      p_question_id: question_id,
      p_choice: choice,
      p_session_id: session_id || null,
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: 'RPC_ERROR', message: 'Your choice got lost in the chaos. Try again.' },
        { status: 500 }
      )
    }

    if (!data.success) {
      return NextResponse.json(data)
    }

    // Fetch question details for contextual Chaos AI roast
    const { data: q } = await supabase
      .from('questions')
      .select('question, option_a, option_b')
      .eq('id', question_id)
      .single()

    const chosenPercent = choice === 'A' ? data.stats.percent_a : data.stats.percent_b

    // Generate contextual funny reaction using Gemini AI with fallback
    let reaction = ''
    if (q) {
      const { generateChaosAIRoast } = await import('@/lib/services/chaos-ai')
      reaction = await generateChaosAIRoast({
        situation: q.question,
        optionA: q.option_a,
        optionB: q.option_b,
        choice,
        percentChosen: chosenPercent,
        playerName: user.user_metadata?.display_name || user.email?.split('@')[0],
      })
    } else {
      reaction = generateVoteReaction({ choice, percentChosen: chosenPercent })
    }

    return NextResponse.json({
      ...data,
      reaction,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Chaos temporarily malfunctioned. 💀' },
      { status: 500 }
    )
  }
}
