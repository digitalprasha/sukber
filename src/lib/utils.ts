import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
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

export function getMailtoUrl(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
