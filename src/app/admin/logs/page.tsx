import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdminOrDev } from '@/lib/constants'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { History, AlertTriangle } from 'lucide-react'

export default async function LogsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email || !isSuperAdminOrDev(user.email)) {
    redirect('/admin')
  }

  const adminSupabase = createAdminClient()
  const { data: logs } = await adminSupabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100)

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <History className="text-purple-400" size={24} />
        <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm mb-6">
        <AlertTriangle size={16} />
        Log ini bersifat append-only dan tidak dapat dihapus atau diedit.
      </div>

      {(!logs || logs.length === 0) && (
        <div className="text-center py-20 text-gray-500">Belum ada log</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Waktu</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">User</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Aksi</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 text-gray-400 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                <td className="py-3 px-4 text-white">{log.user_email}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 max-w-md truncate">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
