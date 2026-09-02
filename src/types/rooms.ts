export type GameMode =
  | 'either_or'
  | 'same_brain'
  | 'pick_for_me'
  | 'mind_reader'
  | 'worst_answer'
  | 'imposter'
  | 'guess_player'
  | 'chain_reaction'
  | 'two_truths'
  | 'caption_chaos'

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
  question_id?: string | null
  status: 'waiting' | 'active' | 'revealing' | 'completed'
  started_at: string | null
  ended_at: string | null
  reveal_at?: string | null
  prompt_data?: any
  target_user_id?: string | null
  target_user_name?: string | null
  is_imposter?: boolean
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
    answer: string
    metadata?: any
  }>
  votes?: Array<{
    voter_id: string
    target_id: string
  }>
  chaos_ai_comment?: string | null
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
  game_mode: GameMode
  status: 'waiting' | 'playing' | 'finished' | 'cancelled'
  max_players: number
  current_round: number
  total_rounds: number
  created_at: string
  started_at: string | null
  ended_at: string | null
  members?: RoomMember[]
  current_round_data?: RoomRound | null
  user_answer?: string | null
  user_vote?: string | null
  is_host?: boolean
}
