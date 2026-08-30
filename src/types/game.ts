export interface Category {
  id: string
  name: string
  slug: string
  emoji: string | null
}

export interface Question {
  id: string
  question: string
  option_a: string
  option_b: string
  category_id: string | null
  categories?: Category | null
  difficulty: 'easy' | 'medium' | 'chaos'
  humor_level: 'light' | 'sarcastic' | 'dark'
  language: 'en' | 'hinglish'
  tags: string[]
  active: boolean
  usage_count: number
  created_at: string
}

export interface QuestionVoteStats {
  count_a: number
  count_b: number
  total: number
  percent_a: number
  percent_b: number
}

export interface VoteResultResponse {
  success: boolean
  error?: string
  message?: string
  choice?: 'A' | 'B'
  xp_awarded?: number
  new_xp?: number
  stats?: QuestionVoteStats
  reaction?: string
}

export interface GameSession {
  id: string
  user_id: string
  game_type: 'either_or' | 'truth' | 'dare' | 'judge_me' | 'room'
  started_at: string
  ended_at: string | null
  score: number
  xp_earned: number
}
