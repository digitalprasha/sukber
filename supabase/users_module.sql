-- Add panitia role to staff table
ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE public.staff ADD CONSTRAINT staff_role_check CHECK (role IN ('admin', 'super_admin', 'developer', 'scanner', 'panitia'));

-- Add password_enabled column for password-based auth
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS password_enabled BOOLEAN DEFAULT false;
