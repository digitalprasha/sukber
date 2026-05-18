-- ============================================
-- SukaBernyanyi Sukabumi Database Schema
-- ============================================

-- Create schemas
CREATE SCHEMA IF NOT EXISTS event_management;

-- ============================================
-- PUBLIC SCHEMA (Permanent)
-- ============================================

-- News table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tags TEXT[] DEFAULT '{}',
  content TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gallery table
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('image', 'youtube')),
  url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs table (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT ''
);

-- Staff table (for admin access control)
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin', 'developer', 'scanner')),
  is_deletable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- EVENT_MANAGEMENT SCHEMA (Dynamic/Resetable)
-- ============================================

-- Events table
CREATE TABLE IF NOT EXISTS event_management.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  flyer_url TEXT NOT NULL DEFAULT '',
  ticket_prefix TEXT NOT NULL DEFAULT 'SBS',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sponsors table
CREATE TABLE IF NOT EXISTS event_management.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES event_management.events(id) ON DELETE CASCADE,
  logo_url TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL
);

-- Participants table
CREATE TABLE IF NOT EXISTS event_management.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES event_management.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  payment_proof_url TEXT NOT NULL DEFAULT '',
  registration_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'checked_in')),
  is_checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);
CREATE INDEX IF NOT EXISTS idx_news_is_active ON public.news(is_active);
CREATE INDEX IF NOT EXISTS idx_events_slug ON event_management.events(slug);
CREATE INDEX IF NOT EXISTS idx_participants_event ON event_management.participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_reg_number ON event_management.participants(registration_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_management.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_management.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_management.participants ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is staff with specific roles
CREATE OR REPLACE FUNCTION public.is_staff(user_email TEXT, allowed_roles TEXT[] DEFAULT '{}')
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.staff
    WHERE email = user_email
    AND (array_length(allowed_roles, 1) IS NULL OR role = ANY(allowed_roles))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- News policies
CREATE POLICY "News public read active" ON public.news
  FOR SELECT USING (is_active = true);

CREATE POLICY "News admin all" ON public.news
  FOR ALL USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer']));

-- Gallery policies
CREATE POLICY "Gallery public read" ON public.gallery
  FOR SELECT USING (true);

CREATE POLICY "Gallery admin all" ON public.gallery
  FOR ALL USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer']));

-- Audit logs: APPEND-ONLY
CREATE POLICY "Audit logs insert" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Audit logs read super_admin_dev" ON public.audit_logs
  FOR SELECT USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['super_admin', 'developer']));

-- NOTE: No UPDATE or DELETE policies for audit_logs (append-only enforced by RLS)

-- Staff policies
CREATE POLICY "Staff read own" ON public.staff
  FOR SELECT USING (
    email = auth.jwt() ->> 'email'
    OR public.is_staff(auth.jwt() ->> 'email', ARRAY['super_admin', 'developer'])
  );

CREATE POLICY "Staff manage super_admin_dev" ON public.staff
  FOR INSERT WITH CHECK (public.is_staff(auth.jwt() ->> 'email', ARRAY['super_admin', 'developer']));

CREATE POLICY "Staff update super_admin_dev" ON public.staff
  FOR UPDATE USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['super_admin', 'developer']))
  WITH CHECK (
    -- Prevent deleting hardcoded super admin / developer IDs
    id NOT IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002')
  );

CREATE POLICY "Staff delete super_admin_dev" ON public.staff
  FOR DELETE USING (
    public.is_staff(auth.jwt() ->> 'email', ARRAY['super_admin', 'developer'])
    AND is_deletable = true
  );

-- Events policies (event_management schema)
CREATE POLICY "Events public read" ON event_management.events
  FOR SELECT USING (true);

CREATE POLICY "Events admin all" ON event_management.events
  FOR ALL USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer']));

-- Sponsors policies
CREATE POLICY "Sponsors public read" ON event_management.sponsors
  FOR SELECT USING (true);

CREATE POLICY "Sponsors admin all" ON event_management.sponsors
  FOR ALL USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer']));

-- Participants policies
CREATE POLICY "Participants insert public" ON event_management.participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Participants read admin" ON event_management.participants
  FOR SELECT USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer', 'scanner']));

CREATE POLICY "Participants update admin" ON event_management.participants
  FOR UPDATE USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer', 'scanner']));

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default staff accounts
INSERT INTO public.staff (id, email, role, is_deletable)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@sukabernyanyi.my.id', 'super_admin', false),
  ('00000000-0000-0000-0000-000000000002', 'digitalprasha@gmail.com', 'developer', false)
ON CONFLICT (email) DO NOTHING;
