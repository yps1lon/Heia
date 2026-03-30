-- ============================================================
-- 00007b_rls_helpers.sql
-- RLS helper functions that depend on the memberships table.
-- Split from 00001 because memberships is created in 00007.
-- ============================================================

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
