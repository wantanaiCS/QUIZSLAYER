-- ══════════════════════════════════════════════════════════════════════
-- วิธีใช้: เปิด Supabase Dashboard → SQL Editor → New Query
--          วาง SQL ทั้งหมดด้านล่างนี้ → กด Run
-- ══════════════════════════════════════════════════════════════════════

-- Step 1: ลบ constraint เดิมที่บล็อกภาษาไทย
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_check;

-- Step 2: เพิ่ม constraint ใหม่ที่รองรับภาษาไทย (ก-ฮ สระ วรรณยุกต์)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_check
  CHECK (
    username ~ '^[[:alnum:]_\u0E00-\u0E7F]{2,20}$'
  );

-- Step 3: แก้ trigger function ให้ไม่ strip ตัวอักษรไทยออกตอนสมัคร
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
    NULLIF(
      REGEXP_REPLACE(
        NEW.raw_user_meta_data->>'username',
        '[^a-zA-Z0-9_\u0E00-\u0E7F]', '_', 'g'
      ),
      ''
    ),
    'Slayer_' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );

  INSERT INTO public.profiles (id, username, coins)
  VALUES (
    NEW.id,
    LEFT(base_username, 11) || '_' || SUBSTRING(NEW.id::TEXT, 1, 8),
    0
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
