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
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 25
    const offset = (page - 1) * limit

    let query = supabase
      .from('judge_cases')
      .select(`
        id, author_id, title, description, category_id, status, created_at,
        profiles:author_id (username),
        categories(name, emoji)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: cases, count, error } = await query.range(offset, offset + limit - 1)

    if (error) return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
    return NextResponse.json({ cases, total: count, page, limit })
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
    const { case_id, status } = body // approved | removed | reported

    if (!case_id || !['approved', 'removed', 'reported'].includes(status)) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }

    const { error } = await supabase
      .from('judge_cases')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', case_id)

    if (error) {
      return NextResponse.json({ error: 'UPDATE_FAILED' }, { status: 500 })
    }

    await logAdminAudit(supabase, user.id, `judge_case_${status}`, 'judge_cases', case_id)

    return NextResponse.json({ success: true, message: `Case status updated to ${status}.` })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
