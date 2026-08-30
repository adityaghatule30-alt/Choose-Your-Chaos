import { CandidateQuestion, CandidateTruthDare, ContentGenerator } from '../types'
import { CONTENT_CONFIG } from '../config'

export class GeminiContentGenerator implements ContentGenerator {
  private apiKey: string | null

  constructor() {
    // Server-side only environment variable
    this.apiKey = process.env.GEMINI_API_KEY || null
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0)
  }

  async generateQuestions(count: number, categorySlug?: string): Promise<CandidateQuestion[]> {
    if (!this.isAvailable()) {
      throw new Error('GEMINI_API_KEY is not configured on the server.')
    }

    const safeCount = Math.min(count, CONTENT_CONFIG.SAFEGUARDS.MAX_BATCH_SIZE)
    const prompt = `You are the Lead Game Writer for "Choose Your Chaos" - a viral party game of unhinged either/or dilemmas.
Generate exactly ${safeCount} unique, hilarious, high-stakes Either/Or dilemmas.

Rules:
1. Category scope: ${categorySlug ? `Focus on category "${categorySlug}"` : 'Mix across Money, College, Friends, Work, Relationships, Personality, Indian, Impossible Choices'}.
2. Formatting: Return a strictly valid JSON array of objects.
3. Natural Language: Use engaging conversational English with occasional relatable Indian / Hinglish dilemmas where culturally suitable (e.g. ₹ amounts, UPI, family dynamics, college attendance, corporate appraisal chaos).
4. No boring questions (e.g. "Tea vs Coffee"). Make them moral/social/existential dilemmas with genuine stakes.
5. ZERO unsafe content: No self-harm, illegal acts, sexual violence, hate speech, or dangerous physical acts.
6. JSON Schema per item:
[
  {
    "question": "Question text...",
    "option_a": "Option A text...",
    "option_b": "Option B text...",
    "category_slug": "money | college | friends | work | relationships | personality | dark-humor | indian | impossible-choices | funny",
    "difficulty": "easy | medium | chaos",
    "humor_level": "light | sarcastic | dark",
    "language": "en | hinglish",
    "tags": ["tag1", "tag2"]
  }
]`

    const rawJson = await this.callGemini(prompt)
    const parsed = this.parseJsonArray<CandidateQuestion>(rawJson)

    return parsed.map((item) => ({
      ...item,
      source: 'ai',
    }))
  }

  async generateTruthDare(
    type: 'truth' | 'dare',
    count: number,
    categorySlug?: string
  ): Promise<CandidateTruthDare[]> {
    if (!this.isAvailable()) {
      throw new Error('GEMINI_API_KEY is not configured on the server.')
    }

    const safeCount = Math.min(count, CONTENT_CONFIG.SAFEGUARDS.MAX_BATCH_SIZE)
    const prompt = `You are the Lead Game Writer for "Choose Your Chaos" party game.
Generate exactly ${safeCount} unique, safe, funny ${type.toUpperCase()} prompts.

Rules:
1. Category scope: ${categorySlug ? `Focus on category "${categorySlug}"` : 'Mix across Funny, Money, Relationships, College, Work, Personality, Indian, Friends, Dark Humor'}.
2. Format: Return a strictly valid JSON array of objects.
3. Dares MUST be social, verbal, or mild comedy/acting tasks (e.g. dramatic accents, funny status changes, goofy sales pitches, impression challenges).
4. STRICT SAFETY: NEVER generate dangerous physical stunts, harassment, illegal acts, property damage, substance use, or humiliating abuse.
5. JSON Schema per item:
[
  {
    "type": "${type}",
    "prompt": "Prompt text...",
    "category_slug": "funny | money | relationships | college | work | personality | dark-humor | indian | impossible-choices | friends",
    "difficulty": "easy | medium | chaos",
    "humor_level": "light | sarcastic | dark",
    "language": "en | hinglish",
    "tags": ["tag1", "tag2"]
  }
]`

    const rawJson = await this.callGemini(prompt)
    const parsed = this.parseJsonArray<CandidateTruthDare>(rawJson)

    return parsed.map((item) => ({
      ...item,
      type,
      source: 'ai',
    }))
  }

  private async callGemini(prompt: string): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CONTENT_CONFIG.SAFEGUARDS.TIMEOUT_MS)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.85,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!candidateText) {
        throw new Error('Gemini API returned empty candidate response.')
      }

      return candidateText
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private parseJsonArray<T>(text: string): T[] {
    try {
      const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '')
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        return parsed as T[]
      }
      if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).items)) {
        return (parsed as any).items as T[]
      }
      return []
    } catch {
      throw new Error('Failed to parse Gemini structured JSON response.')
    }
  }
}
