import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'

export async function EventSection() {
  const supabase = await createServerSupabaseClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <section id="acara" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Acara & Kegiatan</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Ikuti dan daftarkan dirimu untuk berbagai acara musik yang kami selenggarakan
        </p>
      </div>

      {(!events || events.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">Belum ada acara mendatang</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {events && events.length > 0 && (
        <div className="text-center mt-8">
          <Link
            href="/acara"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Lihat Semua Acara
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  )
}
