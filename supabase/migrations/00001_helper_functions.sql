-- ============================================================
-- 00001_helper_functions.sql
-- Helper functions used across all layers
-- ============================================================

-- Enable pg_trgm for fuzzy text search (club names etc.)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- updated_at trigger function
-- Auto-sets updated_at = now() on every UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RLS helper: is_team_member(team_space_id)
-- Returns true if the current auth user is an active member
-- of the given team space.
-- ============================================================
CREATE OR REPLACE FUNCTION is_team_member(ts_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
      AND team_space_id = ts_id
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS helper: is_team_admin(team_space_id)
-- Returns true if the current auth user is a coach, team
-- leader, or admin in the given team space.
-- ============================================================
CREATE OR REPLACE FUNCTION is_team_admin(ts_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
      AND team_space_id = ts_id
      AND status = 'active'
      AND role IN ('trener', 'lagleder', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
