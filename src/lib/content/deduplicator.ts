import { SupabaseClient } from '@supabase/supabase-js'

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' ') // collapse multi-spaces
    .trim()
}

export async function isDuplicateQuestion(
  supabase: SupabaseClient,
  questionText: string,
  optionA: string,
  optionB: string
): Promise<boolean> {
  const normQ = normalizeText(questionText)

  // Fetch recent active questions
  const { data: existingQuestions } = await supabase
    .from('questions')
    .select('question, option_a, option_b')
    .limit(300)

  if (!existingQuestions || existingQuestions.length === 0) {
    return false
  }

  for (const item of existingQuestions) {
    const existingNormQ = normalizeText(item.question)
    if (normQ === existingNormQ) {
      return true
    }

    // Check if options match inverted or identical
    const normA = normalizeText(optionA)
    const normB = normalizeText(optionB)
    const exA = normalizeText(item.option_a)
    const exB = normalizeText(item.option_b)

    if (normQ.length > 20 && existingNormQ.includes(normQ.substring(0, 20))) {
      if ((normA === exA && normB === exB) || (normA === exB && normB === exA)) {
        return true
      }
    }
  }

  return false
}
