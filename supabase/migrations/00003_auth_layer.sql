-- ============================================================
-- 00003_auth_layer.sql
-- Identity layer: profiles, households, managed children,
-- user devices
-- ============================================================

-- ============================================================
-- households (family grouping — created before profiles
-- so profiles can reference it)
-- ============================================================
CREATE TABLE public.households (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_by  uuid,  -- FK added after profiles table exists
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- profiles (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id                     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name           text,
  avatar_url             text,
  phone                  text,
  locale                 text NOT NULL DEFAULT 'nb',
  onboarding_completed   boolean NOT NULL DEFAULT false,
  household_id           uuid REFERENCES public.households(id),
  stripe_customer_id     text,
  deleted_at             timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Now add the FK from households.created_by → profiles
ALTER TABLE public.households
  ADD CONSTRAINT fk_households_created_by
  FOREIGN KEY (created_by) REFERENCES public.profiles(id);

-- ============================================================
-- Auto-create profile on auth.users INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- household_members
-- ============================================================
CREATE TABLE public.household_members (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id   uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  profile_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship   text NOT NULL CHECK (relationship IN ('parent', 'child', 'guardian')),
  is_managed     boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),

  UNIQUE (household_id, profile_id)
);

-- ============================================================
-- managed_children (children without their own auth account)
-- ============================================================
CREATE TABLE public.managed_children (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id   uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  managed_by     uuid NOT NULL REFERENCES public.profiles(id),
  display_name   text NOT NULL,
  avatar_url     text,
  birth_year     int,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_managed_children_updated_at
  BEFORE UPDATE ON public.managed_children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- user_devices (push notification tokens)
-- ============================================================
CREATE TABLE public.user_devices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_token    text NOT NULL,
  platform        text NOT NULL CHECK (platform IN ('ios', 'android')),
  app_version     text,
  last_active_at  timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_user_devices_updated_at
  BEFORE UPDATE ON public.user_devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
