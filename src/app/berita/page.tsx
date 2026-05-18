import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { NewsCard } from '@/components/news/NewsCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { PaginationLinks } from '@/components/ui/PaginationLinks'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

const PER_PAGE = 9

export const metadata: Metadata = {
  title: 'Berita',
  description: 'Berita dan kegiatan terbaru dari SukaBernyanyi Sukabumi',
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page: pageStr, q } = await searchParams
  const page = Math.max(1, parseInt(pageStr || '1'))
  const supabase = await createServerSupabaseClient()

  let query = supabase.from('news').select('*', { count: 'exact' }).eq('is_active', true)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: news, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / PER_PAGE)

  return (
    <>
      <Navigation />
      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Berita</h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Ikuti perkembangan terbaru dari komunitas SukaBernyanyi Sukabumi
          </p>
          <SearchInput placeholder="Cari berita..." basePath="/berita" />
        </div>

        {(!news || news.length === 0) && (
          <div className="text-center py-20">
            <p className="text-gray-500">{q ? 'Berita tidak ditemukan' : 'Belum ada berita tersedia'}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news?.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>

        <PaginationLinks page={page} totalPages={totalPages} basePath={q ? `/berita?q=${encodeURIComponent(q)}` : '/berita'} />
      </main>
      <Footer />
    </>
  )
}
