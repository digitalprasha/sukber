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
import { Plus, X, Banknote, Wallet } from 'lucide-react'

interface SponsorField {
  id?: string
  name: string
  logo: File | null
  preview: string
  existing_logo_url?: string
}

interface PaymentMethod {
  type: 'bank' | 'ewallet'
  name: string
  number: string
}

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({ title: '', slug: '', ticket_prefix: '', description: '' })
  const [fee, setFee] = useState('')
  const [maxPax, setMaxPax] = useState('')
  const [deadline, setDeadline] = useState('')
  const [regOpen, setRegOpen] = useState(true)
  const [payments, setPayments] = useState<PaymentMethod[]>([])
  const [payConfirmed, setPayConfirmed] = useState(false)
  const [flyer, setFlyer] = useState<File | null>(null)
  const [flyerPreview, setFlyerPreview] = useState('')
  const [existingFlyer, setExistingFlyer] = useState('')
  const [sponsors, setSponsors] = useState<SponsorField[]>([])

  const addPayment = () => setPayments([...payments, { type: 'bank', name: '', number: '' }])
  const updatePayment = (i: number, field: Partial<PaymentMethod>) => setPayments(payments.map((p, j) => j === i ? { ...p, ...field } : p))
  const removePayment = (i: number) => setPayments(payments.filter((_, j) => j !== i))

  useEffect(() => {
    Promise.all([
      supabase.from('events').select('*').eq('id', params.id).single(),
      supabase.from('sponsors').select('*').eq('event_id', params.id),
    ]).then(([evRes, spRes]) => {
      if (evRes.data) {
        const ev = evRes.data
        setForm({ title: ev.title, slug: ev.slug, ticket_prefix: ev.ticket_prefix, description: ev.description })
        setExistingFlyer(ev.flyer_url || '')
        setRegOpen(ev.registration_enabled ?? true)
        setFee((ev.registration_fee ?? 0).toString())
        setMaxPax(ev.max_participants?.toString() || '')
        setDeadline(ev.registration_deadline ? ev.registration_deadline.slice(0, 16) : '')
        if (Array.isArray(ev.payment_methods)) setPayments(ev.payment_methods)
      }
      if (spRes.data) {
        setSponsors(spRes.data.map((s: any) => ({
          id: s.id, name: s.name, logo: null, preview: '', existing_logo_url: s.logo_url,
        })))
      }
      setFetching(false)
    })
  }, [params.id, supabase])

  const addSponsor = () => setSponsors([...sponsors, { name: '', logo: null, preview: '' }])
  const removeSponsor = (i: number) => setSponsors(sponsors.filter((_, j) => j !== i))
  const updateSponsor = (i: number, field: Partial<SponsorField>) => setSponsors(sponsors.map((s, j) => j === i ? { ...s, ...field } : s))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (payments.some(p => !p.name || !p.number)) {
      toast.error('Lengkapi nama dan nomor semua metode pembayaran')
      setLoading(false); return
    }
    if (payments.length > 0 && !payConfirmed) {
      toast.error('Harap centang konfirmasi nomor pembayaran sebelum menyimpan')
      setLoading(false); return
    }

    let flyer_url = existingFlyer
    if (flyer) {
      const fd = new FormData(); fd.append('file', flyer); fd.append('type', 'flyer')
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
      if (uploadRes.ok) flyer_url = (await uploadRes.json()).url
    }

    const res = await fetch('/api/admin/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_event', id: params.id, title: form.title, user_email: user?.email,
        fields: {
          title: form.title, slug: form.slug, ticket_prefix: form.ticket_prefix,
          description: form.description, flyer_url,
          registration_enabled: regOpen,
          registration_fee: fee ? Number(fee) : 0,
          max_participants: maxPax ? Number(maxPax) : null,
          registration_deadline: deadline || null,
          payment_methods: payments,
        },
      }),
    })
    if (!res.ok) {
      toast.error((await res.json()).error || 'Gagal mengupdate event')
      setLoading(false); return
    }

    const keepIds = sponsors.filter(s => s.id).map(s => s.id!)
    const delRes = await fetch('/api/admin/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_sponsors', event_id: params.id, keep_ids: keepIds, name: 'cleanup', user_email: user?.email }),
    })
    if (!delRes.ok) { toast.error('Gagal menghapus sponsor lama'); setLoading(false); return }

    for (const sp of sponsors) {
      if (!sp.logo && !sp.id) continue
      let logo_url = sp.existing_logo_url || ''
      if (sp.logo) {
        const fd = new FormData(); fd.append('file', sp.logo); fd.append('type', 'sponsor')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) throw new Error('Gagal upload logo sponsor')
        logo_url = (await uploadRes.json()).url
      }
      if (sp.id) {
        await fetch('/api/admin/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_sponsor', id: sp.id, fields: { name: sp.name, logo_url } }),
        })
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
    setLoading(false)
  }

  if (fetching) return <div className="text-gray-500">Loading...</div>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Informasi Event</h3>
          <Input label="Judul Event" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm" required />
              <p className="text-[11px] text-gray-600 mt-1">Identifikasi unik untuk URL, contoh: <span className="text-gray-500">/acara/</span><span className="text-emerald-400">vol-8-sukabumi</span>. Otomatis terisi dari judul.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Kode Event</label>
              <input value={form.ticket_prefix} onChange={(e) => setForm({ ...form, ticket_prefix: e.target.value })}
                placeholder="VOL8"
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm" required />
              <p className="text-[11px] text-gray-600 mt-1">Tentukan prefix tiket. Contoh: <span className="text-emerald-400">SBS-VOL8</span> → hasil: <span className="text-emerald-400">SBS-VOL8-001</span>. Nomor urut ditambahkan otomatis.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Flyer / Poster</label>
            <p className="text-[11px] text-gray-600 mb-2">Upload gambar flyer atau poster event</p>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) { setFlyer(file); setFlyerPreview(URL.createObjectURL(file)) }
            }} className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-300 hover:file:bg-emerald-500/20" />
            {existingFlyer && !flyerPreview && (
              <div className="flex items-center gap-2 mt-2">
                <img src={existingFlyer} alt="Flyer saat ini" className="h-20 w-auto rounded-xl object-cover border border-white/10" />
                <span className="text-xs text-gray-500">Flyer saat ini</span>
              </div>
            )}
            {flyerPreview && <img src={flyerPreview} alt="" className="mt-2 h-28 w-auto rounded-xl object-cover border border-white/10" />}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Deskripsi</label>
            <RichTextEditor content={form.description} onChange={(html) => setForm({ ...form, description: html })} placeholder="Tulis deskripsi event..." />
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Pendaftaran</h3>
            <Toggle checked={regOpen} onChange={setRegOpen} />
          </div>
          <p className="text-[11px] text-gray-600 -mt-2">Nonaktifkan untuk menutup pendaftaran event ini</p>

          {regOpen && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Biaya Pendaftaran (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                    <input type="text" inputMode="numeric" value={fee} onChange={e => setFee(e.target.value.replace(/\D/g, ''))}
                      placeholder="0"
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm" />
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1">Kosongkan atau isi 0 = Gratis</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Maksimal Peserta</label>
                  <input type="text" inputMode="numeric" value={maxPax} onChange={e => setMaxPax(e.target.value.replace(/\D/g, ''))}
                    placeholder="Tidak terbatas"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm" />
                  <p className="text-[11px] text-gray-600 mt-1">Kosongkan jika tidak ada batas</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Batas Waktu Pendaftaran</label>
                <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-emerald-500/50 text-sm [color-scheme:dark]" />
                <p className="text-[11px] text-gray-600 mt-1">Kosongkan jika tidak ada batas waktu</p>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Metode Pembayaran</label>
                  <button type="button" onClick={addPayment} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Plus size={12} /> Tambah
                  </button>
                </div>
                <p className="text-[11px] text-gray-600 mb-3">Daftar bank/e-wallet yang bisa digunakan peserta untuk transfer</p>
                <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-3">
                  <p className="text-[11px] text-amber-300/70">⚠️ Pastikan nomor rekening/e-wallet sudah benar. Kesalahan nomor bisa menyebabkan kerugian.</p>
                </div>
                {payments.length === 0 && <p className="text-xs text-gray-600 italic">Belum ada metode pembayaran. Klik "Tambah" untuk menambahkan.</p>}
                {payments.map((pm, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 mb-2">
                    <div className="shrink-0 mt-2">{pm.type === 'bank' ? <Banknote size={16} className="text-emerald-500" /> : <Wallet size={16} className="text-amber-500" />}</div>
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <select value={pm.type} onChange={e => updatePayment(i, { type: e.target.value as 'bank' | 'ewallet' })}
                        className="appearance-none bg-[#1a1a2e] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer sm:w-[120px]">
                        <option value="bank" className="bg-[#1a1a2e]">BANK</option>
                        <option value="ewallet" className="bg-[#1a1a2e]">E-WALLET</option>
                      </select>
                      <input value={pm.name} onChange={e => updatePayment(i, { name: e.target.value })}
                        placeholder={pm.type === 'bank' ? 'BCA' : 'DANA'}
                        className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm" />
                      <div className="flex gap-1 flex-1">
                        <input value={pm.number} onChange={e => updatePayment(i, { number: e.target.value })}
                          placeholder="No. rekening"
                          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm" />
                        <button type="button" onClick={() => removePayment(i)} className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-300 transition-colors shrink-0">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Sponsor</h3>
            <button type="button" onClick={addSponsor} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              <Plus size={12} /> Tambah Sponsor
            </button>
          </div>
          <p className="text-[11px] text-gray-600 -mt-2">Logo sponsor akan tampil di halaman publik</p>
          {sponsors.length === 0 && <p className="text-xs text-gray-600 italic">Belum ada sponsor</p>}
          {sponsors.map((sp, i) => (
            <div key={sp.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">Logo</label>
                  {sp.existing_logo_url && !sp.preview && (
                    <div className="mb-2 flex items-center gap-2">
                      <img src={sp.existing_logo_url} alt="" className="h-8 w-auto rounded" />
                      <span className="text-xs text-gray-500">Logo saat ini</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => {
                    const f = e.target.files?.[0]; if (f) updateSponsor(i, { logo: f, preview: URL.createObjectURL(f) })
                  }} className="w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-300" />
                  {sp.preview && <img src={sp.preview} alt="" className="mt-1 h-8 w-auto rounded-lg border border-white/10" />}
                </div>
                <input value={sp.name} onChange={e => updateSponsor(i, { name: e.target.value })}
                  placeholder="Nama sponsor (hanya terlihat admin)"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
              <button type="button" onClick={() => removeSponsor(i)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-300 transition-colors mt-4"><X size={14} /></button>
            </div>
          ))}
        </div>

        {payments.length > 0 && (
          <label className="flex items-start gap-2 pt-2 cursor-pointer">
            <input type="checkbox" checked={payConfirmed} onChange={e => setPayConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 accent-emerald-500 shrink-0" />
            <span className="text-xs text-gray-500 leading-relaxed">Saya telah memeriksa dan memastikan nomor rekening/e-wallet sudah benar</span>
          </label>
        )}
        <div className="flex gap-4 pt-2">
          <Button type="submit" loading={loading}>Simpan</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
        </div>
      </form>
    </div>
  )
}
