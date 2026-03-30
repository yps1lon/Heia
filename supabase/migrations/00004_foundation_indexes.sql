-- ============================================================
-- 00004_foundation_indexes.sql
-- Indexes for sports layer and auth layer
-- ============================================================

-- Sports layer
CREATE INDEX idx_teams_club_sport ON public.teams(club_id, sport_id);
CREATE INDEX idx_team_seasons_team ON public.team_seasons(team_id);
CREATE INDEX idx_team_seasons_season_active ON public.team_seasons(season_id) WHERE is_active = true;
CREATE INDEX idx_source_mappings_reverse ON public.source_mappings(internal_entity_type, internal_id);
CREATE INDEX idx_clubs_name_trgm ON public.clubs USING gin(name gin_trgm_ops);

-- Auth layer
CREATE INDEX idx_profiles_household ON public.profiles(household_id);
CREATE INDEX idx_household_members_household ON public.household_members(household_id);
CREATE INDEX idx_household_members_profile ON public.household_members(profile_id);
CREATE INDEX idx_user_devices_user ON public.user_devices(user_id);
CREATE UNIQUE INDEX idx_user_devices_token ON public.user_devices(device_token);
