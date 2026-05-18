import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { EventCard } from '@/components/events/EventCard'
import { PaginationLinks } from '@/components/ui/PaginationLinks'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

const PER_PAGE = 9

export const metadata: Metadata = {
  title: 'Acara',
  description: 'Acara dan kegiatan musik SukaBernyanyi Sukabumi',
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr || '1'))
  const supabase = await createServerSupabaseClient()

  const { data: events, count } = await supabase
    .from('events')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / PER_PAGE)

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

        <PaginationLinks page={page} totalPages={totalPages} basePath="/acara" />
      </main>
      <Footer />
    </>
  )
}
