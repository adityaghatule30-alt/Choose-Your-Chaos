export interface JudgeCaseAuthor {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export interface JudgeCaseCategory {
  id: string
  name: string
  slug: string
  emoji: string | null
}

export interface JudgeCaseStats {
  not_guilty_count: number
  guilty_count: number
  criminal_count: number
  total: number
  percent_not_guilty: number
  percent_guilty: number
  percent_criminal: number
}

export interface JudgeComment {
  id: string
  case_id: string
  user_id: string
  comment: string
  status: 'pending' | 'approved' | 'reported' | 'removed'
  created_at: string
  author?: JudgeCaseAuthor | null
  reactions_count?: Record<string, number>
  user_reactions?: string[]
}

export interface JudgeCase {
  id: string
  author_id: string
  title: string
  description: string
  category_id: string | null
  status: 'pending' | 'approved' | 'reported' | 'removed'
  created_at: string
  updated_at: string
  author?: JudgeCaseAuthor | null
  category?: JudgeCaseCategory | null
  stats?: JudgeCaseStats
  comments_count?: number
  user_voted?: 'not_guilty' | 'guilty' | 'criminal' | null
}

export interface SubmitCaseRequest {
  title: string
  description: string
  category_slug: string
}

export interface SubmitVoteResponse {
  success: boolean
  error?: string
  message?: string
  verdict?: 'not_guilty' | 'guilty' | 'criminal'
  xp_awarded?: number
  new_xp?: number
  stats?: JudgeCaseStats
}
