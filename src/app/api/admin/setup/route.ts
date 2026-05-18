import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = createAdminClient()
  const adminEmail = 'admin@sukabernyanyi.my.id'
  const seedPassword = process.env.ADMIN_SEED_PASSWORD

  if (!seedPassword) {
    return NextResponse.json({ error: 'ADMIN_SEED_PASSWORD tidak diatur di environment' }, { status: 500 })
  }

  const { data: existingStaff } = await supabase
    .from('staff')
    .select('password_enabled')
    .eq('email', adminEmail)
    .single()

  if (!existingStaff) {
    return NextResponse.json({ error: 'Staff admin tidak ditemukan di database' }, { status: 404 })
  }

  if (existingStaff.password_enabled) {
    return NextResponse.json({ message: 'Admin sudah memiliki password' })
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
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }
  }

  await supabase.from('staff').update({ password_enabled: true }).eq('email', adminEmail)

  await supabase.from('audit_logs').insert({
    user_email: 'system',
    action: 'SETUP_PASSWORD',
    details: 'Password admin berhasil di-seed',
  })

  return NextResponse.json({ success: true, message: 'Password admin berhasil dibuat' })
}
