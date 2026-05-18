import { ParallaxHero } from '@/components/landing/ParallaxHero'
import { NewsSection } from '@/components/landing/NewsSection'
import { EventSection } from '@/components/landing/EventSection'
import { SponsorSection } from '@/components/landing/SponsorSection'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: sponsors } = await supabase
    .from('sponsors')
    .select('id, name, logo_url')

  return (
    <>
      <Navigation />
      <main>
        <ParallaxHero />
        <NewsSection />
        <EventSection />
        <SponsorSection sponsors={sponsors || []} />
      </main>
      <Footer />
    </>
  )
}
