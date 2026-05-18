import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { PaginationLinks } from '@/components/ui/PaginationLinks'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

const PER_PAGE = 12

export const metadata: Metadata = {
  title: 'Galeri',
  description: 'Galeri foto dan video kegiatan SukaBernyanyi Sukabumi',
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr || '1'))
  const supabase = await createServerSupabaseClient()

  const { data: items, count } = await supabase
    .from('gallery')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / PER_PAGE)
  const empty = !items || items.length === 0

  return (
    <>
      <Navigation />
      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeri</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Momen-momen terbaik dari kegiatan SukaBernyanyi Sukabumi
          </p>
        </div>

        {empty && (
          <div className="text-center py-20">
            <p className="text-gray-500">Belum ada galeri tersedia</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items?.map((item: any) => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square bg-white/5 border border-white/10">
              {item.type === 'youtube' ? (
                <div className="w-full h-full flex items-center justify-center bg-amber-900/20">
                  <iframe
                    src={item.url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <PaginationLinks page={page} totalPages={totalPages} basePath="/galeri" />
      </main>
      <Footer />
    </>
  )
}
