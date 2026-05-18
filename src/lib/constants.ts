export const SITE_NAME = 'SukaBernyanyi Sukabumi'
export const SITE_DESCRIPTION = 'Komunitas musik dan bernyanyi di Sukabumi'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const SUPER_ADMIN_EMAILS = ['superadmin@sukabernyanyi.com']
export const DEVELOPER_EMAILS = ['dev@sukabernyanyi.com']

export function isSuperAdmin(email: string) {
  return SUPER_ADMIN_EMAILS.includes(email)
}

export function isDeveloper(email: string) {
  return DEVELOPER_EMAILS.includes(email)
}

export function isSuperAdminOrDev(email: string) {
  return isSuperAdmin(email) || isDeveloper(email)
}
