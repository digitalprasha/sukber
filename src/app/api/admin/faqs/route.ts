import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('faqs').select('*').order('display_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const { question, answer, display_order } = await request.json()
  if (!question || !answer) {
    return NextResponse.json({ error: 'Question dan answer harus diisi' }, { status: 400 })
  }
  const { data, error } = await supabase.from('faqs').insert({ question, answer, display_order: display_order || 0 }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.from('audit_logs').insert({ action: 'FAQ_CREATE', details: `FAQ baru: ${question}` })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = createAdminClient()
  const { id, question, answer, display_order, is_active } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID harus diisi' }, { status: 400 })
  const { data, error } = await supabase.from('faqs').update({ question, answer, display_order, is_active }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.from('audit_logs').insert({ action: 'FAQ_UPDATE', details: `FAQ update: ${question}` })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient()
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID harus diisi' }, { status: 400 })
  const { error } = await supabase.from('faqs').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.from('audit_logs').insert({ action: 'FAQ_DELETE', details: `FAQ dihapus (ID: ${id})` })
  return NextResponse.json({ success: true })
}
