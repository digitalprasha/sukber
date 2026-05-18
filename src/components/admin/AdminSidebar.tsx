'use client'

import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Newspaper,
  ImageIcon,
  Ticket,
  QrCode,
  History,
  Settings,
  LogOut,
  Music2,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/news', label: 'Berita', icon: Newspaper },
  { href: '/admin/gallery', label: 'Galeri', icon: ImageIcon },
  { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
  { href: '/admin/scanner', label: 'Scanner', icon: QrCode },
  { href: '/admin/logs', label: 'Activity Logs', icon: History },
  { href: '/admin/kontak', label: 'Kontak', icon: Phone },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar({ onSignOut }: { onSignOut: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-[#0a0a14] border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <a href="/admin" className="flex items-center gap-2 text-lg font-bold">
          <Music2 className="text-emerald-400" size={24} />
          <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
            Admin
          </span>
        </a>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </a>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-rose-400 hover:bg-rose-600/10 w-full transition-all duration-200"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
