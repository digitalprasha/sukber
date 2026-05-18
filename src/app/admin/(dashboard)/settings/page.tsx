import Link from 'next/link'
import { Info, ArrowRight } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Pengaturan</h1>

      <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-6">
        <div className="flex items-start gap-4">
          <Info className="text-emerald-400 mt-1 shrink-0" size={24} />
          <div>
            <h2 className="text-lg font-semibold text-emerald-300 mb-2">Reset Data</h2>
            <p className="text-gray-400 text-sm mb-4">
              Fitur reset sekarang tersedia <strong>per event</strong> di halaman Events. 
              Setiap event bisa di-reset secara independen — hanya peserta dan sponsor 
              yang terhapus, eventnya tetap aman.
            </p>
            <Link
              href="/admin/events"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
            >
              Buka halaman Events
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
