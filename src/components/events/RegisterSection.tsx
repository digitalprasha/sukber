'use client'

import { useState } from 'react'
import { RegistrationForm } from './RegistrationForm'
import { Building2, Wallet } from 'lucide-react'

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
}

export function RegisterSection({ eventId, ticketPrefix, fee, maxParticipants, deadline, paymentMethods }: RegisterSectionProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Pendaftaran</h2>

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
              </div>
            ))}
          </div>
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-5 py-3 bg-gradient-to-r from-emerald-600 to-amber-500 rounded-xl text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
        >
          Daftar Sekarang
        </button>
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
