-- Migration: Add FREE mode support to game_sessions
-- This migration updates the mode constraint to allow 'free' mode for FREE MODE history tracking

BEGIN;

-- Drop the existing constraint
ALTER TABLE public.game_sessions
DROP CONSTRAINT game_sessions_mode_check;

-- Add new constraint with 'free' mode
ALTER TABLE public.game_sessions
ADD CONSTRAINT game_sessions_mode_check CHECK (mode IN ('solo','pvp','free'));

COMMIT;
