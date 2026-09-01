import { CandidateQuestion, ContentGenerator } from '../types'

interface TemplatePattern {
  categorySlug: string
  difficulty: 'easy' | 'medium' | 'chaos'
  humorLevel: 'light' | 'sarcastic' | 'dark'
  language: 'en' | 'hinglish'
  tags: string[]
  template: (a: string, b: string) => string
  optionsPool: Array<[string, string]>
}

const TEMPLATE_PATTERNS: TemplatePattern[] = [
  // Money
  {
    categorySlug: 'money',
    difficulty: 'medium',
    humorLevel: 'sarcastic',
    language: 'en',
    tags: ['money', 'wealth', 'dilemma'],
    template: (a, b) => `Which financial chaos do you choose?`,
    optionsPool: [
      ['₹1 Lakh daily in 10-rupee coins 🪙', '₹50 Lakh lump sum with 60% tax 💸'],
      ['₹5 Crore with credit score 300 📉', '850 credit score with ₹0 savings 🏦'],
      ['Free flights forever in middle seat ✈️', 'Free 5-star hotel in your hometown 🏨'],
    ],
  },
  // Work
  {
    categorySlug: 'work',
    difficulty: 'chaos',
    humorLevel: 'sarcastic',
    language: 'en',
    tags: ['work', 'boss', 'corporate'],
    template: (a, b) => `At your corporate job, which disaster do you pick?`,
    optionsPool: [
      ['Cat meme to company group 🐱', 'Screen share showing job hunt 💻'],
      ['4-day week with 2-hr commute 🚗', 'Remote with mic unmuted 24/7 🎙️'],
      ['Micromanager texting at 11 PM 📱', 'Manager reviewing 6 months late 👻'],
    ],
  },
  // College
  {
    categorySlug: 'college',
    difficulty: 'easy',
    humorLevel: 'light',
    language: 'en',
    tags: ['college', 'exams', 'campus'],
    template: (a, b) => `In your university semester, which schedule is worse?`,
    optionsPool: [
      ['8:00 AM class 5 days a week ⏰', 'Friday night 3-hour lab 🧪'],
      ['30-page essay in one night 📝', '10-minute impromptu speech 🎤'],
    ],
  },
  // Indian
  {
    categorySlug: 'indian',
    difficulty: 'medium',
    humorLevel: 'sarcastic',
    language: 'hinglish',
    tags: ['desi', 'family', 'relatives'],
    template: (a, b) => `During an Indian family gathering, who do you sit with?`,
    optionsPool: [
      ['Gossiping aunties for 3 hours ☕', 'Political uncles arguing news 🗞️'],
      ['Solo dance on baraat stage 🕺', 'Bargaining hotel discounts with manager 🏨'],
    ],
  },
  // Impossible Choices
  {
    categorySlug: 'impossible-choices',
    difficulty: 'chaos',
    humorLevel: 'dark',
    language: 'en',
    tags: ['choices', 'extreme', 'paranoia'],
    template: (a, b) => `Which supernatural curse do you accept?`,
    optionsPool: [
      ['Fast-forward awkward moments ⏩', 'Rewind 30 seconds once a day ⏪'],
      ['Always feel you forgot something 🧠', 'Never know what time it is 🕰️'],
    ],
  },
]

export class TemplateContentGenerator implements ContentGenerator {
  async generateQuestions(count: number, categorySlug?: string): Promise<CandidateQuestion[]> {
    const candidates: CandidateQuestion[] = []
    let patterns = TEMPLATE_PATTERNS

    if (categorySlug) {
      patterns = patterns.filter((p) => p.categorySlug === categorySlug)
      if (patterns.length === 0) patterns = TEMPLATE_PATTERNS
    }

    for (let i = 0; i < count; i++) {
      const pattern = patterns[i % patterns.length]
      const pair = pattern.optionsPool[Math.floor(Math.random() * pattern.optionsPool.length)]
      const questionText = pattern.template(pair[0], pair[1])

      candidates.push({
        question: questionText,
        option_a: pair[0],
        option_b: pair[1],
        category_slug: pattern.categorySlug,
        difficulty: pattern.difficulty,
        humor_level: pattern.humorLevel,
        language: pattern.language,
        tags: pattern.tags,
        source: 'template',
      })
    }

    return candidates
  }
}
