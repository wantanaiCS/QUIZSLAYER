-- ================================================================
-- QuizSlayer PvP Setup SQL
-- รัน script นี้ใน Supabase Dashboard → SQL Editor
-- ================================================================

-- ── Step 1: สร้าง pvp_rooms table ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.pvp_rooms (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code     TEXT UNIQUE NOT NULL,
  host_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  quiz_set_id   UUID REFERENCES public.quiz_sets(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'waiting'
                  CHECK (status IN ('waiting','rps','playing','lucky_box','finished','abandoned')),
  host_color    TEXT NOT NULL DEFAULT 'red'
                  CHECK (host_color  IN ('red','blue','yellow','green')),
  guest_color   TEXT NOT NULL DEFAULT 'blue'
                  CHECK (guest_color IN ('red','blue','yellow','green')),
  host_hp       INTEGER NOT NULL DEFAULT 20 CHECK (host_hp  >= 0),
  guest_hp      INTEGER NOT NULL DEFAULT 20 CHECK (guest_hp >= 0),
  host_items    JSONB NOT NULL DEFAULT '[]'::jsonb,
  guest_items   JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_turn  TEXT NOT NULL DEFAULT 'host' CHECK (current_turn IN ('host','guest')),
  current_q_index     INTEGER NOT NULL DEFAULT 0,
  questions_answered  INTEGER NOT NULL DEFAULT 0,
  question_seed       INTEGER NOT NULL DEFAULT 0,
  rps_host      TEXT CHECK (rps_host  IN ('rock','paper','scissors', NULL)),
  rps_guest     TEXT CHECK (rps_guest IN ('rock','paper','scissors', NULL)),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  started_at    TIMESTAMPTZ,
  finished_at   TIMESTAMPTZ
);

-- ── Step 2: สร้าง pvp_sessions table ───────────────────────────
CREATE TABLE IF NOT EXISTS public.pvp_sessions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id          UUID REFERENCES public.pvp_rooms(id) ON DELETE CASCADE,
  winner_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_score       INTEGER DEFAULT 0,
  guest_score      INTEGER DEFAULT 0,
  total_questions  INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Step 3: เปิด RLS ────────────────────────────────────────────
ALTER TABLE public.pvp_rooms    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_sessions ENABLE ROW LEVEL SECURITY;

-- ── Step 4: RLS Policies ────────────────────────────────────────

-- pvp_rooms: ใครก็ดูห้องที่ status='waiting' ได้ (เพื่อ join)
--            host/guest ดูห้องตัวเองได้
DROP POLICY IF EXISTS "pvp_rooms_select" ON public.pvp_rooms;
CREATE POLICY "pvp_rooms_select" ON public.pvp_rooms FOR SELECT
  USING (
    auth.uid() = host_id OR
    auth.uid() = guest_id OR
    status = 'waiting'
  );

-- pvp_rooms: สร้างห้องได้เฉพาะ host
DROP POLICY IF EXISTS "pvp_rooms_insert" ON public.pvp_rooms;
CREATE POLICY "pvp_rooms_insert" ON public.pvp_rooms FOR INSERT
  WITH CHECK (auth.uid() = host_id);

-- pvp_rooms: อัปเดตได้เฉพาะคนในห้อง
DROP POLICY IF EXISTS "pvp_rooms_update" ON public.pvp_rooms;
CREATE POLICY "pvp_rooms_update" ON public.pvp_rooms FOR UPDATE
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- pvp_sessions
DROP POLICY IF EXISTS "pvp_sessions_select" ON public.pvp_sessions;
CREATE POLICY "pvp_sessions_select" ON public.pvp_sessions FOR SELECT
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

DROP POLICY IF EXISTS "pvp_sessions_insert" ON public.pvp_sessions;
CREATE POLICY "pvp_sessions_insert" ON public.pvp_sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id OR auth.uid() = guest_id);

-- ── Step 5: Function สร้าง room code ────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  TEXT := '';
  i     INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INT, 1);
  END LOOP;
  RETURN code;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_room_code() TO authenticated;

-- ── Step 6: เปิด Realtime บน pvp_rooms ─────────────────────────
-- (ถ้า error ให้ทำผ่าน Dashboard แทน ดูขั้นตอนใน README)
ALTER PUBLICATION supabase_realtime ADD TABLE public.pvp_rooms;

-- ── Verify ──────────────────────────────────────────────────────
SELECT 'pvp_rooms created' AS status WHERE EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'pvp_rooms'
);
SELECT 'pvp_sessions created' AS status WHERE EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'pvp_sessions'
);
SELECT 'generate_room_code exists' AS status WHERE EXISTS (
  SELECT FROM pg_proc WHERE proname = 'generate_room_code'
);
