-- ============================================================
-- 00002_sports_layer.sql
-- Canonical sports data: sports, clubs, teams, seasons,
-- team_seasons, and source_mappings
-- ============================================================

-- ============================================================
-- sports
-- ============================================================
CREATE TABLE public.sports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  display_name text NOT NULL,
  config      jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_sports_updated_at
  BEFORE UPDATE ON public.sports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- clubs
-- ============================================================
CREATE TABLE public.clubs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  short_name  text,
  logo_url    text,
  region      text,
  metadata    jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- seasons
-- ============================================================
CREATE TABLE public.seasons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id    uuid NOT NULL REFERENCES public.sports(id),
  name        text NOT NULL,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  is_current  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- teams (canonical real-world teams)
-- ============================================================
CREATE TABLE public.teams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     uuid NOT NULL REFERENCES public.clubs(id),
  sport_id    uuid NOT NULL REFERENCES public.sports(id),
  name        text NOT NULL,
  age_group   text,
  gender      text CHECK (gender IN ('male', 'female', 'mixed')),
  level       text CHECK (level IN ('recreational', 'competitive')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- team_seasons (a team's participation in a season)
-- ============================================================
CREATE TABLE public.team_seasons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     uuid NOT NULL REFERENCES public.teams(id),
  season_id   uuid NOT NULL REFERENCES public.seasons(id),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),

  UNIQUE (team_id, season_id)
);

-- ============================================================
-- source_mappings (external → internal ID bridge)
-- ============================================================
CREATE TABLE public.source_mappings (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source               text NOT NULL,
  source_entity_type   text NOT NULL,
  source_external_id   text NOT NULL,
  internal_entity_type text NOT NULL,
  internal_id          uuid NOT NULL,
  source_metadata      jsonb NOT NULL DEFAULT '{}',
  last_synced_at       timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),

  UNIQUE (source, source_entity_type, source_external_id)
);
