'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/berita', label: 'Berita' },
  { href: '/acara', label: 'Acara' },
  { href: '/#gallery', label: 'Galeri' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060a08]/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0 flex items-center">
          <Image src="/logo.png" alt="SukaBernyanyi" width={180} height={55} className="h-12 w-auto" priority />
        </Link>

        <div className="hidden md:flex items-center gap-10 ml-12">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4 ml-auto">
          <Link
            href="/admin/login"
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600/20 border border-emerald-500/30 rounded-xl hover:bg-emerald-600/30 transition-all"
          >
            Admin
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-400 hover:text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={cn('md:hidden border-t border-white/5 overflow-hidden transition-all duration-300', isOpen ? 'max-h-60' : 'max-h-0')}>
        <div className="px-6 py-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-gray-400 hover:text-white transition-colors py-2.5 text-sm"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin/login"
            className="block text-emerald-400 hover:text-emerald-300 transition-colors py-2.5 text-sm font-medium border-t border-white/5 mt-2 pt-4"
            onClick={() => setIsOpen(false)}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}
