-- ============================================================
-- 00006_seed_sports.sql
-- Seed canonical sports data
-- ============================================================

INSERT INTO public.sports (slug, display_name, config) VALUES
  ('fotball',  'Fotball',     '{"periods": 2, "period_minutes": 35, "emoji": "⚽"}'),
  ('handball', 'Håndball',    '{"periods": 2, "period_minutes": 30, "emoji": "🤾"}'),
  ('basket',   'Basketball',  '{"periods": 4, "period_minutes": 10, "emoji": "🏀"}'),
  ('ishockey', 'Ishockey',    '{"periods": 3, "period_minutes": 20, "emoji": "🏒"}'),
  ('annet',    'Annet',       '{}');
