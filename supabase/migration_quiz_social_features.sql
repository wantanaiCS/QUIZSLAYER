-- ═══════════════════════════════════════════════════════════════
-- QuizSlayer: Enhanced Quiz Management with Social Features
-- Migration: Add tags, likes, stats, icons, and sharing features
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. Extend quiz_sets table with metadata
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.quiz_sets
ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'book-open',
ADD COLUMN IF NOT EXISTS icon_color TEXT DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general'
  CHECK (category IN ('general', 'science', 'math', 'history', 'language', 'technology', 'art', 'sports', 'other')),
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
ADD COLUMN IF NOT EXISTS plays_count INTEGER DEFAULT 0 CHECK (plays_count >= 0),
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0 CHECK (shares_count >= 0);

-- Create index for public quiz discovery
CREATE INDEX IF NOT EXISTS idx_quiz_sets_public_popular 
  ON public.quiz_sets (is_public, likes_count DESC, created_at DESC) 
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_quiz_sets_category 
  ON public.quiz_sets (category, is_public);

-- ───────────────────────────────────────────────────────────────
-- 2. Tags System
-- ───────────────────────────────────────────────────────────────

-- Tags table: reusable tags across all quizzes
CREATE TABLE IF NOT EXISTS public.quiz_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 30),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: many-to-many relationship between quizzes and tags
CREATE TABLE IF NOT EXISTS public.quiz_set_tags (
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.quiz_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (quiz_set_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_set_tags_quiz ON public.quiz_set_tags (quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_set_tags_tag ON public.quiz_set_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_quiz_tags_popular ON public.quiz_tags (usage_count DESC);

-- ───────────────────────────────────────────────────────────────
-- 3. Likes/Favorites System
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quiz_likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, quiz_set_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_likes_user ON public.quiz_likes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_likes_quiz ON public.quiz_likes (quiz_set_id);

-- ───────────────────────────────────────────────────────────────
-- 4. Quiz Stats & Analytics
-- ───────────────────────────────────────────────────────────────

-- Track individual views (for analytics, optional)
CREATE TABLE IF NOT EXISTS public.quiz_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_views_quiz ON public.quiz_views (quiz_set_id, viewed_at DESC);

-- ───────────────────────────────────────────────────────────────
-- 5. RLS Policies
-- ───────────────────────────────────────────────────────────────

-- Tags: everyone can read, only system can write (via functions)
ALTER TABLE public.quiz_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_tags_select" ON public.quiz_tags FOR SELECT USING (true);

-- Quiz-Tag junction: read public tags, write own quiz tags
ALTER TABLE public.quiz_set_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_set_tags_select" ON public.quiz_set_tags FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quiz_sets 
    WHERE id = quiz_set_id 
    AND (is_public = true OR author_id = auth.uid())
  )
);
CREATE POLICY "quiz_set_tags_insert" ON public.quiz_set_tags FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quiz_sets 
    WHERE id = quiz_set_id 
    AND author_id = auth.uid()
  )
);
CREATE POLICY "quiz_set_tags_delete" ON public.quiz_set_tags FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.quiz_sets 
    WHERE id = quiz_set_id 
    AND author_id = auth.uid()
  )
);

-- Likes: users can read own likes and like public quizzes
ALTER TABLE public.quiz_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_likes_select" ON public.quiz_likes FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "quiz_likes_insert" ON public.quiz_likes FOR INSERT WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.quiz_sets 
    WHERE id = quiz_set_id 
    AND is_public = true
  )
);
CREATE POLICY "quiz_likes_delete" ON public.quiz_likes FOR DELETE USING (
  user_id = auth.uid()
);

-- Views: track views, users can insert their own
ALTER TABLE public.quiz_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_views_select" ON public.quiz_views FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quiz_sets 
    WHERE id = quiz_set_id 
    AND author_id = auth.uid()
  )
);
CREATE POLICY "quiz_views_insert" ON public.quiz_views FOR INSERT WITH CHECK (true);

-- ───────────────────────────────────────────────────────────────
-- 6. Helper Functions
-- ───────────────────────────────────────────────────────────────

