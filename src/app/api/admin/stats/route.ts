import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyStaffRole } from '@/lib/admin-auth'

export async function GET() {
  try {
    const supabase = await createClient()
    const { isAuthorized, role } = await verifyStaffRole(supabase, 'moderator')

    if (!isAuthorized) {
      return NextResponse.json({ error: 'FORBIDDEN', message: 'You don’t have permission to enter the chaos control room.' }, { status: 403 })
    }

    const [
      usersRes,
      questionsRes,
      truthRes,
      dareRes,
      judgePendingRes,
      reportsPendingRes,
      jobsRes,
      roomsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('truth_dare_items').select('*', { count: 'exact', head: true }).eq('type', 'truth').eq('active', true),
      supabase.from('truth_dare_items').select('*', { count: 'exact', head: true }).eq('type', 'dare').eq('active', true),
      supabase.from('judge_cases').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('content_generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('rooms').select('*', { count: 'exact', head: true }),
    ])

    const stats = {
      total_users: usersRes.count || 0,
      active_questions: questionsRes.count || 0,
      active_truth_items: truthRes.count || 0,
      active_dare_items: dareRes.count || 0,
      pending_judge_cases: judgePendingRes.count || 0,
      pending_reports: reportsPendingRes.count || 0,
      generation_jobs_completed: jobsRes.count || 0,
      total_rooms: roomsRes.count || 0,
      pool_health: {
        either_or: { count: questionsRes.count || 0, threshold: 200, status: (questionsRes.count || 0) >= 200 ? 'Healthy' : 'Needs refill' },
        truth: { count: truthRes.count || 0, threshold: 100, status: (truthRes.count || 0) >= 100 ? 'Healthy' : 'Needs refill' },
        dare: { count: dareRes.count || 0, threshold: 100, status: (dareRes.count || 0) >= 100 ? 'Healthy' : 'Needs refill' },
      }
    }

    return NextResponse.json({ stats, role })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
