'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Sponsor {
  id: string
  name: string
  logo_url: string
}

interface SponsorSectionProps {
  sponsors: Sponsor[]
}

export function SponsorSection({ sponsors }: SponsorSectionProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (!sponsors || sponsors.length === 0) return null

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Sponsor & Mitra</h2>
        <p className="text-gray-400">Terima kasih kepada para sponsor dan mitra yang mendukung kami</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-center">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="relative group flex items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
            onMouseEnter={() => setHoveredId(sponsor.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <img
              src={sponsor.logo_url}
              alt={sponsor.name}
              className="h-12 md:h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
            <div
              className={cn(
                'absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-gray-900/90 text-xs text-white whitespace-nowrap opacity-0 transition-opacity duration-200 pointer-events-none',
                'hidden md:block',
                hoveredId === sponsor.id && 'opacity-100'
              )}
            >
              {sponsor.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
