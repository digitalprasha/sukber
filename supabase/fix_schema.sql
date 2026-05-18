-- Configure PostgREST to see both schemas (required for `from('events')` to work)
ALTER ROLE authenticator SET search_path TO 'public', 'event_management';
