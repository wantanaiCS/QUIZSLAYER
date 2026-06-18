-- Add mode column to game_sessions to differentiate between solo and PvP battles
ALTER TABLE public.game_sessions 
ADD COLUMN mode TEXT DEFAULT 'solo' CHECK (mode IN ('solo', 'pvp'));

-- Update the record_game_session function to include mode parameter
CREATE OR REPLACE FUNCTION public.record_game_session(
  p_quiz_set_id UUID,
  p_difficulty TEXT,
  p_stage_reached INTEGER,
  p_result TEXT,
  p_score INTEGER,
  p_monsters_killed INTEGER,
  p_total_answered INTEGER,
  p_total_correct INTEGER,
  p_duration_seconds INTEGER,
  p_coins_earned INTEGER,
  p_answer_summary JSONB,
  p_mode TEXT DEFAULT 'solo'
)
RETURNS public.game_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_session public.game_sessions;
  safe_coins INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  safe_coins := CASE WHEN p_result = 'win' THEN GREATEST(0, LEAST(COALESCE(p_coins_earned, 0), 500)) ELSE 0 END;

  INSERT INTO public.game_sessions (
    player_id,
    quiz_set_id,
    difficulty,
    stage_reached,
    result,
    score,
    monsters_killed,
    total_answered,
    total_correct,
    duration_seconds,
    coins_earned,
    answer_summary,
    mode
  )
  VALUES (
    auth.uid(),
    p_quiz_set_id,
    p_difficulty,
    p_stage_reached,
    p_result,
    GREATEST(0, COALESCE(p_score, 0)),
    GREATEST(0, COALESCE(p_monsters_killed, 0)),
    GREATEST(0, COALESCE(p_total_answered, 0)),
    GREATEST(0, COALESCE(p_total_correct, 0)),
    GREATEST(0, COALESCE(p_duration_seconds, 0)),
    safe_coins,
    COALESCE(p_answer_summary, '[]'::jsonb),
    COALESCE(p_mode, 'solo')
  )
  RETURNING * INTO inserted_session;

  UPDATE public.profiles
  SET coins = COALESCE(coins, 0) + safe_coins
  WHERE id = auth.uid();

  RETURN inserted_session;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.record_game_session(
  UUID, TEXT, INTEGER, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, JSONB, TEXT
) TO authenticated;
