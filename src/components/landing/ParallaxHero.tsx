'use client'

import { useEffect, useRef } from 'react'
import { Music2, Mic2, Disc3, Volume2 } from 'lucide-react'

const notes = [
  { Icon: Music2, x: '10%', delay: '0s', size: 24 },
  { Icon: Mic2, x: '85%', delay: '1s', size: 32 },
  { Icon: Disc3, x: '20%', delay: '2s', size: 28 },
  { Icon: Volume2, x: '75%', delay: '0.5s', size: 20 },
  { Icon: Music2, x: '50%', delay: '1.5s', size: 36 },
  { Icon: Mic2, x: '90%', delay: '3s', size: 22 },
  { Icon: Disc3, x: '5%', delay: '2.5s', size: 18 },
  { Icon: Volume2, x: '60%', delay: '0.8s', size: 26 },
]

export function ParallaxHero() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return
      const scrolled = window.scrollY
      heroRef.current.style.transform = `translateY(${scrolled * 0.3}px)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        ref={heroRef}
        className="absolute inset-0 z-0"
        style={{ willChange: 'transform' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-transparent to-[#0f0f1a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-700/20 via-transparent to-transparent" />

        {notes.map(({ Icon, x, delay, size }, i) => (
          <div
            key={i}
            className="absolute text-purple-400/20 animate-float"
            style={{
              left: x,
              top: `${20 + (i * 8)}%`,
              animationDelay: delay,
              fontSize: size,
            }}
          >
            <Icon size={size} />
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Komunitas Musik Sukabumi
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          SukaBernyanyi
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Komunitas pecinta musik dan bernyanyi di Sukabumi. 
          Bersama kita berkarya, bernyanyi, dan berbagi kebahagiaan 
          melalui harmoni nada.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#berita"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
          >
            Lihat Berita
          </a>
          <a
            href="#acara"
            className="px-8 py-3 bg-white/10 border border-white/20 rounded-xl font-medium text-white hover:bg-white/20 transition-all duration-300"
          >
            Acara Terkini
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
