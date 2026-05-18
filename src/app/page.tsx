import { ParallaxHero } from '@/components/landing/ParallaxHero'
import { NewsSection } from '@/components/landing/NewsSection'
import { EventSection } from '@/components/landing/EventSection'
import { GallerySection } from '@/components/landing/GallerySection'
import { PartnersSection } from '@/components/landing/PartnersSection'
import { FaqSection } from '@/components/landing/FaqSection'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export default async function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <ParallaxHero />
        <NewsSection />
        <EventSection />
        <GallerySection />
        <PartnersSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  )
}
