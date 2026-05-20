import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function Footer() {
  const supabase = await createServerSupabaseClient()
  const { data: contactRows } = await supabase
    .from('contact_info')
    .select('key, value')

  const contact: Record<string, string> = {}
  if (contactRows) {
    contactRows.forEach((row: { key: string; value: string }) => {
      contact[row.key] = row.value
    })
  }

  return (
    <footer className="border-t border-white/10 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <Image src="/logo.png" alt="SukaBernyanyi" width={160} height={160} className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Komunitas pecinta musik dan bernyanyi di Sukabumi. 
              Bersama kita berkarya dan berbagi kebahagiaan melalui harmoni nada.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Navigasi</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <Link href="/berita" className="block hover:text-emerald-400 transition-colors">Berita</Link>
              <Link href="/acara" className="block hover:text-emerald-400 transition-colors">Acara</Link>
              <Link href="/galeri" className="block hover:text-emerald-400 transition-colors">Galeri</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Kontak</h3>
            <div className="space-y-2 text-sm text-gray-500">
              {contact.instagram ? (
                <a href={`https://instagram.com/${contact.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                  className="block hover:text-emerald-400 transition-colors">
                  Instagram: {contact.instagram.replace('@', '')}
                </a>
              ) : (
                <p>Instagram: @sukabernyanyi</p>
              )}
              {contact.email ? (
                <a href={`mailto:${contact.email}`}
                  className="block hover:text-emerald-400 transition-colors">
                  Email: {contact.email}
                </a>
              ) : (
                <p>Email: info@sukabernyanyi.com</p>
              )}
              {contact.whatsapp && (
                <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="block hover:text-emerald-400 transition-colors">
                  WhatsApp: {contact.whatsapp}
                </a>
              )}
              {contact.address && <p>{contact.address}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} SukaBernyanyi Sukabumi. All rights reserved.
            </p>
            <p className="text-sm text-gray-600">
              Developed by{' '}
              <span className="text-emerald-500 font-medium">
                PT. PRASHA DIGITAL INDONESIA
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
