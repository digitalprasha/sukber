import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { RegisterSection } from '@/components/events/RegisterSection'
import { SanitizedHtml } from '@/components/editor/SanitizedHtml'
import { ShareButton } from '@/components/ui/ShareButton'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getEventCategory, EVENT_CATEGORY_LABELS, EVENT_CATEGORY_COLORS, formatDate } from '@/lib/utils'
import { CalendarDays, Clock, Ticket, Users } from 'lucide-react'
import type { Metadata } from 'next'

interface PaymentMethod {
  type: 'bank' | 'ewallet'
  name: string
  number: string
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, description')
    .eq('slug', slug)
    .single()

  if (!event) return { title: 'Acara Tidak Ditemukan' }

  return {
    title: event.title,
    description: event.description.replace(/<[^>]*>/g, '').slice(0, 160),
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  const paymentMethods: PaymentMethod[] = Array.isArray(event.payment_methods) ? event.payment_methods : []
  const category = getEventCategory(event)

  const { data: sponsors } = await supabase
    .from('sponsors')
    .select('*')
    .eq('event_id', event.id)

  return (
    <>
      <Navigation />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-12">
          <div>
            {event.flyer_url ? (
              <div className="rounded-2xl overflow-hidden mb-6">
                <img
                  src={event.flyer_url}
                  alt={event.title}
                  className="w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-emerald-900/50 to-amber-900/50 flex items-center justify-center mb-6">
                <span className="text-8xl">🎤</span>
              </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${EVENT_CATEGORY_COLORS[getEventCategory(event)]}`}>
                    {EVENT_CATEGORY_LABELS[getEventCategory(event)]}
                  </span>
                  {event.registration_fee && Number(event.registration_fee) > 0 && (
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Rp{Number(event.registration_fee).toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{event.title}</h1>
              </div>
              <ShareButton url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://suka-bernyanyi-smi.vercel.app'}/acara/${event.slug}`} title={event.title} />
            </div>

            <div className="flex flex-wrap gap-3 mb-6 text-sm">
              {event.registration_deadline && (
                <div className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
                  <CalendarDays size={14} />
                  <span>Deadline: {formatDate(event.registration_deadline)}</span>
                </div>
              )}
              {event.max_participants && (
                <div className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
                  <Users size={14} />
                  <span>Kuota: {event.max_participants} peserta</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
                <Ticket size={14} />
                <span>Kode: {event.ticket_prefix || '-'}</span>
              </div>
            </div>

            <SanitizedHtml
              className="prose prose-invert prose-emerald max-w-none text-gray-400"
              html={event.description}
            />

            {sponsors && sponsors.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-white mb-4">Sponsor</h3>
                <div className="flex flex-wrap gap-4">
                  {sponsors.map((s) => (
                    <div key={s.id} className="flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10">
                      {s.logo_url && (
                        <img src={s.logo_url} alt="" className="h-10 md:h-12 w-auto object-contain" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-24 space-y-6">
              <RegisterSection
                eventId={event.id}
                ticketPrefix={event.ticket_prefix}
                fee={event.registration_fee}
                maxParticipants={event.max_participants}
                deadline={event.registration_deadline}
                paymentMethods={paymentMethods}
                category={category}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
