'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Upload, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react'

interface RegistrationFormProps {
  eventId: string
  ticketPrefix?: string
  fee?: number
  maxParticipants?: number | null
  deadline?: string | null
}

export function RegistrationForm({ eventId, fee, maxParticipants, deadline }: RegistrationFormProps) {
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '' })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!maxParticipants) return
    fetch(`/api/events/${eventId}/quota`)
      .then(r => r.json())
      .then(d => setRemaining(d.remaining))
      .catch(() => {})
  }, [eventId, maxParticipants])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!file) {
        throw new Error('Harap upload bukti pembayaran')
      }

      const uploadForm = new FormData()
      uploadForm.append('file', file)
      uploadForm.append('type', 'payment')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      })

      if (!uploadRes.ok) throw new Error('Gagal upload bukti pembayaran')
      const { url: payment_proof_url } = await uploadRes.json()

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          ...form,
          payment_proof_url,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar')

      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12 px-6 rounded-2xl bg-green-500/10 border border-green-500/20">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Pendaftaran Berhasil!</h3>
        <p className="text-gray-400">
          Kami akan memverifikasi pembayaran Anda dan mengirimkan tiket melalui WhatsApp & Email.
        </p>
      </div>
    )
  }

  const isPastDeadline = deadline && new Date(deadline) < new Date()

  if (isPastDeadline) {
    return (
      <div className="text-center py-6">
        <Clock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Pendaftaran telah ditutup</p>
      </div>
    )
  }

  if (maxParticipants && remaining !== null && remaining <= 0) {
    return (
      <div className="text-center py-6">
        <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Kuota peserta sudah penuh</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {maxParticipants && remaining !== null && (
        <div className="flex flex-wrap gap-3 mb-2">
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <Users size={12} />
            {remaining > 0 ? `Sisa ${remaining} kursi` : 'Kuota penuh'}
          </div>
          {deadline && (
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              <Clock size={12} />
              {new Date(deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>
      )}
      <Input
        label="Nama Lengkap"
        id="name"
        placeholder="Masukkan nama lengkap"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <Input
        label="Email"
        id="email"
        type="email"
        placeholder="contoh@email.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <Input
        label="Nomor WhatsApp"
        id="whatsapp"
        placeholder="081234567890"
        value={form.whatsapp}
        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
        onBlur={(e) => {
          const v = e.target.value.replace(/\s/g, '')
          if (v.startsWith('0')) setForm({ ...form, whatsapp: `+62${v.slice(1)}` })
          else if (v.startsWith('62') && !v.startsWith('+62')) setForm({ ...form, whatsapp: `+${v}` })
        }}
        required
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">
          Upload Bukti Pembayaran
        </label>
                  <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition-all cursor-pointer">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Upload size={24} />
            <span className="text-sm">{file ? file.name : 'Klik untuk upload'}</span>
            {file && <span className="text-xs text-green-400">File siap</span>}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
      </Button>
    </form>
  )
}
