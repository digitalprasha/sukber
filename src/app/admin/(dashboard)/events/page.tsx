'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Plus, Pencil, Trash2, RotateCcw, Search } from 'lucide-react'
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
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    loadEvents()
  }, [page, search])

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
    const { error } = await supabase.from('events').delete().eq('id', deleteTarget.id)
    if (error) {
      toast.error(error.message)
    } else {
      await supabase.from('audit_logs').insert({
        action: 'DELETE_EVENT',
        details: `Menghapus event: ${deleteTarget.title}`,
      })
      toast.success('Event berhasil dihapus')
      setDeleteTarget(null)
      loadEvents()
    }
  }

  async function handleReset() {
    if (!resetTarget) return
    const { error: err1 } = await supabase.from('sponsors').delete().eq('event_id', resetTarget.id)
    const { error: err2 } = await supabase.from('participants').delete().eq('event_id', resetTarget.id)
    if (err1 || err2) {
      toast.error(err1?.message || err2?.message)
    } else {
      await supabase.from('audit_logs').insert({
        action: 'RESET_EVENT',
        details: `Reset data event: ${resetTarget.title} (peserta & sponsor dihapus)`,
      })
      toast.success(`Data event "${resetTarget.title}" berihasil direset`)
      setResetTarget(null)
      loadEvents()
    }
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
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              {event.flyer_url ? (
                <img src={event.flyer_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-900/50 to-amber-900/50 flex items-center justify-center text-xl">🎤</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{event.title}</h3>
                <p className="text-sm text-gray-500">/{event.slug}</p>
              </div>
              <button onClick={() => setDeleteTarget(event)} className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-300 transition-colors" title="Hapus event">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setResetTarget(event)} className="p-2 rounded-lg hover:bg-amber-500/10 text-gray-400 hover:text-amber-300 transition-colors" title="Reset peserta & sponsor">
                <RotateCcw size={16} />
              </button>
              <a href={`/admin/events/${event.id}/edit`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <Pencil size={18} />
              </a>
            </div>
          ))}
        </div>
      )}

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
    </div>
  )
}
