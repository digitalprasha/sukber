import { Navigation } from '@/components/Navigation'
import { NewsCardSkeleton } from '@/components/ui/Skeleton'

export default function NewsLoading() {
  return (
    <>
      <Navigation />
      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-12 w-48 animate-shimmer rounded-lg mx-auto mb-4" />
          <div className="h-6 w-96 animate-shimmer rounded-lg mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </>
  )
}
