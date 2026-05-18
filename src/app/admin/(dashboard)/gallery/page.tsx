'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Image, Video } from 'lucide-react'

export default function AdminGalleryPage() {
  const supabase = createClient()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'image', url: '', caption: '' })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    loadGallery()
  }, [])

  async function loadGallery() {
    const { data } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let url = form.url

    if (file && form.type === 'image') {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'gallery')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      url = data.url
    }

    await supabase.from('gallery').insert({ type: form.type, url, caption: form.caption })
    await supabase.from('audit_logs').insert({
      action: 'ADD_GALLERY',
      details: `Menambah galeri: ${form.caption}`,
    })
    setShowForm(false)
    setForm({ type: 'image', url: '', caption: '' })
    setFile(null)
    loadGallery()
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus item galeri ini?')) return
    await supabase.from('gallery').delete().eq('id', id)
    loadGallery()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Galeri</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={18} className="mr-2" />
          Tambah
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-6 space-y-4">
          <div className="flex gap-3">
            <button type="button" onClick={() => setForm({ ...form, type: 'image' })} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${form.type === 'image' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
              <Image size={16} className="inline mr-1" /> Image
            </button>
            <button type="button" onClick={() => setForm({ ...form, type: 'youtube' })} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${form.type === 'youtube' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                              <Video size={16} className="inline mr-1" /> YouTube
            </button>
          </div>

          {form.type === 'image' ? (
            <Input label="Upload Gambar" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          ) : (
            <Input label="URL YouTube" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
          )}

          <Input label="Keterangan" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
          <div className="flex gap-3">
            <Button type="submit">Simpan</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada galeri</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square bg-white/5 border border-white/10">
              {item.type === 'youtube' ? (
                <div className="w-full h-full flex items-center justify-center bg-amber-900/20 p-2">
                  <iframe src={item.url.replace('watch?v=', 'embed/')} className="w-full h-full rounded-lg" allowFullScreen />
                </div>
              ) : (
                <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              {item.caption && (
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-xs truncate">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
