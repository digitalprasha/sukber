'use client'

import { useState } from 'react'
import { RegistrationForm } from './RegistrationForm'
import { Building2, Wallet, Copy, Check, Lock, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface PaymentMethod {
  type: 'bank' | 'ewallet'
  name: string
  number: string
}

interface RegisterSectionProps {
  eventId: string
  ticketPrefix?: string
  fee?: number
  maxParticipants?: number | null
  deadline?: string | null
  paymentMethods: PaymentMethod[]
  category: 'coming_soon' | 'upcoming' | 'past'
}

export function RegisterSection({ eventId, ticketPrefix, fee, maxParticipants, deadline, paymentMethods, category }: RegisterSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num)
    setCopiedId(num)
    toast.success('Nomor berhasil disalin')
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (category === 'past') {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
        <Lock size={32} className="mx-auto mb-3 text-gray-500" />
        <p className="text-gray-400 font-medium">Acara Telah Dilaksanakan</p>
        <p className="text-xs text-gray-600 mt-1">Pendaftaran untuk acara ini sudah ditutup</p>
      </div>
    )
  }

  if (category === 'coming_soon') {
    return (
      <div className="rounded-2xl bg-white/5 border border-amber-500/20 p-6 text-center">
        <Clock size={32} className="mx-auto mb-3 text-amber-400" />
        <p className="text-amber-300 font-medium">Coming Soon</p>
        <p className="text-xs text-gray-500 mt-1">Pendaftaran akan segera dibuka</p>
        {deadline && (
          <p className="text-xs text-gray-600 mt-2">Batas pendaftaran: {formatDate(deadline)}</p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Pendaftaran</h2>
        {fee && Number(fee) > 0 && (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-sm font-semibold border border-emerald-500/20">
            Rp{Number(fee).toLocaleString('id-ID')}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-500">
        {deadline && (
          <span className="px-2 py-1 rounded-lg bg-white/5">Deadline: {formatDate(deadline)}</span>
        )}
        {maxParticipants && (
          <span className="px-2 py-1 rounded-lg bg-white/5">Kuota: {maxParticipants} peserta</span>
        )}
      </div>

      {paymentMethods.length > 0 && (
        <div className="mb-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-emerald-500/10">
            <h3 className="text-sm font-medium text-emerald-300">Metode Pembayaran</h3>
          </div>
          <div className="divide-y divide-emerald-500/10">
            {paymentMethods.map((pm, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                {pm.type === 'bank' ? (
                  <Building2 size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <Wallet size={18} className="text-amber-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{pm.type === 'bank' ? 'BANK' : 'E-WALLET'}</p>
                  <p className="text-sm font-medium text-white">{pm.name}</p>
                </div>
                <p className="text-sm font-semibold text-emerald-200 tabular-nums">{pm.number}</p>
                <button
                  type="button"
                  onClick={() => copyNumber(pm.number)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  title="Salin nomor"
                >
                  {copiedId === pm.number ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-400" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showForm ? (
        <div className="space-y-4">
          {paymentMethods.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs text-amber-300/80 leading-relaxed">
                ⚠️ Pastikan nomor rekening/e-wallet tujuan sudah benar. Kami tidak bertanggung jawab atas kesalahan transfer ke nomor yang salah.
              </p>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 accent-emerald-500"
            />
            <span className="text-sm text-gray-400 leading-relaxed">
              Saya telah memeriksa dan memastikan nomor rekening/e-wallet tujuan sudah benar
            </span>
          </label>

          <button
            onClick={() => confirmed && setShowForm(true)}
            disabled={!confirmed}
            className="w-full px-5 py-3 bg-gradient-to-r from-emerald-600 to-amber-500 rounded-xl text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
          >
            {confirmed ? 'Daftar Sekarang' : 'Centang konfirmasi di atas untuk mendaftar'}
          </button>
        </div>
      ) : (
        <RegistrationForm
          eventId={eventId}
          ticketPrefix={ticketPrefix}
          fee={fee}
          maxParticipants={maxParticipants}
          deadline={deadline}
        />
      )}
    </div>
  )
}
