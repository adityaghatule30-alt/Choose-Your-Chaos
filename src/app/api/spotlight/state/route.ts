import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SpotlightRoom, SpotlightQuestion, SpotlightMember } from '@/types/spotlight'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.toUpperCase()

    if (!code) {
      return NextResponse.json({ success: false, message: 'Code required.' }, { status: 400 })
    }

    const { data: room, error: roomErr } = await supabase
      .from('spotlight_rooms')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (roomErr || !room) {
      return NextResponse.json({ success: false, message: 'Room not found.' }, { status: 404 })
    }

    // Fetch members
    const { data: members } = await supabase
      .from('spotlight_members')
      .select('*')
      .eq('room_id', room.id)
      .order('joined_at', { ascending: true })

    // Fetch questions
    const { data: questions } = await supabase
      .from('spotlight_questions')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at', { ascending: false })

    const questionIds = (questions || []).map((q) => q.id)

    // Fetch reactions
    const { data: reactions } =
      questionIds.length > 0
        ? await supabase
            .from('spotlight_reactions')
            .select('question_id, user_id, reaction')
            .in('question_id', questionIds)
        : { data: [] }

    const formattedQuestions: SpotlightQuestion[] = (questions || []).map((q) => {
      const qReactions = (reactions || []).filter((r) => r.question_id === q.id)
      const reactions_count: Record<string, number> = {}
      for (const r of qReactions) {
        reactions_count[r.reaction] = (reactions_count[r.reaction] || 0) + 1
      }
      const user_reactions = qReactions.filter((r) => r.user_id === user.id).map((r) => r.reaction)

      return {
        ...q,
        reactions_count,
        user_reactions,
      }
    })

    const spotlightUser = members?.find((m) => m.user_id === room.current_spotlight_user_id) || null

    const roomPayload: SpotlightRoom = {
      ...room,
      members: members || [],
      spotlight_user: spotlightUser,
      questions: formattedQuestions,
      is_host: room.host_id === user.id,
      is_spotlight: room.current_spotlight_user_id === user.id,
    }

    return NextResponse.json({ success: true, room: roomPayload })
  } catch (err) {
    console.error('Error in spotlight state:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
