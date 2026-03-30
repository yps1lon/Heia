-- ============================================================
-- 00005_foundation_rls.sql
-- Row Level Security for foundation tables
-- ============================================================

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Profile is auto-created by trigger, no INSERT policy needed
-- for regular users. Service role bypasses RLS.

-- ============================================================
-- sports (public read, service-role write)
-- ============================================================
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read sports"
  ON public.sports FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- clubs (public read, service-role write)
-- ============================================================
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read clubs"
  ON public.clubs FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- seasons (public read, service-role write)
-- ============================================================
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read seasons"
  ON public.seasons FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- teams (public read, service-role write)
-- ============================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read teams"
  ON public.teams FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- team_seasons (public read, service-role write)
-- ============================================================
ALTER TABLE public.team_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read team_seasons"
  ON public.team_seasons FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- source_mappings (no client access — service role only)
-- ============================================================
ALTER TABLE public.source_mappings ENABLE ROW LEVEL SECURITY;
-- No policies = only service role can access

-- ============================================================
-- households
-- ============================================================
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can view their household"
  ON public.households FOR SELECT
  USING (
    id IN (
      SELECT household_id FROM public.household_members
      WHERE profile_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can create households"
  ON public.households FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Household creator can update"
  ON public.households FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ============================================================
-- household_members
-- ============================================================
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can view members"
  ON public.household_members FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members hm
      WHERE hm.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can add household members"
  ON public.household_members FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT h.id FROM public.households h
      WHERE h.created_by = auth.uid()
    )
  );

CREATE POLICY "Parents can remove household members"
  ON public.household_members FOR DELETE
  USING (
    household_id IN (
      SELECT h.id FROM public.households h
      WHERE h.created_by = auth.uid()
    )
  );

-- ============================================================
-- managed_children
-- ============================================================
ALTER TABLE public.managed_children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managing parent can view children"
  ON public.managed_children FOR SELECT
  USING (managed_by = auth.uid());

CREATE POLICY "Managing parent can create children"
  ON public.managed_children FOR INSERT
  WITH CHECK (managed_by = auth.uid());

CREATE POLICY "Managing parent can update children"
  ON public.managed_children FOR UPDATE
  USING (managed_by = auth.uid())
  WITH CHECK (managed_by = auth.uid());

CREATE POLICY "Managing parent can delete children"
  ON public.managed_children FOR DELETE
  USING (managed_by = auth.uid());

-- ============================================================
-- user_devices
-- ============================================================
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices"
  ON public.user_devices FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can register devices"
  ON public.user_devices FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own devices"
  ON public.user_devices FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own devices"
  ON public.user_devices FOR DELETE
  USING (user_id = auth.uid());
