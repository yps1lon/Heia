-- ============================================================
-- 00008_engagement.sql
-- Engagement layer: match_sessions, match_events, feed_posts,
-- comments, reactions
-- ============================================================

-- ============================================================
-- match_sessions
-- One-to-one with an event of type 'kamp'.
-- Tracks live score, status, and the designated reporter.
-- ============================================================
CREATE TABLE public.match_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  opponent      text NOT NULL,
  home_score    int NOT NULL DEFAULT 0 CHECK (home_score >= 0),
  away_score    int NOT NULL DEFAULT 0 CHECK (away_score >= 0),
  is_home       boolean NOT NULL DEFAULT true,
  status        text NOT NULL DEFAULT 'planlagt'
                  CHECK (status IN ('planlagt','live','pause','ferdig','avlyst')),
  reporter_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  started_at    timestamptz,
  finished_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_match_sessions_updated_at
  BEFORE UPDATE ON public.match_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- match_events
-- Append-only timeline of match happenings.
-- No updated_at — corrections are done by delete + re-insert.
-- ============================================================
CREATE TABLE public.match_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_session_id  uuid NOT NULL REFERENCES public.match_sessions(id) ON DELETE CASCADE,
  type              text NOT NULL
                      CHECK (type IN ('avspark','mål','pause','andre_omgang','slutt','bytte','kort','melding')),
  minute            int NOT NULL CHECK (minute >= 0),
  player_name       text,
  team_side         text CHECK (team_side IS NULL OR team_side IN ('home','away')),
  description       text,
  reported_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sequence          int NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- feed_posts
-- The team feed — messages, images, match reports, reminders.
-- ============================================================
CREATE TABLE public.feed_posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_space_id   uuid NOT NULL REFERENCES public.team_spaces(id) ON DELETE CASCADE,
  author_id       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type            text NOT NULL
                    CHECK (type IN ('melding','bilde','paaminnelse','resultat','match_event','match_start','match_end','system')),
  content         text NOT NULL,
  event_id        uuid REFERENCES public.events(id) ON DELETE SET NULL,
  match_event_id  uuid REFERENCES public.match_events(id) ON DELETE SET NULL,
  is_pinned       boolean NOT NULL DEFAULT false,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_feed_posts_updated_at
  BEFORE UPDATE ON public.feed_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- comments
-- Comments on feed posts. Supports editing via updated_at.
-- ============================================================
CREATE TABLE public.comments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_post_id  uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  author_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  content       text NOT NULL CHECK (char_length(content) > 0),
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- reactions
-- Emoji reactions on feed posts. Toggle-on/toggle-off only.
-- ============================================================
CREATE TABLE public.reactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_post_id  uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji         text NOT NULL CHECK (char_length(emoji) BETWEEN 1 AND 8),
  created_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (feed_post_id, user_id, emoji)
);
