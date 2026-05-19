import Link from 'next/link'
import type { Event } from '@/types'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/acara/${event.slug}`}
      className="group h-full flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10"
    >
      {event.flyer_url ? (
        <div className="aspect-[3/4] overflow-hidden shrink-0">
          <img
            src={event.flyer_url}
            alt={event.title}
            className="w-full h-full object-contain transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] shrink-0 bg-gradient-to-br from-emerald-900/50 to-amber-900/50 flex items-center justify-center">
          <span className="text-6xl">🎤</span>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2 flex-1">
          {event.description.replace(/<[^>]*>/g, '').slice(0, 100)}
        </p>
        <div className="mt-auto pt-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-amber-500 rounded-xl text-white text-sm font-medium group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
            Lihat Detail
          </span>
        </div>
      </div>
    </Link>
  )
}
