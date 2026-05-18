import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Music2 } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Music2 className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-400 mb-8">Halaman tidak ditemukan</p>
          <Link
            href="/"
            className="inline-flex px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl text-white font-medium"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
