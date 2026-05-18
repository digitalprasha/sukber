'use client'

import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Toaster } from '@/components/ui/Toaster'
import type { UserRole } from '@/types'

interface AdminShellProps {
  children: React.ReactNode
  email: string
  role: UserRole
}

export function AdminShell({ children, email, role }: AdminShellProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-[#0f0f1a]">
      <div className="hidden lg:block h-screen sticky top-0">
        <AdminSidebar onSignOut={handleSignOut} role={role} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 h-screen">
            <AdminSidebar onSignOut={handleSignOut} role={role} />
          </div>
        </div>
      )}

        <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-[#0f0f1a]/80 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu size={24} />
              </button>
              <div className="hidden sm:block">
                <p className="text-sm text-white">
                  Selamat datang{', '}
                  <span className="capitalize font-semibold text-emerald-300">{role.replace('_', ' ')}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-xs font-medium text-white shrink-0">
                {email[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-400 hidden sm:inline">{email}</span>
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
