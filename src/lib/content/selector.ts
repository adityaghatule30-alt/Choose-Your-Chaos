import { SupabaseClient } from '@supabase/supabase-js'
import { Question } from '@/types/game'

interface SelectorOptions {
  categorySlug?: string
  difficulty?: 'easy' | 'medium' | 'chaos'
  humorLevel?: 'light' | 'sarcastic' | 'dark'
  excludeIds?: string[]
  limit?: number
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function selectActiveContent(
  supabase: SupabaseClient,
  userId: string,
  options: SelectorOptions = {}
): Promise<Question | null> {
  const { categorySlug, difficulty, humorLevel, excludeIds = [] } = options

  // 1. Fetch user's answered question IDs if userId is valid UUID
  let answeredIds: string[] = []
  if (userId && userId !== '00000000-0000-0000-0000-000000000000') {
    const { data: answeredVotes } = await supabase
      .from('question_votes')
      .select('question_id')
      .eq('user_id', userId)

    answeredIds = (answeredVotes || []).map((v) => v.question_id)
  }

  const combinedExcludes = Array.from(new Set([...answeredIds, ...excludeIds]))

  // 2. Fetch user's profile for preferred humor mode if not explicitly passed
  let preferredHumor = humorLevel
  if (!preferredHumor && userId && userId !== '00000000-0000-0000-0000-000000000000') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('humor_level')
      .eq('id', userId)
      .single()
    preferredHumor = profile?.humor_level || 'light'
  }

  // 3. Build query ensuring only active & approved content is selected
  let query = supabase
    .from('questions')
    .select(
      'id, question, option_a, option_b, category_id, difficulty, humor_level, language, tags, active, usage_count, created_at, content_status, quality_score, safety_score, categories(id, name, slug, emoji)'
    )
    .eq('active', true)
    .in('content_status', ['approved', 'active'])

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  if (combinedExcludes.length > 0) {
    query = query.not('id', 'in', `(${combinedExcludes.join(',')})`)
  }

  const { data: candidates, error } = await query.limit(50)

  if (error || !candidates || candidates.length === 0) {
    // If pool is exhausted for this user, fallback to random active questions
    const { data: fallbackQuestions } = await supabase
      .from('questions')
      .select(
        'id, question, option_a, option_b, category_id, difficulty, humor_level, language, tags, active, usage_count, created_at, categories(id, name, slug, emoji)'
      )
      .eq('active', true)
      .in('content_status', ['approved', 'active'])
      .limit(50)

    if (fallbackQuestions && fallbackQuestions.length > 0) {
      // Pick a random question not in excludeIds if possible
      const available = fallbackQuestions.filter((q) => !excludeIds.includes(q.id))
      const pool = available.length > 0 ? available : fallbackQuestions
      const picked = pool[Math.floor(Math.random() * pool.length)]
      return picked as unknown as Question
    }
    return null
  }

  // 4. Randomize and shuffle candidates so questions never repeat in predictable order
  const shuffledCandidates = shuffleArray(candidates)

  // 5. Weight candidates giving high randomness combined with soft humor preference
  const weighted = shuffledCandidates.sort((a, b) => {
    const scoreA =
      (a.humor_level === preferredHumor ? 1.5 : 0) -
      (a.usage_count || 0) * 0.05 +
      Math.random() * 5
    const scoreB =
      (b.humor_level === preferredHumor ? 1.5 : 0) -
      (b.usage_count || 0) * 0.05 +
      Math.random() * 5
    return scoreB - scoreA
  })

  return weighted[0] as unknown as Question
}

/**
 * Check if the active content pool is below healthy thresholds
 */
export async function checkContentPoolHealth(
  supabase: SupabaseClient,
  threshold: number = 10
): Promise<{ status: 'HEALTHY' | 'CONTENT_LOW'; activeCount: number }> {
  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)
    .in('content_status', ['approved', 'active'])

  const activeCount = count || 0
  return {
    status: activeCount < threshold ? 'CONTENT_LOW' : 'HEALTHY',
    activeCount,
  }
}
