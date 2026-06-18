-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZ MANAGEMENT SYSTEM MIGRATION
-- Adds: Categories, Icons, Tags, Likes, Views, Shares, Plays tracking
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Extend quiz_sets table with metadata
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quiz_sets 
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general' 
    CHECK (category IN ('general','science','math','history','language','technology','art','sports','other')),
  ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'book-open',
  ADD COLUMN IF NOT EXISTS icon_color TEXT DEFAULT 'blue'
    CHECK (icon_color IN ('red','blue','green','yellow','purple','pink','orange','teal')),
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Create tags table
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Anyone can view tags
CREATE POLICY "Tags are viewable by everyone." ON public.tags FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Create quiz_tags junction table (many-to-many)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quiz_tags (
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (quiz_set_id, tag_id)
);

ALTER TABLE public.quiz_tags ENABLE ROW LEVEL SECURITY;

-- Users can view tags on public quizzes or their own quizzes
CREATE POLICY "Quiz tags are viewable." ON public.quiz_tags FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quiz_sets 
    WHERE id = quiz_set_id 
    AND (is_public = true OR author_id = auth.uid())
  )
);

-- Users can add tags to their own quizzes
CREATE POLICY "Users can add tags to their quizzes." ON public.quiz_tags FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quiz_sets 
    WHERE id = quiz_set_id 
    AND author_id = auth.uid()
  )
);

-- Users can remove tags from their own quizzes
CREATE POLICY "Users can remove tags from their quizzes." ON public.quiz_tags FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.quiz_sets 
    WHERE id = quiz_set_id 
    AND author_id = auth.uid()
  )
);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Create quiz_likes table
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quiz_likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, quiz_set_id)
);

ALTER TABLE public.quiz_likes ENABLE ROW LEVEL SECURITY;

-- Users can view their own likes
CREATE POLICY "Users can view their own likes." ON public.quiz_likes FOR SELECT USING (auth.uid() = user_id);

