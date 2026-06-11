-- Create users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

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
