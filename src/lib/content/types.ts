export type ContentSource = 'manual' | 'template' | 'ai' | 'community'

export type ContentStatus =
  | 'draft'
  | 'generated'
  | 'validating'
  | 'approved'
  | 'active'
  | 'retired'
  | 'rejected'
  | 'reported'
  | 'removed'

export type GameContentType = 'either_or' | 'truth' | 'dare'

export interface CandidateQuestion {
  question: string
  option_a: string
  option_b: string
  category_slug: string
  difficulty: 'easy' | 'medium' | 'chaos'
  humor_level: 'light' | 'sarcastic' | 'dark'
  language: 'en' | 'hinglish'
  tags: string[]
  source: ContentSource
}

export interface CandidateTruthDare {
  type: 'truth' | 'dare'
  prompt: string
  category_slug: string
  difficulty: 'easy' | 'medium' | 'chaos'
  humor_level: 'light' | 'sarcastic' | 'dark'
  language: 'en' | 'hinglish'
  tags: string[]
  source: ContentSource
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface QualityScoreResult {
  score: number // 0 - 100
  reasons: string[]
}

export interface SafetyScoreResult {
  score: number // 0 - 100
  isSafe: boolean
  flaggedKeywords: string[]
  reasons: string[]
}

export interface ProcessedQuestionCandidate extends CandidateQuestion {
  content_status: ContentStatus
  quality_score: number
  safety_score: number
  validation_errors?: string[]
}

export interface ProcessedTruthDareCandidate extends CandidateTruthDare {
  content_status: ContentStatus
  quality_score: number
  safety_score: number
  validation_errors?: string[]
}

export interface ContentGenerator {
  generateQuestions(count: number, categorySlug?: string): Promise<CandidateQuestion[]>
  generateTruthDare?(type: 'truth' | 'dare', count: number, categorySlug?: string): Promise<CandidateTruthDare[]>
}
