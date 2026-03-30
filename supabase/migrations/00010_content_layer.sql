-- ============================================================
-- 00009_content_layer.sql
-- Content layer: media, media_attachments
-- ============================================================

-- ============================================================
-- media
-- Tracks files uploaded to Supabase Storage.
-- deleted_at enables two-phase deletion: soft-delete row first,
-- then a background job cleans up storage after 7 days.
-- ============================================================
CREATE TABLE public.media (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  team_space_id   uuid NOT NULL REFERENCES public.team_spaces(id) ON DELETE CASCADE,
  bucket          text NOT NULL,
  storage_path    text NOT NULL,
  file_name       text NOT NULL,
  mime_type       text NOT NULL,
  size_bytes      bigint NOT NULL CHECK (size_bytes > 0),
  width           int CHECK (width IS NULL OR width > 0),
  height          int CHECK (height IS NULL OR height > 0),
  thumbnail_path  text,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- media_attachments
-- Polymorphic join: links a media row to any entity.
-- ============================================================
CREATE TABLE public.media_attachments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id    uuid NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  entity_type text NOT NULL
                CHECK (entity_type IN ('feed_post','comment','event','profile','team_space','match_session')),
  entity_id   uuid NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),

  UNIQUE (media_id, entity_type, entity_id)
);
