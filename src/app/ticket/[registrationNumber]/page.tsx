import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'
import QRCode from 'qrcode'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ registrationNumber: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { registrationNumber } = await params
  return {
    title: `Tiket #${registrationNumber}`,
  }
}

export default async function TicketPage({ params }: Props) {
  const { registrationNumber } = await params
  const supabase = createAdminClient()

  const { data: participant } = await supabase
    .from('participants')
    .select('*, events!inner(title, ticket_prefix)')
    .eq('registration_number', registrationNumber)
    .single()

  if (!participant) notFound()

  const ticketUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/ticket/${registrationNumber}`
  const qrDataUrl = await QRCode.toDataURL(ticketUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#059669', light: '#00000000' },
  })

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Image src="/logo.png" alt="SukaBernyanyi" width={100} height={100} className="mx-auto mb-2" />
          <h1 className="text-xl font-bold text-white">SukaBernyanyi</h1>
          <p className="text-gray-500 text-sm">Tiket Masuk</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-900/50 to-amber-900/50 border border-emerald-500/30 p-6 text-center">
          {participant.status === 'checked_in' && (
            <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-sm font-medium">
              <CheckCircle size={16} />
              SUDAH CHECK-IN
            </div>
          )}

          <div className="mb-4">
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-2xl font-bold text-white font-mono">{participant.registration_number}</p>
            <p className="text-lg text-white">{participant.name}</p>
            <p className="text-sm text-gray-400">{participant.events?.title}</p>
          </div>

          <div className="border-t border-emerald-500/20 pt-4 text-xs text-gray-500">
            <p>Tunjukkan QR ini di pintu masuk</p>
          </div>
        </div>
      </div>
    </div>
  )
}
