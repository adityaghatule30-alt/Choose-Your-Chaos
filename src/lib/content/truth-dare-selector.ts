import { SupabaseClient } from '@supabase/supabase-js'
import { TruthDareItem } from '@/types/truth-dare'

interface SelectorTruthDareOptions {
  type: 'truth' | 'dare'
  difficulty?: 'easy' | 'medium' | 'chaos'
  humorLevel?: 'light' | 'sarcastic' | 'dark'
  excludeIds?: string[]
}

export async function selectActiveTruthDare(
  supabase: SupabaseClient,
  userId: string,
  options: SelectorTruthDareOptions
): Promise<TruthDareItem | null> {
  const { type, difficulty, humorLevel, excludeIds = [] } = options

  // 1. Fetch user's profile for preferred humor mode if not provided
  let preferredHumor = humorLevel
  if (!preferredHumor) {
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
    .select('id, type, prompt, difficulty, humor_level, language, tags, category_id, safety_status, active, usage_count, created_at, categories(id, name, slug, emoji)')
    .eq('type', type)
    .eq('active', true)
    .eq('safety_status', 'approved')

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data: items, error } = await query.limit(20)

  if (error || !items || items.length === 0) {
    // If specific filter or exclude list exhausted items, fallback to any active item of that type
    if (excludeIds.length > 0) {
      const { data: fallbackItems } = await supabase
        .from('truth_dare_items')
        .select('id, type, prompt, difficulty, humor_level, language, tags, category_id, safety_status, active, usage_count, created_at, categories(id, name, slug, emoji)')
        .eq('type', type)
        .eq('active', true)
        .eq('safety_status', 'approved')
        .limit(10)

      if (fallbackItems && fallbackItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackItems.length)
        return fallbackItems[randomIndex] as unknown as TruthDareItem
      }
    }
    return null
  }

  // 3. Weight by humor preference and lower usage count with randomness
  const weighted = [...items].sort((a, b) => {
    const scoreA =
      (a.humor_level === preferredHumor ? 3 : 0) -
      (a.usage_count || 0) * 0.2 +
      Math.random() * 2
    const scoreB =
      (b.humor_level === preferredHumor ? 3 : 0) -
      (b.usage_count || 0) * 0.2 +
      Math.random() * 2
    return scoreB - scoreA
  })

  return weighted[0] as unknown as TruthDareItem
}
