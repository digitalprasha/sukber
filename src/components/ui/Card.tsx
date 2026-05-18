import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm',
        hover && 'hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  )
}
