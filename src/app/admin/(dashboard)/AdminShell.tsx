'use client'

import { useState, useRef, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Menu, LogOut } from 'lucide-react'
import { Toaster } from '@/components/ui/Toaster'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { UserRole } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  developer: 'Developer',
  admin: 'Admin',
  panitia: 'Panitia',
  scanner: 'Scanner',
}

interface AdminShellProps {
  children: React.ReactNode
  email: string
  role: UserRole
}

export function AdminShell({ children, email, role }: AdminShellProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] admin-dashboard">
      <div className="hidden lg:flex h-screen sticky top-0">
        <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} role={role} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0">
            <AdminSidebar collapsed={false} onToggleCollapse={() => {}} role={role} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-[var(--color-header-bg)] backdrop-blur-lg border-b border-[var(--color-card-border)]">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu size={24} />
              </button>
              <p className="text-xs sm:text-sm text-white hidden sm:block">
                SELAMAT DATANG, ANDA LOGIN SEBAGAI <span className="font-semibold text-emerald-300 uppercase">{ROLE_LABELS[role] || role}</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-sm font-medium text-white shrink-0">
                  {email[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-400 hidden sm:inline">{email}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-dropdown-bg)] shadow-2xl shadow-black/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--color-card-border)]">
                    <p className="text-sm text-white truncate">{email}</p>
                    <p className="text-xs text-gray-500 capitalize">{ROLE_LABELS[role] || role}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-400 hover:text-rose-400 hover:bg-rose-600/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
