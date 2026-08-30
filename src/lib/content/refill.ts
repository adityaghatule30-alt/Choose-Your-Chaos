import { SupabaseClient } from '@supabase/supabase-js'
import { ContentGenerator } from './types'
import { GeminiContentGenerator } from './generators/gemini'
import { TemplateContentGenerator } from './generators/template'
import { ContentPipeline } from './pipeline'
import { CONTENT_CONFIG } from './config'

export interface PoolRefillStatus {
  eitherOr: { activeCount: number; needed: number; status: 'HEALTHY' | 'NEEDS_REFILL' }
  truth: { activeCount: number; needed: number; status: 'HEALTHY' | 'NEEDS_REFILL' }
  dare: { activeCount: number; needed: number; status: 'HEALTHY' | 'NEEDS_REFILL' }
}

export class ContentRefillService {
  private pipeline: ContentPipeline
  private geminiGenerator: GeminiContentGenerator
  private templateGenerator: TemplateContentGenerator

  constructor(private supabase: SupabaseClient) {
    this.pipeline = new ContentPipeline(supabase)
    this.geminiGenerator = new GeminiContentGenerator()
    this.templateGenerator = new TemplateContentGenerator()
  }

  async checkPoolStatus(): Promise<PoolRefillStatus> {
    const [eitherCountRes, truthCountRes, dareCountRes] = await Promise.all([
      this.supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)
        .in('content_status', ['approved', 'active']),
      this.supabase
        .from('truth_dare_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'truth')
        .eq('active', true)
        .in('content_status', ['approved', 'active']),
      this.supabase
        .from('truth_dare_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'dare')
        .eq('active', true)
        .in('content_status', ['approved', 'active']),
    ])

    const eitherCount = eitherCountRes.count || 0
    const truthCount = truthCountRes.count || 0
    const dareCount = dareCountRes.count || 0

    return {
      eitherOr: {
        activeCount: eitherCount,
        needed: Math.max(0, CONTENT_CONFIG.POOL_THRESHOLDS.EITHER_OR_MIN - eitherCount),
        status: eitherCount < CONTENT_CONFIG.POOL_THRESHOLDS.EITHER_OR_MIN ? 'NEEDS_REFILL' : 'HEALTHY',
      },
      truth: {
        activeCount: truthCount,
        needed: Math.max(0, CONTENT_CONFIG.POOL_THRESHOLDS.TRUTH_MIN - truthCount),
        status: truthCount < CONTENT_CONFIG.POOL_THRESHOLDS.TRUTH_MIN ? 'NEEDS_REFILL' : 'HEALTHY',
      },
      dare: {
        activeCount: dareCount,
        needed: Math.max(0, CONTENT_CONFIG.POOL_THRESHOLDS.DARE_MIN - dareCount),
        status: dareCount < CONTENT_CONFIG.POOL_THRESHOLDS.DARE_MIN ? 'NEEDS_REFILL' : 'HEALTHY',
      },
    }
  }

  getGenerator(): ContentGenerator {
    if (this.geminiGenerator.isAvailable()) {
      return this.geminiGenerator
    }
    return this.templateGenerator
  }

  async executeRefill(jobId?: string): Promise<{
    eitherOrAdded: number
    truthAdded: number
    dareAdded: number
    errors: string[]
  }> {
    const status = await this.checkPoolStatus()
    const generator = this.getGenerator()
    const errors: string[] = []

    let eitherOrAdded = 0
    let truthAdded = 0
    let dareAdded = 0

    if (status.eitherOr.status === 'NEEDS_REFILL') {
      try {
        const batchSize = Math.min(status.eitherOr.needed, CONTENT_CONFIG.BATCH_SIZES.EITHER_OR)
        const res = await this.pipeline.processAndIngestQuestions(generator, batchSize)
        eitherOrAdded = res.approvedCount
      } catch (err: any) {
        errors.push(`Either/Or refill failed: ${err.message}`)
      }
    }

    if (status.truth.status === 'NEEDS_REFILL' && generator.generateTruthDare) {
      try {
        const batchSize = Math.min(status.truth.needed, CONTENT_CONFIG.BATCH_SIZES.TRUTH)
        const res = await this.pipeline.processAndIngestTruthDare(generator, 'truth', batchSize)
        truthAdded = res.approvedCount
      } catch (err: any) {
        errors.push(`Truth refill failed: ${err.message}`)
      }
    }

    if (status.dare.status === 'NEEDS_REFILL' && generator.generateTruthDare) {
      try {
        const batchSize = Math.min(status.dare.needed, CONTENT_CONFIG.BATCH_SIZES.DARE)
        const res = await this.pipeline.processAndIngestTruthDare(generator, 'dare', batchSize)
        dareAdded = res.approvedCount
      } catch (err: any) {
        errors.push(`Dare refill failed: ${err.message}`)
      }
    }

    if (jobId) {
      await this.supabase
        .from('content_generation_jobs')
        .update({
          status: errors.length === 0 ? 'completed' : 'failed',
          approved_count: eitherOrAdded + truthAdded + dareAdded,
          error_message: errors.length > 0 ? errors.join('; ') : null,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId)
    }

    return {
      eitherOrAdded,
      truthAdded,
      dareAdded,
      errors,
    }
  }
}
