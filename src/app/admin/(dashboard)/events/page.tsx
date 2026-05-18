'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Plus, Pencil, AlertTriangle, Trash2, X } from 'lucide-react'

export default function AdminEventsPage() {
  const supabase = createClient()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resetTarget, setResetTarget] = useState<any | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  async function handleReset() {
    if (!resetTarget) return
    setResetting(true)

    const { error: delSponsors } = await supabase
      .from('sponsors')
      .delete()
      .eq('event_id', resetTarget.id)

    const { error: delParticipants } = await supabase
      .from('participants')
      .delete()
      .eq('event_id', resetTarget.id)

    if (delSponsors || delParticipants) {
      alert('Gagal: ' + (delSponsors?.message || delParticipants?.message))
    } else {
      await supabase.from('audit_logs').insert({
        action: 'RESET_EVENT',
        details: `Reset data event: ${resetTarget.title} (peserta & sponsor dihapus)`,
      })
      setResetTarget(null)
      setConfirmed(false)
      loadEvents()
    }
    setResetting(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <a
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-amber-500 rounded-xl text-white text-sm font-medium"
        >
          <Plus size={18} />
          Tambah Event
        </a>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada event</div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              {event.flyer_url ? (
                <img src={event.flyer_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-900/50 to-amber-900/50 flex items-center justify-center">
                  <span className="text-2xl">🎤</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{event.title}</h3>
                <p className="text-sm text-gray-500">/{event.slug}</p>
              </div>
              <button
                onClick={() => setResetTarget(event)}
                className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-300 transition-colors"
                title="Reset event ini"
              >
                <Trash2 size={16} />
              </button>
              <a
                href={`/admin/events/${event.id}/edit`}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <Pencil size={18} />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-[#0a0f0d] border border-rose-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-rose-400" size={22} />
                <h2 className="text-lg font-semibold text-rose-300">Reset Event</h2>
              </div>
              <button onClick={() => { setResetTarget(null); setConfirmed(false) }}>
                <X size={20} className="text-gray-500 hover:text-white" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-2">
              Ini akan menghapus SEMUA <strong className="text-white">peserta</strong> dan <strong className="text-white">sponsor</strong> dari:
            </p>
            <p className="text-white font-medium mb-6">&ldquo;{resetTarget.title}&rdquo;</p>
            <p className="text-gray-500 text-xs mb-4">Event itu sendiri tidak akan dihapus.</p>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 mb-4">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5"
              />
              <span className="text-sm text-gray-300">
                Saya telah membackup data dan memahami bahwa tindakan ini tidak dapat dibatalkan.
              </span>
            </label>

            <div className="flex gap-3">
              <Button onClick={handleReset} disabled={!confirmed} loading={resetting} variant="danger" className="flex-1">
                <Trash2 size={16} className="mr-2" />
                Reset Event Ini
              </Button>
              <Button variant="ghost" onClick={() => { setResetTarget(null); setConfirmed(false) }}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
