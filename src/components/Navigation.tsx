'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/berita', label: 'Berita' },
  { href: '/acara', label: 'Acara' },
  { href: '/#gallery', label: 'Galeri' },
]

function MusicNoteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

function MusicNoteCloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060a08]/80 backdrop-blur-2xl border-b border-white/[0.03]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0 block relative">
          <div className="relative w-[62px] h-[62px] sm:w-[90px] sm:h-[90px]">
            <Image
              src="/logo.png"
              alt="SukaBernyanyi"
              fill
              className="object-contain drop-shadow-[0_0_20px_rgba(5,150,105,0.3)]"
              priority
            />
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.03] rounded-xl transition-all tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-200 transition-all shadow-lg shadow-emerald-500/5"
          >
            <LogIn size={16} />
            Login
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <MusicNoteCloseIcon /> : <MusicNoteIcon />}
        </button>
      </div>

      <div className={cn(
        'md:hidden overflow-hidden transition-all duration-400 ease-in-out',
        isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="px-4 pb-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all py-3 px-4 rounded-xl text-sm"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/5 my-2" />
          <Link
            href="/admin/login"
            className="flex items-center gap-2 text-emerald-300 hover:text-emerald-200 transition-all py-3 px-4 rounded-xl text-sm font-medium"
            onClick={() => setIsOpen(false)}
          >
            <LogIn size={16} />
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}
