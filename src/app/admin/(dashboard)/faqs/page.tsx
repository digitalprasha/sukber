'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ question: '', answer: '', display_order: 0 })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    const res = await fetch('/api/admin/faqs')
    if (res.ok) setFaqs(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => { setForm({ question: '', answer: '', display_order: 0 }); setEditId(null); setShowForm(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const isEdit = !!editId
    const url = '/api/admin/faqs'
    const body = isEdit ? { ...form, id: editId } : form
    const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (!res.ok) { toast.error('Gagal menyimpan'); return }
    toast.success(isEdit ? 'FAQ berhasil diupdate' : 'FAQ berhasil ditambahkan')
    resetForm()
    load()
  }

  const handleEdit = (item: any) => {
    setForm({ question: item.question, answer: item.answer, display_order: item.display_order })
    setEditId(item.id)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const res = await fetch('/api/admin/faqs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteId }) })
    setDeleting(false)
    if (!res.ok) { toast.error('Gagal menghapus'); return }
    toast.success('FAQ berhasil dihapus')
    setDeleteId(null)
    load()
  }

  const handleToggle = async (item: any) => {
    const res = await fetch('/api/admin/faqs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, is_active: !item.is_active, question: item.question, answer: item.answer, display_order: item.display_order }) })
    if (!res.ok) { toast.error('Gagal mengubah status'); return }
    load()
  }

  if (loading) return <div className="text-gray-500">Memuat...</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">FAQ</h1>
        <Button onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah FAQ
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">{editId ? 'Edit FAQ' : 'Tambah FAQ'}</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Pertanyaan</label>
            <input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Jawaban</label>
            <textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={4}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 resize-y" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Urutan</label>
            <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })}
              className="w-24 px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>Simpan</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>Batal</Button>
          </div>
        </form>
      )}

      {faqs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada FAQ</div>
      ) : (
        <div className="space-y-3">
          {faqs.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="mt-1 text-gray-600"><GripVertical size={16} /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm">{item.question}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.answer}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 pt-1">
                <Toggle checked={!!item.is_active} onChange={() => handleToggle(item)} />
                <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-300 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
          <div className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-white mb-2">Hapus FAQ?</h2>
            <p className="text-gray-400 text-sm mb-6">FAQ yang dihapus tidak bisa dikembalikan.</p>
            <div className="flex justify-center gap-3">
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button variant="danger" loading={deleting} onClick={handleDelete}>Hapus</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
