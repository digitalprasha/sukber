'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'

export default function NewNewsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', content: '', tags: '' })
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let thumbnail_url = ''
      if (thumbnail) {
        const fd = new FormData()
        fd.append('file', thumbnail)
        fd.append('type', 'thumbnail')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        thumbnail_url = data.url
      }

      const { error } = await supabase.from('news').insert({
        title: form.title,
        slug: form.slug,
        content: form.content,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        thumbnail_url,
        is_active: true,
      })
      if (error) throw error

      await supabase.from('audit_logs').insert({
        user_email: (await supabase.auth.getUser()).data.user?.email,
        action: 'CREATE_NEWS',
        details: `Membuat berita baru: ${form.title}`,
      })

      toast.success('Berita berhasil dibuat')
      router.push('/admin/news')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat berita')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-8">Tambah Berita Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Judul"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })}
          required
        />
        <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <Input label="Tags (pisahkan dengan koma)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="musik, konser, komunitas" />
        <p className="text-[11px] text-gray-600 -mt-4">Contoh: musik, konser, komunitas. Dipisah dengan koma.</p>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Konten</label>
          <p className="text-[11px] text-gray-600 mb-1">Isi berita. Bisa menggunakan teks, gambar, dan format lainnya.</p>
          <RichTextEditor content={form.content} onChange={(html) => setForm({ ...form, content: html })} placeholder="Tulis berita di sini..." />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Thumbnail</label>
          <p className="text-[11px] text-gray-600 mb-1">Gambar sampul untuk berita. Ukuran maksimal 500KB.</p>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) { setThumbnail(file); setThumbPreview(URL.createObjectURL(file)) }
          }} className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-300 hover:file:bg-emerald-500/20" />
          {thumbPreview && (
            <img src={thumbPreview} alt="Preview" className="mt-2 h-32 w-auto rounded-xl object-cover border border-white/10" />
          )}
        </div>
        <div className="flex gap-4">
          <Button type="submit" loading={loading}>Simpan</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
        </div>
      </form>
    </div>
  )
}
