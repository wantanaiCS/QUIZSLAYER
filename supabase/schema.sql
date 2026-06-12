-- Create users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  avatar_url TEXT,
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  exp INTEGER DEFAULT 0 CHECK (exp >= 0),
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz sets table
CREATE TABLE public.quiz_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  difficulty TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL, -- 1 to 5
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 strings
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game sessions (History)
CREATE TABLE public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL,
  stage_reached INTEGER NOT NULL,
  result TEXT NOT NULL, -- 'win', 'lose'
  score INTEGER DEFAULT 0,
  monsters_killed INTEGER DEFAULT 0,
  total_answered INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  answer_summary JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (
  auth.uid() = id
  AND coins = 0
  AND level = 1
  AND exp = 0
);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (username, avatar_url) ON public.profiles TO authenticated;

-- Policies for quiz_sets
CREATE POLICY "Public quiz sets are viewable by everyone." ON public.quiz_sets FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own quiz sets." ON public.quiz_sets FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Users can insert their own quiz sets." ON public.quiz_sets FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own quiz sets." ON public.quiz_sets FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own quiz sets." ON public.quiz_sets FOR DELETE USING (auth.uid() = author_id);

-- Policies for questions
CREATE POLICY "Questions in public sets are viewable by everyone." ON public.questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND is_public = true)
);
CREATE POLICY "Users can view questions in their own sets." ON public.questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND author_id = auth.uid())
);
CREATE POLICY "Users can insert questions to their own sets." ON public.questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND author_id = auth.uid())
);
CREATE POLICY "Users can update questions in their own sets." ON public.questions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND author_id = auth.uid())
);
CREATE POLICY "Users can delete questions in their own sets." ON public.questions FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND author_id = auth.uid())
);

-- Policies for game sessions
CREATE POLICY "Users can view their own game sessions." ON public.game_sessions FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "Users can insert their own game sessions." ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = player_id);

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
  p_answer_summary JSONB
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
    answer_summary
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
    COALESCE(p_answer_summary, '[]'::jsonb)
  )
  RETURNING * INTO inserted_session;

  UPDATE public.profiles
  SET coins = COALESCE(coins, 0) + safe_coins
  WHERE id = auth.uid();

  RETURN inserted_session;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_game_session(
  UUID, TEXT, INTEGER, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, JSONB
) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
BEGIN
  base_username := COALESCE(
    NULLIF(REGEXP_REPLACE(NEW.raw_user_meta_data->>'username', '[^a-zA-Z0-9_]', '_', 'g'), ''),
    'Slayer_' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );

  INSERT INTO public.profiles (id, username, coins)
  VALUES (NEW.id, LEFT(base_username, 11) || '_' || SUBSTRING(NEW.id::TEXT, 1, 8), 0)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
