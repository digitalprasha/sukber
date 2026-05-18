import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationLinksProps {
  page: number
  totalPages: number
  basePath: string
}

export function PaginationLinks({ page, totalPages, basePath }: PaginationLinksProps) {
  if (totalPages <= 1) return null

  function href(p: number) {
    return p === 1 ? basePath : `${basePath}?page=${p}`
  }

  const pages: (number | 'ellipsis')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages <= 7 || i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {page > 1 && (
        <Link href={href(page - 1)} className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <ChevronLeft size={18} />
        </Link>
      )}
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1 text-gray-600">...</span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            className={`min-w-[36px] h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
              p === page
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link href={href(page + 1)} className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <ChevronRight size={18} />
        </Link>
      )}
    </div>
  )
}
