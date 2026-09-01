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
  // College
  {
    categorySlug: 'college',
    difficulty: 'easy',
    humorLevel: 'sarcastic',
    language: 'en',
    tags: ['college', 'attendance', 'viva', 'exams'],
    template: () => `Your attendance is 64% on the last day before exam eligibility. What do you do?`,
    optionsPool: [
      ['Beg the HOD with medical certificate 🩺', 'Give proxy in 5 consecutive classes 🏃'],
      ['Submit a fake assignment overnight 📝', 'Risk it and hope the server glitches 🎲'],
      ['Sit in the front row and nod all class 🤓', 'Bribe class rep for lab attendance ☕'],
    ],
  },
  // Money & UPI
  {
    categorySlug: 'money',
    difficulty: 'medium',
    humorLevel: 'sarcastic',
    language: 'en',
    tags: ['money', 'upi', 'budget', 'food'],
    template: () => `You have ₹150 left in your account until the end of the month. How do you survive?`,
    optionsPool: [
      ['Eat plain Maggi for 4 days straight 🍜', 'Send split-bill reminders to 6 friends 📱'],
      ['Borrow ₹100 from 3 different people 💸', 'Eat free snacks at a campus seminar 🥪'],
      ['Pretend to be on an intermittent fast 🧘', 'Crash a distant relative’s wedding 🍛'],
    ],
  },
  // Friends & Gossip
  {
    categorySlug: 'friends',
    difficulty: 'chaos',
    humorLevel: 'sarcastic',
    language: 'en',
    tags: ['friends', 'whatsapp', 'gossip'],
    template: () => `You accidentally sent a screenshot of your friend’s chat back to them. What is your cover story?`,
    optionsPool: [
      ['Claim your phone screen was glitching 📱', 'Say "Bro was testing your reaction" 💀'],
      ['Delete for everyone after 20 minutes ⏳', 'Switch off phone and leave the city ✈️'],
    ],
  },
  // Family & Relatives
  {
    categorySlug: 'indian',
    difficulty: 'medium',
    humorLevel: 'sarcastic',
    language: 'hinglish',
    tags: ['family', 'relatives', 'sharmaji'],
    template: () => `At a crowded family wedding, which nightmare situation do you pick?`,
    optionsPool: [
      ['Aunties asking your salary & marriage plans 💍', 'Getting compared to Sharmaji’s son on stage 🏆'],
      ['Relatives asking to unlock your phone gallery 📱', 'Giving a 5-minute speech in front of elders 🎤'],
    ],
  },
  // Dating & Crushes
  {
    categorySlug: 'relationships',
    difficulty: 'chaos',
    humorLevel: 'sarcastic',
    language: 'en',
    tags: ['dating', 'crush', 'instagram'],
    template: () => `Your parents call you on video while you're sitting in a cafe with your crush. What do you do?`,
    optionsPool: [
      ['Cut the call and text "In library" 📚', 'Introduce your crush as "Group project lead" 🤝'],
      ['Put phone on airplane mode immediately ✈️', 'Hand the phone to your crush to say namaste 🙏'],
    ],
  },
  // Food & Midnight Chaos
  {
    categorySlug: 'funny',
    difficulty: 'easy',
    humorLevel: 'light',
    language: 'en',
    tags: ['food', 'hostel', 'biryani', 'swiggy'],
    template: () => `Your roommate ate your leftover biryani from the fridge at 2 AM. What is your revenge?`,
    optionsPool: [
      ['Change the hostel Wi-Fi password 📶', 'Wake them up with alarms at 6 AM ⏰'],
      ['Order ₹500 food on their Swiggy 🍗', 'Eat all their secret snack stash 🍫'],
    ],
  },
  // Travel & Commute
  {
    categorySlug: 'impossible-choices',
    difficulty: 'chaos',
    humorLevel: 'sarcastic',
    language: 'en',
    tags: ['travel', 'traffic', 'auto', 'metro'],
    template: () => `You have an exam in 30 minutes and are stuck in peak traffic. Which choice do you make?`,
    optionsPool: [
      ['Bargain with an auto for ₹300 🛺', 'Sprint 2 kilometers in formal shoes 🏃'],
      ['Take the overcrowded metro and squeeze in 🚇', 'Beg a random bike rider for a lift 🏍️'],
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
