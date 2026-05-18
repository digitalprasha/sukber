import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
        },
      },
    }
  )

  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL('/admin/login', request.url))
  response.cookies.getAll().forEach(({ name, value, ...rest }) => {
    response.cookies.set(name, '', { ...rest, maxAge: 0 })
  })

  return response
}
