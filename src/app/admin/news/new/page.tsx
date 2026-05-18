'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { slugify } from '@/lib/utils'

export default function NewNewsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    tags: '',
  })
  const [thumbnail, setThumbnail] = useState<File | null>(null)

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
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        thumbnail_url,
        is_active: true,
      })

      if (error) throw error

      await supabase.from('audit_logs').insert({
        user_email: (await supabase.auth.getUser()).data.user?.email,
        action: 'CREATE_NEWS',
        details: `Membuat berita baru: ${form.title}`,
      })

      router.push('/admin/news')
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan')
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
        <Input
          label="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />
        <Input
          label="Tags (pisahkan dengan koma)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="musik, konser, komunitas"
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Konten (HTML)</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={12}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />
        </div>
        <Input
          label="Thumbnail"
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
        />

        <div className="flex gap-4">
          <Button type="submit" loading={loading}>Simpan</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
        </div>
      </form>
    </div>
  )
}
