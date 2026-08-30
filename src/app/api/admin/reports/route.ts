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
      .from('reports')
      .select(`
        id, target_type, target_id, reason, details, status, created_at, resolved_at,
        profiles:reporter_id (username)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: reports, count, error } = await query.range(offset, offset + limit - 1)

    if (error) return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
    return NextResponse.json({ reports, total: count, page, limit })
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
    const { report_id, status } = body // reviewing | resolved | dismissed

    if (!report_id || !['reviewing', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }

    const updates: Record<string, any> = {
      status,
      resolved_by: user.id,
      resolved_at: status !== 'reviewing' ? new Date().toISOString() : null,
    }

    const { error } = await supabase.from('reports').update(updates).eq('id', report_id)

    if (error) {
      return NextResponse.json({ error: 'UPDATE_FAILED' }, { status: 500 })
    }

    await logAdminAudit(supabase, user.id, `report_${status}`, 'reports', report_id)

    return NextResponse.json({ success: true, message: `Report marked as ${status}.` })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
