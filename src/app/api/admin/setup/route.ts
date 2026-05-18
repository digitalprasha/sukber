import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function handleSetup(seedPassword: string) {
  const supabase = createAdminClient()
  const adminEmail = 'admin@sukabernyanyi.my.id'

  const { data: existingStaff } = await supabase
    .from('staff')
    .select('password_enabled')
    .eq('email', adminEmail)
    .single()

  if (!existingStaff) {
    return { error: 'Staff admin tidak ditemukan di database. Jalankan migrasi SQL dulu.', status: 404 }
  }

  if (existingStaff.password_enabled) {
    return { message: 'Admin sudah memiliki password. Tidak perlu di-setup ulang.' }
  }

  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingAuthUser = existingUsers?.users?.find(u => u.email === adminEmail)

  if (existingAuthUser) {
    await supabase.auth.admin.updateUserById(existingAuthUser.id, { password: seedPassword })
  } else {
    const { error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: seedPassword,
      email_confirm: true,
    })
    if (createError) {
      return { error: createError.message, status: 500 }
    }
  }

  await supabase.from('staff').update({ password_enabled: true }).eq('email', adminEmail)

  await supabase.from('audit_logs').insert({
    user_email: 'system',
    action: 'SETUP_PASSWORD',
    details: 'Password admin berhasil di-seed',
  })

  return { success: true, message: 'Password admin berhasil dibuat. Password: [yang diset di ADMIN_SEED_PASSWORD]' }
}

export async function GET() {
  const seedPassword = process.env.ADMIN_SEED_PASSWORD
  if (!seedPassword) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="background:#060a08;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
        <div style="max-width:500px;text-align:center;">
          <h1 style="color:#10b981;">ADMIN_SEED_PASSWORD belum diset</h1>
          <p style="color:#9ca3af;margin:20px 0;">Set environment variable <code style="background:#1f2937;padding:2px 8px;border-radius:4px;">ADMIN_SEED_PASSWORD</code> di Vercel Dashboard, lalu kunjungi URL ini lagi.</p>
          <p style="color:#6b7280;font-size:14px;">Atau buat user manual di Supabase Dashboard → Authentication → Users → Add User dengan email <strong>admin@sukabernyanyi.my.id</strong> dan password pilihanmu.</p>
        </div>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const result = await handleSetup(seedPassword)
  return new NextResponse(
    `<!DOCTYPE html><html><body style="background:#060a08;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
      <div style="max-width:500px;text-align:center;">
        <h1 style="color:${result.success ? '#10b981' : '#ef4444'};">${result.success ? '✅ Berhasil' : '❌ Gagal'}</h1>
        <p style="color:#9ca3af;margin:20px 0;">${result.message || result.error}</p>
        <p style="color:#6b7280;font-size:14px;">Sekarang kamu bisa login dengan email dan password di <strong>/admin/login</strong></p>
      </div>
    </body></html>`,
    { status: result.status || 200, headers: { 'Content-Type': 'text/html' } }
  )
}

export async function POST() {
  const seedPassword = process.env.ADMIN_SEED_PASSWORD
  if (!seedPassword) {
    return NextResponse.json({ error: 'ADMIN_SEED_PASSWORD tidak diatur di environment' }, { status: 500 })
  }
  const result = await handleSetup(seedPassword)
  return NextResponse.json(result, { status: (result as { status?: number }).status || 200 })
}
