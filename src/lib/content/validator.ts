import { CandidateQuestion, ValidationResult } from './types'

export function validateQuestionFormat(candidate: CandidateQuestion): ValidationResult {
  const errors: string[] = []

  if (!candidate.question || candidate.question.trim().length < 10) {
    errors.push('Question text is missing or too short (minimum 10 characters).')
  }

  if (!candidate.option_a || candidate.option_a.trim().length < 2) {
    errors.push('Option A is missing or too short.')
  }

  if (!candidate.option_b || candidate.option_b.trim().length < 2) {
    errors.push('Option B is missing or too short.')
  }

  if (
    candidate.option_a &&
    candidate.option_b &&
    candidate.option_a.trim().toLowerCase() === candidate.option_b.trim().toLowerCase()
  ) {
    errors.push('Option A and Option B cannot be identical.')
  }

  if (!candidate.category_slug) {
    errors.push('Category slug is required.')
  }

  const validDifficulties = ['easy', 'medium', 'chaos']
  if (!validDifficulties.includes(candidate.difficulty)) {
    errors.push(`Invalid difficulty: ${candidate.difficulty}`)
  }

  const validHumorLevels = ['light', 'sarcastic', 'dark']
  if (!validHumorLevels.includes(candidate.humor_level)) {
    errors.push(`Invalid humor level: ${candidate.humor_level}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
