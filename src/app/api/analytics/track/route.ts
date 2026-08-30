import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics/track'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    const { eventName, gameType, contentId, metadata, sessionId } = body

    if (!eventName) {
      return NextResponse.json({ error: 'MISSING_EVENT_NAME' }, { status: 400 })
    }

    await trackServerEvent(supabase, {
      eventName,
      userId: user?.id || null,
      sessionId,
      gameType,
      contentId,
      metadata,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
