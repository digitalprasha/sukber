-- Create public views for event_management tables
-- Workaround for when PostgREST doesn't pick up the event_management schema

CREATE OR REPLACE VIEW public.events AS SELECT * FROM event_management.events;
CREATE OR REPLACE VIEW public.sponsors AS SELECT * FROM event_management.sponsors;
CREATE OR REPLACE VIEW public.participants AS SELECT * FROM event_management.participants;
