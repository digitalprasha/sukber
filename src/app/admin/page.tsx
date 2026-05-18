import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Calendar, Newspaper, Ticket, Users } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  const [{ count: eventsCount }, { count: newsCount }, { count: pendingTickets }, { count: participantsCount }] =
    await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('news').select('*', { count: 'exact', head: true }),
      supabase.from('participants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('participants').select('*', { count: 'exact', head: true }),
    ])

  const stats = [
    { label: 'Total Events', value: eventsCount || 0, icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Berita', value: newsCount || 0, icon: Newspaper, color: 'from-blue-500 to-cyan-500' },
    { label: 'Pending Tickets', value: pendingTickets || 0, icon: Ticket, color: 'from-yellow-500 to-orange-500' },
    { label: 'Total Peserta', value: participantsCount || 0, icon: Users, color: 'from-green-500 to-emerald-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/events/new"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <Calendar size={20} className="text-purple-400" />
            <span className="text-sm text-white">Buat Event Baru</span>
          </a>
          <a
            href="/admin/news/new"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <Newspaper size={20} className="text-blue-400" />
            <span className="text-sm text-white">Tulis Berita Baru</span>
          </a>
          <a
            href="/admin/tickets"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <Ticket size={20} className="text-yellow-400" />
            <span className="text-sm text-white">Verifikasi Tiket</span>
          </a>
        </div>
      </div>
    </div>
  )
}
