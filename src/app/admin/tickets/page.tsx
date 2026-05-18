'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { getWaUrl, getMailtoUrl } from '@/lib/utils'
import { CheckCircle, XCircle, Send, ExternalLink, Search } from 'lucide-react'

interface Participant {
  id: string
  event_id: string
  name: string
  email: string
  whatsapp: string
  payment_proof_url: string
  registration_number: string | null
  status: string
  is_checked_in: boolean
  created_at: string
  events?: { title: string; ticket_prefix: string }
}

export default function TicketsPage() {
  const supabase = createClient()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [events, setEvents] = useState<{ id: string; title: string; ticket_prefix: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const loaded = useRef(false)

  const reload = useCallback(() => {
    setLoading(true)
    Promise.all([
      supabase.from('participants').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('id, title, ticket_prefix'),
    ]).then(([partRes, evRes]) => {
      setParticipants(partRes.data || [])
      setEvents(evRes.data || [])
    }).finally(() => setLoading(false))
  }, [supabase])

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    reload()
  }, [supabase, reload])

  async function handleVerify(participant: Participant) {
    const event = events.find((e) => e.id === participant.event_id)
    if (!event) return

    const count = participants.filter(
      (p) => p.event_id === participant.event_id && p.registration_number
    ).length

    const regNumber = `${event.ticket_prefix}${String(count + 1).padStart(3, '0')}`

    const { error } = await supabase
      .from('participants')
      .update({
        status: 'verified',
        registration_number: regNumber,
      })
      .eq('id', participant.id)

    if (error) {
      alert(error.message)
    } else {
      await supabase.from('audit_logs').insert({
        user_email: (await supabase.auth.getUser()).data.user?.email,
        action: 'VERIFY_PARTICIPANT',
        details: `Verifikasi peserta ${participant.name} - No: ${regNumber}`,
      })
      reload()
    }
  }

  async function handleReject(participant: Participant) {
    const { error } = await supabase
      .from('participants')
      .update({ status: 'pending', payment_proof_url: '' })
      .eq('id', participant.id)

    if (!error) {
      await supabase.from('audit_logs').insert({
        user_email: (await supabase.auth.getUser()).data.user?.email,
        action: 'REJECT_PARTICIPANT',
        details: `Menolak peserta ${participant.name}`,
      })
      reload()
    }
  }

  const ticketUrl = (participant: Participant) =>
    `${window.location.origin}/ticket/${participant.registration_number}`

  const filtered = participants.filter((p) => {
    if (selectedEvent !== 'all' && p.event_id !== selectedEvent) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.registration_number || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const statusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge variant="success">Verified</Badge>
      case 'checked_in': return <Badge variant="warning">Checked In</Badge>
      default: return <Badge variant="danger">Pending</Badge>
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Manajemen Tiket</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Cari nama, email, atau no registrasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Semua Event</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Tidak ada data peserta</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Peserta</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">No. Registrasi</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Bukti</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-medium">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.email} / {p.whatsapp}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white font-mono">{p.registration_number || '-'}</span>
                  </td>
                  <td className="py-3 px-4">{statusBadge(p.status)}</td>
                  <td className="py-3 px-4">
                    {p.payment_proof_url ? (
                      <a
                        href={p.payment_proof_url}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300"
                      >
                        <ExternalLink size={14} />
                        Lihat
                      </a>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {p.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleVerify(p)}>
                            <CheckCircle size={14} className="mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleReject(p)}>
                            <XCircle size={14} />
                          </Button>
                        </>
                      )}
                      {p.registration_number && (
                        <>
                          <a
                            href={getWaUrl(p.whatsapp, `Halo ${p.name}! Terima kasih telah mendaftar. Berikut tiket Anda: ${ticketUrl(p)}`)}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors"
                          >
                            <Send size={14} />
                            WA
                          </a>
                          <a
                            href={getMailtoUrl(p.email, 'Tiket Anda - SukaBernyanyi', `Halo ${p.name}!\n\nTerima kasih telah mendaftar. Berikut tiket Anda:\n${ticketUrl(p)}\n\nSalam,\nSukaBernyanyi Sukabumi`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
                          >
                            <Send size={14} />
                            Email
                          </a>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
