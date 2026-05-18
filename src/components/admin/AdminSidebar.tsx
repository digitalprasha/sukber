'use client'

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
  Phone,
  Users,
  PanelLeftClose,
  PanelRightOpen,
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

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
  role,
}: {
  collapsed: boolean
  onToggleCollapse: () => void
  role?: UserRole
}) {
  const pathname = usePathname()

  const visibleItems = navItems.filter(
    item => !item.adminOnly || role === 'super_admin' || role === 'developer'
  )

  return (
    <aside className={cn(
      'h-full bg-[#0a0a14] border-r border-white/10 flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className={cn(
        'border-b border-white/10 shrink-0 flex items-center h-16',
        collapsed ? 'justify-center px-0' : 'justify-between px-4'
      )}>
        <a href="/admin" className={cn(collapsed ? 'mx-auto' : '')}>
          <Image src="/logo.png" alt="SukaBernyanyi" width={collapsed ? 32 : 90} height={collapsed ? 32 : 90} className="shrink-0" />
        </a>
        {!collapsed && (
          <button onClick={onToggleCollapse} className="text-gray-500 hover:text-white transition-colors p-1" title="Perkecil menu">
            <PanelLeftClose size={18} />
          </button>
        )}
        {collapsed && (
          <button onClick={onToggleCollapse} className="absolute -right-3 top-5 bg-[#0a0a14] border border-white/10 rounded-full p-1 text-gray-500 hover:text-white transition-colors shadow" title="Perluas menu">
            <PanelRightOpen size={14} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : (pathname === item.href || pathname.startsWith(item.href + '/'))
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
    </aside>
  )
}
