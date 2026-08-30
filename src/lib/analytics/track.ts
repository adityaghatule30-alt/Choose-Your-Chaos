import { SupabaseClient } from '@supabase/supabase-js'
import { AnalyticsEventPayload } from './types'

/**
 * Server-side non-blocking analytics tracker
 */
export async function trackServerEvent(
  supabase: SupabaseClient,
  payload: AnalyticsEventPayload
) {
  try {
    await supabase.from('analytics_events').insert({
      user_id: payload.userId || null,
      session_id: payload.sessionId || null,
      event_name: payload.eventName,
      game_type: payload.gameType || null,
      content_id: payload.contentId || null,
      metadata: payload.metadata || {},
    })
  } catch (err) {
    // Fail silently so analytics NEVER blocks core gameplay
    console.error('Analytics tracking failed silently:', err)
  }
}

/**
 * Client-side asynchronous analytics dispatcher
 */
export function trackClientEvent(payload: AnalyticsEventPayload) {
  if (typeof window === 'undefined') return
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}
