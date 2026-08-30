import { SupabaseClient } from '@supabase/supabase-js'
import { selectActiveContent } from '@/lib/content/selector'
import { Question } from '@/types/game'

export async function fetchEligibleQuestion(
  supabase: SupabaseClient,
  userId: string,
  excludeIds: string[] = []
): Promise<Question | null> {
  return await selectActiveContent(supabase, userId, { excludeIds })
}
