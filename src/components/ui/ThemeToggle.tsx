'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const dark = stored !== 'light'
    setIsDark(dark)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(dark ? 'dark' : 'light')
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="relative w-14 h-7 rounded-full bg-white/10 border border-white/10 transition-colors hover:border-emerald-500/30"
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
    >
      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg flex items-center justify-center transition-transform duration-300 ${isDark ? 'translate-x-0.5' : 'translate-x-[1.85rem]'}`}>
        {isDark ? <Moon size={12} className="text-white" /> : <Sun size={12} className="text-white" />}
      </div>
    </button>
  )
}
