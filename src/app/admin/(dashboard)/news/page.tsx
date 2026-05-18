'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { toast } from 'sonner'

const PER_PAGE = 10

export default function AdminNewsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    loadNews()
  }, [])

  async function loadNews() {
    setLoading(true)
    let query = supabase.from('news').select('*', { count: 'exact' })
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }
    const { data, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
    setNews(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  useEffect(() => { loadNews() }, [page, search])

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('news').delete().eq('id', deleteTarget.id)
    if (error) {
      toast.error(error.message)
    } else {
      await supabase.from('audit_logs').insert({
        action: 'DELETE_NEWS',
        details: `Menghapus berita: ${deleteTarget.title}`,
      })
      toast.success('Berita berhasil dihapus')
      setDeleteTarget(null)
      loadNews()
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Berita</h1>
        <a href="/admin/news/new" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-amber-500 rounded-xl text-white text-sm font-medium">
          <Plus size={18} />
          Tambah Berita
        </a>
      </div>

      <div className="relative max-w-xs mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input type="text" placeholder="Cari berita..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
      </div>

      {loading ? (
        <div className="text-gray-500 py-10">Loading...</div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada berita</div>
      ) : (
        <div className="grid gap-4">
          {news.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              {item.thumbnail_url ? (
                <img src={item.thumbnail_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-900/50 to-amber-900/50 flex items-center justify-center text-xl">🎵</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{item.title}</h3>
                <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-500/20 text-green-300' : 'bg-rose-600/20 text-rose-300'}`}>
                {item.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
              <button onClick={() => setDeleteTarget(item)} className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-300 transition-colors">
                <Trash2 size={16} />
              </button>
              <a href={`/admin/news/${item.id}/edit`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <Pencil size={18} />
              </a>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Berita"
        message={`Yakin ingin menghapus berita "${deleteTarget?.title}"?`}
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  )
}
