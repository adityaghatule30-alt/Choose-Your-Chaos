export const CONTENT_CONFIG = {
  // Quality & Safety Thresholds
  THRESHOLDS: {
    QUALITY_MIN_SCORE: 75,
    SAFETY_MIN_SCORE: 95,
  },

  // Pool Refill Minimum Thresholds (Triggers auto-refill when below)
  POOL_THRESHOLDS: {
    EITHER_OR_MIN: 200,
    TRUTH_MIN: 100,
    DARE_MIN: 100,
  },

  // Batch Sizes for Refill Operations
  BATCH_SIZES: {
    EITHER_OR: 50,
    TRUTH: 25,
    DARE: 25,
  },

  // Safeguards
  SAFEGUARDS: {
    MAX_BATCH_SIZE: 50,
    MAX_RETRIES: 3,
    TIMEOUT_MS: 30000, // 30 seconds
  },
} as const
