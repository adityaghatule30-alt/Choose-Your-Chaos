import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyStaffRole } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { isAuthorized } = await verifyStaffRole(supabase, 'moderator')
    if (!isAuthorized) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'all_time'

    let dateFilter: string | null = null
    const now = new Date()
    if (timeframe === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      dateFilter = today.toISOString()
    } else if (timeframe === '7d') {
      const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = d7.toISOString()
    } else if (timeframe === '30d') {
      const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = d30.toISOString()
    } else if (timeframe === '90d') {
      const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      dateFilter = d90.toISOString()
    }

    let eventsQuery = supabase.from('analytics_events').select('event_name, game_type, created_at')
    let votesQuery = supabase.from('question_votes').select('id, choice, created_at')
    let judgeQuery = supabase.from('judge_cases').select('id, status, created_at')
    let roomsQuery = supabase.from('rooms').select('id, status, created_at')

    if (dateFilter) {
      eventsQuery = eventsQuery.gte('created_at', dateFilter)
      votesQuery = votesQuery.gte('created_at', dateFilter)
      judgeQuery = judgeQuery.gte('created_at', dateFilter)
      roomsQuery = roomsQuery.gte('created_at', dateFilter)
    }

    const [eventsRes, votesRes, judgeRes, roomsRes, usersCountRes] = await Promise.all([
      eventsQuery,
      votesQuery,
      judgeQuery,
      roomsQuery,
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])

    const events = eventsRes.data || []
    const votes = votesRes.data || []
    const cases = judgeRes.data || []
    const rooms = roomsRes.data || []

    const eitherOrAnswers = votes.length
    const countA = votes.filter((v) => v.choice === 'A').length
    const countB = votes.filter((v) => v.choice === 'B').length

    const totalRooms = rooms.length
    const completedRooms = rooms.filter((r) => r.status === 'finished').length
    const playingRooms = rooms.filter((r) => r.status === 'playing').length

    const totalCases = cases.length
    const approvedCases = cases.filter((c) => c.status === 'approved').length

    const eventCounts: Record<string, number> = {}
    for (const ev of events) {
      eventCounts[ev.event_name] = (eventCounts[ev.event_name] || 0) + 1
    }

    const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || process.env.NEXT_PUBLIC_ADSENSE_PUB_ID
    const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true' && Boolean(publisherId && publisherId.startsWith('ca-pub-'))

    const analyticsData = {
      timeframe,
      overview: {
        total_registered_users: usersCountRes.count || 0,
        either_or_votes: eitherOrAnswers,
        judge_cases_filed: totalCases,
        rooms_created: totalRooms,
        rooms_completed: completedRooms,
        events_recorded: events.length,
      },
      either_or: {
        total_votes: eitherOrAnswers,
        choice_a_count: countA,
        choice_b_count: countB,
        percent_a: eitherOrAnswers > 0 ? Math.round((countA / eitherOrAnswers) * 100) : 50,
        percent_b: eitherOrAnswers > 0 ? 100 - Math.round((countA / eitherOrAnswers) * 100) : 50,
      },
      judge_me: {
        cases_submitted: totalCases,
        cases_approved: approvedCases,
        comments_posted: eventCounts['judge_comment_created'] || 0,
        reactions_added: eventCounts['judge_reaction_added'] || 0,
      },
      rooms: {
        created: totalRooms,
        playing: playingRooms,
        finished: completedRooms,
        completion_rate: totalRooms > 0 ? Math.round((completedRooms / totalRooms) * 100) : 0,
      },
      monetization: {
        ads_enabled: adsEnabled,
        publisher_configured: Boolean(publisherId && publisherId.startsWith('ca-pub-')),
        ad_slots_rendered: eventCounts['ad_slot_viewed'] || 0,
        status: adsEnabled ? 'Live Monetization Active' : 'AdSense Ready (Awaiting Publisher ID & Approval)',
      },
      event_breakdown: eventCounts,
    }

    return NextResponse.json({ analytics: analyticsData })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
