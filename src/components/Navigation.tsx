'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/berita', label: 'Berita' },
  { href: '/acara', label: 'Acara' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f1a]/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          SukaBernyanyi
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-400 hover:text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={cn('md:hidden border-t border-white/10 overflow-hidden transition-all duration-300', isOpen ? 'max-h-48' : 'max-h-0')}>
        <div className="px-4 py-3 space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-gray-400 hover:text-white transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
