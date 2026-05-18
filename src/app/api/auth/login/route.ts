import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

const LOCK_MINUTES = 15
const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  const adminClient = createAdminClient()

  const fifteenMinAgo = new Date(Date.now() - LOCK_MINUTES * 60 * 1000).toISOString()
  const { count } = await adminClient
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('action', 'LOGIN_FAILED')
    .eq('user_email', email)
    .gte('timestamp', fifteenMinAgo)

  if (count && count >= MAX_ATTEMPTS) {
    await adminClient.from('audit_logs').insert({
      user_email: email,
      action: 'LOGIN_BLOCKED',
      details: `Akun diblokir ${LOCK_MINUTES} menit karena ${MAX_ATTEMPTS}x gagal login. IP: ${ip}`,
    })
    return NextResponse.json({
      error: `Akun diblokir sementara. Coba lagi ${LOCK_MINUTES} menit lagi.`,
    }, { status: 429 })
  }

  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            pendingCookies.push({ name, value, options })
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    await adminClient.from('audit_logs').insert({
      user_email: email,
      action: 'LOGIN_FAILED',
      details: `Login gagal: ${error.message}. IP: ${ip}`,
    })

    const message =
      error.message === 'Invalid login credentials'
        ? 'Email atau password salah'
        : 'Gagal masuk. Silakan coba lagi.'
    return NextResponse.json({ error: message }, { status: 401 })
  }

  const { data: staff } = await supabase
    .from('staff')
    .select('role')
    .eq('email', data.user.email)
    .single()

  if (!staff) {
    await supabase.auth.signOut()
    await adminClient.from('audit_logs').insert({
      user_email: email,
      action: 'LOGIN_DENIED',
      details: `Login ditolak: email tidak terdaftar sebagai staff. IP: ${ip}`,
    })
    return NextResponse.json({ error: 'Akun tidak memiliki akses admin' }, { status: 403 })
  }

  await adminClient.from('audit_logs').insert({
    user_email: email,
    action: 'LOGIN_SUCCESS',
    details: `Login berhasil (password). Role: ${staff.role}. IP: ${ip}`,
  })

  const redirectResponse = NextResponse.json({ success: true, role: staff.role })
  for (const { name, value, options } of pendingCookies) {
    redirectResponse.cookies.set(name, value, options)
  }

  return redirectResponse
}
