import Link from 'next/link'
import { Music2 } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent mb-3">
              <Music2 size={24} />
              SukaBernyanyi
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Komunitas pecinta musik dan bernyanyi di Sukabumi. 
              Bersama kita berkarya dan berbagi kebahagiaan.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Navigasi</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <Link href="/berita" className="block hover:text-emerald-400 transition-colors">Berita</Link>
              <Link href="/acara" className="block hover:text-emerald-400 transition-colors">Acara</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Kontak</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Instagram: @sukabernyanyi</p>
              <p>Email: info@sukabernyanyi.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} SukaBernyanyi Sukabumi. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
