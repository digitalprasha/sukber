'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { slugify } from '@/lib/utils'

export default function EditNewsPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    tags: '',
    is_active: true,
  })

  useEffect(() => {
    async function fetchNews() {
      const { data } = await supabase
        .from('news')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) {
        setForm({
          title: data.title,
          slug: data.slug,
          content: data.content,
          tags: (data.tags || []).join(', '),
          is_active: data.is_active,
        })
      }
      setFetching(false)
    }
    fetchNews()
  }, [params.id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('news')
      .update({
        title: form.title,
        slug: form.slug,
        content: form.content,
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        is_active: form.is_active,
      })
      .eq('id', params.id)

    if (error) {
      alert(error.message)
    } else {
      await supabase.from('audit_logs').insert({
        user_email: (await supabase.auth.getUser()).data.user?.email,
        action: 'UPDATE_NEWS',
        details: `Mengupdate berita: ${form.title}`,
      })
      router.push('/admin/news')
      router.refresh()
    }
    setLoading(false)
  }

  if (fetching) return <div className="text-gray-500">Loading...</div>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-8">Edit Berita</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} required />
        <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <Input label="Tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Konten (HTML)</label>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm" />
        </div>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-white/5" />
          <span className="text-sm text-gray-300">Aktif</span>
        </label>
        <div className="flex gap-4">
          <Button type="submit" loading={loading}>Simpan</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
        </div>
      </form>
    </div>
  )
}
