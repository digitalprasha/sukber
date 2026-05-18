'use client'

interface Sponsor {
  id: string
  name: string
  logo_url: string
}

interface SponsorSectionProps {
  sponsors: Sponsor[]
}

export function SponsorSection({ sponsors }: SponsorSectionProps) {
  if (!sponsors || sponsors.length === 0) return null

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Sponsor & Mitra</h2>
        <p className="text-gray-400">Terima kasih kepada para sponsor dan mitra yang mendukung kami</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300"
          >
            <img
              src={sponsor.logo_url}
              alt=""
              className="h-10 md:h-14 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
