import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 bg-white/5 border-b border-white/10" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-full mx-auto" />
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
      </div>
    </div>
  )
}
