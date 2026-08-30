import { SafetyScoreResult } from './types'

// Prohibited / Harmful words and dangerous challenges patterns
const PROHIBITED_KEYWORDS = [
  'kill yourself',
  'suicide',
  'self harm',
  'cut yourself',
  'overdose',
  'bomb',
  'terrorist',
  'hate speech',
  'racial slur',
  'doxx',
  'harass',
  'swatting',
  'steal',
  'arson',
  'poison',
  'illegal weapon',
]

const SENSITIVE_KEYWORDS = [
  'death',
  'die',
  'punch',
  'slap',
  'destroy',
  'hate',
  'fire',
]

export function evaluateContentSafety(
  text: string,
  isDare: boolean = false
): SafetyScoreResult {
  const lower = text.toLowerCase()
  const flaggedKeywords: string[] = []
  const reasons: string[] = []
  let score = 100

  // 1. Prohibited items (Immediate zero score / unsafe)
  for (const word of PROHIBITED_KEYWORDS) {
    if (lower.includes(word)) {
      flaggedKeywords.push(word)
      reasons.push(`Contains prohibited keyword: "${word}"`)
      score = 0
    }
  }

  if (score === 0) {
    return {
      score: 0,
      isSafe: false,
      flaggedKeywords,
      reasons,
    }
  }

  // 2. Sensitive keywords deduction
  for (const word of SENSITIVE_KEYWORDS) {
    if (lower.includes(word)) {
      flaggedKeywords.push(word)
      reasons.push(`Contains sensitive context: "${word}"`)
      score -= isDare ? 30 : 15 // Dares are held to stricter scrutiny
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    isSafe: score >= 60,
    flaggedKeywords,
    reasons,
  }
}
