import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { News } from '@/types'

interface NewsCardProps {
  news: News
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <Link
      href={`/berita/${news.slug}`}
      className="group h-full flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10"
    >
      {news.thumbnail_url ? (
        <div className="aspect-video overflow-hidden shrink-0">
          <img
            src={news.thumbnail_url}
            alt={news.title}
            className="w-full h-full object-contain transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-video shrink-0 bg-gradient-to-br from-emerald-900/50 to-amber-900/50 flex items-center justify-center">
          <span className="text-4xl">🎵</span>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">{formatDate(news.created_at)}</span>
          {news.tags && news.tags.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {news.tags[0]}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
          {news.title}
        </h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {news.content.replace(/<[^>]*>/g, '').slice(0, 120)}
        </p>
      </div>
    </Link>
  )
}
