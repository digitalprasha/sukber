'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'

export default function EditNewsPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({ title: '', slug: '', content: '', tags: '', is_active: true })
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState('')
  const [existingThumb, setExistingThumb] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/news?id=${params.id}`)
      if (!res.ok) { toast.error('Gagal memuat berita'); return }
      const data = await res.json()
      setForm({
        title: data.title,
        slug: data.slug,
        content: data.content,
        tags: (data.tags || []).join(', '),
        is_active: data.is_active,
      })
      setExistingThumb(data.thumbnail_url || '')
      setFetching(false)
    }
    load()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      let thumbnail_url = existingThumb
      if (thumbnail) {
        const fd = new FormData()
        fd.append('file', thumbnail)
        fd.append('type', 'thumbnail')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (res.ok) thumbnail_url = (await res.json()).url
      }

      const res = await fetch('/api/admin/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          title: form.title,
          slug: form.slug,
          content: form.content,
          tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
          is_active: form.is_active,
          thumbnail_url,
          user_email: user?.email,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal mengupdate berita')

      toast.success('Berita berhasil diupdate')
      router.push('/admin/news')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengupdate berita')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="text-gray-500">Loading...</div>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Berita</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} required />
        <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <Input label="Tags (pisahkan dengan koma)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="musik, konser, komunitas" />
        <p className="text-[11px] text-gray-600 -mt-3">Contoh: musik, konser, komunitas. Dipisah dengan koma.</p>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Konten</label>
          <p className="text-[11px] text-gray-600 mb-1">Isi berita. Bisa menggunakan teks, gambar, dan format lainnya.</p>
          <RichTextEditor content={form.content} onChange={(html) => setForm({ ...form, content: html })} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Thumbnail</label>
          <p className="text-[11px] text-gray-600 mb-1">Gambar sampul berita. Upload ulang jika ingin mengganti.</p>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) { setThumbnail(file); setThumbPreview(URL.createObjectURL(file)) }
          }} className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-300 hover:file:bg-emerald-500/20" />
          {existingThumb && !thumbPreview && (
            <div className="flex items-center gap-2 mt-2">
              <img src={existingThumb} alt="Thumbnail saat ini" className="h-20 w-auto rounded-xl object-cover border border-white/10" />
              <span className="text-xs text-gray-500">Thumbnail saat ini</span>
            </div>
          )}
          {thumbPreview && (
            <img src={thumbPreview} alt="Preview" className="mt-2 h-32 w-auto rounded-xl object-cover border border-white/10" />
          )}
        </div>

        <label className="flex items-center gap-3">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-white/5" />
          <span className="text-sm text-gray-300">Aktif</span>
        </label>
        <div className="flex gap-4 pt-2">
          <Button type="submit" loading={loading}>Simpan</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
        </div>
      </form>
    </div>
  )
}
