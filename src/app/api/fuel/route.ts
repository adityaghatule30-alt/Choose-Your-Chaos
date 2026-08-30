import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { amount, note } = body

    if (!amount || typeof amount !== 'number' || amount < 10) {
      return NextResponse.json({ success: false, message: 'Invalid support amount.' }, { status: 400 })
    }

    // Award Supporter Badge & XP if authenticated
    const { data: profile } = await supabase.from('profiles').select('xp, chaos_score').eq('id', user.id).single()
    if (profile) {
      await supabase
        .from('profiles')
        .update({
          xp: (profile.xp || 0) + 100,
          chaos_score: (profile.chaos_score || 0) + 50,
        })
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      amount,
      message: 'Thank you for fueling the madness! You earned +100 XP and Supporter Karma 🔥',
    })
  } catch (err) {
    console.error('Error in fuel API:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
