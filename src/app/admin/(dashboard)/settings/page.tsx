'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Info, ArrowRight, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Password baru tidak cocok')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (error) {
      toast.error('Gagal mengubah password')
      return
    }

    toast.success('Password berhasil diubah')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-white">Pengaturan</h1>

      <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-6">
        <div className="flex items-start gap-4">
          <Info className="text-emerald-400 mt-1 shrink-0" size={24} />
          <div>
            <h2 className="text-lg font-semibold text-emerald-300 mb-2">Reset Data</h2>
            <p className="text-gray-400 text-sm mb-4">
              Fitur reset sekarang tersedia <strong>per event</strong> di halaman Events. 
              Setiap event bisa di-reset secara independen — hanya peserta dan sponsor 
              yang terhapus, eventnya tetap aman.
            </p>
            <Link
              href="/admin/events"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
            >
              Buka halaman Events
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="text-emerald-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Ubah Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              required
            />
          </div>
          <Button type="submit" loading={loading}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Simpan Password
          </Button>
        </form>
      </div>
    </div>
  )
}
