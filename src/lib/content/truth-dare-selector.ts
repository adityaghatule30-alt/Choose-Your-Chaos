import { SupabaseClient } from '@supabase/supabase-js'
import { TruthDareItem } from '@/types/truth-dare'

interface SelectorTruthDareOptions {
  type: 'truth' | 'dare'
  difficulty?: 'easy' | 'medium' | 'chaos'
  humorLevel?: 'light' | 'sarcastic' | 'dark'
  excludeIds?: string[]
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

export async function selectActiveTruthDare(
  supabase: SupabaseClient,
  userId: string,
  options: SelectorTruthDareOptions
): Promise<TruthDareItem | null> {
  const { type, difficulty, humorLevel, excludeIds = [] } = options

  // 1. Fetch user's profile for preferred humor mode if not provided
  let preferredHumor = humorLevel
  if (!preferredHumor && userId && userId !== '00000000-0000-0000-0000-000000000000') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('humor_level')
      .eq('id', userId)
      .single()
    preferredHumor = profile?.humor_level || 'light'
  }

  // 2. Query active & approved items matching type
  let query = supabase
    .from('truth_dare_items')
    .select(
      'id, type, prompt, difficulty, humor_level, language, tags, category_id, safety_status, active, usage_count, created_at, categories(id, name, slug, emoji)'
    )
    .eq('type', type)
    .eq('active', true)
    .eq('safety_status', 'approved')

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data: items, error } = await query.limit(50)

  if (error || !items || items.length === 0) {
    // If specific filter or exclude list exhausted items, fallback to random active items
    const { data: fallbackItems } = await supabase
      .from('truth_dare_items')
      .select(
        'id, type, prompt, difficulty, humor_level, language, tags, category_id, safety_status, active, usage_count, created_at, categories(id, name, slug, emoji)'
      )
      .eq('type', type)
      .eq('active', true)
      .eq('safety_status', 'approved')
      .limit(50)

    if (fallbackItems && fallbackItems.length > 0) {
      const available = fallbackItems.filter((i) => !excludeIds.includes(i.id))
      const pool = available.length > 0 ? available : fallbackItems
      const picked = pool[Math.floor(Math.random() * pool.length)]
      return picked as unknown as TruthDareItem
    }
    return null
  }

  // 3. Randomize and shuffle candidates
  const shuffledItems = shuffleArray(items)

  // 4. Weight with high randomness
  const weighted = shuffledItems.sort((a, b) => {
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

  return weighted[0] as unknown as TruthDareItem
}
