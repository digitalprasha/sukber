-- ADD REGISTRATION SETTINGS TO EVENTS TABLE
-- Jalankan setelah reset_full.sql

ALTER TABLE event_management.events 
  ADD COLUMN IF NOT EXISTS registration_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS registration_fee NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_participants INTEGER,
  ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_info TEXT DEFAULT '';