-- Function: Add or get tag by name (creates if doesn't exist)
CREATE OR REPLACE FUNCTION public.get_or_create_tag(tag_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tag_slug TEXT;
  tag_id UUID;
BEGIN
  -- Generate slug from name
  tag_slug := LOWER(REGEXP_REPLACE(
    REGEXP_REPLACE(tag_name, '[^\u0E00-\u0E7Fa-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
  
  -- Try to get existing tag
  SELECT id INTO tag_id FROM public.quiz_tags WHERE slug = tag_slug;
  
  -- Create if doesn't exist
  IF tag_id IS NULL THEN
    INSERT INTO public.quiz_tags (name, slug)
    VALUES (tag_name, tag_slug)
    RETURNING id INTO tag_id;
  END IF;
  
  RETURN tag_id;
END;
$$;

-- Function: Update tag usage counts (call after adding/removing tags)
CREATE OR REPLACE FUNCTION public.update_tag_usage_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.quiz_tags 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.quiz_tags 
    SET usage_count = GREATEST(0, usage_count - 1) 
    WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_tag_counts_on_quiz_set_tags
AFTER INSERT OR DELETE ON public.quiz_set_tags
FOR EACH ROW EXECUTE FUNCTION public.update_tag_usage_counts();

-- Function: Toggle like on a quiz (like if not liked, unlike if already liked)
CREATE OR REPLACE FUNCTION public.toggle_quiz_like(p_quiz_set_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_liked BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if already liked
  SELECT EXISTS (
    SELECT 1 FROM public.quiz_likes 
    WHERE user_id = auth.uid() AND quiz_set_id = p_quiz_set_id
  ) INTO is_liked;
  
  IF is_liked THEN
    -- Unlike
    DELETE FROM public.quiz_likes 
    WHERE user_id = auth.uid() AND quiz_set_id = p_quiz_set_id;
    
    UPDATE public.quiz_sets 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = p_quiz_set_id;
    
    RETURN false; -- unliked
  ELSE
    -- Like (only if quiz is public or owned)
    IF EXISTS (
      SELECT 1 FROM public.quiz_sets 
      WHERE id = p_quiz_set_id 
      AND (is_public = true OR author_id = auth.uid())
    ) THEN
      INSERT INTO public.quiz_likes (user_id, quiz_set_id)
      VALUES (auth.uid(), p_quiz_set_id)
      ON CONFLICT (user_id, quiz_set_id) DO NOTHING;
      
      UPDATE public.quiz_sets 
      SET likes_count = likes_count + 1 
      WHERE id = p_quiz_set_id;
      
      RETURN true; -- liked
    ELSE
      RAISE EXCEPTION 'Quiz not found or not accessible';
    END IF;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_quiz_like(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_tag(TEXT) TO authenticated;

-- Function: Record quiz view (increment view count)
CREATE OR REPLACE FUNCTION public.record_quiz_view(p_quiz_set_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert view record
  INSERT INTO public.quiz_views (quiz_set_id, user_id)
  VALUES (p_quiz_set_id, auth.uid());
  
  -- Increment view count
  UPDATE public.quiz_sets 
  SET views_count = views_count + 1 
  WHERE id = p_quiz_set_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_quiz_view(UUID) TO authenticated;

-- Function: Increment play count when battle starts
CREATE OR REPLACE FUNCTION public.record_quiz_play(p_quiz_set_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.quiz_sets 
  SET plays_count = plays_count + 1 
  WHERE id = p_quiz_set_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_quiz_play(UUID) TO authenticated;

-- Function: Increment share count
CREATE OR REPLACE FUNCTION public.record_quiz_share(p_quiz_set_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.quiz_sets 
  SET shares_count = shares_count + 1 
  WHERE id = p_quiz_set_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_quiz_share(UUID) TO authenticated;

-- ───────────────────────────────────────────────────────────────
-- 7. Sample Icons/Categories Data
-- ───────────────────────────────────────────────────────────────

-- Icon names reference game-icons.svg sprite
-- Available icons: book-open, brain, flask, globe, calculator, palette, trophy, star, etc.

COMMENT ON COLUMN public.quiz_sets.icon_name IS 'Icon name from game-icons.svg sprite';
COMMENT ON COLUMN public.quiz_sets.icon_color IS 'Icon color: red, blue, yellow, green, purple, pink, orange, teal';
COMMENT ON COLUMN public.quiz_sets.category IS 'Quiz category for filtering';

-- ───────────────────────────────────────────────────────────────
-- 8. Materialized View for Popular Tags (Optional Performance)
-- ───────────────────────────────────────────────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS public.popular_tags AS
SELECT 
  t.id,
  t.name,
  t.slug,
  t.usage_count,
  COUNT(DISTINCT qst.quiz_set_id) as quiz_count
FROM public.quiz_tags t
LEFT JOIN public.quiz_set_tags qst ON t.id = qst.tag_id
LEFT JOIN public.quiz_sets qs ON qst.quiz_set_id = qs.id AND qs.is_public = true
GROUP BY t.id, t.name, t.slug, t.usage_count
HAVING t.usage_count > 0
ORDER BY t.usage_count DESC
LIMIT 50;

CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_tags_id ON public.popular_tags (id);

-- Refresh materialized view periodically (run this via cron or manually)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY public.popular_tags;

-- ═══════════════════════════════════════════════════════════════
-- Migration Complete
-- ═══════════════════════════════════════════════════════════════
