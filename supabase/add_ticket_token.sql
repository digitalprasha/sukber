ALTER TABLE event_management.participants ADD COLUMN IF NOT EXISTS ticket_token TEXT;

CREATE OR REPLACE VIEW public.participants AS SELECT * FROM event_management.participants;
