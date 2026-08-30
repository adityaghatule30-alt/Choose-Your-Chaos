import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyStaffRole, logAdminAudit } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { isAuthorized } = await verifyStaffRole(supabase, 'moderator')
    if (!isAuthorized) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'truth_dare' // questions | truth_dare
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 25
    const offset = (page - 1) * limit

    if (type === 'questions') {
      const { data: items, count, error } = await supabase
        .from('questions')
        .select(`
          id, question, option_a, option_b, category_id, difficulty, humor_level, language,
          safety_status, active, source, content_status, quality_score, safety_score, created_at,
          categories(name, emoji)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
      return NextResponse.json({ items, total: count, page, limit })
    } else {
      const { data: items, count, error } = await supabase
        .from('truth_dare_items')
        .select(`
          id, type, prompt, difficulty, humor_level, language,
          safety_status, active, source, content_status, quality_score, safety_score, created_at,
          categories(name, emoji)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
      return NextResponse.json({ items, total: count, page, limit })
    }
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user, isAuthorized } = await verifyStaffRole(supabase, 'moderator')
    if (!isAuthorized || !user) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const body = await request.json()
    const { target_type, target_id, action } = body // action: approve | reject | activate | deactivate | retire

    if (!['questions', 'truth_dare_items'].includes(target_type) || !target_id) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }

    const updates: Record<string, any> = {
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }

    if (action === 'approve') {
      updates.safety_status = 'approved'
      updates.content_status = 'active'
      updates.active = true
    } else if (action === 'reject') {
      updates.safety_status = 'removed'
      updates.content_status = 'rejected'
      updates.active = false
    } else if (action === 'activate') {
      updates.active = true
      updates.content_status = 'active'
    } else if (action === 'deactivate') {
      updates.active = false
    } else if (action === 'retire') {
      updates.active = false
      updates.content_status = 'retired'
    }

    const { error } = await supabase.from(target_type).update(updates).eq('id', target_id)

    if (error) {
      return NextResponse.json({ error: 'UPDATE_FAILED', message: error.message }, { status: 500 })
    }

    await logAdminAudit(supabase, user.id, `content_${action}`, target_type, target_id, updates)

    return NextResponse.json({ success: true, message: `Content ${action}d successfully.` })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
