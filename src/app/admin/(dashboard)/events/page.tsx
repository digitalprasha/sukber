import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Plus, Pencil } from 'lucide-react'

export default async function AdminEventsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

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

      {(!events || events.length === 0) && (
        <div className="text-center py-20 text-gray-500">Belum ada event</div>
      )}

      <div className="grid gap-4">
        {events?.map((event) => (
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
            <a
              href={`/admin/events/${event.id}/edit`}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <Pencil size={18} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
