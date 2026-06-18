-- ═══════════════════════════════════════════════════════════════════════════════
-- Quiz Management Features Migration
-- Adds: Tags, Likes, Views, Shares, Categories, Difficulty, Icons, Cover Images
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Update quiz_sets table with new metadata columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quiz_sets
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general'
    CHECK (category IN ('general', 'science', 'math', 'history', 'language', 'technology', 'art', 'sports', 'other')),
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'normal'
    CHECK (difficulty IN ('easy', 'normal', 'hard', 'expert')),
  ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'book-open',
  ADD COLUMN IF NOT EXISTS icon_color TEXT DEFAULT 'blue'
    CHECK (icon_color IN ('red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'teal')),
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
  ADD COLUMN IF NOT EXISTS plays_count INTEGER DEFAULT 0 CHECK (plays_count >= 0),
  ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0 CHECK (shares_count >= 0);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_quiz_sets_category ON public.quiz_sets(category);
CREATE INDEX IF NOT EXISTS idx_quiz_sets_difficulty ON public.quiz_sets(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_sets_public ON public.quiz_sets(is_public) WHERE is_public = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Tags System
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 30),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  description TEXT,
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: quiz_sets <-> tags (many-to-many)
CREATE TABLE IF NOT EXISTS public.quiz_tags (
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (quiz_set_id, tag_id)
);

-- Indexes for tags
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON public.tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_tags_tag_id ON public.quiz_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_quiz_tags_quiz_set_id ON public.quiz_tags(quiz_set_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Quiz Likes System
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quiz_likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, quiz_set_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_likes_quiz_set_id ON public.quiz_likes(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_likes_user_id ON public.quiz_likes(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Quiz Views Tracking (for analytics)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quiz_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_views_quiz_set_id ON public.quiz_views(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_views_viewed_at ON public.quiz_views(viewed_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Quiz Shares Tracking
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quiz_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_set_id UUID REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_shares_quiz_set_id ON public.quiz_shares(quiz_set_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Row Level Security (RLS)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_shares ENABLE ROW LEVEL SECURITY;

-- Tags: Everyone can read, only authenticated can suggest (via function)
CREATE POLICY "Tags are viewable by everyone." ON public.tags
  FOR SELECT USING (true);

-- Quiz Tags: Read by everyone for public quizzes, manage by quiz owner
CREATE POLICY "Quiz tags are viewable by everyone." ON public.quiz_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND is_public = true)
    OR EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND author_id = auth.uid())
  );

CREATE POLICY "Users can add tags to their own quizzes." ON public.quiz_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND author_id = auth.uid())
  );

CREATE POLICY "Users can remove tags from their own quizzes." ON public.quiz_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND author_id = auth.uid())
  );

-- Quiz Likes: Users can see likes on public quizzes, manage their own likes
CREATE POLICY "Quiz likes are viewable by everyone." ON public.quiz_likes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND is_public = true)
  );

CREATE POLICY "Users can like quizzes." ON public.quiz_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike quizzes." ON public.quiz_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Quiz Views: Read-only for quiz owners
CREATE POLICY "Quiz views are viewable by quiz owner." ON public.quiz_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND author_id = auth.uid())
  );

-- Quiz Shares: Read-only for quiz owners
CREATE POLICY "Quiz shares are viewable by quiz owner." ON public.quiz_shares
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = quiz_set_id AND author_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Functions for Quiz Management
-- ─────────────────────────────────────────────────────────────────────────────

