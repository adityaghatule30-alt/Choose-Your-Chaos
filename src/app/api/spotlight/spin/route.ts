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
    const { room_id } = body

    const { data: room, error: roomErr } = await supabase
      .from('spotlight_rooms')
      .select('*')
      .eq('id', room_id)
      .single()

    if (roomErr || !room) {
      return NextResponse.json({ success: false, message: 'Room not found.' }, { status: 404 })
    }

    if (room.host_id !== user.id) {
      return NextResponse.json({ success: false, message: 'Only host can spin the spotlight.' }, { status: 403 })
    }

    // Fetch members
    const { data: members } = await supabase
      .from('spotlight_members')
      .select('user_id')
      .eq('room_id', room.id)

    if (!members || members.length < 2) {
      return NextResponse.json({ success: false, message: 'Need at least 2 players in the room to spin!' }, { status: 400 })
    }

    const memberIds = members.map((m) => m.user_id)
    let history: string[] = room.spotlight_history || []

    // Eligible candidates who have not been in spotlight in current cycle
    let eligible = memberIds.filter((id) => !history.includes(id))

    // If everyone has been selected, reset cycle history
    if (eligible.length === 0) {
      history = []
      eligible = memberIds
    }

    // Pick random eligible player
    const chosenUserId = eligible[Math.floor(Math.random() * eligible.length)]
    history.push(chosenUserId)

    // Update room to spinning / questioning
    await supabase
      .from('spotlight_rooms')
      .update({
        status: 'questioning',
        current_spotlight_user_id: chosenUserId,
        spotlight_history: history,
        skips_remaining: 2,
        updated_at: new Date().toISOString(),
      })
      .eq('id', room.id)

    return NextResponse.json({ success: true, chosen_user_id: chosenUserId })
  } catch (err) {
    console.error('Error spinning spotlight:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
