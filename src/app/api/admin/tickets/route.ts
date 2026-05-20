import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    const supabase = createAdminClient()

    if (action === 'verify_participant') {
      // Check quota
      const { data: event } = await supabase
        .from('events')
        .select('max_participants')
        .eq('id', data.event_id)
        .single()

      if (event?.max_participants) {
        const { count: approvedCount } = await supabase
          .from('participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', data.event_id)
          .in('status', ['verified', 'checked_in'])

        if (approvedCount !== null && approvedCount >= event.max_participants) {
          return NextResponse.json({ error: 'Kuota peserta sudah penuh' }, { status: 400 })
        }
      }

      const token = crypto.randomUUID()
      const count = data.current_count || 0
      const regNumber = `${data.ticket_prefix}-${String(count + 1).padStart(3, '0')}`
      const { error } = await supabase.from('participants').update({
        status: 'verified',
        registration_number: regNumber,
        ticket_token: token,
      }).eq('id', data.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      await supabase.from('audit_logs').insert({
        user_email: data.user_email || 'unknown',
        action: 'VERIFY_PARTICIPANT',
        details: `Verifikasi peserta ${data.name} - No: ${regNumber}`,
      })
      return NextResponse.json({ registration_number: regNumber, ticket_token: token })
    }

    if (action === 'send_message') {
      const { error } = await supabase.from('participants').update({
        admin_note: data.message,
      } as never).eq('id', data.id)

      if (error) {
        if (error.message?.includes('column') && error.message?.includes('admin_note')) {
          return NextResponse.json({ error: 'Kolom admin_note belum ada. Jalankan: ALTER TABLE event_management.participants ADD COLUMN admin_note TEXT; di Supabase SQL Editor.' }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      await supabase.from('audit_logs').insert({
        user_email: data.user_email || 'unknown',
        action: 'SEND_MESSAGE',
        details: `Mengirim pesan ke ${data.name}: ${data.message}`,
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'check_in') {
      const { error } = await supabase.from('participants').update({
        is_checked_in: true,
        status: 'checked_in',
      }).eq('id', data.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      await supabase.from('audit_logs').insert({
        user_email: data.user_email || 'unknown',
        action: 'CHECK_IN',
        details: `Check-in peserta: ${data.name} (${data.reg_number})`,
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
