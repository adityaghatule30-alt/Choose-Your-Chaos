import { SupabaseClient } from '@supabase/supabase-js'
import {
  ContentGenerator,
  ProcessedQuestionCandidate,
  ProcessedTruthDareCandidate,
  CandidateQuestion,
  CandidateTruthDare,
} from './types'
import { validateQuestionFormat } from './validator'
import { isDuplicateQuestion, normalizeText } from './deduplicator'
import { evaluateContentQuality } from './quality'
import { evaluateContentSafety } from './safety'
import { CONTENT_CONFIG } from './config'

export class ContentPipeline {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Process and ingest candidate Either/Or questions
   */
  async processAndIngestQuestions(
    generator: ContentGenerator,
    count: number = 20,
    categorySlug?: string
  ): Promise<{
    processed: ProcessedQuestionCandidate[]
    approvedCount: number
    rejectedCount: number
  }> {
    const candidates = await generator.generateQuestions(count, categorySlug)

    const { data: categories } = await this.supabase
      .from('categories')
      .select('id, slug')
    const categoryMap = new Map((categories || []).map((c) => [c.slug, c.id]))

    const processed: ProcessedQuestionCandidate[] = []
    let approvedCount = 0
    let rejectedCount = 0

    for (const item of candidates) {
      // 1. Format validation
      const validation = validateQuestionFormat(item)
      if (!validation.valid) {
        processed.push({
          ...item,
          content_status: 'rejected',
          quality_score: 0,
          safety_score: 0,
          validation_errors: validation.errors,
        })
        rejectedCount++
        continue
      }

      // 2. Duplicate checking
      const isDup = await isDuplicateQuestion(
        this.supabase,
        item.question,
        item.option_a,
        item.option_b
      )

      if (isDup) {
        processed.push({
          ...item,
          content_status: 'rejected',
          quality_score: 0,
          safety_score: 100,
          validation_errors: ['Duplicate question detected.'],
        })
        rejectedCount++
        continue
      }

      // 3. Quality evaluation
      const qualityResult = evaluateContentQuality(item)

      // 4. Safety evaluation
      const safetyResult = evaluateContentSafety(
        `${item.question} ${item.option_a} ${item.option_b}`
      )

      // 5. Configurable thresholds check
      const isApproved =
        qualityResult.score >= CONTENT_CONFIG.THRESHOLDS.QUALITY_MIN_SCORE &&
        safetyResult.isSafe &&
        safetyResult.score >= CONTENT_CONFIG.THRESHOLDS.SAFETY_MIN_SCORE

      const status = isApproved ? 'active' : 'validating'

      const processedItem: ProcessedQuestionCandidate = {
        ...item,
        content_status: status,
        quality_score: qualityResult.score,
        safety_score: safetyResult.score,
      }

      processed.push(processedItem)

      if (isApproved) {
        approvedCount++
        const categoryId = categoryMap.get(item.category_slug) || null

        await this.supabase.from('questions').insert({
          question: item.question,
          option_a: item.option_a,
          option_b: item.option_b,
          category_id: categoryId,
          difficulty: item.difficulty,
          humor_level: item.humor_level,
          language: item.language,
          tags: item.tags,
          source: item.source,
          content_status: status,
          quality_score: qualityResult.score,
          safety_score: safetyResult.score,
          active: true,
        })
      } else {
        rejectedCount++
      }
    }

    return { processed, approvedCount, rejectedCount }
  }

  /**
   * Process and ingest candidate Truth/Dare items
   */
  async processAndIngestTruthDare(
    generator: ContentGenerator,
    type: 'truth' | 'dare',
    count: number = 15,
    categorySlug?: string
  ): Promise<{
    processed: ProcessedTruthDareCandidate[]
    approvedCount: number
    rejectedCount: number
  }> {
    if (!generator.generateTruthDare) {
      throw new Error('Generator does not support Truth/Dare generation.')
    }

    const candidates = await generator.generateTruthDare(type, count, categorySlug)

    const { data: categories } = await this.supabase
      .from('categories')
      .select('id, slug')
    const categoryMap = new Map((categories || []).map((c) => [c.slug, c.id]))

    const { data: existingItems } = await this.supabase
      .from('truth_dare_items')
      .select('prompt')
      .eq('type', type)
      .limit(300)

    const existingPrompts = new Set(
      (existingItems || []).map((i) => normalizeText(i.prompt))
    )

    const processed: ProcessedTruthDareCandidate[] = []
    let approvedCount = 0
    let rejectedCount = 0

    for (const item of candidates) {
      // 1. Validation
      if (!item.prompt || item.prompt.trim().length < 10) {
        processed.push({
          ...item,
          content_status: 'rejected',
          quality_score: 0,
          safety_score: 0,
          validation_errors: ['Prompt is too short or empty.'],
        })
        rejectedCount++
        continue
      }

      // 2. Duplicate checking
      const normPrompt = normalizeText(item.prompt)
      if (existingPrompts.has(normPrompt)) {
        processed.push({
          ...item,
          content_status: 'rejected',
          quality_score: 0,
          safety_score: 100,
          validation_errors: ['Duplicate prompt detected.'],
        })
        rejectedCount++
        continue
      }

      // 3. Quality evaluation (placeholder leak detection)
      const placeholderCheck = /\{.*?\}|\[.*?\]|as an ai|prompt:/i.test(item.prompt)
      const qualityScore = placeholderCheck ? 30 : 95

      // 4. Stricter Safety check for Truth/Dare
      const safetyResult = evaluateContentSafety(item.prompt, item.type === 'dare')

      // 5. Thresholds check
      const isApproved =
        qualityScore >= CONTENT_CONFIG.THRESHOLDS.QUALITY_MIN_SCORE &&
        safetyResult.isSafe &&
        safetyResult.score >= CONTENT_CONFIG.THRESHOLDS.SAFETY_MIN_SCORE

      const status = isApproved ? 'active' : 'validating'

      const processedItem: ProcessedTruthDareCandidate = {
        ...item,
        content_status: status,
        quality_score: qualityScore,
        safety_score: safetyResult.score,
      }

      processed.push(processedItem)

      if (isApproved) {
        approvedCount++
        existingPrompts.add(normPrompt)
        const categoryId = categoryMap.get(item.category_slug) || null

        await this.supabase.from('truth_dare_items').insert({
          type: item.type,
          prompt: item.prompt,
          category_id: categoryId,
          difficulty: item.difficulty,
          humor_level: item.humor_level,
          language: item.language,
          tags: item.tags,
          source: item.source,
          content_status: status,
          quality_score: qualityScore,
          safety_score: safetyResult.score,
          safety_status: 'approved',
          active: true,
        })
      } else {
        rejectedCount++
      }
    }

    return { processed, approvedCount, rejectedCount }
  }
}
