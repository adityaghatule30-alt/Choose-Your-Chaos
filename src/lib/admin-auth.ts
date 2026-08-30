import { SupabaseClient, User } from '@supabase/supabase-js'

export type UserRole = 'user' | 'moderator' | 'admin'

export interface AuthRoleResult {
  user: User | null
  role: UserRole | null
  isAdmin: boolean
  isModerator: boolean
  isAuthorized: boolean
}

export async function verifyStaffRole(
  supabase: SupabaseClient,
  requiredRole: 'moderator' | 'admin' = 'moderator'
): Promise<AuthRoleResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      role: null,
      isAdmin: false,
      isModerator: false,
      isAuthorized: false,
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile?.role as UserRole) || 'user'
  const isAdmin = role === 'admin'
  const isModerator = role === 'moderator' || isAdmin

  const isAuthorized = requiredRole === 'admin' ? isAdmin : isModerator

  return {
    user,
    role,
    isAdmin,
    isModerator,
    isAuthorized,
  }
}

export async function logAdminAudit(
  supabase: SupabaseClient,
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, any> = {}
) {
  try {
    await supabase.from('admin_audit_logs').insert({
      actor_id: actorId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    })
  } catch {}
}
