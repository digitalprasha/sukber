import { Navigation } from '@/components/Navigation'
import { Skeleton } from '@/components/ui/Skeleton'

export default function EventDetailLoading() {
  return (
    <>
      <Navigation />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
            <Skeleton className="h-10 w-3/4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        </div>
      </main>
    </>
  )
}
