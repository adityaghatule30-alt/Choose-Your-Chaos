import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UserStats } from '@/types/progression'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const [
      eitherOrVotesRes,
      judgeVotesRes,
      roomsPlayedRes,
      truthDareAnswersRes,
    ] = await Promise.all([
      supabase.from('question_votes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('judge_votes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('room_members').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('game_session_answers').select('answer').eq('session_id', user.id),
    ])

    const eitherOrVotes = eitherOrVotesRes.count || 0
    const judgeVotes = judgeVotesRes.count || 0
    const roomsPlayed = roomsPlayedRes.count || 0

    // Fetch truth/dare completions from session answers
    const { data: sessionAnswers } = await supabase
      .from('game_sessions')
      .select('game_session_answers(answer)')
      .eq('user_id', user.id)

    let truthCount = 0
    let dareCount = 0

    if (sessionAnswers) {
      for (const s of sessionAnswers as any[]) {
        const answers = s.game_session_answers || []
        for (const a of answers) {
          if (a.answer?.startsWith('truth:')) truthCount++
          if (a.answer?.startsWith('dare:')) dareCount++
        }
      }
    }

    const stats: UserStats = {
      either_or_votes: eitherOrVotes,
      truth_completed: truthCount,
      dare_completed: dareCount,
      judge_votes: judgeVotes,
      rooms_played: roomsPlayed,
      total_games: eitherOrVotes + truthCount + dareCount + judgeVotes + roomsPlayed,
    }

    return NextResponse.json({ stats })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
