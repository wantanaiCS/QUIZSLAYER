-- FREE MODE History Support — SQL Commands for Supabase
-- Copy and paste these commands into Supabase SQL Editor
-- See: FREE_MODE_HISTORY_SETUP.md for detailed instructions

-- ============================================
-- STEP 1: Add 'free' to game_sessions.mode
-- ============================================

BEGIN;

-- Remove old constraint
ALTER TABLE public.game_sessions
DROP CONSTRAINT game_sessions_mode_check;

-- Add new constraint with 'free' mode
ALTER TABLE public.game_sessions
ADD CONSTRAINT game_sessions_mode_check CHECK (mode IN ('solo','pvp','free'));

COMMIT;


-- ============================================
-- VERIFICATION: Check if update worked
-- ============================================

-- Show mode column info
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'game_sessions' AND column_name = 'mode';

-- Show constraint details
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'game_sessions' AND constraint_name LIKE '%mode%';

-- Try inserting a FREE mode test record (optional, for testing)
-- INSERT INTO public.game_sessions (
--   player_id, quiz_set_id, quiz_title, mode, difficulty, stage_reached, result
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000'::uuid,  -- replace with real user_id
--   '00000000-0000-0000-0000-000000000000'::uuid,  -- replace with real quiz_id
--   'Test Quiz',
--   'free',
--   'free',
--   10,
--   'win'
-- );
