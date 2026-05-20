'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { getWaUrl, getEmailUrl } from '@/lib/utils'
import { CheckCircle, XCircle, Send, ExternalLink, Search, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

const PER_PAGE = 15

interface Participant {
  id: string; event_id: string; name: string; email: string; whatsapp: string
  payment_proof_url: string; registration_number: string | null; status: string
  is_checked_in: boolean; created_at: string; events?: { title: string; ticket_prefix: string }
}

export default function TicketsPage() {
  const supabase = createClient()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [events, setEvents] = useState<{ id: string; title: string; ticket_prefix: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [approveTarget, setApproveTarget] = useState<Participant | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Participant | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectChannel, setRejectChannel] = useState<'wa' | 'email'>('wa')
  const [rejectLoading, setRejectLoading] = useState(false)
  const loaded = useRef(false)

  const reload = () => {
    setLoading(true)
    const eventFilter = selectedEvent !== 'all' ? `event_id.eq.${selectedEvent}` : undefined
    const searchFilter = searchQuery
      ? `or(name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,registration_number.ilike.%${searchQuery}%)`
      : undefined

    Promise.all([
      supabase.from('participants').select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PER_PAGE, page * PER_PAGE - 1),
      supabase.from('events').select('id, title, ticket_prefix'),
    ]).then(([partRes, evRes]) => {
      setParticipants(partRes.data || [])
      setTotal(partRes.count || 0)
      setEvents(evRes.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    reload()
  }, [page, selectedEvent, searchQuery])

  async function handleVerify() {
    if (!approveTarget) return
    const event = events.find((e) => e.id === approveTarget.event_id)
    if (!event) return

    const count = participants.filter(
      (p) => p.event_id === approveTarget.event_id && p.registration_number
    ).length

    const { data: { user } } = await supabase.auth.getUser()
    const res = await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify_participant',
        id: approveTarget.id,
        name: approveTarget.name,
        ticket_prefix: event.ticket_prefix,
        current_count: count,
        user_email: user?.email,
      }),
    })
    const result = await res.json()

    if (!res.ok) {
      toast.error(result.error || 'Gagal verifikasi')
    } else {
      toast.success(`${approveTarget.name} berhasil diverifikasi — ${result.registration_number}`)
      setApproveTarget(null)
      reload()
    }
  }

  async function handleSendMessage() {
    if (!rejectTarget || !rejectReason.trim()) {
      toast.error('Harap isi pesan')
      return
    }
    setRejectLoading(true)

    const { name, whatsapp, email } = rejectTarget
    const waText = `Hi ${name},\n\nPesan dari admin SukaBernyanyi:\n${rejectReason}\n\nSilakan hubungi kami jika ada pertanyaan lebih lanjut.\n\nTerima kasih.`
    const emailSubject = 'Pesan dari Admin - SukaBernyanyi'
    const emailBody = `Hi ${name},\n\nPesan dari admin SukaBernyanyi:\n${rejectReason}\n\nSilakan hubungi kami jika ada pertanyaan lebih lanjut.\n\nTerima kasih.`

    if (rejectChannel === 'wa') window.open(getWaUrl(whatsapp, waText), '_blank')
    else window.open(getEmailUrl(email, emailSubject, emailBody), '_blank')

    toast.success(`Membuka ${rejectChannel === 'wa' ? 'WhatsApp' : 'Email'} untuk ${name}`)

    setRejectTarget(null)
    setRejectReason('')
    setRejectChannel('wa')
    setRejectLoading(false)
    reload()
  }

  const ticketUrl = (p: Participant) => `${window.location.origin}/ticket/${p.registration_number}`

  const statusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge variant="success">Verified</Badge>
      case 'checked_in': return <Badge variant="warning">Checked In</Badge>
      default: return <Badge variant="danger">Pending</Badge>
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Manajemen Tiket</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" placeholder="Cari nama, email, atau no registrasi..." value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <select value={selectedEvent} onChange={(e) => { setSelectedEvent(e.target.value); setPage(1) }}
          className="appearance-none w-full sm:w-auto px-4 py-2.5 bg-[#1a1a2e] border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
          <option value="all" className="bg-[#1a1a2e] text-white">Semua Event</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id} className="bg-[#1a1a2e] text-white">{ev.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : participants.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Tidak ada data peserta</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
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
                {participants.map((p) => (
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
                        <a href={p.payment_proof_url} target="_blank"
                          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                          <ExternalLink size={14} /> Lihat
                        </a>
                      ) : <span className="text-gray-600">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {p.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => setApproveTarget(p)}>
                              <CheckCircle size={14} className="mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setRejectTarget(p)}>
                              <XCircle size={14} />
                            </Button>
                          </>
                        )}
                        {p.registration_number && (
                          <>
                            <a href={getWaUrl(p.whatsapp, `Halo ${p.name}! Terima kasih telah mendaftar. Berikut tiket Anda: ${ticketUrl(p)}`)}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors">
                              <Send size={14} /> WA
                            </a>
                            <a href={getEmailUrl(p.email, 'Tiket Anda - SukaBernyanyi',
                              `Halo ${p.name}!\n\nTerima kasih telah mendaftar. Berikut tiket Anda:\n${ticketUrl(p)}\n\nSalam,\nSukaBernyanyi Sukabumi`)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors">
                              <Send size={14} /> Email
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

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {participants.map((p) => (
              <div key={p.id} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.email} / {p.whatsapp}</p>
                  </div>
                  <div className="shrink-0">{statusBadge(p.status)}</div>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  {p.registration_number || '-'}
                </div>
                {p.payment_proof_url && (
                  <a href={p.payment_proof_url} target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
                    <ExternalLink size={12} /> Lihat Bukti Pembayaran
                  </a>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {p.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => setApproveTarget(p)}>
                        <CheckCircle size={14} className="mr-1" /> Approve
                      </Button>
                      <button onClick={() => setRejectTarget(p)}
                        className="px-2 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-sm"
                        title="Kirim Pesan">
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  {p.registration_number && (
                    <>
                      <a href={getWaUrl(p.whatsapp, `Halo ${p.name}! Terima kasih telah mendaftar. Berikut tiket Anda: ${ticketUrl(p)}`)}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors">
                        <Send size={12} /> WA
                      </a>
                      <a href={getEmailUrl(p.email, 'Tiket Anda - SukaBernyanyi',
                        `Halo ${p.name}!\n\nTerima kasih telah mendaftar. Berikut tiket Anda:\n${ticketUrl(p)}\n\nSalam,\nSukaBernyanyi Sukabumi`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors">
                        <Send size={12} /> Email
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmModal
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleVerify}
        title="Verifikasi Peserta"
        message={`Approve pendaftaran "${approveTarget?.name}"? Tiket akan dibuat otomatis.`}
        confirmText="Approve"
        variant="warning"
      />

      {rejectTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => !rejectLoading && setRejectTarget(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-3">
                <AlertTriangle className="text-rose-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">Kirim Pesan ke {rejectTarget.name}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">Pesan akan dicatat. Status peserta tetap pending.</p>
            </div>
              <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Tulis pesan untuk peserta..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-[var(--foreground)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm mb-4"
            />
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="rejectChannel" value="wa" checked={rejectChannel === 'wa'}
                  onChange={() => setRejectChannel('wa')}
                  className="w-4 h-4 border-[var(--color-input-border)] bg-[var(--color-input-bg)] accent-emerald-500" />
                <span className="text-sm text-[var(--color-text-secondary)]">Kirim via WhatsApp</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="rejectChannel" value="email" checked={rejectChannel === 'email'}
                  onChange={() => setRejectChannel('email')}
                  className="w-4 h-4 border-[var(--color-input-border)] bg-[var(--color-input-bg)] accent-emerald-500" />
                <span className="text-sm text-[var(--color-text-secondary)]">Kirim via Email</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setRejectTarget(null); setRejectReason(''); setRejectChannel('wa') }} disabled={rejectLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-card-border)] text-[var(--color-text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--color-hover)] transition-all text-sm font-medium disabled:opacity-50">
                Batal
              </button>
              <button onClick={handleSendMessage} disabled={rejectLoading || !rejectReason.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-all disabled:opacity-50">
                {rejectLoading ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
