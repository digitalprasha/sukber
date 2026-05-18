import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Plus, Pencil } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AdminNewsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Berita</h1>
        <a
          href="/admin/news/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl text-white text-sm font-medium"
        >
          <Plus size={18} />
          Tambah Berita
        </a>
      </div>

      {(!news || news.length === 0) && (
        <div className="text-center py-20 text-gray-500">Belum ada berita</div>
      )}

      <div className="grid gap-4">
        {news?.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
          >
            {item.thumbnail_url ? (
              <img src={item.thumbnail_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate">{item.title}</h3>
              <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {item.is_active ? 'Aktif' : 'Nonaktif'}
            </span>
            <a
              href={`/admin/news/${item.id}/edit`}
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
