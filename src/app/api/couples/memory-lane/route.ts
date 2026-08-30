import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRandomChaosAIComment } from '@/lib/services/chaos-ai'

const MEMORY_QUESTIONS = [
  "Where was our very first date or real hangout?",
  "Who said 'I love you' or made the first move first?",
  "What is the most chaotic outfit your partner has ever worn?",
  "What food order does your partner ALWAYS get without fail?",
  "What is the funniest argument you two have ever had?",
  "Who takes longer to get ready before leaving the house?",
  "What song immediately reminds you of your partner?",
  "What is your partner's ultimate comfort movie or show?",
]

export async function GET() {
  const randomQ = MEMORY_QUESTIONS[Math.floor(Math.random() * MEMORY_QUESTIONS.length)]
  return NextResponse.json({ question: randomQ })
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

    const body = await request.json()
    const { player1_answer, player2_answer, question } = body

    if (!player1_answer || !player2_answer) {
      return NextResponse.json({ success: false, message: 'Both answers are required.' }, { status: 400 })
    }

    const clean1 = player1_answer.trim().toLowerCase()
    const clean2 = player2_answer.trim().toLowerCase()

    // Fuzzy match check (same or one contains the other)
    const isMatch = clean1 === clean2 || clean1.includes(clean2) || clean2.includes(clean1)

    // Award XP
    const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
    if (profile) {
      await supabase
        .from('profiles')
        .update({ xp: (profile.xp || 0) + (isMatch ? 15 : 5) })
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      isMatch,
      scoreAwarded: isMatch ? 15 : 5,
      chaosAi: getRandomChaosAIComment(),
    })
  } catch (err) {
    console.error('Error in memory lane:', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