-- Function: Toggle like on a quiz
CREATE OR REPLACE FUNCTION public.toggle_quiz_like(p_quiz_set_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_is_liked BOOLEAN;
  v_new_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if already liked
  SELECT EXISTS(
    SELECT 1 FROM public.quiz_likes 
    WHERE user_id = v_user_id AND quiz_set_id = p_quiz_set_id
  ) INTO v_is_liked;

  IF v_is_liked THEN
    -- Unlike: remove like
    DELETE FROM public.quiz_likes
    WHERE user_id = v_user_id AND quiz_set_id = p_quiz_set_id;
    
    -- Decrement count
    UPDATE public.quiz_sets
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = p_quiz_set_id
    RETURNING likes_count INTO v_new_count;
    
    RETURN jsonb_build_object('is_liked', false, 'likes_count', v_new_count);
  ELSE
    -- Like: add like
    INSERT INTO public.quiz_likes (user_id, quiz_set_id)
    VALUES (v_user_id, p_quiz_set_id)
    ON CONFLICT DO NOTHING;
    
    -- Increment count
    UPDATE public.quiz_sets
    SET likes_count = likes_count + 1
    WHERE id = p_quiz_set_id
    RETURNING likes_count INTO v_new_count;
    
    RETURN jsonb_build_object('is_liked', true, 'likes_count', v_new_count);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_quiz_like(UUID) TO authenticated;

-- Function: Record a quiz view
CREATE OR REPLACE FUNCTION public.record_quiz_view(p_quiz_set_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Insert view record
  INSERT INTO public.quiz_views (quiz_set_id, user_id)
  VALUES (p_quiz_set_id, v_user_id);
  
  -- Increment view count
  UPDATE public.quiz_sets
  SET views_count = views_count + 1
  WHERE id = p_quiz_set_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_quiz_view(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_quiz_view(UUID) TO anon;

-- Function: Record a quiz share
CREATE OR REPLACE FUNCTION public.record_quiz_share(p_quiz_set_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Insert share record
  INSERT INTO public.quiz_shares (quiz_set_id, user_id)
  VALUES (p_quiz_set_id, v_user_id);
  
  -- Increment share count
  UPDATE public.quiz_sets
  SET shares_count = shares_count + 1
  WHERE id = p_quiz_set_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_quiz_share(UUID) TO authenticated;

-- Function: Record a quiz play (when user starts playing)
CREATE OR REPLACE FUNCTION public.record_quiz_play(p_quiz_set_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment play count
  UPDATE public.quiz_sets
  SET plays_count = plays_count + 1
  WHERE id = p_quiz_set_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_quiz_play(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_quiz_play(UUID) TO anon;

-- Function: Get popular tags (ordered by usage count)
CREATE OR REPLACE FUNCTION public.get_popular_tags(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  usage_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.slug, t.description, t.usage_count
  FROM public.tags t
  WHERE t.usage_count > 0
  ORDER BY t.usage_count DESC, t.name ASC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_popular_tags(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_popular_tags(INTEGER) TO anon;

-- Function: Sync tag usage counts (maintenance function, call periodically)
CREATE OR REPLACE FUNCTION public.sync_tag_usage_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tags t
  SET usage_count = (
    SELECT COUNT(*)
    FROM public.quiz_tags qt
    JOIN public.quiz_sets qs ON qs.id = qt.quiz_set_id
    WHERE qt.tag_id = t.id AND qs.is_public = true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_tag_usage_counts() TO authenticated;

-- Function: Add or get tag (creates tag if doesn't exist, returns tag id)
CREATE OR REPLACE FUNCTION public.add_or_get_tag(p_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tag_id UUID;
  v_slug TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Validate name
  IF char_length(p_name) < 2 OR char_length(p_name) > 30 THEN
    RAISE EXCEPTION 'Tag name must be between 2 and 30 characters';
  END IF;
  
  -- Generate slug: lowercase, replace spaces with hyphens
  v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := regexp_replace(v_slug, '^-+|-+$', '', 'g'); -- trim leading/trailing hyphens
  
  -- Insert or get existing tag
  INSERT INTO public.tags (name, slug)
  VALUES (p_name, v_slug)
  ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
  RETURNING id INTO v_tag_id;
  
  RETURN v_tag_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_or_get_tag(TEXT) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Triggers to maintain tag usage counts
-- ─────────────────────────────────────────────────────────────────────────────

-- Increment usage_count when tag is added to a public quiz
CREATE OR REPLACE FUNCTION public.increment_tag_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only count if quiz is public
  IF EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = NEW.quiz_set_id AND is_public = true) THEN
    UPDATE public.tags
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_quiz_tag_added
AFTER INSERT ON public.quiz_tags
FOR EACH ROW EXECUTE FUNCTION public.increment_tag_usage();

-- Decrement usage_count when tag is removed from a public quiz
CREATE OR REPLACE FUNCTION public.decrement_tag_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only count if quiz is public
  IF EXISTS (SELECT 1 FROM public.quiz_sets WHERE id = OLD.quiz_set_id AND is_public = true) THEN
    UPDATE public.tags
    SET usage_count = GREATEST(0, usage_count - 1)
    WHERE id = OLD.tag_id;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_quiz_tag_removed
AFTER DELETE ON public.quiz_tags
FOR EACH ROW EXECUTE FUNCTION public.decrement_tag_usage();

-- Update tag usage when quiz visibility changes
CREATE OR REPLACE FUNCTION public.update_tag_usage_on_visibility_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If quiz became public, increment all its tags
  IF NEW.is_public = true AND OLD.is_public = false THEN
    UPDATE public.tags
    SET usage_count = usage_count + 1
    WHERE id IN (SELECT tag_id FROM public.quiz_tags WHERE quiz_set_id = NEW.id);
  END IF;
  
  -- If quiz became private, decrement all its tags
  IF NEW.is_public = false AND OLD.is_public = true THEN
    UPDATE public.tags
    SET usage_count = GREATEST(0, usage_count - 1)
    WHERE id IN (SELECT tag_id FROM public.quiz_tags WHERE quiz_set_id = NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_quiz_visibility_changed
AFTER UPDATE OF is_public ON public.quiz_sets
FOR EACH ROW EXECUTE FUNCTION public.update_tag_usage_on_visibility_change();

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. View for efficient quiz fetching with all relationships
-- ─────────────────────────────────────────────────────────────────────────────

-- This view makes fetching quizzes with tags, likes, and author info more efficient
CREATE OR REPLACE VIEW public.quiz_sets_with_details AS
SELECT 
  qs.*,
  p.username as author_name,
  p.avatar_url as author_avatar,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug
      )
      ORDER BY t.name
    )
    FROM public.quiz_tags qt
    JOIN public.tags t ON t.id = qt.tag_id
    WHERE qt.quiz_set_id = qs.id
  ) as tags,
  (
    SELECT CASE 
      WHEN auth.uid() IS NULL THEN false
      ELSE EXISTS(
        SELECT 1 FROM public.quiz_likes 
        WHERE quiz_set_id = qs.id AND user_id = auth.uid()
      )
    END
  ) as is_liked
FROM public.quiz_sets qs
LEFT JOIN public.profiles p ON p.id = qs.author_id;

-- Grant access to the view
GRANT SELECT ON public.quiz_sets_with_details TO authenticated;
GRANT SELECT ON public.quiz_sets_with_details TO anon;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration Complete
-- ═══════════════════════════════════════════════════════════════════════════════
