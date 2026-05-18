'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { slugify } from '@/lib/utils'

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    ticket_prefix: 'SBS',
    description: '',
  })

  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) {
        setForm({
          title: data.title,
          slug: data.slug,
          ticket_prefix: data.ticket_prefix,
          description: data.description,
        })
      }
      setFetching(false)
    }
    fetchEvent()
  }, [params.id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('events')
      .update(form)
      .eq('id', params.id)

    if (error) {
      alert(error.message)
    } else {
      await supabase.from('audit_logs').insert({
        user_email: (await supabase.auth.getUser()).data.user?.email,
        action: 'UPDATE_EVENT',
        details: `Mengupdate event: ${form.title}`,
      })
      router.push('/admin/events')
      router.refresh()
    }
    setLoading(false)
  }

  if (fetching) return <div className="text-gray-500">Loading...</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} required />
        <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <Input label="Prefix Tiket" value={form.ticket_prefix} onChange={(e) => setForm({ ...form, ticket_prefix: e.target.value })} required />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Deskripsi</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div className="flex gap-4">
          <Button type="submit" loading={loading}>Simpan</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
        </div>
      </form>
    </div>
  )
}
