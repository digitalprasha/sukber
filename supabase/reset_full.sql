-- ============================================
-- RESET DATABASE - Clean Schema + Seed
-- ============================================

-- Drop event_management schema and recreate
DROP SCHEMA IF EXISTS event_management CASCADE;
CREATE SCHEMA event_management;

-- Drop password_enabled from staff
ALTER TABLE public.staff DROP COLUMN IF EXISTS password_enabled;
ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE public.staff ADD CONSTRAINT staff_role_check CHECK (role IN ('admin', 'super_admin', 'developer', 'scanner', 'panitia'));

-- Recreate staff seed
DELETE FROM public.staff;
INSERT INTO public.staff (id, email, role, is_deletable) VALUES
  ('00000000-0000-0000-0000-000000000001', 'sukabernyanyis@gmail.com', 'super_admin', false),
  ('00000000-0000-0000-0000-000000000002', 'digitalprasha@gmail.com', 'developer', false);

-- Events table with is_active
CREATE TABLE event_management.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  flyer_url TEXT NOT NULL DEFAULT '',
  ticket_prefix TEXT NOT NULL DEFAULT 'SBS',
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sponsors table
CREATE TABLE event_management.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES event_management.events(id) ON DELETE CASCADE,
  logo_url TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL
);

-- Participants table
CREATE TABLE event_management.participants (
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

-- FAQs table
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Partners table
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL DEFAULT '',
  website_url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('partnership', 'sponsorship', 'collaborator', 'media_partner')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FAQs public read active" ON public.faqs
  FOR SELECT USING (is_active = true);
CREATE POLICY "FAQs admin all" ON public.faqs
  FOR ALL USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer', 'panitia']));

CREATE POLICY "Partners public read active" ON public.partners
  FOR SELECT USING (is_active = true);
CREATE POLICY "Partners admin all" ON public.partners
  FOR ALL USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer', 'panitia']));

-- Add is_active to gallery
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON event_management.events(slug);
CREATE INDEX IF NOT EXISTS idx_participants_event ON event_management.participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_reg_number ON event_management.participants(registration_number);

-- RLS
ALTER TABLE event_management.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_management.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_management.participants ENABLE ROW LEVEL SECURITY;

-- Drop old policies if any
DROP POLICY IF EXISTS "Events public read" ON event_management.events;
DROP POLICY IF EXISTS "Events admin all" ON event_management.events;
DROP POLICY IF EXISTS "Sponsors public read" ON event_management.sponsors;
DROP POLICY IF EXISTS "Sponsors admin all" ON event_management.sponsors;
DROP POLICY IF EXISTS "Participants insert public" ON event_management.participants;
DROP POLICY IF EXISTS "Participants read admin" ON event_management.participants;
DROP POLICY IF EXISTS "Participants update admin" ON event_management.participants;

-- Event policies
CREATE POLICY "Events public read active" ON event_management.events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Events admin all" ON event_management.events
  FOR ALL USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer', 'panitia']));

-- Sponsors policies
CREATE POLICY "Sponsors public read" ON event_management.sponsors
  FOR SELECT USING (true);

CREATE POLICY "Sponsors admin all" ON event_management.sponsors
  FOR ALL USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer', 'panitia']));

-- Participants policies
CREATE POLICY "Participants insert public" ON event_management.participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Participants read admin" ON event_management.participants
  FOR SELECT USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer', 'panitia', 'scanner']));

CREATE POLICY "Participants update admin" ON event_management.participants
  FOR UPDATE USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer', 'panitia', 'scanner']));

-- Update news policy to allow panitia
DROP POLICY IF EXISTS "News admin all" ON public.news;
CREATE POLICY "News admin all" ON public.news
  FOR ALL USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer', 'panitia']));

-- Update gallery policy to allow panitia
DROP POLICY IF EXISTS "Gallery admin all" ON public.gallery;
CREATE POLICY "Gallery admin all" ON public.gallery
  FOR ALL USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer', 'panitia']));

-- Update staff policy to allow panitia insert/manage
DROP POLICY IF EXISTS "Staff manage super_admin_dev" ON public.staff;
CREATE POLICY "Staff manage super_admin_dev" ON public.staff
  FOR INSERT WITH CHECK (public.is_staff(auth.jwt() ->> 'email', ARRAY['super_admin', 'developer']));

DROP POLICY IF EXISTS "Staff update super_admin_dev" ON public.staff;
CREATE POLICY "Staff update super_admin_dev" ON public.staff
  FOR UPDATE USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['super_admin', 'developer']))
  WITH CHECK (id NOT IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'));

DROP POLICY IF EXISTS "Staff delete super_admin_dev" ON public.staff;
CREATE POLICY "Staff delete super_admin_dev" ON public.staff
  FOR DELETE USING (
    public.is_staff(auth.jwt() ->> 'email', ARRAY['super_admin', 'developer'])
    AND is_deletable = true
  );
