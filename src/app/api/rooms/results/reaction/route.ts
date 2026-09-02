import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMatchResultReaction } from '@/lib/services/chaos-ai'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomCode = searchParams.get('code')

    if (!roomCode) {
      return NextResponse.json({ success: false, error: 'MISSING_ROOM_CODE' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Fetch Room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, code, game_mode, status, total_rounds, current_round')
      .eq('code', roomCode.toUpperCase())
      .single()

    if (roomError || !room) {
      return NextResponse.json({ success: false, error: 'ROOM_NOT_FOUND' }, { status: 404 })
    }

    // 2. Fetch Members
    const { data: members } = await supabase
      .from('room_members')
      .select('user_id, display_name, score')
      .eq('room_id', room.id)
      .is('left_at', null)
      .order('score', { ascending: false })

    const playerScores = (members || []).map((m) => ({
      displayName: m.display_name || 'Player',
      score: m.score || 0,
    }))

    // 3. Fetch all completed rounds and answers
    const { data: rounds } = await supabase
      .from('room_rounds')
      .select(`
        id, round_number, target_user_id, status,
        room_answers (user_id, answer)
      `)
      .eq('room_id', room.id)
      .order('round_number', { ascending: true })

    const pickForMeStatsMap: Record<string, { correct: number; total: number }> = {}

    if (members) {
      for (const m of members) {
        pickForMeStatsMap[m.user_id] = { correct: 0, total: 0 }
      }
    }

    if (rounds) {
      for (const r of rounds) {
        const answers = (r.room_answers as any) || []
        if (answers.length >= 2 && room.game_mode === 'pick_for_me') {
          const targetAns = answers.find((a: any) => a.user_id === r.target_user_id)?.answer
          const predictorRecord = answers.find((a: any) => a.user_id !== r.target_user_id)

          if (predictorRecord && targetAns) {
            const pId = predictorRecord.user_id
            if (!pickForMeStatsMap[pId]) {
              pickForMeStatsMap[pId] = { correct: 0, total: 0 }
            }
            pickForMeStatsMap[pId].total += 1
            if (predictorRecord.answer === targetAns) {
              pickForMeStatsMap[pId].correct += 1
            }
          }
        }
      }
    }

    const pickForMeStats = members?.map((m) => ({
      userId: m.user_id,
      displayName: m.display_name || 'Player',
      correct: pickForMeStatsMap[m.user_id]?.correct || 0,
      total: pickForMeStatsMap[m.user_id]?.total || 0,
      score: m.score || 0,
    }))

    const reaction = await generateMatchResultReaction({
      gameMode: room.game_mode,
      totalRounds: room.total_rounds || 10,
      pickForMeStats,
      playerScores,
    })

    return NextResponse.json({
      success: true,
      gameMode: room.game_mode,
      totalRounds: room.total_rounds,
      pickForMeStats,
      reaction,
    })
  } catch {
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}
