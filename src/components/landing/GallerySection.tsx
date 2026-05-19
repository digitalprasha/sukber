import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GallerySection() {
  const supabase = await createServerSupabaseClient()
  const { data: items } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  const empty = !items || items.length === 0

  return (
    <section id="gallery" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Galeri</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Momen-momen terbaik dari kegiatan SukaBernyanyi Sukabumi
        </p>
      </div>

      {empty ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Belum ada gambar atau video yang tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
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
                  className="w-full h-full object-contain transition-transform duration-500"
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
      )}

      {!empty && (
        <div className="text-center mt-8">
          <Link
            href="/galeri"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Lihat Semua Galeri
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  )
}
