export interface UserSocials {
  instagram?: string
  twitter?: string
  youtube?: string
  discord?: string
  github?: string
  linkedin?: string
  custom?: string
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined' | 'blocked'

export interface FriendProfile {
  id: string
  username: string
  display_name: string
  avatar_url?: string | null
  bio?: string | null
  xp?: number
  chaos_score?: number
  socials?: UserSocials | null
  friendship_status?: FriendshipStatus
  friendship_id?: string
  created_at?: string
}

export interface DirectMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: {
    display_name: string
    username: string
    avatar_url?: string | null
  }
}

export interface ConversationSummary {
  id: string
  friend: FriendProfile
  last_message?: DirectMessage | null
  unread_count?: number
  updated_at: string
}
