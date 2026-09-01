import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const body = await request.json()
    const name = body.name?.trim() || 'Chaos Arena'
    const totalRounds = [3, 5, 10].includes(body.total_rounds) ? body.total_rounds : 5
    const gameMode = body.game_mode || 'either_or'
    const code = generateRoomCode()

    const { data: room, error } = await supabase
      .from('rooms')
      .insert({
        code,
        name,
        host_id: user.id,
        game_mode: gameMode,
        total_rounds: totalRounds,
        status: 'waiting',
        max_players: 10,
      })
      .select('id, code, name, game_mode')
      .single()

    if (error) {
      return NextResponse.json({ error: 'DB_ERROR', message: error.message }, { status: 500 })
    }

    // Add host as member
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .single()

    await supabase.from('room_members').insert({
      room_id: room.id,
      user_id: user.id,
      display_name: profile?.display_name || profile?.username || 'Host',
      is_host: true,
      score: 0,
    })

    return NextResponse.json({ success: true, room })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
