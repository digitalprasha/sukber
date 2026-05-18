'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Partner {
  id: string
  name: string
  logo_url: string
  website_url: string
  category: string
}

const CATEGORY_LABELS: Record<string, string> = {
  partnership: 'Partnership',
  sponsorship: 'Sponsorship',
  collaborator: 'Collaborator',
  media_partner: 'Media Partner',
}

const CATEGORY_ORDER = ['partnership', 'sponsorship', 'collaborator', 'media_partner']

export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('partners').select('*').eq('is_active', true).order('display_order', { ascending: true }).then(({ data }) => {
      if (data) setPartners(data)
    })
  }, [])

  if (partners.length === 0) return null

  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: partners.filter(p => p.category === cat),
  })).filter(g => g.items.length > 0)

  return (
    <section id="partners" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mitra Kami</h2>
          <p className="text-gray-400">Terima kasih kepada para mitra yang telah bekerja sama dengan kami</p>
        </div>

        <div className="space-y-12">
          {grouped.map((group) => (
            <div key={group.category}>
              <h3 className="text-lg font-semibold text-emerald-300 mb-6 text-center uppercase tracking-wider">{group.label}</h3>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                {group.items.map((partner) => (
                  <a
                    key={partner.id}
                    href={partner.website_url || '#'}
                    target={partner.website_url ? '_blank' : undefined}
                    rel={partner.website_url ? 'noopener noreferrer' : undefined}
                    className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300"
                    title={partner.name}
                  >
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="h-10 md:h-14 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                    <span className="text-xs text-gray-500 group-hover:text-emerald-300 transition-colors text-center">{partner.name}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
