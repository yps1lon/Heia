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
-- RLS helpers is_team_member() and is_team_admin() depend on
-- the memberships table and are created in
-- 00008_rls_helpers.sql (after memberships exists).
-- ============================================================
