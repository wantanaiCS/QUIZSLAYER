# 🏷️ Tag System Fix Guide

## 🔍 Problem Diagnosis

The tag system in Edit Quiz page freezes when trying to add a new tag. This happens because the Supabase database is missing the `add_or_get_tag` RPC function.

### Root Cause

The `add_or_get_tag` function is defined in these SQL files:
- `supabase/migration_quiz_management_system.sql`
- `supabase/quiz_management_features.sql`

But it may not have been executed in your Supabase database yet.

---

## ✅ Solution 1: Run the Migration (RECOMMENDED)

### Step 1: Connect to Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `yvrbnghjulfmaveckiwa`
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Migration

Copy and paste this SQL into the SQL Editor:

```sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Function: Add or get tag (creates tag if doesn't exist, returns tag id)
-- ─────────────────────────────────────────────────────────────────────────────

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
```

### Step 3: Click "Run" button

### Step 4: Test the Tag System

1. Go to your app at http://127.0.0.1:5174/
2. Login
3. Go to **My Quizzes** → click a quiz → **Edit**
4. Try adding a new tag (type a tag name and press Enter)
5. Check browser console (F12) for any errors

---

## ✅ Solution 2: Verify All Required Tables Exist

Before running the function, make sure these tables exist:

### Check if tables exist:

```sql
-- Check tags table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'tags'
);

-- Check quiz_tags table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'quiz_tags'
);
```

If either returns `false`, you need to create the tables first:

```sql
-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create quiz_tags junction table
CREATE TABLE IF NOT EXISTS public.quiz_tags (
  quiz_set_id UUID NOT NULL REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (quiz_set_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_tags_quiz_set_id ON public.quiz_tags(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_tags_tag_id ON public.quiz_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON public.tags(usage_count DESC);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags (everyone can read)
CREATE POLICY "Tags are viewable by everyone" ON public.tags
  FOR SELECT USING (true);

-- RLS Policies for quiz_tags
CREATE POLICY "Quiz tags are viewable by everyone" ON public.quiz_tags
  FOR SELECT USING (true);

CREATE POLICY "Users can add tags to own quizzes" ON public.quiz_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_sets
      WHERE quiz_sets.id = quiz_tags.quiz_set_id
      AND quiz_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tags from own quizzes" ON public.quiz_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.quiz_sets
      WHERE quiz_sets.id = quiz_tags.quiz_set_id
      AND quiz_sets.user_id = auth.uid()
    )
  );
```

---

## ✅ Solution 3: Run Complete Migration

If you haven't run the quiz management system migration at all, run this complete SQL:

**File**: `supabase/migration_quiz_management_system.sql`

Or run the complete features file:

**File**: `supabase/quiz_management_features.sql`

Copy the entire content and run it in Supabase SQL Editor.

---

## 🧪 Testing After Fix

### Test Steps:

1. **Open browser console** (F12 → Console tab)
2. **Go to Edit Quiz page**:
   - http://127.0.0.1:5174/ → Login → My Quizzes → Click any quiz → Edit
3. **Try adding a tag**:
   - Type a tag name (e.g., "JavaScript")
   - Press Enter
4. **Check console for logs**:
   ```
   [quizStore] Calling add_or_get_tag with: JavaScript
   [quizStore] Tag created/found, id: <uuid>
   ```
5. **Expected result**: Tag appears in selected tags list with green success toast

### If Still Failing:

Check console for error messages like:
- `Database error: function public.add_or_get_tag(p_name text) does not exist`
  → Run Solution 1
- `Database error: relation "public.tags" does not exist`
  → Run Solution 2
- `Not authenticated`
  → Make sure you're logged in
- Other errors → Copy error and check Supabase logs

---

## 📊 Verify Function Exists

Run this query in Supabase SQL Editor:

```sql
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'add_or_get_tag';
```

**Expected result**: Should return 1 row with:
- `routine_name`: add_or_get_tag
- `routine_type`: FUNCTION
- `data_type`: uuid

If it returns 0 rows → function doesn't exist → run Solution 1

---

## 🔄 Complete Migration Checklist

If you want to ensure ALL quiz management features work, run all these functions:

```sql
-- 1. Check if all required functions exist
SELECT routine_name 
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'add_or_get_tag',
    'get_popular_tags',
    'toggle_quiz_like',
    'record_quiz_view',
    'record_quiz_share',
    'record_quiz_play'
  )
ORDER BY routine_name;
```

**Should return 6 rows**. If any are missing, you need to run the complete migration.

---

## ✨ Code Improvements Made

I've added better error handling so you can see the exact error:

### In `TagManager.vue`:
- Added try-catch block
- Shows specific error message in toast
- Logs error to console

### In `quizStore.js`:
- Added console.log statements for debugging
- Better error message formatting
- Added null checks

### How to use:
1. Open browser console (F12)
2. Try adding a tag
3. Check console for detailed logs:
   - `[quizStore] Calling add_or_get_tag with: <tagName>`
   - `[quizStore] Error from add_or_get_tag: <error>`
   - `[TagManager] Failed to create tag: <error>`

---

## 🎯 Summary

**Most likely fix**: Run Solution 1 (create the `add_or_get_tag` function in Supabase)

**Alternative**: If tables don't exist, run Solution 2 first, then Solution 1

**Nuclear option**: Run Solution 3 (complete migration)

After applying the fix, the tag system should work perfectly! ✨

---

## 📞 Need Help?

If the error persists after running the migration:
1. Copy the error message from browser console
2. Copy the result of the "Verify Function Exists" query
3. Share these with someone who can help debug further

The improved error logging will make it much easier to identify the exact issue!
