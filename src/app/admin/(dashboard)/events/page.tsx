'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Modal } from '@/components/ui/Modal'
import { Toggle } from '@/components/ui/Toggle'
import { Plus, Pencil, Trash2, RotateCcw, Search, Download, ShieldAlert, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'

const PER_PAGE = 10

export default function AdminEventsPage() {
  const supabase = createClient()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [resetTarget, setResetTarget] = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [exportTarget, setExportTarget] = useState<any | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const loaded = useRef(false)

  useEffect(() => { loadEvents() }, [page, search])

  async function loadEvents() {
    setLoading(true)
    let query = supabase.from('events').select('*', { count: 'exact' })
    if (search) query = query.ilike('title', `%${search}%`)
    const { data, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
    setEvents(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { data: { user } } = await supabase.auth.getUser()
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_event', id: deleteTarget.id, title: deleteTarget.title, user_email: user?.email }),
    })
    const result = await res.json()
    if (!res.ok) {
      toast.error(result.error || 'Gagal menghapus event')
    } else {
      toast.success('Event berhasil dihapus')
      setDeleteTarget(null)
      loadEvents()
    }
  }

  async function handleToggleActive(item: any) {
    const { data: { user } } = await supabase.auth.getUser()
    const res = await fetch('/api/admin/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_active', id: item.id, is_active: !item.is_active, user_email: user?.email }),
    })
    if (!res.ok) { toast.error('Gagal mengubah status'); return }
    toast.success(item.is_active ? 'Event dinonaktifkan' : 'Event diaktifkan')
    loadEvents()
  }

  async function handleReset() {
    if (!resetTarget) return
    const { data: { user } } = await supabase.auth.getUser()
    const res = await fetch('/api/admin/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_event', id: resetTarget.id, title: resetTarget.title, user_email: user?.email }),
    })
    const result = await res.json()
    if (!res.ok) {
      toast.error(result.error || 'Gagal reset event')
    } else {
      toast.success(`Data event "${resetTarget.title}" berhasil direset`)
      setResetTarget(null)
      loadEvents()
    }
  }

  function handleExport(event: any) {
    setExportTarget(event)
  }

  async function confirmExport() {
    if (!exportTarget) return
    setExportLoading(true)

    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'export_participants', id: exportTarget.id }),
    })
    if (!res.ok) { toast.error('Gagal mengambil data'); setExportLoading(false); return }
    const { participants } = await res.json()
    if (!participants || participants.length === 0) {
      toast.error('Belum ada peserta'); setExportLoading(false); return
    }

    const warning = '# FILE INI BERSIFAT RAHASIA — Hanya untuk kebutuhan internal organisasi.\n'
      + '# Berisi data pribadi peserta dan link bukti pembayaran. DILARANG menyebarluaskan.\n\n'
    const header = 'Nama,Email,WhatsApp,No.Registrasi,Status,Check-In,Bukti Bayar,Tanggal Daftar'
    const rows = participants.map((p: any) =>
      [
        `"${p.name}"`, `"${p.email}"`, p.whatsapp,
        p.registration_number || '', p.status === 'verified' ? 'Terverifikasi' : p.status === 'checked_in' ? 'Check-in' : 'Pending',
        p.is_checked_in ? 'Ya' : 'Tidak', p.payment_proof_url || '',
        new Date(p.created_at).toLocaleDateString('id-ID'),
      ].join(',')
    ).join('\n')

    const blob = new Blob(['\ufeff' + warning + header + '\n' + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `peserta_${exportTarget.slug}_${new Date().toISOString().slice(0,10)}.csv`
    a.click()

    setExportLoading(false)
    setExportTarget(null)
    URL.revokeObjectURL(url)
    toast.success(`Berhasil mengunduh ${participants.length} peserta`)
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <a href="/admin/events/new" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-amber-500 rounded-xl text-white text-sm font-medium">
          <Plus size={18} />
          Tambah Event
        </a>
      </div>

      <div className="relative w-full sm:max-w-xs mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input type="text" placeholder="Cari event..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
      </div>

      {loading ? (
        <div className="text-gray-500 py-10">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada event</div>
      ) : (
        <>{openMenu && <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />}
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
              {event.flyer_url ? (
                <img src={event.flyer_url} alt="" className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-900/50 to-amber-900/50 flex items-center justify-center text-base sm:text-xl shrink-0">🎤</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm sm:text-base truncate">{event.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">/{event.slug}</p>
              </div>
              <div className="hidden lg:flex items-center gap-1 shrink-0">
                <Toggle checked={!!event.is_active} onChange={() => handleToggleActive(event)} />
                <button onClick={() => handleExport(event)} className="p-2 rounded-lg hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-300 transition-colors" title="Unduh data peserta (CSV)">
                  <Download size={16} />
                </button>
                <a href={`/admin/events/${event.id}/edit`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <Pencil size={18} />
                </a>
                <button onClick={() => setResetTarget(event)} className="p-2 rounded-lg hover:bg-amber-500/10 text-gray-400 hover:text-amber-300 transition-colors" title="Reset peserta & sponsor">
                  <RotateCcw size={16} />
                </button>
                <button onClick={() => setDeleteTarget(event)} className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-300 transition-colors" title="Hapus event">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="relative shrink-0 lg:hidden">
                <button onClick={() => setOpenMenu(openMenu === event.id ? null : event.id)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <MoreVertical size={18} />
                </button>
                {openMenu === event.id && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/10 bg-[#0f1a14] shadow-xl shadow-black/40 z-50 py-1.5">
                    <div className="px-3 py-1.5 border-b border-white/5">
                      <label className="flex items-center justify-between gap-3 text-xs text-gray-400">
                        Aktif
                        <Toggle checked={!!event.is_active} onChange={() => { handleToggleActive(event); setOpenMenu(null) }} />
                      </label>
                    </div>
                    <button onClick={() => { handleExport(event); setOpenMenu(null) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/5 transition-colors">
                      <Download size={15} /> Unduh CSV
                    </button>
                    <a href={`/admin/events/${event.id}/edit`} onClick={() => setOpenMenu(null)} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                      <Pencil size={15} /> Edit
                    </a>
                    <button onClick={() => { setResetTarget(event); setOpenMenu(null) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-300 hover:text-amber-300 hover:bg-amber-500/5 transition-colors">
                      <RotateCcw size={15} /> Reset
                    </button>
                    <button onClick={() => { setDeleteTarget(event); setOpenMenu(null) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-300 hover:text-rose-300 hover:bg-rose-500/5 transition-colors">
                      <Trash2 size={15} /> Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        </>)}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Event"
        message={`Yakin ingin menghapus event "${deleteTarget?.title}" beserta seluruh data peserta dan sponsornya?`}
        confirmText="Hapus"
        variant="danger"
      />

      <ConfirmModal
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        onConfirm={handleReset}
        title="Reset Event"
        message={`Ini akan menghapus SEMUA peserta dan sponsor dari "${resetTarget?.title}". Event itu sendiri tidak akan dihapus.`}
        confirmText="Reset Event"
        variant="warning"
        requireCheckbox
        checkboxLabel="Saya telah membackup data dan memahami bahwa tindakan ini tidak dapat dibatalkan."
      />

      <Modal open={!!exportTarget} onClose={() => !exportLoading && setExportTarget(null)} title="">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center mb-4 ring-1 ring-amber-500/20">
            <ShieldAlert className="text-amber-400" size={28} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-3">⚠️ Data Rahasia</h3>
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl px-4 py-3 mb-4 text-left">
            <p className="text-sm text-gray-300 leading-relaxed">
              File ini berisi <span className="text-rose-300 font-medium">data pribadi peserta</span> (nama, email, WhatsApp) dan link bukti pembayaran.
            </p>
          </div>
          <p className="text-sm text-amber-300/80 font-medium mb-6">
            Hanya untuk kebutuhan internal organisasi. <span className="text-rose-400">DILARANG menyebarluaskan</span> ke pihak lain.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setExportTarget(null)} disabled={exportLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium disabled:opacity-50">
              Batal
            </button>
            <button onClick={confirmExport} disabled={exportLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white text-sm font-medium hover:from-amber-500 hover:to-rose-500 transition-all disabled:opacity-50">
              {exportLoading ? 'Mengunduh...' : 'Lanjutkan Download'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
