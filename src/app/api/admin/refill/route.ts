import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContentRefillService } from '@/lib/content/refill'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    // Verify admin role via server query
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const refillService = new ContentRefillService(supabase)
    const poolStatus = await refillService.checkPoolStatus()

    return NextResponse.json({
      poolStatus,
      generator: refillService.getGenerator() instanceof Object ? 'Available' : 'Fallback',
    })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    // Create job record
    const { data: job } = await supabase
      .from('content_generation_jobs')
      .insert({
        content_type: 'either_or',
        requested_count: 50,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    const refillService = new ContentRefillService(supabase)
    const result = await refillService.executeRefill(job?.id)

    return NextResponse.json({
      success: true,
      jobId: job?.id,
      result,
    })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
