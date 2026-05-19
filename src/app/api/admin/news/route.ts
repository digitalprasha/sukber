import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const perPage = 10
    const supabase = createAdminClient()

    if (id) {
      const { data, error } = await supabase.from('news').select('*').eq('id', id).single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json(data)
    }

    let query = supabase.from('news').select('*', { count: 'exact' })
    if (search) query = query.ilike('title', `%${search}%`)
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data, total: count || 0 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createAdminClient()

    let thumbnail_url = ''
    if (body.thumbnail_url) thumbnail_url = body.thumbnail_url

    const { data, error } = await supabase.from('news').insert({
      title: body.title,
      slug: body.slug,
      content: body.content,
      tags: body.tags,
      thumbnail_url,
      is_active: true,
    }).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    await supabase.from('audit_logs').insert({
      user_email: body.user_email || 'unknown',
      action: 'CREATE_NEWS',
      details: `Membuat berita baru: ${body.title}`,
    })

    return NextResponse.json({ id: data.id })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createAdminClient()

    const { error } = await supabase.from('news').update({
      title: body.title,
      slug: body.slug,
      content: body.content,
      tags: body.tags,
      is_active: body.is_active,
      thumbnail_url: body.thumbnail_url,
    }).eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    await supabase.from('audit_logs').insert({
      user_email: body.user_email || 'unknown',
      action: 'UPDATE_NEWS',
      details: `Mengupdate berita: ${body.title}`,
    })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, user_email } = await request.json()
    const supabase = createAdminClient()
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    await supabase.from('audit_logs').insert({
      user_email: user_email || 'unknown',
      action: 'DELETE_NEWS',
      details: `Menghapus berita ${id}`,
    })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
