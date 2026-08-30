import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyStaffRole, logAdminAudit } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { isAuthorized, isAdmin } = await verifyStaffRole(supabase, 'moderator')
    if (!isAuthorized) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 25
    const offset = (page - 1) * limit

    let query = supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, role, xp, chaos_score, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('username', `%${search}%`)
    }

    const { data: users, count, error } = await query.range(offset, offset + limit - 1)

    if (error) return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
    return NextResponse.json({ users, total: count, page, limit, isAdmin })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user, isAdmin } = await verifyStaffRole(supabase, 'admin')
    if (!isAdmin || !user) {
      return NextResponse.json({ error: 'ADMIN_ONLY', message: 'Only full administrators can change user roles.' }, { status: 403 })
    }

    const body = await request.json()
    const { user_id, role } = body // user | moderator | admin

    if (!user_id || !['user', 'moderator', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }

    const { error } = await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', user_id)

    if (error) {
      return NextResponse.json({ error: 'UPDATE_FAILED' }, { status: 500 })
    }

    await logAdminAudit(supabase, user.id, 'change_role', 'profiles', user_id, { new_role: role })

    return NextResponse.json({ success: true, message: `User role updated to ${role}.` })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
