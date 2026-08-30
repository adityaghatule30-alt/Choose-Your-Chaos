import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRandomChaosAIComment } from '@/lib/services/chaos-ai'

const COUPLE_CHAOS_QUESTIONS = [
  {
    question: "Who is more dramatic when they get sick?",
    optionA: "Partner 1 (You)",
    optionB: "Partner 2 (Them)",
  },
  {
    question: "Who is more likely to start a random 2:00 AM debate?",
    optionA: "Partner 1 (You)",
    optionB: "Partner 2 (Them)",
  },
  {
    question: "Who apologizes first after a silly disagreement?",
    optionA: "Partner 1 (You)",
    optionB: "Partner 2 (Them)",
  },
  {
    question: "Who is more likely to spend money on chaotic impulse buys?",
    optionA: "Partner 1 (You)",
    optionB: "Partner 2 (Them)",
  },
  {
    question: "Who would survive longer alone in an apocalyptic wasteland?",
    optionA: "Partner 1 (You)",
    optionB: "Partner 2 (Them)",
  },
  {
    question: "Who is the worse driver or backseat navigator?",
    optionA: "Partner 1 (You)",
    optionB: "Partner 2 (Them)",
  },
]

export async function GET() {
  const item = COUPLE_CHAOS_QUESTIONS[Math.floor(Math.random() * COUPLE_CHAOS_QUESTIONS.length)]
  return NextResponse.json({ item })
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
    const { choice1, choice2 } = body

    let verdict = 'INTERESTING...'
    let verdictEmoji = '👀'
    let alertType = 'neutral'

    if (choice1 === choice2) {
      verdict = 'SAME BRAIN CELL 🧠'
      verdictEmoji = '❤️'
      alertType = 'agreement'
    } else if (choice1 === 'Partner 2 (Them)' && choice2 === 'Partner 2 (Them)') {
      verdict = 'MUTUAL ACCUSATION DETECTED 🚨'
      verdictEmoji = '💀'
      alertType = 'accusation'
    } else {
      verdict = 'CHAOTIC SOULMATES'
      verdictEmoji = '😂'
      alertType = 'chaos'
    }

    const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
    if (profile) {
      await supabase
        .from('profiles')
        .update({ xp: (profile.xp || 0) + 10 })
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      verdict,
      verdictEmoji,
      alertType,
      chaosAi: getRandomChaosAIComment(),
    })
  } catch (err) {
    console.error('Error in couple chaos:', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
