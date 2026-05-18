'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'

interface SponsorField {
  name: string
  logo: File | null
  preview: string
}

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', ticket_prefix: 'SBS', description: '' })
  const [flyer, setFlyer] = useState<File | null>(null)
  const [flyerPreview, setFlyerPreview] = useState('')
  const [sponsors, setSponsors] = useState<SponsorField[]>([])

  const addSponsor = () => {
    setSponsors([...sponsors, { name: '', logo: null, preview: '' }])
  }

  const removeSponsor = (idx: number) => {
    setSponsors(sponsors.filter((_, i) => i !== idx))
  }

  const updateSponsor = (idx: number, field: Partial<SponsorField>) => {
    setSponsors(sponsors.map((s, i) => i === idx ? { ...s, ...field } : s))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const user_email = user?.email || 'unknown'

      let flyer_url = ''
      if (flyer) {
        const fd = new FormData()
        fd.append('file', flyer)
        fd.append('type', 'flyer')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Gagal upload flyer')
        }
        const data = await res.json()
        flyer_url = data.url
      }

      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_event',
          title: form.title,
          slug: form.slug,
          ticket_prefix: form.ticket_prefix,
          description: form.description,
          flyer_url,
          user_email,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal membuat event')

      for (const sp of sponsors) {
        if (!sp.logo) continue
        const fd = new FormData()
        fd.append('file', sp.logo)
        fd.append('type', 'sponsor')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) throw new Error('Gagal upload logo sponsor')
        const { url } = await uploadRes.json()

        const spRes = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_sponsor', event_id: result.id, name: sp.name, logo_url: url }),
        })
        if (!spRes.ok) {
          const spErr = await spRes.json()
          throw new Error(spErr.error || 'Gagal menyimpan sponsor')
        }
      }

      toast.success('Event berhasil dibuat')
      router.push('/admin/events')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      toast.error(msg)
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
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Flyer / Poster</label>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) { setFlyer(file); setFlyerPreview(URL.createObjectURL(file)) }
          }} className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-300 hover:file:bg-emerald-500/20" />
          {flyerPreview && (
            <img src={flyerPreview} alt="Preview flyer" className="mt-2 h-40 w-auto rounded-xl object-cover border border-white/10" />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Sponsor</label>
            <button type="button" onClick={addSponsor} className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              <Plus size={14} />
              Tambah Sponsor
            </button>
          </div>
          {sponsors.length === 0 && (
            <p className="text-xs text-gray-600">Belum ada sponsor. Klik &ldquo;Tambah Sponsor&rdquo; untuk menambahkan.</p>
          )}
          {sponsors.map((sp, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Logo</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      updateSponsor(idx, { logo: file, preview: URL.createObjectURL(file) })
                    }
                  }} className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-300 hover:file:bg-emerald-500/20" />
                  {sp.preview && (
                    <img src={sp.preview} alt="Preview logo sponsor" className="mt-2 h-10 w-auto rounded-lg border border-white/10" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-300">
                    Nama Sponsor{' '}
                    <em className="text-rose-400 text-[11px] not-italic">*hanya terlihat oleh admin</em>
                  </label>
                  <input
                    value={sp.name}
                    onChange={(e) => updateSponsor(idx, { name: e.target.value })}
                    placeholder="Nama sponsor"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>
              <button type="button" onClick={() => removeSponsor(idx)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-300 transition-colors mt-6">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" loading={loading}>Simpan</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
        </div>
      </form>
    </div>
  )
}
