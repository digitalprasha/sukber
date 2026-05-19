import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    const supabase = createAdminClient()

    if (action === 'verify_participant') {
      const count = data.current_count || 0
      const regNumber = `SBS-${data.ticket_prefix}-${String(count + 1).padStart(3, '0')}`
      const { error } = await supabase.from('participants').update({
        status: 'verified',
        registration_number: regNumber,
      }).eq('id', data.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      await supabase.from('audit_logs').insert({
        user_email: data.user_email || 'unknown',
        action: 'VERIFY_PARTICIPANT',
        details: `Verifikasi peserta ${data.name} - No: ${regNumber}`,
      })
      return NextResponse.json({ registration_number: regNumber })
    }

    if (action === 'reject_participant') {
      const { error } = await supabase.from('participants').update({
        status: 'pending',
        payment_proof_url: '',
      }).eq('id', data.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      await supabase.from('audit_logs').insert({
        user_email: data.user_email || 'unknown',
        action: 'REJECT_PARTICIPANT',
        details: `Menolak peserta ${data.name}`,
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
