'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import { Music2, Mic2, Disc3 } from 'lucide-react'

const NOTES = [Music2, Mic2, Disc3]

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return pos
}

function SoundWave() {
  return (
    <div className="absolute inset-x-0 bottom-1/3 flex items-end justify-center gap-[3px] z-0 opacity-20">
      {Array.from({ length: 48 }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] bg-gradient-to-t from-emerald-500 to-amber-400 rounded-full"
          style={{
            height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 20}px`,
            animation: `soundWave 1.2s ease-in-out ${i * 0.05}s infinite alternate`,
            animationDelay: `${i * 0.04}s`,
          }}
        />
      ))}
    </div>
  )
}

function FloatingNote({
  Icon,
  index,
  mouse,
}: {
  Icon: typeof Music2
  index: number
  mouse: { x: number; y: number }
}) {
  const style = useMemo(() => {
    const angle = (index / 12) * Math.PI * 2
    const radius = 15 + (index % 7) * 8
    const baseX = 50 + Math.cos(angle) * radius
    const baseY = 50 + Math.sin(angle) * radius
    return {
      left: `${baseX}%` as const,
      top: `${baseY}%` as const,
      size: 60 + (index % 5) * 25,
      delay: `${index * 0.7}s` as const,
      duration: `${8 + (index % 4) * 3}s` as const,
      driftX: mouse.x * (15 + (index % 10)),
      driftY: mouse.y * (15 + (index % 10)),
      rotate: index * 27,
      blur: index % 3 === 0 ? 0 : 0.5,
    }
  }, [index, mouse])

  return (
    <div
      className="absolute transition-all duration-700 ease-out"
      style={{
        left: style.left,
        top: style.top,
        transform: `translate(${style.driftX}px, ${style.driftY}px) rotate(${style.rotate}deg)`,
      }}
    >
      <div
        className="animate-float"
        style={{
          animationDuration: style.duration,
          animationDelay: style.delay,
        }}
      >
        <Icon
          size={style.size}
          className="text-emerald-400/10"
          style={{ filter: `blur(${style.blur}px)` }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-400/8 to-amber-400/8 rounded-full blur-3xl"
          style={{
            width: style.size * 2.5,
            height: style.size * 2.5,
            left: -style.size * 0.75,
            top: -style.size * 0.75,
          }}
        />
      </div>
    </div>
  )
}

export function ParallaxHero() {
  const mouse = useMousePosition()
  const heroRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef(0)
  const [scrollY, setScrollY] = useState(0)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const handler = () => {
      scrollRef.current = window.scrollY
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setScrollY(scrollRef.current)
          rafRef.current = undefined
        })
      }
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const parallaxStyle = (speed: number) =>
    ({
      transform: `translateY(${scrollY * speed}px)`,
      willChange: 'transform',
    }) as React.CSSProperties

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#060a08] selection:bg-emerald-500/30"
      style={{ perspective: '1px', transformStyle: 'preserve-3d' }}
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden" style={parallaxStyle(0.3)}>
        <div
          className="absolute -top-1/2 -left-1/2 w-[120%] h-[120%] animate-slow-spin opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(5,150,105,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(217,119,6,0.1) 0%, transparent 60%)',
            willChange: 'transform',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Sound wave visualization */}
      <div className="absolute inset-0 z-[1]" style={parallaxStyle(0.25)}>
        <SoundWave />
      </div>

      {/* Floating notes layer */}
      <div className="absolute inset-0 z-[2]" style={parallaxStyle(0.6)}>
        {Array.from({ length: 12 }).map((_, i) => (
          <FloatingNote
            key={i}
            Icon={NOTES[i % NOTES.length]}
            index={i}
            mouse={mouse}
          />
        ))}
      </div>

      {/* Content layer */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto" style={parallaxStyle(-0.08)}>
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md text-emerald-300 text-sm mb-10 animate-fade-in shadow-lg shadow-emerald-500/5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="relative rounded-full bg-emerald-400 h-2.5 w-2.5" />
          </span>
          <span className="tracking-widest uppercase text-xs font-medium">Komunitas Musik Sukabumi</span>
        </div>

        <div className="space-y-2 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] leading-none tracking-tight" style={{ fontFamily: 'var(--font-righteous)' }}>
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-400 bg-clip-text text-transparent block">
              Suka
            </span>
            <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent block -mt-2 sm:-mt-4 md:-mt-6 lg:-mt-10">
              Bernyanyi
            </span>
          </h1>
        </div>

        <div
          className="space-y-3 mb-12 animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          <p className="text-emerald-300/80 text-lg sm:text-xl md:text-2xl font-semibold tracking-wide">
            Sukabumi Satu Harmoni
          </p>
          <p className="text-amber-400/70 text-sm sm:text-base md:text-lg italic">
            &ldquo;Gak harus Penyanyi, yang penting MAU nyanyi&rdquo;
          </p>
          <p className="text-emerald-400/40 text-xs sm:text-sm tracking-widest uppercase font-mono">
            #MicONPressureOFF
          </p>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
          style={{ animationDelay: '0.7s' }}
        >
          <Link
            href="/berita"
            className="group relative px-10 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 rounded-2xl font-semibold text-white shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-500 hover:scale-105 hover:-translate-y-0.5 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative tracking-wide">Jelajahi Berita</span>
          </Link>
          <Link
            href="/acara"
            className="group relative px-10 py-4 rounded-2xl font-semibold text-white/80 border border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-0.5 overflow-hidden backdrop-blur-md"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative tracking-wide">Lihat Acara</span>
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/80 to-transparent z-20" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-fade-in" style={{ animationDelay: '1.2s' }}>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] text-emerald-600/50 tracking-widest uppercase">Scroll</span>
          <div className="w-[2px] h-8 bg-gradient-to-b from-emerald-500/50 to-transparent relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-emerald-400 rounded-full animate-scroll-indicator" />
          </div>
        </div>
      </div>
    </section>
  )
}
