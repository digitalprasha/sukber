'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleReset = async () => {
    if (!confirm('APAKAH ANDA YAKIN? Semua data event management akan dihapus permanen!')) return

    setLoading(true)
    setResult(null)

    try {
      const { error: delSponsors } = await supabase
        .from('sponsors')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      const { error: delParticipants } = await supabase
        .from('participants')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      const { error: delEvents } = await supabase
        .from('events')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (delEvents || delParticipants || delSponsors) {
        throw new Error(delEvents?.message || delParticipants?.message || delSponsors?.message)
      }

      await supabase.from('audit_logs').insert({
        action: 'RESET_EVENT_MANAGEMENT',
        details: 'Semua data event_management telah di-reset',
      })

      setResult({ type: 'success', message: 'Semua data event_management berhasil dihapus!' })
      setConfirmed(false)
    } catch (err: unknown) {
      setResult({ type: 'error', message: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Pengaturan</h1>

      <div className="rounded-2xl bg-rose-600/5 border border-rose-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-rose-400" size={24} />
          <h2 className="text-lg font-semibold text-rose-300">Reset Data Event Management</h2>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Tindakan ini akan menghapus SEMUA data di event_management schema (events, sponsors, participants).
          Data di public schema (news, gallery, audit_logs) tidak akan terpengaruh.
        </p>

        <div className="space-y-4">
          <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5"
            />
            <span className="text-sm text-gray-300">
              Saya telah membackup data ke Google Drive dan memahami bahwa tindakan ini tidak dapat dibatalkan.
            </span>
          </label>

          <Button
            onClick={handleReset}
            disabled={!confirmed}
            loading={loading}
            variant="danger"
            className="w-full"
          >
            <AlertTriangle size={18} className="mr-2" />
            Reset Semua Data Event Management
          </Button>
        </div>

        {result && (
          <div className={`mt-4 flex items-center gap-2 text-sm ${result.type === 'success' ? 'text-green-400' : 'text-rose-400'}`}>
            {result.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {result.message}
          </div>
        )}
      </div>
    </div>
  )
}
