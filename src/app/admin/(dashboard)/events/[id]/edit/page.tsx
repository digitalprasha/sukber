'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'

interface SponsorField {
  id?: string
  name: string
  logo: File | null
  preview: string
  existing_logo_url?: string
}

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({ title: '', slug: '', ticket_prefix: 'SBS', description: '' })
  const [registration, setRegistration] = useState({
    enabled: true, fee: 0, max_participants: '', deadline: '', payment_info: '',
  })
  const [flyer, setFlyer] = useState<File | null>(null)
  const [flyerPreview, setFlyerPreview] = useState('')
  const [existingFlyer, setExistingFlyer] = useState('')
  const [sponsors, setSponsors] = useState<SponsorField[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('events').select('*').eq('id', params.id).single(),
      supabase.from('sponsors').select('*').eq('event_id', params.id),
    ]).then(([evRes, spRes]) => {
      if (evRes.data) {
        const ev = evRes.data
        setForm({ title: ev.title, slug: ev.slug, ticket_prefix: ev.ticket_prefix, description: ev.description })
        setExistingFlyer(ev.flyer_url || '')
        setRegistration({
          enabled: ev.registration_enabled ?? true,
          fee: ev.registration_fee ?? 0,
          max_participants: ev.max_participants?.toString() || '',
          deadline: ev.registration_deadline ? ev.registration_deadline.slice(0, 16) : '',
          payment_info: ev.payment_info || '',
        })
      }
      if (spRes.data) {
        setSponsors(spRes.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          logo: null,
          preview: '',
          existing_logo_url: s.logo_url,
        })))
      }
      setFetching(false)
    })
  }, [params.id, supabase])

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
    const { data: { user } } = await supabase.auth.getUser()
    const user_email = user?.email || 'unknown'

    let flyer_url = existingFlyer
    if (flyer) {
      const fd = new FormData()
      fd.append('file', flyer)
      fd.append('type', 'flyer')
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
      if (uploadRes.ok) {
        const data = await uploadRes.json()
        flyer_url = data.url
      }
    }

    const res = await fetch('/api/admin/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_event',
        id: params.id,
        title: form.title,
        user_email,
        fields: {
          title: form.title,
          slug: form.slug,
          ticket_prefix: form.ticket_prefix,
          description: form.description,
          flyer_url,
          registration_enabled: registration.enabled,
          registration_fee: registration.fee,
          max_participants: registration.max_participants ? Number(registration.max_participants) : null,
          registration_deadline: registration.deadline || null,
          payment_info: registration.payment_info,
        },
      }),
    })
    const result = await res.json()
    if (!res.ok) {
      toast.error(result.error || 'Gagal mengupdate event')
      setLoading(false)
      return
    }

    const existingIds = sponsors.filter((s) => s.id).map((s) => s.id!)
    if (existingIds.length > 0) {
      await supabase.from('sponsors').delete().eq('event_id', params.id).not('id', 'in', `(${existingIds.join(',')})`)
    } else {
      await supabase.from('sponsors').delete().eq('event_id', params.id)
    }

    for (const sp of sponsors) {
      let logo_url = sp.existing_logo_url || ''
      if (sp.logo) {
        const fd = new FormData()
        fd.append('file', sp.logo)
        fd.append('type', 'sponsor')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        const uploadData = await uploadRes.json()
        logo_url = uploadData.url
      }

      if (sp.id) {
        if (logo_url) {
          await fetch('/api/admin/events', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_sponsor', id: sp.id, fields: { name: sp.name, logo_url } }),
          })
        } else {
          await fetch('/api/admin/events', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_sponsor', id: sp.id, fields: { name: sp.name } }),
          })
        }
      } else {
        await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_sponsor', event_id: params.id, name: sp.name, logo_url }),
        })
      }
    }

    toast.success('Event berhasil diupdate')
    router.push('/admin/events')
    router.refresh()
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
          <label className="block text-sm font-medium text-gray-300">Flyer / Poster</label>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) { setFlyer(file); setFlyerPreview(URL.createObjectURL(file)) }
          }} className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-300 hover:file:bg-emerald-500/20" />
          {existingFlyer && !flyerPreview && (
            <div className="flex items-center gap-2 mt-2">
              <img src={existingFlyer} alt="Flyer saat ini" className="h-24 w-auto rounded-xl object-cover border border-white/10" />
              <span className="text-xs text-gray-500">Flyer saat ini</span>
            </div>
          )}
          {flyerPreview && (
            <img src={flyerPreview} alt="Preview flyer" className="mt-2 h-40 w-auto rounded-xl object-cover border border-white/10" />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Deskripsi</label>
          <RichTextEditor content={form.description} onChange={(html) => setForm({ ...form, description: html })} />
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white">Pengaturan Pendaftaran</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Buka Pendaftaran</span>
            <Toggle checked={registration.enabled} onChange={(v) => setRegistration({ ...registration, enabled: v })} />
          </div>
          {registration.enabled && (
            <div className="space-y-4 pt-2">
              <Input label="Biaya Pendaftaran (Rp)" type="number" min={0} value={registration.fee} onChange={(e) => setRegistration({ ...registration, fee: Number(e.target.value) })} />
              <Input label="Maksimal Peserta (opsional)" type="number" min={1} value={registration.max_participants} onChange={(e) => setRegistration({ ...registration, max_participants: e.target.value })} />
              <Input label="Batas Waktu Pendaftaran (opsional)" type="datetime-local" value={registration.deadline} onChange={(e) => setRegistration({ ...registration, deadline: e.target.value })} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Informasi Pembayaran</label>
                <p className="text-[11px] text-gray-500">Masukkan nomor rekening bank atau e-wallet untuk pembayaran</p>
                <textarea value={registration.payment_info} onChange={(e) => setRegistration({ ...registration, payment_info: e.target.value })}
                  rows={4} placeholder="BCA: 1234567890 a.n. SukaBernyanyi&#10;DANA: 081234567890"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 resize-y text-sm" />
              </div>
            </div>
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
            <p className="text-xs text-gray-600">Belum ada sponsor.</p>
          )}
          {sponsors.map((sp, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Logo</label>
                  {sp.existing_logo_url && !sp.preview && (
                    <div className="mb-2 flex items-center gap-2">
                      <img src={sp.existing_logo_url} alt="" className="h-8 w-auto rounded" />
                      <span className="text-xs text-gray-500">Logo saat ini</span>
                    </div>
                  )}
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
