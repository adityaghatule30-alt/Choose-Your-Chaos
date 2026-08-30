import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CHAOS_AVATARS } from '@/lib/avatars'

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
    const { avatar_url, display_name, bio } = body

    // Validate avatar_url if provided
    if (avatar_url && !CHAOS_AVATARS.some((a) => a.path === avatar_url)) {
      return NextResponse.json({ success: false, message: 'Invalid avatar selected.' }, { status: 400 })
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (avatar_url !== undefined) updates.avatar_url = avatar_url
    if (display_name !== undefined && display_name.trim().length >= 2) {
      updates.display_name = display_name.trim().slice(0, 30)
    }
    if (bio !== undefined) updates.bio = bio.trim().slice(0, 160)

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (err) {
    console.error('Error updating user profile:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
