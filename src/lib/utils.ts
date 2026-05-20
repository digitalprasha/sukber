import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export type EventCategory = 'coming_soon' | 'upcoming' | 'past'

export function getEventCategory(event: {
  registration_enabled?: boolean
  registration_deadline?: string | null
  max_participants?: number | null
}): EventCategory {
  const now = new Date()
  const deadline = event.registration_deadline ? new Date(event.registration_deadline) : null

  if (!event.registration_enabled && deadline && deadline < now) return 'past'
  if (!event.registration_enabled || (deadline && deadline < now)) return 'coming_soon'
  return 'upcoming'
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  coming_soon: 'Coming Soon',
  upcoming: 'Acara Terdekat',
  past: 'Telah Dilaksanakan',
}

export const EVENT_CATEGORY_COLORS: Record<EventCategory, string> = {
  coming_soon: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  upcoming: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  past: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function generateRegistrationNumber(prefix: string, count: number) {
  return `${prefix}${String(count + 1).padStart(3, '0')}`
}

export function getWaUrl(phone: string, text: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
}

export function getEmailUrl(email: string, subject: string, body: string) {
  const params = new URLSearchParams({
    view: 'cm', fs: '1', to: email,
    su: subject, body,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}
