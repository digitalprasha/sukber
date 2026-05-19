'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Mail } from 'lucide-react'
import type { Staff, UserRole } from '@/types'

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  developer: 'Developer',
  admin: 'Admin',
  panitia: 'Panitia',
  scanner: 'Scanner',
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'panitia', label: 'Panitia' },
  { value: 'scanner', label: 'Scanner' },
]

export default function PenggunaPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addRole, setAddRole] = useState<UserRole>('panitia')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<UserRole>('panitia')
  const [editing, setEditing] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchStaff = async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) setStaff(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchStaff() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: addEmail, role: addRole }),
    })
    setAdding(false)
    if (!res.ok) { const { error } = await res.json(); toast.error(error); return }
    toast.success('Staff berhasil ditambahkan')
    setShowAdd(false)
    setAddEmail('')
    fetchStaff()
  }

  const handleEdit = async (id: string) => {
    setEditing(true)
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role: editRole }),
    })
    setEditing(false)
    if (!res.ok) { toast.error('Gagal mengupdate staff'); return }
    toast.success('Role berhasil diubah')
    setEditId(null)
    fetchStaff()
  }

  const handleDelete = async (id: string) => {
    setDeleting(true)
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeleting(false)
    if (!res.ok) { const { error } = await res.json(); toast.error(error); return }
    toast.success('Staff berhasil dihapus')
    setDeleteId(null)
    fetchStaff()
  }

  if (loading) return <div className="text-gray-500">Memuat...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Pengguna</h1>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Staff
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="rounded-2xl border border-white/10 min-w-[600px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Sejak</th>
              <th className="text-right px-4 py-3 text-sm text-gray-400 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-600 shrink-0" />
                    <span className="text-white text-sm">{s.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {editId === s.id ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select
                          value={editRole}
                          onChange={e => setEditRole(e.target.value as UserRole)}
                          className="appearance-none bg-[#1a1a2e] border border-white/20 rounded-xl px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer"
                        >
                          {ROLE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value} className="bg-[#1a1a2e] text-white">{o.label}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <Button size="sm" loading={editing} onClick={() => handleEdit(s.id)}>Simpan</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Batal</Button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-300">{ROLE_LABELS[s.role]}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(s.created_at).toLocaleDateString('id-ID')}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editId !== s.id && (
                      <>
                        <button onClick={() => { setEditId(s.id); setEditRole(s.role) }}
                          className="p-2 text-gray-500 hover:text-white transition-colors" title="Ubah role">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {s.is_deletable && (
                          <button onClick={() => setDeleteId(s.id)}
                            className="p-2 text-gray-500 hover:text-rose-400 transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowAdd(false)} />
          <div className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">Tambah Staff</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                <input type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Role</label>
                <div className="relative">
                  <select value={addRole} onChange={e => setAddRole(e.target.value as UserRole)}
                    className="appearance-none w-full bg-[#1a1a2e] border border-white/20 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer">
                    {ROLE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} className="bg-[#1a1a2e] text-white">{o.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Batal</Button>
                <Button type="submit" loading={adding}>Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
          <div className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-white mb-2">Hapus Staff?</h2>
            <p className="text-gray-400 text-sm mb-6">Staff yang dihapus tidak bisa dikembalikan.</p>
            <div className="flex justify-center gap-3">
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button variant="danger" loading={deleting} onClick={() => handleDelete(deleteId)}>Hapus</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
