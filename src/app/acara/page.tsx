import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { EventCard } from '@/components/events/EventCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { PaginationLinks } from '@/components/ui/PaginationLinks'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

const PER_PAGE = 9

export const metadata: Metadata = {
  title: 'Acara',
  description: 'Acara dan kegiatan musik SukaBernyanyi Sukabumi',
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page: pageStr, q } = await searchParams
  const page = Math.max(1, parseInt(pageStr || '1'))
  const supabase = await createServerSupabaseClient()

  let query = supabase.from('events').select('*', { count: 'exact' })
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: events, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / PER_PAGE)

  return (
    <>
      <Navigation />
      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Acara & Kegiatan</h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Daftar dan ikuti berbagai acara musik yang kami selenggarakan
          </p>
          <SearchInput placeholder="Cari acara..." basePath="/acara" />
        </div>

        {(!events || events.length === 0) && (
          <div className="text-center py-20">
            <p className="text-gray-500">{q ? 'Acara tidak ditemukan' : 'Belum ada acara tersedia'}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <PaginationLinks page={page} totalPages={totalPages} basePath={q ? `/acara?q=${encodeURIComponent(q)}` : '/acara'} />
      </main>
      <Footer />
    </>
  )
}
