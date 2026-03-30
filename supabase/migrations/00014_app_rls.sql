-- ============================================================
-- 00013_app_rls.sql
-- Row-Level Security for all Phase 2 tables.
--
-- Authorization primitives:
--   is_team_member(team_space_id) — active member check
--   is_team_admin(team_space_id)  — trener/lagleder/admin check
-- Both are SECURITY DEFINER functions from 00001.
--
-- Bootstrap note: The first membership for a new team_space
-- must be created via activate_team_space() RPC which is
-- SECURITY DEFINER and bypasses RLS.
-- ============================================================

-- ─── team_spaces ────────────────────────────────────────────
ALTER TABLE public.team_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view team space"
  ON public.team_spaces FOR SELECT
  USING (deleted_at IS NULL AND is_team_member(id));

CREATE POLICY "Admins can update team space"
  ON public.team_spaces FOR UPDATE
  USING (is_team_admin(id))
  WITH CHECK (is_team_admin(id));

-- ─── memberships ────────────────────────────────────────────
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Members see other members of their team spaces
CREATE POLICY "Members can view team memberships"
  ON public.memberships FOR SELECT
  USING (is_team_member(team_space_id));

-- Users always see their own memberships (for invite acceptance)
CREATE POLICY "Users can view own memberships"
  ON public.memberships FOR SELECT
  USING (user_id = (SELECT auth.uid()));

-- Admins can invite (insert) new members
CREATE POLICY "Admins can invite members"
  ON public.memberships FOR INSERT
  WITH CHECK (is_team_admin(team_space_id));

-- Users can update their own membership (accept invite, leave)
CREATE POLICY "Users can update own membership"
  ON public.memberships FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Admins can update any membership (change role, remove)
CREATE POLICY "Admins can update memberships"
  ON public.memberships FOR UPDATE
  USING (is_team_admin(team_space_id))
  WITH CHECK (is_team_admin(team_space_id));

-- Admins can hard-delete memberships
CREATE POLICY "Admins can remove members"
  ON public.memberships FOR DELETE
  USING (is_team_admin(team_space_id));

-- ─── events ─────────────────────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view events"
  ON public.events FOR SELECT
  USING (deleted_at IS NULL AND is_team_member(team_space_id));

CREATE POLICY "Admins can create events"
  ON public.events FOR INSERT
  WITH CHECK (is_team_admin(team_space_id));

CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (is_team_admin(team_space_id))
  WITH CHECK (is_team_admin(team_space_id));

-- ─── event_rsvps ────────────────────────────────────────────
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view RSVPs"
  ON public.event_rsvps FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM public.events
      WHERE is_team_member(team_space_id) AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can RSVP"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND event_id IN (
      SELECT id FROM public.events
      WHERE is_team_member(team_space_id)
    )
  );

CREATE POLICY "Users can change own RSVP"
  ON public.event_rsvps FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ─── match_sessions ─────────────────────────────────────────
ALTER TABLE public.match_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view match sessions"
  ON public.match_sessions FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM public.events
      WHERE is_team_member(team_space_id)
    )
  );

CREATE POLICY "Admins can create match sessions"
  ON public.match_sessions FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.events
      WHERE is_team_admin(team_space_id)
    )
  );

CREATE POLICY "Reporter or admin can update match session"
  ON public.match_sessions FOR UPDATE
  USING (
    reporter_id = (SELECT auth.uid())
    OR event_id IN (
      SELECT id FROM public.events
      WHERE is_team_admin(team_space_id)
    )
  );

-- ─── match_events ───────────────────────────────────────────
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view match events"
  ON public.match_events FOR SELECT
  USING (
    match_session_id IN (
      SELECT ms.id FROM public.match_sessions ms
      JOIN public.events e ON e.id = ms.event_id
      WHERE is_team_member(e.team_space_id)
    )
  );

