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
    template: (a, b) => `Would you rather ${a} or ${b}?`,
    optionsPool: [
      ['receive ₹1 Lakh daily but only in 10-rupee coins 🪙', 'receive ₹50 Lakh lump sum with 60% tax deducted 💸'],
      ['win ₹5 Crore but your credit score drops to 300 forever 📉', 'have an 850 credit score but zero cash in savings 🏦'],
      ['have free international flights forever in middle seat ✈️', 'have free 5-star hotel stays but only in your hometown 🏨'],
    ],
  },
  // Work
  {
    categorySlug: 'work',
    difficulty: 'chaos',
    humorLevel: 'sarcastic',
    language: 'en',
    tags: ['work', 'boss', 'corporate'],
    template: (a, b) => `At your job, would you rather ${a} or ${b}?`,
    optionsPool: [
      ['reply-all to a CEO company email with a confused cat meme 🐱', 'have your screen share reveal your open job search tabs 💻'],
      ['work 4-day workweeks with 2-hour daily commute 🚗', 'work fully remote with your mic unmuted 24/7 🎙️'],
      ['have a micromanager who texts at 11 PM 📱', 'have a ghost manager who reviews work 6 months late 👻'],
    ],
  },
  // College
  {
    categorySlug: 'college',
    difficulty: 'easy',
    humorLevel: 'light',
    language: 'en',
    tags: ['college', 'exams', 'campus'],
    template: (a, b) => `In your university semester, would you rather ${a} or ${b}?`,
    optionsPool: [
      ['have an 8:00 AM class 5 days a week ⏰', 'have a 6:00 PM to 9:00 PM lab on Friday nights 🧪'],
      ['write a 30-page essay in one night 📝', 'give a 10-minute impromptu speech in front of 500 students 🎤'],
    ],
  },
  // Indian
  {
    categorySlug: 'indian',
    difficulty: 'medium',
    humorLevel: 'sarcastic',
    language: 'hinglish',
    tags: ['desi', 'family', 'relatives'],
    template: (a, b) => `During an Indian family gathering, would you rather ${a} or ${b}?`,
    optionsPool: [
      ['sit with the gossiping aunties and agree with everything ☕', 'sit with the political uncles and nod for 3 hours 🗞️'],
      ['be forced to dance on the baraat stage solo 🕺', 'be forced to negotiate hotel room discounts with the manager 🏨'],
    ],
  },
  // Impossible Choices
  {
    categorySlug: 'impossible-choices',
    difficulty: 'chaos',
    humorLevel: 'dark',
    language: 'en',
    tags: ['choices', 'extreme', 'paranoia'],
    template: (a, b) => `Would you rather ${a} or ${b}?`,
    optionsPool: [
      ['be able to fast forward time through awkward moments ⏩', 'be able to rewind time by 30 seconds once a day ⏪'],
      ['always feel like you forgot something important 🧠', 'never be able to tell what time of day it is 🕰️'],
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
