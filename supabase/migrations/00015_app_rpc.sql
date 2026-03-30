-- ============================================================
-- 00014_app_rpc.sql
-- RPC functions for the Heia app.
-- All SECURITY DEFINER to bypass RLS where needed.
-- ============================================================

-- ============================================================
-- generate_invite_code()
-- Internal helper: generates an 8-char code from the safe
-- alphabet ABCDEFGHJKMNPQRSTUVWXYZ23456789 (no 0/O/1/I/L).
-- ============================================================
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text := '';
  i int;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(alphabet, floor(random() * 30 + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql VOLATILE;


-- ============================================================
-- activate_team_space()
-- Creates a team_space and the initial admin membership in one
-- transaction. Solves the circular RLS bootstrap problem.
-- ============================================================
CREATE OR REPLACE FUNCTION activate_team_space(
  p_team_id      uuid,
  p_display_name text,
  p_color        text DEFAULT '#6366F1'
)
RETURNS jsonb AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_space_id   uuid;
  v_member_id  uuid;
  v_code       text;
  v_attempts   int := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check user doesn't already have an active space for this team
  IF EXISTS (
    SELECT 1 FROM public.memberships m
    JOIN public.team_spaces ts ON ts.id = m.team_space_id
    WHERE ts.team_id = p_team_id
      AND m.user_id = v_uid
      AND m.status = 'active'
      AND ts.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'User already has active membership for this team';
  END IF;

  -- Generate unique invite code with retry
  LOOP
    v_code := generate_invite_code();
    v_attempts := v_attempts + 1;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.team_spaces WHERE invite_code = v_code
    );
    IF v_attempts > 10 THEN
      RAISE EXCEPTION 'Failed to generate unique invite code';
    END IF;
  END LOOP;

  -- Create team space
  INSERT INTO public.team_spaces (
    team_id, display_name, color, invite_code,
    is_activated, activated_at, activated_by
  ) VALUES (
    p_team_id, p_display_name, p_color, v_code,
    true, now(), v_uid
  )
  RETURNING id INTO v_space_id;

  -- Create initial admin membership
  INSERT INTO public.memberships (
    user_id, team_space_id, role, status, joined_at
  ) VALUES (
    v_uid, v_space_id, 'trener', 'active', now()
  )
  RETURNING id INTO v_member_id;

  RETURN jsonb_build_object(
    'team_space_id', v_space_id,
    'invite_code', v_code,
    'membership_id', v_member_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- lookup_invite_code()
-- Public lookup for the join flow. No membership required.
-- Returns team space info or null if not found.
-- ============================================================
CREATE OR REPLACE FUNCTION lookup_invite_code(code text)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT jsonb_build_object(
    'id', ts.id,
    'display_name', ts.display_name,
    'color', ts.color,
    'club_name', c.name,
    'sport', s.slug,
    'member_count', (
      SELECT count(*) FROM public.memberships m
      WHERE m.team_space_id = ts.id AND m.status = 'active'
    )
  ) INTO result
  FROM public.team_spaces ts
  JOIN public.teams t ON t.id = ts.team_id
  JOIN public.clubs c ON c.id = t.club_id
  JOIN public.sports s ON s.id = t.sport_id
  WHERE ts.invite_code = upper(code)
    AND ts.deleted_at IS NULL
    AND ts.is_activated = true;

  RETURN result; -- null if not found
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ============================================================
-- join_team_space()
-- Join a team space via invite code.
-- Creates an active membership.
-- ============================================================
CREATE OR REPLACE FUNCTION join_team_space(
  p_invite_code      text,
  p_role             text DEFAULT 'forelder',
  p_managed_child_id uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_uid       uuid := auth.uid();
  v_space     record;
  v_member_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate role
  IF p_role NOT IN ('trener','lagleder','admin','forelder','spiller') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- If managed_child_id provided, role must be forelder
  IF p_managed_child_id IS NOT NULL AND p_role != 'forelder' THEN
    RAISE EXCEPTION 'Role must be forelder when managed_child_id is set';
  END IF;

  -- Validate managed child belongs to user's household
  IF p_managed_child_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.managed_children mc
      WHERE mc.id = p_managed_child_id
        AND mc.managed_by = v_uid
    ) THEN
      RAISE EXCEPTION 'Child does not belong to this user';
    END IF;
  END IF;

  -- Find the team space
  SELECT ts.id, ts.display_name
  INTO v_space
  FROM public.team_spaces ts
  WHERE ts.invite_code = upper(p_invite_code)
    AND ts.deleted_at IS NULL
    AND ts.is_activated = true;

  IF v_space IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  -- Check not already active member (with same child)
  IF EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = v_uid
      AND m.team_space_id = v_space.id
      AND m.status = 'active'
      AND COALESCE(m.managed_child_id, '00000000-0000-0000-0000-000000000000')
        = COALESCE(p_managed_child_id, '00000000-0000-0000-0000-000000000000')
  ) THEN
    RAISE EXCEPTION 'Already an active member';
  END IF;

  -- Create membership
  INSERT INTO public.memberships (
    user_id, team_space_id, role, status, managed_child_id, joined_at
  ) VALUES (
    v_uid, v_space.id, p_role, 'active', p_managed_child_id, now()
  )
  RETURNING id INTO v_member_id;

  RETURN jsonb_build_object(
    'membership_id', v_member_id,
    'team_space_id', v_space.id,
    'display_name', v_space.display_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- upsert_rsvp()
-- Create or update an RSVP. Validates child ownership.
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_rsvp(
  p_event_id uuid,
  p_status   text,
  p_child_id uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_uid     uuid := auth.uid();
  v_evt     record;
  v_rsvp_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_status NOT IN ('kommer','kan_ikke','venter') THEN
    RAISE EXCEPTION 'Invalid RSVP status: %', p_status;
  END IF;

  -- Get event and verify membership
  SELECT e.id, e.team_space_id
  INTO v_evt
  FROM public.events e
  WHERE e.id = p_event_id AND e.deleted_at IS NULL;

  IF v_evt IS NULL THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  IF NOT is_team_member(v_evt.team_space_id) THEN
    RAISE EXCEPTION 'Not a member of this team space';
  END IF;

  -- Validate child ownership
  IF p_child_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.managed_children mc
      WHERE mc.id = p_child_id AND mc.managed_by = v_uid
    ) THEN
      RAISE EXCEPTION 'Child does not belong to this user';
    END IF;
  END IF;

  -- Upsert
  INSERT INTO public.event_rsvps (event_id, user_id, child_id, status, responded_at)
  VALUES (p_event_id, v_uid, p_child_id, p_status, now())
  ON CONFLICT (
    event_id,
    user_id,
    COALESCE(child_id, '00000000-0000-0000-0000-000000000000')
  )
  DO UPDATE SET
    status = EXCLUDED.status,
    responded_at = now()
  RETURNING id INTO v_rsvp_id;

  RETURN jsonb_build_object(
    'rsvp_id', v_rsvp_id,
    'status', p_status,
    'child_id', p_child_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- get_team_feed()
-- Returns feed posts with author info, comment count, reaction
-- aggregates, and media attachments. Cursor-based pagination.
-- ============================================================
CREATE OR REPLACE FUNCTION get_team_feed(
  ts_id  uuid,
  lim    int DEFAULT 20,
  cursor timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id              uuid,
  type            text,
  content         text,
  is_pinned       boolean,
  created_at      timestamptz,
  event_id        uuid,
  match_event_id  uuid,
  author_id       uuid,
  author_name     text,
  author_avatar   text,
  author_role     text,
  comment_count   bigint,
  reaction_counts jsonb,
  media           jsonb
) AS $$
BEGIN
  IF NOT is_team_member(ts_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    fp.id,
    fp.type,
    fp.content,
    fp.is_pinned,
    fp.created_at,
    fp.event_id,
    fp.match_event_id,
    p.id AS author_id,
    p.display_name AS author_name,
    p.avatar_url AS author_avatar,
    m.role AS author_role,
    (
      SELECT count(*)
      FROM public.comments c
      WHERE c.feed_post_id = fp.id AND c.deleted_at IS NULL
    ) AS comment_count,
    (
      SELECT jsonb_object_agg(sub.emoji, sub.cnt)
      FROM (
        SELECT r.emoji, count(*) AS cnt
        FROM public.reactions r
        WHERE r.feed_post_id = fp.id
        GROUP BY r.emoji
      ) sub
    ) AS reaction_counts,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', med.id,
          'storage_path', med.storage_path,
          'thumbnail_path', med.thumbnail_path,
          'mime_type', med.mime_type
        ) ORDER BY ma.sort_order
      )
      FROM public.media_attachments ma
      JOIN public.media med ON med.id = ma.media_id
      WHERE ma.entity_type = 'feed_post'
        AND ma.entity_id = fp.id
        AND med.deleted_at IS NULL
    ) AS media
  FROM public.feed_posts fp
  LEFT JOIN public.profiles p ON p.id = fp.author_id
  LEFT JOIN public.memberships m
    ON m.user_id = fp.author_id
    AND m.team_space_id = ts_id
    AND m.status = 'active'
    AND m.managed_child_id IS NULL
  WHERE fp.team_space_id = ts_id
    AND fp.deleted_at IS NULL
    AND (cursor IS NULL OR fp.created_at < cursor)
  ORDER BY fp.is_pinned DESC, fp.created_at DESC
  LIMIT lim;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ============================================================
-- get_event_with_rsvp()
-- Returns full event details including match session, match
-- events, RSVP summary, user's own RSVPs, and attendee lists.
-- ============================================================
CREATE OR REPLACE FUNCTION get_event_with_rsvp(evt_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_evt    record;
  v_result jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_evt
  FROM public.events
  WHERE id = evt_id AND deleted_at IS NULL;

  IF v_evt IS NULL THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  IF NOT is_team_member(v_evt.team_space_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'id', e.id,
    'type', e.type,
    'title', e.title,
    'description', e.description,
    'location', e.location,
    'start_time', e.start_time,
    'end_time', e.end_time,
    'all_day', e.all_day,
    'created_by', e.created_by,
    -- Match session (null if not a match)
    'match_session', (
      SELECT jsonb_build_object(
        'id', ms.id,
        'opponent', ms.opponent,
        'home_score', ms.home_score,
        'away_score', ms.away_score,
        'is_home', ms.is_home,
        'status', ms.status,
        'reporter_id', ms.reporter_id,
        'match_events', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', me.id,
              'type', me.type,
              'minute', me.minute,
              'player_name', me.player_name,
              'team_side', me.team_side,
              'description', me.description,
              'reported_by', me.reported_by
            ) ORDER BY me.sequence
          ), '[]'::jsonb)
          FROM public.match_events me
          WHERE me.match_session_id = ms.id
        )
      )
      FROM public.match_sessions ms
      WHERE ms.event_id = e.id
    ),
    -- RSVP summary
    'rsvp_summary', (
      SELECT jsonb_build_object(
        'coming', count(*) FILTER (WHERE er.status = 'kommer'),
        'not_coming', count(*) FILTER (WHERE er.status = 'kan_ikke'),
        'pending', count(*) FILTER (WHERE er.status = 'venter')
      )
      FROM public.event_rsvps er
      WHERE er.event_id = e.id
    ),
    -- Current user's own RSVP (no child)
    'my_rsvp', (
      SELECT er.status
      FROM public.event_rsvps er
      WHERE er.event_id = e.id
        AND er.user_id = v_uid
        AND er.child_id IS NULL
    ),
    -- Current user's child RSVPs
    'my_child_rsvps', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'child_id', er.child_id,
          'child_name', mc.display_name,
          'status', er.status
        )
      ), '[]'::jsonb)
      FROM public.event_rsvps er
      JOIN public.managed_children mc ON mc.id = er.child_id
      WHERE er.event_id = e.id
        AND er.user_id = v_uid
        AND er.child_id IS NOT NULL
    ),
    -- Attendee lists
    'attendees', jsonb_build_object(
      'coming', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.display_name,
            'avatar', p.avatar_url,
            'child_name', mc.display_name
          )
        ), '[]'::jsonb)
        FROM public.event_rsvps er
        JOIN public.profiles p ON p.id = er.user_id
        LEFT JOIN public.managed_children mc ON mc.id = er.child_id
        WHERE er.event_id = e.id AND er.status = 'kommer'
      ),
      'not_coming', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.display_name,
            'avatar', p.avatar_url,
            'child_name', mc.display_name
          )
        ), '[]'::jsonb)
        FROM public.event_rsvps er
        JOIN public.profiles p ON p.id = er.user_id
        LEFT JOIN public.managed_children mc ON mc.id = er.child_id
        WHERE er.event_id = e.id AND er.status = 'kan_ikke'
      ),
      'pending', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.display_name,
            'avatar', p.avatar_url,
            'child_name', mc.display_name
          )
        ), '[]'::jsonb)
        FROM public.event_rsvps er
        JOIN public.profiles p ON p.id = er.user_id
        LEFT JOIN public.managed_children mc ON mc.id = er.child_id
        WHERE er.event_id = e.id AND er.status = 'venter'
      )
    )
  ) INTO v_result
  FROM public.events e
  WHERE e.id = evt_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ============================================================
-- get_team_members()
-- Returns team members with profile info, role, and managed
-- child name. Sorted by role hierarchy.
-- ============================================================
CREATE OR REPLACE FUNCTION get_team_members(ts_id uuid)
RETURNS TABLE (
  membership_id    uuid,
  user_id          uuid,
  display_name     text,
  avatar_url       text,
  role             text,
  status           text,
  joined_at        timestamptz,
  managed_child_id uuid,
  child_name       text
) AS $$
BEGIN
  IF NOT is_team_member(ts_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    m.id AS membership_id,
    m.user_id,
    p.display_name,
    p.avatar_url,
    m.role,
    m.status,
    m.joined_at,
    m.managed_child_id,
    mc.display_name AS child_name
  FROM public.memberships m
  JOIN public.profiles p ON p.id = m.user_id
  LEFT JOIN public.managed_children mc ON mc.id = m.managed_child_id
  WHERE m.team_space_id = ts_id
    AND m.status IN ('active', 'invited')
  ORDER BY
    CASE m.role
      WHEN 'trener' THEN 1
      WHEN 'lagleder' THEN 2
      WHEN 'admin' THEN 3
      WHEN 'forelder' THEN 4
      WHEN 'spiller' THEN 5
    END,
    p.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
