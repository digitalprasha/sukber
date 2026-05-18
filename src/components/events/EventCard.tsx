import Link from 'next/link'
import type { Event } from '@/types'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/acara/${event.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
    >
      {event.flyer_url ? (
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={event.flyer_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
          <span className="text-6xl">🎤</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">
          {event.description.replace(/<[^>]*>/g, '').slice(0, 100)}
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl text-white text-sm font-medium group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
            Daftar Sekarang
          </span>
        </div>
      </div>
    </Link>
  )
}
