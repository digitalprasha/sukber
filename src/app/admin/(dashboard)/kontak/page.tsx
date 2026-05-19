'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

const FIELDS = [
  { key: 'instagram', label: 'Instagram', placeholder: '@sukabernyanyi' },
  { key: 'email', label: 'Email', placeholder: 'info@sukabernyanyi.com' },
  { key: 'address', label: 'Alamat', placeholder: 'Sukabumi, Jawa Barat' },
  { key: 'whatsapp', label: 'WhatsApp Admin', placeholder: '6281234567890' },
]

export default function KontakPage() {
  const supabase = createClient()
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('contact_info').select('key, value').then(({ data }) => {
      if (data) {
        const vals: Record<string, string> = {}
        data.forEach((row: any) => { vals[row.key] = row.value })
        setForm(vals)
      }
      setLoading(false)
    })
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const user_email = user?.email || 'unknown'

    for (const field of FIELDS) {
      const value = form[field.key] || ''
      const { data: existing } = await supabase
        .from('contact_info')
        .select('id')
        .eq('key', field.key)
        .single()

      if (existing) {
        await supabase.from('contact_info').update({ value }).eq('key', field.key)
      } else {
        await supabase.from('contact_info').insert({ key: field.key, value })
      }
    }

    await supabase.from('audit_logs').insert({
      user_email,
      action: 'UPDATE_CONTACT',
      details: 'Mengupdate informasi kontak',
    })

    toast.success('Kontak berhasil disimpan')
    setSaving(false)
  }

  if (loading) return <div className="text-gray-500 py-10">Loading...</div>

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-8">Informasi Kontak</h1>
      <p className="text-sm text-gray-500 mb-6">
        Informasi ini akan tampil di footer website.
      </p>

      <div className="space-y-5">
        {FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">{field.label}</label>
            <input
              type="text"
              value={form[field.key] || ''}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        ))}

        <Button onClick={handleSave} loading={saving} className="mt-4">
          <Save size={18} className="mr-2" />
          Simpan
        </Button>
      </div>
    </div>
  )
}