CREATE POLICY "Reporter or admin can insert match events"
  ON public.match_events FOR INSERT
  WITH CHECK (
    reported_by = (SELECT auth.uid())
    AND match_session_id IN (
      SELECT ms.id FROM public.match_sessions ms
      WHERE ms.reporter_id = (SELECT auth.uid())
        OR ms.event_id IN (
          SELECT id FROM public.events
          WHERE is_team_admin(team_space_id)
        )
    )
  );

CREATE POLICY "Reporter or admin can delete match events"
  ON public.match_events FOR DELETE
  USING (
    reported_by = (SELECT auth.uid())
    OR match_session_id IN (
      SELECT ms.id FROM public.match_sessions ms
      JOIN public.events e ON e.id = ms.event_id
      WHERE is_team_admin(e.team_space_id)
    )
  );

-- ─── feed_posts ─────────────────────────────────────────────
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view feed"
  ON public.feed_posts FOR SELECT
  USING (deleted_at IS NULL AND is_team_member(team_space_id));

CREATE POLICY "Members can create posts"
  ON public.feed_posts FOR INSERT
  WITH CHECK (
    is_team_member(team_space_id)
    AND author_id = (SELECT auth.uid())
  );

CREATE POLICY "Authors can update own posts"
  ON public.feed_posts FOR UPDATE
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE POLICY "Admins can moderate posts"
  ON public.feed_posts FOR UPDATE
  USING (is_team_admin(team_space_id));

-- ─── comments ───────────────────────────────────────────────
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view comments"
  ON public.comments FOR SELECT
  USING (
    deleted_at IS NULL
    AND feed_post_id IN (
      SELECT id FROM public.feed_posts
      WHERE is_team_member(team_space_id) AND deleted_at IS NULL
    )
  );

CREATE POLICY "Members can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND feed_post_id IN (
      SELECT id FROM public.feed_posts
      WHERE is_team_member(team_space_id)
    )
  );

CREATE POLICY "Authors can update own comments"
  ON public.comments FOR UPDATE
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE POLICY "Admins can moderate comments"
  ON public.comments FOR UPDATE
  USING (
    feed_post_id IN (
      SELECT id FROM public.feed_posts
      WHERE is_team_admin(team_space_id)
    )
  );

-- ─── reactions ──────────────────────────────────────────────
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view reactions"
  ON public.reactions FOR SELECT
  USING (
    feed_post_id IN (
      SELECT id FROM public.feed_posts
      WHERE is_team_member(team_space_id)
    )
  );

CREATE POLICY "Members can react"
  ON public.reactions FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND feed_post_id IN (
      SELECT id FROM public.feed_posts
      WHERE is_team_member(team_space_id)
    )
  );

CREATE POLICY "Users can remove own reactions"
  ON public.reactions FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- ─── media ──────────────────────────────────────────────────
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view team media"
  ON public.media FOR SELECT
  USING (deleted_at IS NULL AND is_team_member(team_space_id));

CREATE POLICY "Members can upload media"
  ON public.media FOR INSERT
  WITH CHECK (
    uploaded_by = (SELECT auth.uid())
    AND is_team_member(team_space_id)
  );

CREATE POLICY "Uploader or admin can soft-delete media"
  ON public.media FOR UPDATE
  USING (
    uploaded_by = (SELECT auth.uid())
    OR is_team_admin(team_space_id)
  );

-- ─── media_attachments ──────────────────────────────────────
ALTER TABLE public.media_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view attachments"
  ON public.media_attachments FOR SELECT
  USING (
    media_id IN (
      SELECT id FROM public.media
      WHERE is_team_member(team_space_id) AND deleted_at IS NULL
    )
  );

CREATE POLICY "Uploader can create attachments"
  ON public.media_attachments FOR INSERT
  WITH CHECK (
    media_id IN (
      SELECT id FROM public.media
      WHERE uploaded_by = (SELECT auth.uid())
    )
  );

-- ─── notification_preferences ───────────────────────────────
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ─── notifications ──────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users mark own notifications read"
  ON public.notifications FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ─── audit_log ──────────────────────────────────────────────
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
-- No client policies. Service role only.
