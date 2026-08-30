export type AnalyticsEventName =
  | 'signup'
  | 'login'
  | 'logout'
  | 'either_or_started'
  | 'either_or_answered'
  | 'truth_started'
  | 'truth_completed'
  | 'dare_started'
  | 'dare_completed'
  | 'judge_feed_viewed'
  | 'judge_case_created'
  | 'judge_case_voted'
  | 'judge_comment_created'
  | 'judge_reaction_added'
  | 'judge_report_created'
  | 'room_created'
  | 'room_joined'
  | 'room_started'
  | 'room_round_completed'
  | 'room_completed'
  | 'xp_earned'
  | 'level_up'
  | 'achievement_unlocked'
  | 'ad_slot_viewed'

export interface AnalyticsEventPayload {
  eventName: AnalyticsEventName
  userId?: string | null
  sessionId?: string | null
  gameType?: 'either_or' | 'truth' | 'dare' | 'judge_me' | 'rooms' | null
  contentId?: string | null
  metadata?: Record<string, any>
}
