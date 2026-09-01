import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Room, RoomRound } from '@/types/rooms'
import { GAME_PROMPTS } from '@/lib/games/prompts'

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
    let userAnswer: string | null = null
    let userVote: string | null = null

    if (room.current_round > 0) {
      const { data: round } = await supabase
        .from('room_rounds')
        .select(`
          id, room_id, round_number, question_id, status, target_user_id, imposter_user_id, prompt_data, started_at, ended_at,
          questions:question_id (id, question, option_a, option_b, category_id)
        `)
        .eq('room_id', room.id)
        .eq('round_number', room.current_round)
        .single()

      if (round) {
        // Fetch answers count & user's own answer
        const { data: answers } = await supabase
          .from('room_answers')
          .select('user_id, answer, metadata')
          .eq('round_id', round.id)

        const totalAnswers = answers?.length || 0
        const ownAnswerRecord = answers?.find((a) => a.user_id === user.id)
        userAnswer = ownAnswerRecord?.answer || null

        // Fetch user's own vote
        const { data: ownVoteRecord } = await supabase
          .from('room_votes')
          .select('target_id')
          .eq('round_id', round.id)
          .eq('voter_id', user.id)
          .maybeSingle()

        userVote = ownVoteRecord?.target_id || null

        // Resolve target user name if any
        const targetMember = mappedMembers.find((m) => m.user_id === round.target_user_id)

        // Resolve prompt data based on game_mode
        const gameMode = room.game_mode || 'either_or'
        let promptPayload: any = round.prompt_data || {}

        if (!promptPayload || Object.keys(promptPayload).length === 0) {
          const promptsList = (GAME_PROMPTS as any)[gameMode]
          if (promptsList && promptsList.length > 0) {
            const promptIndex = (round.round_number - 1) % promptsList.length
            promptPayload = promptsList[promptIndex]
          }
        }

        // Hide imposter identity unless revealing/completed or user is the imposter
        const isUserImposter = round.imposter_user_id === user.id
        const isRevealed = round.status === 'revealing' || round.status === 'completed'

        let publicAnswers: any[] = []
        let publicVotes: any[] = []
        let stats = undefined

        if (isRevealed) {
          // Fetch round votes
          const { data: votes } = await supabase
            .from('room_votes')
            .select('voter_id, target_id')
            .eq('round_id', round.id)

          publicVotes = (votes || []).map((v) => ({
            voter_id: v.voter_id,
            target_id: v.target_id,
          }))

          if (gameMode === 'either_or' || gameMode === 'mind_reader') {
            const countA = answers?.filter((a) => a.answer === 'A').length || 0
            const countB = answers?.filter((a) => a.answer === 'B').length || 0
            stats = {
              count_a: countA,
              count_b: countB,
              total: totalAnswers,
              percent_a: totalAnswers > 0 ? Math.round((countA / totalAnswers) * 100) : 50,
              percent_b: totalAnswers > 0 ? 100 - Math.round((countA / totalAnswers) * 100) : 50,
            }
          }

          publicAnswers = (answers || []).map((a) => {
            const member = mappedMembers.find((m) => m.user_id === a.user_id)
            return {
              user_id: a.user_id,
              display_name: member?.display_name || 'Player',
              answer: a.answer,
              metadata: a.metadata,
            }
          })
        } else if (gameMode === 'worst_answer' || gameMode === 'caption_chaos' || gameMode === 'guess_player' || gameMode === 'imposter' || gameMode === 'whos_lying') {
          // During voting stage, present answers anonymously without user IDs
          if (totalAnswers >= mappedMembers.length || round.status === 'active') {
            publicAnswers = (answers || []).map((a) => ({
              user_id: round.status === 'active' ? (a.user_id === user.id ? user.id : 'hidden') : a.user_id,
              display_name: 'Anonymous Player',
              answer: a.answer,
              metadata: a.metadata,
            }))
          }
        }

        currentRoundData = {
          id: round.id,
          room_id: round.room_id,
          round_number: round.round_number,
          question_id: round.question_id,
          status: round.status,
          started_at: round.started_at,
          ended_at: round.ended_at,
          prompt_data: promptPayload,
          target_user_id: round.target_user_id,
          target_user_name: targetMember?.display_name || 'Spotlight Target',
          is_imposter: isUserImposter,
          question: round.questions as any,
          answers_count: totalAnswers,
          answers: publicAnswers,
          votes: publicVotes,
          stats,
        }
      }
    }

    const payload: Room = {
      id: room.id,
      code: room.code,
      name: room.name,
      host_id: room.host_id,
      game_mode: room.game_mode || 'either_or',
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
      user_vote: userVote,
      is_host: room.host_id === user.id,
    }

    return NextResponse.json({ room: payload })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
