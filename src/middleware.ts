import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'

  const pathname = request.nextUrl.pathname
  const isAuthApi = pathname.startsWith('/api/auth/')
  const isApi = pathname.startsWith('/api/')

  if (isAuthApi) {
    const allowed = rateLimit(`auth:${ip}`, 5, 15000)
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: 'Too many attempts. Silakan tunggu 15 detik.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '15' },
      })
    }
  } else if (isApi) {
    const allowed = rateLimit(ip, 30, 10000)
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '10' },
      })
    }
  }

  const supabaseResponse = await updateSession(request)

  supabaseResponse.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https: http:",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' data:",
      "connect-src 'self' https: http:",
      "frame-src 'self' https: http:",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(self), microphone=(self)')

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
