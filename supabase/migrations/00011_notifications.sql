-- ============================================================
-- 00010_notifications.sql
-- Notification preferences and notification delivery log
-- ============================================================

-- ============================================================
-- notification_preferences
-- Per-user, per-team_space, per-channel, per-category toggles.
-- team_space_id NULL = global default. Team-specific rows
-- override the global setting.
-- ============================================================
CREATE TABLE public.notification_preferences (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_space_id  uuid REFERENCES public.team_spaces(id) ON DELETE CASCADE,
  channel        text NOT NULL
                   CHECK (channel IN ('push','in_app','email')),
  category       text NOT NULL
                   CHECK (category IN ('event_reminder','rsvp_update','match_live','new_post','new_comment','admin_message','system')),
  enabled        boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, team_space_id, channel, category)
);

CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- notifications
-- Individual notification records delivered to a user.
-- Written by service role (edge functions). Users can only
-- read their own and mark them as read.
-- ============================================================
CREATE TABLE public.notifications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_space_id      uuid REFERENCES public.team_spaces(id) ON DELETE CASCADE,
  category           text NOT NULL
                       CHECK (category IN ('event_reminder','rsvp_update','match_live','new_post','new_comment','admin_message','system')),
  title              text NOT NULL,
  body               text NOT NULL,
  data               jsonb NOT NULL DEFAULT '{}',
  source_entity_type text,
  source_entity_id   uuid,
  read_at            timestamptz,
  sent_at            timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
