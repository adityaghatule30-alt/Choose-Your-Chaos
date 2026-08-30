import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { JudgeCase, JudgeCaseStats } from '@/types/judge'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'trending'
    const caseId = searchParams.get('id')

    if (caseId) {
      const { data: item, error } = await supabase
        .from('judge_cases')
        .select(`
          id, author_id, title, description, category_id, status, created_at, updated_at,
          profiles:author_id (id, username, display_name, avatar_url),
          categories:category_id (id, name, slug, emoji)
        `)
        .eq('id', caseId)
        .maybeSingle()

      if (error) {
        console.error(`Error querying judge case ${caseId}:`, error)
        return NextResponse.json({ error: 'DB_ERROR', message: error.message }, { status: 500 })
      }

      if (!item) {
        console.warn(`Judge case not found for id: ${caseId}`)
        return NextResponse.json({ error: 'CASE_NOT_FOUND' }, { status: 404 })
      }

      if (item.status !== 'approved' && item.author_id !== user?.id) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
      }

      const { data: votes } = await supabase
        .from('judge_votes')
        .select('user_id, verdict')
        .eq('case_id', caseId)

      const total = votes?.length || 0
      const not_guilty = votes?.filter((v) => v.verdict === 'not_guilty').length || 0
      const guilty = votes?.filter((v) => v.verdict === 'guilty').length || 0
      const criminal = votes?.filter((v) => v.verdict === 'criminal').length || 0

      const stats: JudgeCaseStats = {
        not_guilty_count: not_guilty,
        guilty_count: guilty,
        criminal_count: criminal,
        total,
        percent_not_guilty: total > 0 ? Math.round((not_guilty / total) * 100) : 33,
        percent_guilty: total > 0 ? Math.round((guilty / total) * 100) : 33,
        percent_criminal:
          total > 0
            ? 100 - (Math.round((not_guilty / total) * 100) + Math.round((guilty / total) * 100))
            : 34,
      }

      const userVote = user ? votes?.find((v) => v.user_id === user.id)?.verdict : null

      const { count: commentCount } = await supabase
        .from('judge_comments')
        .select('*', { count: 'exact', head: true })
        .eq('case_id', caseId)
        .eq('status', 'approved')

      const caseDetails: JudgeCase = {
        id: item.id,
        author_id: item.author_id,
        title: item.title,
        description: item.description,
        category_id: item.category_id,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        author: item.profiles as any,
        category: item.categories as any,
        stats,
        comments_count: commentCount || 0,
        user_voted: (userVote as any) || null,
      }

      return NextResponse.json({ case: caseDetails })
    }

    let query = supabase
      .from('judge_cases')
      .select(`
        id, author_id, title, description, category_id, status, created_at, updated_at,
        profiles:author_id (id, username, display_name, avatar_url),
        categories:category_id (id, name, slug, emoji)
      `)

    if (user) {
      query = query.or(`status.eq.approved,author_id.eq.${user.id}`)
    } else {
      query = query.eq('status', 'approved')
    }

    const { data: cases, error } = await query.order('created_at', { ascending: false }).limit(40)

    if (error) {
      console.error('Error fetching judge cases list:', error)
      return NextResponse.json({ error: 'DB_ERROR', message: error.message }, { status: 500 })
    }

    const caseIds = (cases || []).map((c) => c.id)

    const [votesRes, commentsRes] = await Promise.all([
      caseIds.length > 0
        ? supabase.from('judge_votes').select('case_id, user_id, verdict').in('case_id', caseIds)
        : { data: [] },
      caseIds.length > 0
        ? supabase.from('judge_comments').select('case_id').in('case_id', caseIds).eq('status', 'approved')
        : { data: [] },
    ])

    const votes = votesRes.data || []
    const comments = commentsRes.data || []

    const casesWithStats: JudgeCase[] = (cases || []).map((item) => {
      const caseVotes = votes.filter((v) => v.case_id === item.id)
      const total = caseVotes.length
      const not_guilty = caseVotes.filter((v) => v.verdict === 'not_guilty').length
      const guilty = caseVotes.filter((v) => v.verdict === 'guilty').length
      const criminal = caseVotes.filter((v) => v.verdict === 'criminal').length

      const pct_ng = total > 0 ? Math.round((not_guilty / total) * 100) : 33
      const pct_g = total > 0 ? Math.round((guilty / total) * 100) : 33
      const pct_c = total > 0 ? 100 - (pct_ng + pct_g) : 34

      const userVote = user ? caseVotes.find((v) => v.user_id === user.id)?.verdict : null
      const commentCount = comments.filter((c) => c.case_id === item.id).length

      return {
        id: item.id,
        author_id: item.author_id,
        title: item.title,
        description: item.description,
        category_id: item.category_id,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        author: item.profiles as any,
        category: item.categories as any,
        stats: {
          not_guilty_count: not_guilty,
          guilty_count: guilty,
          criminal_count: criminal,
          total,
          percent_not_guilty: pct_ng,
          percent_guilty: pct_g,
          percent_criminal: pct_c,
        },
        comments_count: commentCount,
        user_voted: (userVote as any) || null,
      }
    })

    let sortedCases = casesWithStats

    if (filter === 'trending') {
      sortedCases = casesWithStats.sort((a, b) => {
        const scoreA = (a.stats?.total || 0) + (a.comments_count || 0) * 2
        const scoreB = (b.stats?.total || 0) + (b.comments_count || 0) * 2
        return scoreB - scoreA
      })
    } else if (filter === 'controversial') {
      sortedCases = casesWithStats.sort((a, b) => {
        const statsA = a.stats
        const statsB = b.stats
        const varA =
          statsA && statsA.total > 0
            ? 100 - Math.max(statsA.percent_not_guilty, statsA.percent_guilty, statsA.percent_criminal)
            : 0
        const varB =
          statsB && statsB.total > 0
            ? 100 - Math.max(statsB.percent_not_guilty, statsB.percent_guilty, statsB.percent_criminal)
            : 0
        return varB - varA
      })
    }

    return NextResponse.json({ cases: sortedCases })
  } catch (err) {
    console.error('Judge cases GET failed:', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category_slug } = body

    if (!title || title.trim().length < 5 || title.trim().length > 200) {
      return NextResponse.json(
        { error: 'INVALID_TITLE', message: 'Title must be between 5 and 200 characters.' },
        { status: 400 }
      )
    }

    if (!description || description.trim().length < 15 || description.trim().length > 2000) {
      return NextResponse.json(
        { error: 'INVALID_DESCRIPTION', message: 'Situation must be between 15 and 2000 characters.' },
        { status: 400 }
      )
    }

    let categoryId: string | null = null
    if (category_slug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category_slug)
        .maybeSingle()
      if (cat) categoryId = cat.id
    }

    const { data: newCase, error } = await supabase
      .from('judge_cases')
      .insert({
        author_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        status: 'approved',
      })
      .select('id, status, title')
      .single()

    if (error) {
      console.error('Error inserting judge case:', error)
      return NextResponse.json(
        { error: 'DB_ERROR', message: error.message || 'Your case didn’t reach the courtroom. Try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      case: newCase,
      message: 'Case submitted. The court is reviewing your evidence. ⚖️',
    })
  } catch (err) {
    console.error('Judge cases POST failed:', err)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Your case didn’t reach the courtroom. Try again.' },
      { status: 500 }
    )
  }
}
