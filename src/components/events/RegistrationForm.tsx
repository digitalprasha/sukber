'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

interface RegistrationFormProps {
  eventId: string
  ticketPrefix?: string
}

export function RegistrationForm({ eventId }: RegistrationFormProps) {
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '' })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        placeholder="6281234567890"
        value={form.whatsapp}
        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
        required
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">
          Upload Bukti Pembayaran
        </label>
        <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition-all cursor-pointer">
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
