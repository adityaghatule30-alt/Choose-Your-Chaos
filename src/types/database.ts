export type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  xp: number
  chaos_score: number
  role: 'user' | 'moderator' | 'admin'
  humor_level: 'light' | 'sarcastic' | 'dark'
  language: 'en' | 'hinglish'
  created_at: string
  updated_at: string
}
