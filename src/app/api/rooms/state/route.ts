import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Room, RoomRound } from '@/types/rooms'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.trim().toUpperCase()

    if (!code) {
      return NextResponse.json({ error: 'MISSING_CODE' }, { status: 400 })
    }

    // 1. Fetch room
    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single()

    if (error || !room) {
      return NextResponse.json({ error: 'ROOM_NOT_FOUND' }, { status: 404 })
    }

    // 2. Fetch room members
    const { data: members } = await supabase
      .from('room_members')
      .select(`
        id, room_id, user_id, display_name, score, is_host, joined_at, left_at,
        profiles:user_id (avatar_url, username)
      `)
      .eq('room_id', room.id)
      .is('left_at', null)
      .order('score', { ascending: false })

    const mappedMembers = (members || []).map((m: any) => ({
      id: m.id,
      room_id: m.room_id,
      user_id: m.user_id,
      display_name: m.display_name,
      score: m.score,
      is_host: m.is_host,
      joined_at: m.joined_at,
      left_at: m.left_at,
      avatar_url: m.profiles?.avatar_url,
      username: m.profiles?.username,
    }))

    // 3. Fetch current round data if playing or revealing
    let currentRoundData: RoomRound | null = null
    let userAnswer: 'A' | 'B' | null = null

    if (room.current_round > 0) {
      const { data: round } = await supabase
        .from('room_rounds')
        .select(`
          id, room_id, round_number, question_id, status, started_at, ended_at,
          questions:question_id (id, question, option_a, option_b, category_id)
        `)
        .eq('room_id', room.id)
        .eq('round_number', room.current_round)
        .single()

      if (round) {
        // Fetch answers count
        const { data: answers } = await supabase
          .from('room_answers')
          .select('user_id, answer')
          .eq('round_id', round.id)

        const totalAnswers = answers?.length || 0
        const ownAnswer = answers?.find((a) => a.user_id === user.id)?.answer as any
        userAnswer = ownAnswer || null

        let publicAnswers: any[] = []
        let stats = undefined

        // ONLY expose other players' answers during 'revealing' or 'completed'
        if (round.status === 'revealing' || round.status === 'completed') {
          const countA = answers?.filter((a) => a.answer === 'A').length || 0
          const countB = answers?.filter((a) => a.answer === 'B').length || 0
          stats = {
            count_a: countA,
            count_b: countB,
            total: totalAnswers,
            percent_a: totalAnswers > 0 ? Math.round((countA / totalAnswers) * 100) : 50,
            percent_b: totalAnswers > 0 ? 100 - Math.round((countA / totalAnswers) * 100) : 50,
          }

          publicAnswers = (answers || []).map((a) => {
            const member = mappedMembers.find((m) => m.user_id === a.user_id)
            return {
              user_id: a.user_id,
              display_name: member?.display_name || 'Player',
              answer: a.answer,
            }
          })
        }

        currentRoundData = {
          id: round.id,
          room_id: round.room_id,
          round_number: round.round_number,
          question_id: round.question_id,
          status: round.status,
          started_at: round.started_at,
          ended_at: round.ended_at,
          question: round.questions as any,
          answers_count: totalAnswers,
          answers: publicAnswers,
          stats,
        }
      }
    }

    const payload: Room = {
      id: room.id,
      code: room.code,
      name: room.name,
      host_id: room.host_id,
      status: room.status,
      max_players: room.max_players,
      current_round: room.current_round,
      total_rounds: room.total_rounds,
      created_at: room.created_at,
      started_at: room.started_at,
      ended_at: room.ended_at,
      members: mappedMembers,
      current_round_data: currentRoundData,
      user_answer: userAnswer,
      is_host: room.host_id === user.id,
    }

    return NextResponse.json({ room: payload })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
