export interface News {
  id: string
  title: string
  slug: string
  tags: string[]
  content: string
  thumbnail_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Gallery {
  id: string
  type: 'image' | 'youtube'
  url: string
  caption: string
  created_at: string
}

export interface AuditLog {
  id: string
  timestamp: string
  user_email: string
  action: string
  details: string
}

export interface Event {
  id: string
  title: string
  slug: string
  flyer_url: string
  ticket_prefix: string
  description: string
  created_at: string
  updated_at: string
}

export interface Sponsor {
  id: string
  event_id: string
  logo_url: string
  name: string
}

export interface Participant {
  id: string
  event_id: string
  name: string
  email: string
  whatsapp: string
  payment_proof_url: string
  registration_number: string | null
  status: 'pending' | 'verified' | 'checked_in'
  is_checked_in: boolean
  created_at: string
}

export interface Staff {
  id: string
  email: string
  role: 'admin' | 'super_admin' | 'developer' | 'scanner'
  is_deletable: boolean
  created_at: string
}

export type UserRole = 'admin' | 'super_admin' | 'developer' | 'scanner'

export const SUPER_ADMIN_IDS = ['super-admin-id-1', 'super-admin-id-2']
export const DEVELOPER_IDS = ['dev-id-1']
