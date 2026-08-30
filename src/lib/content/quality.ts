import { CandidateQuestion, QualityScoreResult } from './types'

export function evaluateContentQuality(candidate: CandidateQuestion): QualityScoreResult {
  let score = 100
  const reasons: string[] = []

  const q = candidate.question.trim()
  const a = candidate.option_a.trim()
  const b = candidate.option_b.trim()

  // 1. Length checks
  if (q.length < 20) {
    score -= 20
    reasons.push('Question is somewhat brief/underdeveloped.')
  } else if (q.length > 250) {
    score -= 15
    reasons.push('Question is overly verbose.')
  }

  // 2. Option balance checks
  if (a.length < 3 || b.length < 3) {
    score -= 25
    reasons.push('Options are excessively brief.')
  }

  // 3. Instruction or placeholder leaks
  const placeholderPatterns = [
    /\{.*?\}/,
    /\[.*?\]/,
    /option\s*[ab]/i,
    /as an ai/i,
    /here is a question/i,
    /prompt:/i,
    /system:/i,
  ]

  for (const pattern of placeholderPatterns) {
    if (pattern.test(q) || pattern.test(a) || pattern.test(b)) {
      score -= 40
      reasons.push('Detected placeholder syntax or prompt leak.')
      break
    }
  }

  // 4. Repeated wording between options
  if (a.toLowerCase() === b.toLowerCase()) {
    score = 0
    reasons.push('Options are completely identical.')
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
  }
}
