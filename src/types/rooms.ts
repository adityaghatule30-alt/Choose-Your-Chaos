export interface RoomMember {
  id: string
  room_id: string
  user_id: string
  display_name: string
  score: number
  is_host: boolean
  joined_at: string
  left_at: string | null
  avatar_url?: string | null
  username?: string | null
}

export interface RoomRound {
  id: string
  room_id: string
  round_number: number
  question_id: string
  status: 'waiting' | 'active' | 'revealing' | 'completed'
  started_at: string | null
  ended_at: string | null
  question?: {
    id: string
    question: string
    option_a: string
    option_b: string
    category_id: string | null
  } | null
  answers_count?: number
  answers?: Array<{
    user_id: string
    display_name: string
    answer: 'A' | 'B'
  }>
  stats?: {
    count_a: number
    count_b: number
    total: number
    percent_a: number
    percent_b: number
  }
}

export interface Room {
  id: string
  code: string
  name: string
  host_id: string
  status: 'waiting' | 'playing' | 'finished' | 'cancelled'
  max_players: number
  current_round: number
  total_rounds: number
  created_at: string
  started_at: string | null
  ended_at: string | null
  members?: RoomMember[]
  current_round_data?: RoomRound | null
  user_answer?: 'A' | 'B' | null
  is_host?: boolean
}
