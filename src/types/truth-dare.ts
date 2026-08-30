export interface TruthDareItem {
  id: string
  type: 'truth' | 'dare'
  prompt: string
  difficulty: 'easy' | 'medium' | 'chaos'
  humor_level: 'light' | 'sarcastic' | 'dark'
  language: 'en' | 'hinglish'
  tags: string[]
  category_id: string | null
  categories?: {
    id: string
    name: string
    slug: string
    emoji: string | null
  } | null
  safety_status: 'pending' | 'approved' | 'removed'
  active: boolean
  usage_count: number
  created_at: string
}

export interface CompleteTruthDareResponse {
  success: boolean
  error?: string
  message?: string
  xp_awarded?: number
  new_xp?: number
  type?: 'truth' | 'dare'
  difficulty?: 'easy' | 'medium' | 'chaos'
}

export interface CreateReportRequest {
  target_type: 'question' | 'truth_dare' | 'judge_case' | 'comment' | 'user'
  target_id: string
  reason: 'offensive' | 'harassment' | 'spam' | 'inappropriate' | 'dangerous' | 'other'
  details?: string
}
