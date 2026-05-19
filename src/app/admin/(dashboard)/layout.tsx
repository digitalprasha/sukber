import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from './AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    redirect('/admin/login')
  }

  const { data: staff } = await supabase
    .from('staff')
    .select('role')
    .eq('email', user.email)
    .single()

  if (!staff) {
    await supabase.auth.signOut()
    redirect('/admin/login?error=not_authorized')
  }

  return <AdminShell email={user.email} role={staff.role}>{children}</AdminShell>
}
