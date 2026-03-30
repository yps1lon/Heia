-- ============================================================
-- 00012_app_indexes.sql
-- Performance indexes for all Phase 2 tables.
--
-- The memberships covering index is the single most critical
-- index: is_team_member() and is_team_admin() run on EVERY
-- RLS check. INCLUDE(role) lets is_team_admin satisfy from
-- index alone without a heap fetch.
-- ============================================================

-- ─── Memberships (CRITICAL — every RLS check hits this) ─────
CREATE INDEX idx_memberships_user_active
  ON public.memberships (user_id, team_space_id)
  INCLUDE (role)
  WHERE status = 'active';

CREATE INDEX idx_memberships_team_space
  ON public.memberships (team_space_id)
  WHERE status = 'active';

CREATE INDEX idx_memberships_managed_child
  ON public.memberships (managed_child_id)
  WHERE managed_child_id IS NOT NULL;

-- ─── Team spaces ────────────────────────────────────────────
CREATE INDEX idx_team_spaces_team
  ON public.team_spaces (team_id);

CREATE INDEX idx_team_spaces_invite
  ON public.team_spaces (invite_code)
  WHERE deleted_at IS NULL;

-- ─── Events ─────────────────────────────────────────────────
CREATE INDEX idx_events_team_space_time
  ON public.events (team_space_id, start_time DESC)
  WHERE deleted_at IS NULL;

-- ─── Event RSVPs ────────────────────────────────────────────
CREATE INDEX idx_event_rsvps_event
  ON public.event_rsvps (event_id);

-- ─── Match sessions & events ────────────────────────────────
CREATE INDEX idx_match_sessions_status
  ON public.match_sessions (status)
  WHERE status = 'live';

CREATE INDEX idx_match_events_session
  ON public.match_events (match_session_id, sequence);

-- ─── Feed posts (primary screen) ────────────────────────────
CREATE INDEX idx_feed_posts_team_feed
  ON public.feed_posts (team_space_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_feed_posts_pinned
  ON public.feed_posts (team_space_id)
  WHERE is_pinned = true AND deleted_at IS NULL;

-- ─── Comments & reactions ───────────────────────────────────
CREATE INDEX idx_comments_post
  ON public.comments (feed_post_id, created_at)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_reactions_post
  ON public.reactions (feed_post_id);

-- ─── Media ──────────────────────────────────────────────────
CREATE INDEX idx_media_team_space
  ON public.media (team_space_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_media_attachments_entity
  ON public.media_attachments (entity_type, entity_id);

CREATE INDEX idx_media_cleanup
  ON public.media (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- ─── Notifications ──────────────────────────────────────────
CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX idx_notifications_user_all
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX idx_notification_prefs_user
  ON public.notification_preferences (user_id);

-- ─── Audit log ──────────────────────────────────────────────
CREATE INDEX idx_audit_log_entity
  ON public.audit_log (entity_type, entity_id);

CREATE INDEX idx_audit_log_team_space
  ON public.audit_log (team_space_id, created_at DESC);
