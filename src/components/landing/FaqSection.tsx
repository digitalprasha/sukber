'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown } from 'lucide-react'

interface Faq {
  id: string
  question: string
  answer: string
}

export function FaqSection() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('faqs').select('id, question, answer').eq('is_active', true).order('display_order', { ascending: true }).then(({ data }) => {
      if (data) setFaqs(data)
    })
  }, [])

  if (faqs.length === 0) return null

  return (
    <section id="faq" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">FAQ</h2>
          <p className="text-gray-400">Pertanyaan yang sering diajukan</p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq) => (
            <div key={faq.id} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-200">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="flex items-center justify-between w-full px-4 py-3 text-left text-emerald-300 text-sm font-medium hover:bg-white/[0.02] transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown size={16} className={`shrink-0 text-emerald-600 transition-transform duration-200 ${openId === faq.id ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${openId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="px-4 pb-3 text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
