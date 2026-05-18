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
    <div className="flex min-h-screen bg-[#0f0f1a]">
      <div className="hidden lg:block">
        <AdminSidebar onSignOut={handleSignOut} role={role} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0">
            <AdminSidebar onSignOut={handleSignOut} role={role} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-[#0f0f1a]/80 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right">
                <p className="text-sm text-white">{email}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-sm font-medium text-white">
                {email[0].toUpperCase()}
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
