-- ============================================================
-- 00011_audit_log.sql
-- Append-only audit trail for security-sensitive actions.
-- Service role writes only — no client access.
-- ============================================================

CREATE TABLE public.audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  team_space_id uuid REFERENCES public.team_spaces(id) ON DELETE SET NULL,
  action        text NOT NULL,
  entity_type   text NOT NULL,
  entity_id     uuid NOT NULL,
  old_data      jsonb,
  new_data      jsonb,
  ip_address    inet,
  created_at    timestamptz NOT NULL DEFAULT now()
);
