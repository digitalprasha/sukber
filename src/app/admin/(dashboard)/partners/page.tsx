'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, GripVertical, ExternalLink } from 'lucide-react'

const CATEGORIES = [
  { value: 'partnership', label: 'Partnership' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'collaborator', label: 'Collaborator' },
  { value: 'media_partner', label: 'Media Partner' },
]

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', logo_url: '', website_url: '', category: 'partnership', display_order: 0 })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    const res = await fetch('/api/admin/partners')
    if (res.ok) setPartners(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => { setForm({ name: '', logo_url: '', website_url: '', category: 'partnership', display_order: 0 }); setFile(null); setPreview(''); setEditId(null); setShowForm(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    let logo_url = form.logo_url
    if (file) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'partner')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) { toast.error('Gagal upload logo'); setSaving(false); return }
      const data = await res.json()
      logo_url = data.url
    }

    const isEdit = !!editId
    const body = isEdit ? { ...form, logo_url, id: editId } : { ...form, logo_url }
    const res = await fetch('/api/admin/partners', { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (!res.ok) { toast.error('Gagal menyimpan'); return }
    toast.success(isEdit ? 'Partner berhasil diupdate' : 'Partner berhasil ditambahkan')
    resetForm()
    load()
  }

  const handleEdit = (item: any) => {
    setForm({ name: item.name, logo_url: item.logo_url, website_url: item.website_url, category: item.category, display_order: item.display_order })
    setPreview(item.logo_url)
    setEditId(item.id)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const res = await fetch('/api/admin/partners', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteId }) })
    setDeleting(false)
    if (!res.ok) { toast.error('Gagal menghapus'); return }
    toast.success('Partner berhasil dihapus')
    setDeleteId(null)
    load()
  }

  const handleToggle = async (item: any) => {
    const res = await fetch('/api/admin/partners', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, is_active: !item.is_active, name: item.name, logo_url: item.logo_url, website_url: item.website_url, category: item.category, display_order: item.display_order }) })
    if (!res.ok) { toast.error('Gagal mengubah status'); return }
    load()
  }

  if (loading) return <div className="text-gray-500">Memuat...</div>

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Partners</h1>
        <Button onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Partner
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">{editId ? 'Edit Partner' : 'Tambah Partner'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nama</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Kategori</label>
              <div className="relative">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="appearance-none w-full bg-[#1a1a2e] border border-white/20 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-[#1a1a2e] text-white">{c.label}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Logo</label>
            <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)) } }}
              className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-300 hover:file:bg-emerald-500/20" />
            {preview && <img src={preview} alt="Preview" className="mt-2 h-12 w-auto rounded-lg border border-white/10" />}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">URL Website</label>
            <input value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50" />
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

      {partners.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada partner</div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Logo</th>
                <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Nama</th>
                <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Kategori</th>
                <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Website</th>
                <th className="text-right px-4 py-3 text-sm text-gray-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    {p.logo_url ? <img src={p.logo_url} alt={p.name} className="h-8 w-auto rounded-lg" /> : <div className="w-8 h-8 rounded-lg bg-white/5" />}
                  </td>
                  <td className="px-4 py-3"><span className="text-sm text-white">{p.name}</span></td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">{CATEGORIES.find(c => c.value === p.category)?.label}</span></td>
                  <td className="px-4 py-3">
                    {p.website_url ? (
                      <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 text-sm">
                        <ExternalLink size={12} /> Buka
                      </a>
                    ) : <span className="text-gray-600 text-sm">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Toggle checked={!!p.is_active} onChange={() => handleToggle(p)} />
                      <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-300 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
          <div className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-white mb-2">Hapus Partner?</h2>
            <p className="text-gray-400 text-sm mb-6">Partner yang dihapus tidak bisa dikembalikan.</p>
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
