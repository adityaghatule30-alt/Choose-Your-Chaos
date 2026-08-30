/**
 * In-Memory Sliding Window Rate Limiter for Next.js App Router Edge/Node Runtime
 * Protects endpoints against brute-force and rapid automated spamming.
 */

interface RateLimitRecord {
  timestamps: number[]
}

const tracker = new Map<string, RateLimitRecord>()

// Cleanup old memory records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of tracker.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60000)
      if (record.timestamps.length === 0) {
        tracker.delete(key)
      }
    }
  }, 300000)
}

export function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now()
  let record = tracker.get(identifier)

  if (!record) {
    record = { timestamps: [] }
    tracker.set(identifier, record)
  }

  // Filter out timestamps older than the active window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs)

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0]
    const reset = Math.ceil((oldestTimestamp + windowMs - now) / 1000)
    return { success: false, remaining: 0, reset }
  }

  record.timestamps.push(now)
  return {
    success: true,
    remaining: limit - record.timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  }
}
