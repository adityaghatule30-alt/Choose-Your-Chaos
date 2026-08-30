export interface AchievementItem {
  id: string
  name: string
  description: string
  icon: string | null
  requirement_type: string
  requirement_value: number
  active: boolean
  unlocked: boolean
  unlocked_at: string | null
  progress: number
  progressPercent: number
}

export interface UserStats {
  either_or_votes: number
  truth_completed: number
  dare_completed: number
  judge_votes: number
  rooms_played: number
  total_games: number
}

export interface LeaderboardUser {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  xp: number
  chaos_score: number
  level: number
  rank: number
  is_current_user?: boolean
}
