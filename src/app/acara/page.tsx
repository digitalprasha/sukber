import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { EventCard } from '@/components/events/EventCard'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acara',
  description: 'Acara dan kegiatan musik SukaBernyanyi Sukabumi',
}

export default async function EventsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Navigation />
      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Acara & Kegiatan</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Daftar dan ikuti berbagai acara musik yang kami selenggarakan
          </p>
        </div>

        {(!events || events.length === 0) && (
          <div className="text-center py-20">
            <p className="text-gray-500">Belum ada acara tersedia</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
