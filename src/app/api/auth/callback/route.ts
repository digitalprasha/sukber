import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const redirectResponse = NextResponse.redirect(`${origin}${next}`)
      request.cookies.getAll().forEach(({ name, value }) => {
        redirectResponse.cookies.set(name, value)
      })
      return redirectResponse
    }

    console.error('Auth exchange error:', error?.message)
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`)
}
