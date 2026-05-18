import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-shimmer rounded-lg', className)} />
}

export function NewsCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
