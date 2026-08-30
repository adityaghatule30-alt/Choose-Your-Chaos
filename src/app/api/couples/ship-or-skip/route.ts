import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRandomChaosAIComment } from '@/lib/services/chaos-ai'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const body = await request.json()
    const { partner1, partner2, vibeRating, chaosRating } = body

    if (!partner1 || !partner2) {
      return NextResponse.json({ success: false, message: 'Both willing participants required.' }, { status: 400 })
    }

    // Calculate dynamic compatibility
    const compatPercent = Math.min(99, Math.max(12, Math.floor(Math.random() * 85) + 15))
    const chemistryScore = Math.floor(Math.random() * 100)
    const chaosScore = Math.floor(Math.random() * 100)

    let finalVerdict = 'SHIP IT 🚢'
    let summary = 'Certified chaotic chemistry. Proceed with absolute caution.'

    if (compatPercent >= 75) {
      finalVerdict = 'SHIP IT 🚢'
      summary = 'High compatibility detected. The wedding planners have been alerted.'
    } else if (compatPercent >= 50) {
      finalVerdict = 'FRIENDSHIP BOAT 🛶'
      summary = 'Solid alliance. Better off as partners in crime than lovers.'
    } else if (compatPercent >= 30) {
      finalVerdict = 'SHIP FROZEN 🧊'
      summary = 'Sub-zero temperatures. Needs intense thermal resuscitation.'
    } else {
      finalVerdict = 'SHIPWRECKED 💥'
      summary = 'Abandon ship immediately. Zero survivors predicted.'
    }

    const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
    if (profile) {
      await supabase
        .from('profiles')
        .update({ xp: (profile.xp || 0) + 15 })
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      compatPercent,
      chemistryScore,
      chaosScore,
      finalVerdict,
      summary,
      chaosAi: getRandomChaosAIComment(),
    })
  } catch (err) {
    console.error('Error in ship or skip:', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
