-- ============================================
-- Contact info settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT ''
);

INSERT INTO public.contact_info (key, value) VALUES
  ('instagram', '@sukabernyanyi'),
  ('email', 'info@sukabernyanyi.com'),
  ('address', 'Sukabumi, Jawa Barat')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contact info public read" ON public.contact_info
  FOR SELECT USING (true);

CREATE POLICY "Contact info admin all" ON public.contact_info
  FOR ALL USING (public.is_staff(auth.jwt() ->> 'email', ARRAY['admin', 'super_admin', 'developer']));
