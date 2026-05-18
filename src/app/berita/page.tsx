import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { NewsCard } from '@/components/news/NewsCard'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Berita',
  description: 'Berita dan kegiatan terbaru dari SukaBernyanyi Sukabumi',
}

export default async function NewsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <>
      <Navigation />
      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Berita</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Ikuti perkembangan terbaru dari komunitas SukaBernyanyi Sukabumi
          </p>
        </div>

        {(!news || news.length === 0) && (
          <div className="text-center py-20">
            <p className="text-gray-500">Belum ada berita tersedia</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news?.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
