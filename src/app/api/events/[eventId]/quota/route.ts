import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: event } = await supabase
    .from('events')
    .select('max_participants')
    .eq('id', eventId)
    .single()

  if (!event?.max_participants) {
    return NextResponse.json({ remaining: null })
  }

  const { count } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .in('status', ['verified', 'checked_in'])

  const remaining = event.max_participants - (count || 0)
  return NextResponse.json({ remaining: Math.max(0, remaining) })
}
