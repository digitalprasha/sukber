'use client'

import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState, useCallback } from 'react'

interface SearchInputProps {
  placeholder?: string
  basePath: string
}

export function SearchInput({ placeholder = 'Cari...', basePath }: SearchInputProps) {
  const router = useRouter()
  const [value, setValue] = useState('')

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (q) {
      router.push(`${basePath}?q=${encodeURIComponent(q)}`)
    } else {
      router.push(basePath)
    }
  }, [value, basePath, router])

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all text-sm"
      />
    </form>
  )
}
