'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AlertCircle, CheckCircle, Scan, Search } from 'lucide-react'
import type { Participant } from '@/types'

export default function ScannerPage() {
  const supabase = createClient()
  const [manualRegNumber, setManualRegNumber] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error' | 'warning'
    message: string
  } | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  async function handleCheckIn(regNumber: string) {
    setLoading(true)
    setResult(null)
    setParticipant(null)

    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('registration_number', regNumber)
      .single()

    if (!data) {
      setResult({ type: 'error', message: 'Tiket tidak ditemukan!' })
      setLoading(false)
      return
    }

    if (data.is_checked_in) {
      setResult({ type: 'warning', message: 'TICKET ALREADY USED!' })
      setParticipant(data)
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('participants')
      .update({ is_checked_in: true, status: 'checked_in' })
      .eq('id', data.id)

    if (error) {
      setResult({ type: 'error', message: error.message })
    } else {
      setResult({ type: 'success', message: 'Check-in berhasil!' })
      setParticipant({ ...data, is_checked_in: true })

      await supabase.from('audit_logs').insert({
        action: 'CHECK_IN',
        details: `Check-in peserta: ${data.name} (${regNumber})`,
      })
    }
    setLoading(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualRegNumber.trim()) {
      handleCheckIn(manualRegNumber.trim().toUpperCase())
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8 text-center">QR Scanner</h1>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-6">
        <div className="aspect-square max-w-sm mx-auto bg-black/50 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
          {scanning ? (
            <video ref={videoRef} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-gray-500">
              <Scan size={48} className="mx-auto mb-2" />
              <p className="text-sm">Kamera siap memindai</p>
            </div>
          )}
        </div>

        <Button
          onClick={() => setScanning(!scanning)}
          variant={scanning ? 'danger' : 'primary'}
          className="w-full"
        >
          {scanning ? 'Stop Scanner' : 'Mulai Scan QR'}
        </Button>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-sm font-medium text-gray-400 mb-4">Atau masukkan nomor registrasi manual:</h2>
        <form onSubmit={handleManualSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="SBS001"
            value={manualRegNumber}
            onChange={(e) => setManualRegNumber(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button type="submit" loading={loading}>
            <Search size={18} />
          </Button>
        </form>
      </div>

      {result && (
        <div
          className={`mt-6 rounded-2xl p-6 border ${
            result.type === 'success'
              ? 'bg-green-500/10 border-green-500/20'
              : result.type === 'warning'
              ? 'bg-rose-600/10 border-rose-500/20 animate-pulse'
              : 'bg-rose-600/10 border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {result.type === 'success' ? (
              <CheckCircle className="text-green-400" size={24} />
            ) : (
              <AlertCircle className="text-rose-400" size={24} />
            )}
            <span
              className={`font-semibold ${
                result.type === 'success' ? 'text-green-300' : 'text-rose-300'
              }`}
            >
              {result.message}
            </span>
          </div>

          {participant && (
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">Nama: <span className="text-white">{participant.name}</span></p>
              <p className="text-gray-400">Email: <span className="text-white">{participant.email}</span></p>
              <p className="text-gray-400">No. Registrasi: <span className="text-white font-mono">{participant.registration_number}</span></p>
              <p className="text-gray-400">Status: {participant.is_checked_in ? <Badge variant="warning">Checked In</Badge> : <Badge variant="success">Verified</Badge>}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
