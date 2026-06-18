-- Migration: Avatar Customization
-- Adds avatar_gradient and title_badge columns to profiles table

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_gradient TEXT DEFAULT 'purple',
  ADD COLUMN IF NOT EXISTS title_badge     TEXT DEFAULT 'Slayer Apprentice';

-- Optional: add a check constraint for valid gradient keys
ALTER TABLE public.profiles
  ADD CONSTRAINT IF NOT EXISTS profiles_avatar_gradient_valid
    CHECK (
      avatar_gradient IN (
        'purple','fire','ocean','forest','gold',
        'rose','void','ice','toxic','cosmic'
      )
    );

COMMENT ON COLUMN public.profiles.avatar_gradient IS 'Avatar gradient key (purple, fire, ocean, etc.)';
COMMENT ON COLUMN public.profiles.title_badge     IS 'Display title badge earned through achievements';
