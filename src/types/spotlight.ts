export interface SpotlightMember {
  id: string
  room_id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  is_host: boolean
  joined_at: string
}

export interface SpotlightQuestion {
  id: string
  room_id: string
  asker_id: string | null
  asker_name: string
  spotlight_user_id: string | null
  question: string
  status: 'pending' | 'answering' | 'answered' | 'skipped'
  answer: string | null
  chaos_ai_comment: string | null
  created_at: string
  reactions_count?: Record<string, number>
  user_reactions?: string[]
}

export interface SpotlightRoom {
  id: string
  code: string
  host_id: string
  status: 'lobby' | 'spinning' | 'questioning' | 'answering' | 'finished'
  current_spotlight_user_id: string | null
  spotlight_history: string[]
  skips_remaining: number
  created_at: string
  updated_at: string
  members?: SpotlightMember[]
  spotlight_user?: SpotlightMember | null
  questions?: SpotlightQuestion[]
  is_host?: boolean
  is_spotlight?: boolean
}
