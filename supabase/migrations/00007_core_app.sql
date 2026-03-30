-- ============================================================
-- 00007_core_app.sql
-- Core app layer: team_spaces, memberships, events, event_rsvps
-- ============================================================

-- ============================================================
-- team_spaces
-- A Heia community room created when someone activates a team.
-- One team can have multiple spaces (e.g. per season).
-- ============================================================
CREATE TABLE public.team_spaces (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         uuid NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  season_id       uuid REFERENCES public.seasons(id) ON DELETE SET NULL,
  display_name    text NOT NULL,
  color           text NOT NULL DEFAULT '#6366F1'
                    CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  logo_url        text,
  invite_code     text NOT NULL UNIQUE
                    CHECK (invite_code ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$'),
  is_activated    boolean NOT NULL DEFAULT false,
  activated_at    timestamptz,
  activated_by    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  settings        jsonb NOT NULL DEFAULT '{}',
  stripe_account_id text,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_team_spaces_updated_at
  BEFORE UPDATE ON public.team_spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- memberships
-- Links a user (profile) to a team_space with a role.
--
-- When managed_child_id IS NULL the membership is for the user
-- themselves (coach, leader, admin, or older player).
-- When managed_child_id points to a child the membership
-- represents the parent's connection on behalf of that child;
-- role must be 'forelder' in that case.
-- ============================================================
CREATE TABLE public.memberships (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_space_id    uuid NOT NULL REFERENCES public.team_spaces(id) ON DELETE CASCADE,
  role             text NOT NULL
                     CHECK (role IN ('trener','lagleder','admin','forelder','spiller')),
  status           text NOT NULL DEFAULT 'invited'
                     CHECK (status IN ('invited','active','inactive','removed')),
  managed_child_id uuid REFERENCES public.managed_children(id) ON DELETE SET NULL,
  invited_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at        timestamptz,
  left_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  -- If a child is linked the role must be 'forelder'
  CHECK (
    (managed_child_id IS NULL)
    OR (managed_child_id IS NOT NULL AND role = 'forelder')
  )
);

-- One active membership per user per child per team_space
CREATE UNIQUE INDEX idx_memberships_active_unique
  ON public.memberships (
    user_id,
    team_space_id,
    COALESCE(managed_child_id, '00000000-0000-0000-0000-000000000000')
  )
  WHERE status = 'active';

CREATE TRIGGER set_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- events
-- Calendar entries within a team_space.
-- fixture_id intentionally omitted — will be added with proper
-- FK when external fixture data is integrated.
-- ============================================================
CREATE TABLE public.events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_space_id   uuid NOT NULL REFERENCES public.team_spaces(id) ON DELETE CASCADE,
  type            text NOT NULL
                    CHECK (type IN ('trening','kamp','sosialt','mote','turnering','annet')),
  title           text NOT NULL,
  description     text,
  location        text,
  start_time      timestamptz NOT NULL,
  end_time        timestamptz
                    CHECK (end_time IS NULL OR end_time > start_time),
  all_day         boolean NOT NULL DEFAULT false,
  recurrence_rule text,
  created_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- event_rsvps
-- RSVP per user per child per event.
-- child_id NULL = user responds for themselves.
-- child_id set  = parent responds on behalf of that child.
-- Household ownership validated in upsert_rsvp() RPC.
-- ============================================================
CREATE TABLE public.event_rsvps (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id      uuid REFERENCES public.managed_children(id) ON DELETE CASCADE,
  status        text NOT NULL
                  CHECK (status IN ('kommer','kan_ikke','venter')),
  responded_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- One RSVP per user per child per event
CREATE UNIQUE INDEX idx_event_rsvps_unique
  ON public.event_rsvps (
    event_id,
    user_id,
    COALESCE(child_id, '00000000-0000-0000-0000-000000000000')
  );

CREATE TRIGGER set_event_rsvps_updated_at
  BEFORE UPDATE ON public.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
