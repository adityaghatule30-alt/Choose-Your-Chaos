import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AchievementItem } from '@/types/progression'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    // 1. Fetch all active achievements definitions
    const { data: achievements, error: achError } = await supabase
      .from('achievements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true })

    if (achError || !achievements) {
      return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
    }

    // 2. Fetch user unlocked achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', user.id)

    const unlockedMap = new Map(
      (userAchievements || []).map((u) => [u.achievement_id, u.unlocked_at])
    )

    // 3. Fetch user gameplay telemetry to calculate real progress
    const [voteCountRes, dareCountRes] = await Promise.all([
      supabase.from('question_votes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('judge_votes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    const totalQuestionVotes = voteCountRes.count || 0
    const totalJudgeVotes = dareCountRes.count || 0

    const items: AchievementItem[] = achievements.map((ach) => {
      const isUnlocked = unlockedMap.has(ach.id)
      let progress = 0

      if (ach.name === 'Professional Overthinker') {
        progress = totalQuestionVotes
      } else if (ach.name === 'Certified Chaos') {
        progress = Math.min(ach.requirement_value, totalQuestionVotes)
      } else if (ach.name === 'Somehow Always Wrong') {
        progress = totalJudgeVotes
      } else if (ach.name === 'Never Chooses The Safe Option') {
        progress = Math.min(ach.requirement_value, totalQuestionVotes)
      }

      const percent = isUnlocked
        ? 100
        : Math.min(100, Math.round((progress / Math.max(1, ach.requirement_value)) * 100))

      return {
        id: ach.id,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        requirement_type: ach.requirement_type,
        requirement_value: ach.requirement_value,
        active: ach.active,
        unlocked: isUnlocked,
        unlocked_at: unlockedMap.get(ach.id) || null,
        progress,
        progressPercent: percent,
      }
    })

    return NextResponse.json({ achievements: items })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
