import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { SanitizedHtml } from '@/components/editor/SanitizedHtml'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: news } = await supabase
    .from('news')
    .select('title, content')
    .eq('slug', slug)
    .single()

  if (!news) return { title: 'Berita Tidak Ditemukan' }

  return {
    title: news.title,
    description: news.content.replace(/<[^>]*>/g, '').slice(0, 160),
  }
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!news) notFound()

  return (
    <>
      <Navigation />
      <main className="pt-24 pb-20 px-4">
        <article className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <time className="text-sm text-gray-500">{formatDate(news.created_at)}</time>
              {news.tags?.map((tag: string) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">{news.title}</h1>
          </div>

          {news.thumbnail_url && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8">
              <img
                src={news.thumbnail_url}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <SanitizedHtml
            className="prose prose-invert prose-emerald max-w-none"
            html={news.content}
          />

          <div className="mt-12 pt-8 border-t border-white/10">
            <Link
              href="/berita"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Kembali ke Berita
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
