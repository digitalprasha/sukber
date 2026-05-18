import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    const supabase = createAdminClient()

    if (action === 'create_event') {
      const insertData: Record<string, unknown> = {
        title: data.title,
        slug: data.slug,
        ticket_prefix: data.ticket_prefix,
        description: data.description,
        flyer_url: data.flyer_url || '',
        registration_enabled: data.registration_enabled ?? true,
        registration_fee: data.registration_fee ?? 0,
        max_participants: data.max_participants || null,
        registration_deadline: data.registration_deadline || null,
        payment_info: data.payment_info || '',
      }
      const { data: event, error } = await supabase
        .from('events')
        .insert(insertData)
        .select('id')
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      await supabase.from('audit_logs').insert({
        user_email: data.user_email || 'unknown',
        action: 'CREATE_EVENT',
        details: `Membuat event baru: ${data.title}`,
      })

      return NextResponse.json({ id: event.id })
    }

    if (action === 'delete_event') {
      const { error } = await supabase.from('events').delete().eq('id', data.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      await supabase.from('audit_logs').insert({
        user_email: data.user_email || 'unknown',
        action: 'DELETE_EVENT',
        details: `Menghapus event: ${data.title}`,
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'add_sponsor') {
      const { error } = await supabase.from('sponsors').insert({ event_id: data.event_id, name: data.name, logo_url: data.logo_url })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    const supabase = createAdminClient()

    if (action === 'toggle_active') {
      const { error } = await supabase.from('events').update({ is_active: data.is_active }).eq('id', data.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      await supabase.from('audit_logs').insert({
        user_email: data.user_email || 'unknown',
        action: 'TOGGLE_EVENT',
        details: `${data.is_active ? 'Mengaktifkan' : 'Menonaktifkan'} event: ${data.title}`,
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'update_event') {
      const { error } = await supabase.from('events').update(data.fields).eq('id', data.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      await supabase.from('audit_logs').insert({
        user_email: data.user_email || 'unknown',
        action: 'UPDATE_EVENT',
        details: `Mengupdate event: ${data.title}`,
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'reset_event') {
      await supabase.from('sponsors').delete().eq('event_id', data.id)
      await supabase.from('participants').delete().eq('event_id', data.id)
      await supabase.from('audit_logs').insert({
        user_email: data.user_email || 'unknown',
        action: 'RESET_EVENT',
        details: `Reset data event: ${data.title}`,
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'update_sponsor') {
      const { error } = await supabase.from('sponsors').update(data.fields).eq('id', data.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')
    const supabase = createAdminClient()

    if (action === 'delete_sponsor') {
      const { error } = await supabase.from('sponsors').delete().eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
