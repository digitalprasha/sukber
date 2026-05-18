'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', ticket_prefix: 'SBS', description: '' })
  const [flyer, setFlyer] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let flyer_url = ''
      if (flyer) {
        const fd = new FormData()
        fd.append('file', flyer)
        fd.append('type', 'flyer')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        flyer_url = data.url
      }

      const { error } = await supabase.from('events').insert({ ...form, flyer_url })
      if (error) throw error

      await supabase.from('audit_logs').insert({
        user_email: (await supabase.auth.getUser()).data.user?.email,
        action: 'CREATE_EVENT',
        details: `Membuat event baru: ${form.title}`,
      })

      toast.success('Event berhasil dibuat')
      router.push('/admin/events')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Tambah Event Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Judul Event" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} required />
        <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <Input label="Prefix Tiket" value={form.ticket_prefix} onChange={(e) => setForm({ ...form, ticket_prefix: e.target.value })} required />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Deskripsi</label>
          <RichTextEditor content={form.description} onChange={(html) => setForm({ ...form, description: html })} placeholder="Tulis deskripsi event..." />
        </div>
        <Input label="Flyer / Poster" type="file" accept="image/*" onChange={(e) => setFlyer(e.target.files?.[0] || null)} />
        <div className="flex gap-4">
          <Button type="submit" loading={loading}>Simpan</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
        </div>
      </form>
    </div>
  )
}
