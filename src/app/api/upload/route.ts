import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { compressImage } from '@/lib/compress'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const compressed = await compressImage(buffer, 500)

    const ext = 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const folderMap: Record<string, string> = {
      payment: 'payments', flyer: 'flyers', thumbnail: 'thumbnails',
      partner: 'partners', editor: 'editor', gallery: 'gallery', sponsor: 'sponsors',
    }
    const folder = folderMap[type] || 'general'

    const supabase = createAdminClient()
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`${folder}/${filename}`, compressed, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
    return NextResponse.json({ url: `${baseUrl}/api/files/${folder}/${filename}` })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 })
  }
}
