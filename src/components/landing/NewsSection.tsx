import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NewsCard } from '@/components/news/NewsCard'

export async function NewsSection() {
  const supabase = await createServerSupabaseClient()
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <section id="berita" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Berita Terbaru</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Ikuti perkembangan dan kegiatan terbaru dari komunitas SukaBernyanyi Sukabumi
        </p>
      </div>

      {(!news || news.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">Belum ada berita tersedia</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news?.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>

      {news && news.length > 0 && (
        <div className="text-center mt-8">
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            Lihat Semua Berita
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  )
}
