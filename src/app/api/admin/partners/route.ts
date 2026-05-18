import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('partners').select('*').order('display_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const { name, logo_url, website_url, category, display_order } = await request.json()
  if (!name || !category) {
    return NextResponse.json({ error: 'Nama dan kategori harus diisi' }, { status: 400 })
  }
  const { data, error } = await supabase.from('partners').insert({ name, logo_url, website_url, category, display_order: display_order || 0 }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.from('audit_logs').insert({ action: 'PARTNER_CREATE', details: `Partner baru: ${name}` })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = createAdminClient()
  const { id, name, logo_url, website_url, category, display_order, is_active } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID harus diisi' }, { status: 400 })
  const { data, error } = await supabase.from('partners').update({ name, logo_url, website_url, category, display_order, is_active }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.from('audit_logs').insert({ action: 'PARTNER_UPDATE', details: `Partner update: ${name}` })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient()
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID harus diisi' }, { status: 400 })
  const { error } = await supabase.from('partners').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.from('audit_logs').insert({ action: 'PARTNER_DELETE', details: `Partner dihapus (ID: ${id})` })
  return NextResponse.json({ success: true })
}
