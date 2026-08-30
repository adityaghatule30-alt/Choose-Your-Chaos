import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { LeaderboardUser } from '@/types/progression'
import { getLevelFromXP } from '@/lib/progression'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'all_time' // daily | weekly | all_time

    let query = supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, xp, chaos_score')
      .order('xp', { ascending: false })
      .limit(30)

    const { data: profiles, error } = await query

    if (error) {
      return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
    }

    const leaderboard: LeaderboardUser[] = (profiles || []).map((p, index) => {
      const levelInfo = getLevelFromXP(p.xp || 0)
      return {
        id: p.id,
        username: p.username || 'Agent',
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        xp: p.xp || 0,
        chaos_score: p.chaos_score || 0,
        level: levelInfo.level,
        rank: index + 1,
        is_current_user: user ? user.id === p.id : false,
      }
    })

    return NextResponse.json({ leaderboard })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
