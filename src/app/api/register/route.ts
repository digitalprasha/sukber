import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { event_id, name, email, whatsapp, payment_proof_url } = await request.json()

    if (!event_id || !name || !email || !whatsapp) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('participants')
      .select('id, status')
      .eq('event_id', event_id)
      .or(`email.eq.${email},whatsapp.eq.${whatsapp}`)
      .in('status', ['verified', 'checked_in'])
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Email atau nomor WhatsApp sudah terdaftar dan telah disetujui untuk event ini. Jika ingin mendaftar ulang, hubungi admin.' }, { status: 409 })
    }

    const { data: participant, error } = await supabase
      .from('participants')
      .insert({
        event_id,
        name,
        email,
        whatsapp,
        payment_proof_url,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('audit_logs').insert({
      user_email: email,
      action: 'REGISTER',
      details: `Pendaftaran baru untuk event ${event_id} oleh ${name}`,
    })

    return NextResponse.json({ success: true, participant })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Registration failed' }, { status: 500 })
  }
}