-- Users can like quizzes
CREATE POLICY "Users can like quizzes." ON public.quiz_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unlike quizzes
CREATE POLICY "Users can unlike quizzes." ON public.quiz_likes FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Create quiz_stats table for views, shares, plays
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quiz_stats (
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE PRIMARY KEY,
  views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
  shares_count INTEGER DEFAULT 0 CHECK (shares_count >= 0),
  plays_count INTEGER DEFAULT 0 CHECK (plays_count >= 0),
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can view stats for public quizzes, owners can view stats for their quizzes
CREATE POLICY "Quiz stats are viewable." ON public.quiz_stats FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quiz_sets 
    WHERE id = quiz_set_id 
    AND (is_public = true OR author_id = auth.uid())
  )
);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. Create indexes for performance
-- ─────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_quiz_sets_category ON public.quiz_sets(category);
CREATE INDEX IF NOT EXISTS idx_quiz_sets_is_public ON public.quiz_sets(is_public);
CREATE INDEX IF NOT EXISTS idx_quiz_sets_author_id ON public.quiz_sets(author_id);
CREATE INDEX IF NOT EXISTS idx_quiz_tags_quiz_set_id ON public.quiz_tags(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_tags_tag_id ON public.quiz_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_quiz_likes_quiz_set_id ON public.quiz_likes(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_likes_user_id ON public.quiz_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- ─────────────────────────────────────────────────────────────────────────
-- 7. Function: Add or get tag (creates if doesn't exist)
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.add_or_get_tag(p_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tag_id UUID;
  tag_slug TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Normalize tag name: trim, lowercase for slug
  p_name := TRIM(p_name);
  tag_slug := LOWER(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9\u0E00-\u0E7F]+', '-', 'g'));
  tag_slug := TRIM(BOTH '-' FROM tag_slug);

  -- Try to insert, return existing if conflict
  INSERT INTO public.tags (name, slug)
  VALUES (p_name, tag_slug)
  ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
  RETURNING id INTO tag_id;

  RETURN tag_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_or_get_tag(TEXT) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 8. Function: Toggle like on a quiz
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.toggle_quiz_like(p_quiz_set_id UUID)
RETURNS TABLE(is_liked BOOLEAN, likes_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_liked BOOLEAN;
  v_likes_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if already liked
  SELECT EXISTS(
    SELECT 1 FROM public.quiz_likes 
    WHERE user_id = auth.uid() AND quiz_set_id = p_quiz_set_id
  ) INTO v_is_liked;

  IF v_is_liked THEN
    -- Unlike
    DELETE FROM public.quiz_likes 
    WHERE user_id = auth.uid() AND quiz_set_id = p_quiz_set_id;
    v_is_liked := false;
  ELSE
    -- Like
    INSERT INTO public.quiz_likes (user_id, quiz_set_id)
    VALUES (auth.uid(), p_quiz_set_id)
    ON CONFLICT DO NOTHING;
    v_is_liked := true;
  END IF;

  -- Update stats count
  SELECT COUNT(*)::INTEGER INTO v_likes_count
  FROM public.quiz_likes
  WHERE quiz_set_id = p_quiz_set_id;

  INSERT INTO public.quiz_stats (quiz_set_id, likes_count, updated_at)
  VALUES (p_quiz_set_id, v_likes_count, NOW())
  ON CONFLICT (quiz_set_id) DO UPDATE 
  SET likes_count = v_likes_count, updated_at = NOW();

  RETURN QUERY SELECT v_is_liked, v_likes_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_quiz_like(UUID) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 9. Function: Record quiz view (anonymous or authenticated)
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.record_quiz_view(p_quiz_set_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment view count (no auth required - can be anonymous)
  INSERT INTO public.quiz_stats (quiz_set_id, views_count, updated_at)
  VALUES (p_quiz_set_id, 1, NOW())
  ON CONFLICT (quiz_set_id) DO UPDATE 
  SET views_count = quiz_stats.views_count + 1, updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_quiz_view(UUID) TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────────
-- 10. Function: Record quiz share
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.record_quiz_share(p_quiz_set_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Increment share count
  INSERT INTO public.quiz_stats (quiz_set_id, shares_count, updated_at)
  VALUES (p_quiz_set_id, 1, NOW())
  ON CONFLICT (quiz_set_id) DO UPDATE 
  SET shares_count = quiz_stats.shares_count + 1, updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_quiz_share(UUID) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 11. Function: Record quiz play
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.record_quiz_play(p_quiz_set_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment play count (no auth required - can be anonymous)
  INSERT INTO public.quiz_stats (quiz_set_id, plays_count, updated_at)
  VALUES (p_quiz_set_id, 1, NOW())
  ON CONFLICT (quiz_set_id) DO UPDATE 
  SET plays_count = quiz_stats.plays_count + 1, updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_quiz_play(UUID) TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────────
-- 12. Function: Get popular tags (most used)
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_popular_tags(p_limit INTEGER DEFAULT 20)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  usage_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug,
    COUNT(qt.quiz_set_id)::BIGINT as usage_count
  FROM public.tags t
  LEFT JOIN public.quiz_tags qt ON t.id = qt.tag_id
  LEFT JOIN public.quiz_sets qs ON qt.quiz_set_id = qs.id AND qs.is_public = true
  GROUP BY t.id, t.name, t.slug
  HAVING COUNT(qt.quiz_set_id) > 0
  ORDER BY usage_count DESC, t.name ASC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_popular_tags(INTEGER) TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────────
-- 13. Create view: quiz_sets_with_details (with all metadata)
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.quiz_sets_with_details AS
SELECT 
  qs.*,
  p.username as author_name,
  COALESCE(st.likes_count, 0) as likes_count,
  COALESCE(st.views_count, 0) as views_count,
  COALESCE(st.plays_count, 0) as plays_count,
  COALESCE(st.shares_count, 0) as shares_count,
  EXISTS(
    SELECT 1 FROM public.quiz_likes 
    WHERE quiz_set_id = qs.id AND user_id = auth.uid()
  ) as is_liked,
  (
    SELECT COALESCE(json_agg(json_build_object(
      'id', t.id,
      'name', t.name,
      'slug', t.slug
    ) ORDER BY t.name), '[]'::json)
    FROM public.tags t
    INNER JOIN public.quiz_tags qt ON t.id = qt.tag_id
    WHERE qt.quiz_set_id = qs.id
  ) as tags
FROM public.quiz_sets qs
LEFT JOIN public.profiles p ON qs.author_id = p.id
LEFT JOIN public.quiz_stats st ON qs.id = st.quiz_set_id;

-- Grant access to the view
GRANT SELECT ON public.quiz_sets_with_details TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────────
-- 14. Trigger: Auto-update updated_at on quiz_sets
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_quiz_sets_updated_at ON public.quiz_sets;
CREATE TRIGGER update_quiz_sets_updated_at
  BEFORE UPDATE ON public.quiz_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════
