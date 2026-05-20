'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AlertCircle, CheckCircle, Scan, Search, Camera, CameraOff } from 'lucide-react'
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
  const [cameraError, setCameraError] = useState('')
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try { html5QrCodeRef.current.stop() } catch {}
      }
    }
  }, [])

  const startScanner = async () => {
    setCameraError('')
    setScanning(true)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('qr-reader')
      html5QrCodeRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
            let regNumber = decodedText.trim()
            try {
              const url = new URL(regNumber)
              regNumber = url.pathname.split('/').pop() || ''
            } catch {}
            if (regNumber) handleCheckIn(regNumber)
            scanner.stop().catch(() => {})
            setScanning(false)
          },
        () => {}
      )
    } catch (err: any) {
      setCameraError(err?.message || 'Gagal mengakses kamera')
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try { await html5QrCodeRef.current.stop() } catch {}
      html5QrCodeRef.current = null
    }
    setScanning(false)
  }

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
      setResult({ type: 'warning', message: 'TICKET SUDAH DIGUNAKAN!' })
      setParticipant(data)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const res = await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'check_in',
        id: data.id,
        name: data.name,
        reg_number: regNumber,
        user_email: user?.email,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      setResult({ type: 'error', message: err.error || 'Gagal check-in' })
    } else {
      setResult({ type: 'success', message: 'Check-in berhasil!' })
      setParticipant({ ...data, is_checked_in: true })
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
        <div id="qr-reader" ref={scannerRef} className="aspect-square max-w-sm mx-auto bg-black/50 rounded-xl overflow-hidden mb-4" />

        {cameraError && (
          <div className="flex items-center gap-2 text-sm text-rose-400 mb-4">
            <AlertCircle size={16} />
            {cameraError}
          </div>
        )}

        {!scanning ? (
          <Button onClick={startScanner} className="w-full">
            <Camera size={18} className="mr-2" />
            Mulai Scan QR
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="danger" className="w-full">
            <CameraOff size={18} className="mr-2" />
            Stop Scanner
          </Button>
        )}
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
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : result.type === 'warning'
              ? 'bg-rose-500/10 border-rose-500/20 animate-pulse'
              : 'bg-rose-500/10 border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {result.type === 'success' ? (
              <CheckCircle className="text-emerald-400" size={24} />
            ) : (
              <AlertCircle className="text-rose-400" size={24} />
            )}
            <span
              className={`font-semibold ${
                result.type === 'success' ? 'text-emerald-300' : 'text-rose-300'
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
