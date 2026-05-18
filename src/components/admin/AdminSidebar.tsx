'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
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
  Phone,
  Users,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/news', label: 'Berita', icon: Newspaper },
  { href: '/admin/gallery', label: 'Galeri', icon: ImageIcon },
  { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
  { href: '/admin/scanner', label: 'Scanner', icon: QrCode },
  { href: '/admin/pengguna', label: 'Pengguna', icon: Users, adminOnly: true },
  { href: '/admin/logs', label: 'Activity Logs', icon: History },
  { href: '/admin/kontak', label: 'Kontak', icon: Phone },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  developer: 'Developer',
  admin: 'Admin',
  panitia: 'Panitia',
  scanner: 'Scanner',
}

export function AdminSidebar({ onSignOut, role }: { onSignOut: () => void; role?: UserRole }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapsed = () => setCollapsed(!collapsed)

  const visibleItems = navItems.filter(
    item => !item.adminOnly || role === 'super_admin' || role === 'developer'
  )

  return (
    <aside className={cn(
      'h-screen bg-[#0a0a14] border-r border-white/10 flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className={cn(
        'border-b border-white/10 shrink-0 flex items-center',
        collapsed ? 'justify-center p-3' : 'justify-between p-4'
      )}>
        <a href="/admin" className={cn(
          'flex items-center gap-2',
          collapsed ? 'justify-center' : ''
        )}>
          <Image src="/logo.png" alt="SukaBernyanyi" width={28} height={28} className="shrink-0" />
          {!collapsed && (
            <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent text-lg font-bold">
              Admin
            </span>
          )}
        </a>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <a
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                collapsed ? 'justify-center p-2.5' : 'px-4 py-2.5',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && item.label}
            </a>
          )
        })}
      </nav>

      <div className={cn(
        'border-t border-white/10 p-2 space-y-1',
        collapsed ? 'flex flex-col items-center' : ''
      )}>
        <button
          onClick={toggleCollapsed}
          className={cn(
            'rounded-xl text-sm font-medium transition-all duration-200 text-gray-500 hover:text-white hover:bg-white/5',
            collapsed ? 'p-2.5' : 'w-full px-4 py-2.5 flex items-center gap-3'
          )}
          title={collapsed ? 'Perluas menu' : 'Perkecil menu'}
        >
          {collapsed ? <PanelLeft size={18} /> : <><PanelLeftClose size={18} /> Perkecil Menu</>}
        </button>

        <button
          onClick={onSignOut}
          className={cn(
            'rounded-xl text-sm font-medium transition-all duration-200 text-gray-500 hover:text-rose-400 hover:bg-rose-600/10',
            collapsed ? 'p-2.5' : 'w-full px-4 py-2.5 flex items-center gap-3'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}
