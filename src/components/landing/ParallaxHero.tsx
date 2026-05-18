'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Music2, Mic2, Disc3, Volume2, Headphones, Radio } from 'lucide-react'

const layers = [
  {
    speed: 0.15,
    notes: [
      { Icon: Music2, x: '5%', y: '10%', size: 120, delay: '0s', rotate: -15 },
      { Icon: Disc3, x: '90%', y: '15%', size: 100, delay: '2s', rotate: 20 },
      { Icon: Volume2, x: '15%', y: '70%', size: 90, delay: '3.5s', rotate: -10 },
    ],
  },
  {
    speed: 0.3,
    notes: [
      { Icon: Mic2, x: '80%', y: '60%', size: 110, delay: '1s', rotate: 25 },
      { Icon: Headphones, x: '50%', y: '80%', size: 85, delay: '4s', rotate: -20 },
      { Icon: Radio, x: '70%', y: '30%', size: 75, delay: '1.5s', rotate: 10 },
    ],
  },
  {
    speed: 0.5,
    notes: [
      { Icon: Music2, x: '30%', y: '25%', size: 60, delay: '0.5s', rotate: 30 },
      { Icon: Disc3, x: '95%', y: '75%', size: 55, delay: '2.5s', rotate: -25 },
      { Icon: Volume2, x: '45%', y: '50%', size: 50, delay: '3s', rotate: 15 },
      { Icon: Mic2, x: '10%', y: '40%', size: 45, delay: '4.5s', rotate: -5 },
    ],
  },
]

export function ParallaxHero() {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      layerRefs.current.forEach((layer, i) => {
        if (layer) {
          layer.style.transform = `translateY(${scrolled * layers[i].speed}px)`
        }
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0f0d]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-900/20 to-[#0a0f0d]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/15 via-transparent to-transparent" />

        {layers.map((layer, layerIdx) => (
          <div
            key={layerIdx}
            ref={(el) => { layerRefs.current[layerIdx] = el }}
            className="absolute inset-0 transition-transform duration-100 ease-out"
            style={{ willChange: 'transform' }}
          >
            {layer.notes.map(({ Icon, x, y, size, delay, rotate }, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: x,
                  top: y,
                  perspective: '800px',
                }}
              >
                <div
                  className="animate-float"
                  style={{
                    animationDelay: delay,
                    animationDuration: `${6 + layerIdx * 2}s`,
                    transform: `rotate(${rotate}deg)`,
                  }}
                >
                  <div
                    className="transition-all duration-500"
                    style={{
                      transform: 'rotateX(15deg) rotateY(-10deg)',
                      filter: 'drop-shadow(0 0 30px rgba(5, 150, 105, 0.15))',
                    }}
                  >
                    <Icon
                      size={size}
                      className="text-emerald-400/10 group-hover:opacity-20 transition-opacity"
                      style={{
                        filter: `blur(${layerIdx === 0 ? 0 : layerIdx === 1 ? 0.5 : 1}px)`,
                      }}
                    />
                  </div>

                  <div
                    className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-amber-400/5 rounded-full blur-2xl"
                    style={{
                      width: size * 2,
                      height: size * 2,
                      left: -size / 2,
                      top: -size / 2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wide">Komunitas Musik Sukabumi</span>
        </div>

        <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold mb-6 bg-gradient-to-r from-emerald-300 via-teal-300 to-amber-300 bg-clip-text text-transparent leading-none tracking-tight">
          Suka
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
            Bernyanyi
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
          Komunitas pecinta musik dan bernyanyi di Sukabumi. 
          Bersama kita berkarya, bernyanyi, dan berbagi kebahagiaan 
          melalui harmoni nada.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/#berita"
            className="group relative px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl font-medium text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-500 hover:scale-105 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">Lihat Berita</span>
          </Link>
          <Link
            href="/#acara"
            className="group relative px-8 py-3.5 rounded-xl font-medium text-white border border-white/20 hover:bg-white/5 transition-all duration-500 hover:scale-105 overflow-hidden backdrop-blur-sm"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">Acara Terkini</span>
          </Link>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0f0d] to-transparent z-10" />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
