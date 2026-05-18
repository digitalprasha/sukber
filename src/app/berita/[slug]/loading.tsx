import { Navigation } from '@/components/Navigation'
import { Skeleton } from '@/components/ui/Skeleton'

export default function NewsDetailLoading() {
  return (
    <>
      <Navigation />
      <main className="pt-24 pb-20 px-4">
        <article className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </article>
      </main>
    </>
  )
}
