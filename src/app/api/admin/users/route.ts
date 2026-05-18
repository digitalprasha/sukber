import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { email, role } = await request.json()
  const supabase = createAdminClient()

  if (!email || !role) {
    return NextResponse.json({ error: 'Email dan role harus diisi' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('staff')
    .insert({ email, role })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    user_email: 'system',
    action: 'STAFF_CREATE',
    details: `Staff baru: ${email} (${role})`,
  })

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const { id, role } = await request.json()
  const supabase = createAdminClient()

  if (!id || !role) {
    return NextResponse.json({ error: 'ID dan role harus diisi' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('staff')
    .select('is_deletable')
    .eq('id', id)
    .single()

  if (existing && !existing.is_deletable) {
    return NextResponse.json({ error: 'Role akun proteksi tidak bisa diubah' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('staff')
    .update({ role })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('audit_logs').insert({
    user_email: 'system',
    action: 'STAFF_UPDATE',
    details: `Staff ${data.email} role diubah ke ${role}`,
  })

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const supabase = createAdminClient()

  const { data: staff, error: fetchError } = await supabase
    .from('staff')
    .select('email, is_deletable')
    .eq('id', id)
    .single()

  if (fetchError) return NextResponse.json({ error: 'Staff tidak ditemukan' }, { status: 404 })
  if (!staff.is_deletable) return NextResponse.json({ error: 'Staff ini tidak bisa dihapus' }, { status: 403 })

  const { error } = await supabase.from('staff').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('audit_logs').insert({
    user_email: 'system',
    action: 'STAFF_DELETE',
    details: `Staff dihapus: ${staff.email}`,
  })

  return NextResponse.json({ success: true })
}
