# QUIZSLAYER — Project SKILL.md
> ใช้ไฟล์นี้เป็น context หลักส่งให้ AI ตัวใดก็ได้ เพื่อให้เข้าใจโปรเจกต์ทั้งหมดและช่วยพัฒนาต่อได้ทันที

---

## 1. PROJECT OVERVIEW

- **ชื่อโปรเจกต์**: QuizSlayer
- **ประเภท**: Educational RPG Web Game (Gamified Quiz)
- **แนวคิดหลัก**: ผู้เล่นต่อสู้กับมอนสเตอร์โดยการตอบคำถาม 4 ตัวเลือก (A/B/C/D) แบบ turn-based
- **ธีม**: 2D Pixel Art — น่ารักแต่เท่ (Cute & Cool)
- **เป้าหมายผู้เล่น**: เคลียร์มอนสเตอร์ 5 ตัวต่อเนื่อง (5-Monster Run) เพื่อรับคะแนนและเหรียญ
- **จุดเด่น**: ผู้ใช้สร้างชุดข้อสอบเองผ่าน AI Prompt Generator ได้

---

## 2. CORE BATTLE MECHANICS

### 2.1 Turn System (Dynamic Bar Time)
- ระบบ **turn-based** โดยใช้ **Bar Time** (แถบเวลาเคลื่อนที่) แทนการสลับ turn แบบปกติ
- ทั้งผู้เล่นและมอนสเตอร์มี Bar Time ของตัวเอง — **ใครเต็มก่อนได้ turn ก่อน**
- **ผู้เล่นได้ Bar Time เร็วกว่าเล็กน้อยในช่วงเริ่มต้น** เพื่อให้ได้ตอบก่อนเสมอในข้อแรก
- หาก Bar Time มอนสเตอร์เต็มก่อน → มอนสเตอร์โจมตีผู้เล่นโดยอัตโนมัติ (ลด HP)
- หาก Bar Time ผู้เล่นเต็มก่อน → ผู้เล่นต้องตอบคำถามภายใน Cooldown Time

**Bar Time Speed Rules:**
- Streak สูง (ตอบถูกติดกัน 3+ ข้อ) → Bar ผู้เล่นเร็วขึ้น (ได้ turn บ่อยขึ้น, ดาเมจสูงขึ้น)
- ค่าเริ่มต้น Bar Speed สามารถปรับได้ใน Room Settings (โหมด PvP)

### 2.2 Cooldown System
- เมื่อได้ turn ผู้เล่นมีเวลาตอบ = **Cooldown Time**
- ค่าเริ่มต้นตามโหมดความยาก:
  - Easy: ไม่มี Cooldown (ตอบได้อิสระ)
  - Normal: 10 วินาที
  - Hard: 7 วินาที
- หาก Cooldown หมดโดยไม่ตอบ → ถือว่าตอบผิด (มอนสเตอร์โจมตี)
- ในโหมด PvP: ผู้สร้างห้องสามารถปรับ Cooldown เองได้

### 2.3 HP System (ผูกกับจำนวนข้อในชุดข้อสอบ)

**สูตรคำนวณ HP:**
```
Player Max HP = floor(total_questions × hp_ratio)

hp_ratio:
  Easy   → 0.6
  Normal → 0.35
  Hard   → 0.15

Monster HP per stage = max(20, ceil(questions_in_stage × difficulty_multiplier))
  difficulty_multiplier:
    Easy   → 2.0
    Normal → 3.0
    Hard   → 4.5

** Monster HP ขั้นต่ำ = 20 HP เสมอ ไม่ว่าชุดข้อสอบจะสั้นแค่ไหน
```

**ตัวอย่าง ชุดข้อสอบ 20 ข้อ (4 ข้อ/stage × 5 stage):**
| โหมด | Player HP | ผิดได้กี่ครั้ง | Monster HP/stage |
|---|---|---|---|
| Easy | 12 | 12 ครั้ง | 20 (ขั้นต่ำ) |
| Normal | 7 | 7 ครั้ง | 20 (ขั้นต่ำ) |
| Hard | 3 | 3 ครั้ง | 20 (ขั้นต่ำ) |

**ตัวอย่าง ชุดข้อสอบ 50 ข้อ (10 ข้อ/stage × 5 stage):**
| โหมด | Player HP | ผิดได้กี่ครั้ง | Monster HP/stage |
|---|---|---|---|
| Easy | 30 | 30 | 20 |
| Normal | 17 | 17 | 30 |
| Hard | 7 | 7 | 45 |

**ตอบถูก = โจมตีมอนสเตอร์:**
- ดาเมจพื้นฐานต่อ hit = ceil(Monster HP / questions_in_stage)
- → ตอบถูกทุกข้อใน stage = kill monster พอดี

**ตอบผิด = มอนสเตอร์โจมตีผู้เล่น:**
- ดาเมจ = 1 HP (Easy/Normal) หรือ 2 HP (Hard)

### 2.4 Streak & Skill System
- **Combo Streak**: ตอบถูกติดกัน → สะสม Skill Gauge (Mana Bar)
- ตอบถูก 3 ติดกัน → ปลด **Skill Lv.1** (ดาเมจพิเศษ)
- ตอบถูก 5 ติดกัน → ปลด **Ultimate Skill** (ดาเมจหนักหรือฟื้น HP)
- ท่าไม้ตายซื้อได้จาก Shop ด้วยเหรียญในเกม
- ตอบผิด 1 ครั้ง → Streak รีเซ็ต

---

## 3. 5-MONSTER STAGE DESIGN

### Stage 1 — Slime (ง่ายมาก)
- ไม่มี mechanic พิเศษ — เป็น tutorial stage โดยธรรมชาติ
- Bar Time: ช้า | คำถาม: easy

### Stage 2 — Goblin (ง่าย)
- **Shuffle Options**: สลับตำแหน่ง A/B/C/D ทุก turn
- Bar Time: ปกติ | คำถาม: easy-normal

### Stage 3 — Orc (กลาง)
- **Stun Bar**: ปล่อยสตัน หยุด Bar Time ผู้เล่น 2 วินาที
- มีท่าป้องกันสกิลนี้ได้ (ซื้อจาก Shop)
- Bar Time: ปกติ-เร็ว | Cooldown +2 วิ | คำถาม: normal

### Stage 4 — Dark Mage (กลาง-ยาก)
- **Blind**: บังตัวเลือก 1 ใน 4 ให้มองไม่เห็น 3 วิ
- หากตอบผิด → Counter โจมตีกลับ ดาเมจ ×2
- Bar Time: เร็ว | คำถาม: normal-hard

### Stage 5 — Boss (ยาก)
- Bar Time สั้นลงเรื่อยๆ ตาม HP ที่เหลือ
- ทุก 2 ตอบถูก Boss จะ **Rage** → เปลี่ยน pattern สุ่มใหม่
- **Decoy Option**: มีตัวเลือกที่ดูถูกแต่ผิด (คล้ายคำตอบมาก)
- **Vanishing Choices**: ตัวเลือกหายทีละตัวทุก 3 วิ
- **No-Miss Zone** (Hard เท่านั้น): ช่วง HP Boss เหลือน้อย — ตอบผิด = ตายทันที
- คำถาม: hard ทั้งหมด

---

## 4. GAME MODES

### Arcade Mode
- เล่นคนเดียว 5 stage ต่อเนื่อง
- บันทึกสถิติย้อนหลัง (ประวัติการเล่น)
- ได้รับเหรียญหลังชนะ

### PvP Mode (Future Phase 3)
- สร้างห้อง → ได้ Room Code → แชร์ให้เพื่อน
- ทั้งคู่ตอบคำถามชุดเดียวกัน turn-based พร้อมกัน
- Room Settings ปรับได้: Cooldown, HP, Bar Speed
- ใช้ Supabase Realtime (WebSocket) — ไม่ต้องเขียน Socket.io
- Game Logic validate บน Edge Function เท่านั้น (ป้องกัน cheat)
- Disconnect > 30 วิ = lose อัตโนมัติ

---

## 5. ECONOMY SYSTEM

### เหรียญในเกม (Coins)
- ได้จาก: ชนะ stage, Perfect Run bonus (ไม่พลาดเลย), Streak bonus
- ใช้ซื้อของใน Shop

### Shop (Phase 2 เป็นต้นไป)
| ประเภท | ตัวอย่าง |
|---|---|
| Character / Skin | เปลี่ยน sprite + animation ตีมอนสเตอร์ |
| Skill เพิ่มเติม | ท่า freeze บอส 5 วิ, ดาเมจกระจาย AoE |
| Passive Item | ลด Cooldown, เพิ่ม HP เริ่มต้น, ลดดาเมจรับ |

---

## 6. AI PROMPT GENERATOR

### Input Modes
1. **Topic Mode**: ระบุหัวข้อ + ระดับความยาก → ระบบสร้าง Master Prompt → user copy ไปวางใน AI
2. **Document Mode**: อัปโหลด PDF/TXT → ระบบดึง text → inject เข้า Master Prompt

### Master Prompt Template
```
You are a quiz generator for an educational RPG game called QuizSlayer.
Generate exactly {N} multiple choice questions based on the content/topic below.

Rules:
- Each question must have exactly 4 options (index 0-3)
- correct_index is 0-based (0=A, 1=B, 2=C, 3=D)
- Distribute difficulty: {easy_count} easy, {normal_count} normal, {hard_count} hard
- Return ONLY a valid JSON array. No explanation. No markdown. No extra text.

Topic/Content:
{user_input_or_document_text}

JSON format:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correct_index": 0,
    "difficulty": "easy",
    "explanation": "optional short explanation of correct answer"
  }
]
```

### การแบ่ง Call สำหรับชุดข้อสอบใหญ่
- **ฟิกที่ 20–30 ข้อ/call** (เพื่อไม่ให้ output token เกิน)
- ต้องการ 100 ข้อ → แบ่ง 4 calls × 25 ข้อ
- แต่ละ call ส่ง document chunk ต่างกัน (ถ้ามีเอกสาร)
- Merge JSON array ทั้งหมด → shuffle → assign stage → import ลง DB

### JSON Data Structure (เต็มรูปแบบ)
```json
{
  "quiz_id": "uuid",
  "created_at": "ISO8601",
  "source": "topic_input | document_upload",
  "questions": [
    {
      "id": 1,
      "stage": 1,
      "monster_name": "Slime",
      "question": "คำถาม...",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "difficulty": "easy | normal | hard",
      "explanation": "อธิบายเฉลย (optional)"
    }
  ]
}
```

---

## 7. TECH STACK

### Frontend
| Layer | เทคโนโลยี | หมายเหตุ |
|---|---|---|
| Framework | Vue 3 + Vite | stack หลักของ dev |
| Styling | TailwindCSS | Pixel UI, responsive |
| Game Engine | Phaser 3 | battle animation, sprite, timer |
| State | Pinia | official Vue 3 store |
| Routing | Vue Router 4 | standard |
| API Client | Supabase JS SDK | built-in, ไม่ต้องใช้ axios แยก |
| Realtime | Supabase Realtime | WebSocket สำหรับ PvP |

### Backend / Database
| Layer | เทคโนโลยี | หมายเหตุ |
|---|---|---|
| Database | Supabase PostgreSQL | JSON column, index, RLS |
| Auth | Supabase Auth | Email + Google OAuth |
| File Storage | Supabase Storage | เก็บ PDF/TXT ที่ user upload |
| Server Logic | Supabase Edge Functions | เรียก AI API อย่างปลอดภัย |
| AI API | Anthropic / OpenAI | เรียกจาก Edge Function เท่านั้น |

### Deployment
| Layer | เทคโนโลยี |
|---|---|
| Hosting | Vercel |
| CI/CD | GitHub → Vercel auto-deploy |

---

## 8. DATABASE SCHEMA (PostgreSQL / Supabase)

```sql
-- ผู้ใช้
users (id uuid PK, email, username, avatar_id FK, coins int default 0, created_at)

-- ชุดข้อสอบ
quiz_sets (id uuid PK, owner_id FK, title, source, is_public bool, created_at)

-- ข้อสอบรายข้อ
questions (
  id uuid PK,
  quiz_set_id FK,
  stage int,         -- 1-5
  question_text,
  options jsonb,     -- array 4 ตัว
  correct_index int, -- 0-3
  difficulty,
  explanation
)

-- session การเล่นแต่ละครั้ง
game_sessions (
  id uuid PK,
  player_id FK,
  quiz_set_id FK,
  mode,              -- 'arcade' | 'pvp'
  difficulty,
  score int,
  result,            -- 'win' | 'lose'
  monsters_cleared int,
  coins_earned int,
  played_at
)

-- ประวัติตอบรายข้อ
session_answers (
  id, session_id FK, question_id FK,
  chosen_index, is_correct, time_taken_ms
)

-- ห้อง PvP
pvp_rooms (
  id uuid PK,
  room_code char(6),
  host_id FK,
  guest_id FK,
  quiz_set_id FK,
  status,            -- 'waiting' | 'in_progress' | 'finished'
  settings jsonb,    -- { cooldown, hp_mode, bar_speed }
  created_at
)

-- ของในร้านค้า
shop_items (id uuid PK, type, name, price int, asset_key)

-- ของที่ user มี
user_inventory (user_id FK, item_id FK, acquired_at)
```

**Index ที่ต้องทำ:**
```sql
CREATE INDEX ON game_sessions(player_id);
CREATE INDEX ON questions(quiz_set_id);
CREATE INDEX ON pvp_rooms(room_code);
```

**Row Level Security (RLS) — ต้องเปิดทุกตาราง:**
- users: อ่านได้เฉพาะ row ของตัวเอง
- game_sessions: อ่าน/เขียนได้เฉพาะ player_id = auth.uid()
- quiz_sets: อ่านได้ถ้า is_public = true หรือ owner_id = auth.uid()

---

## 9. PERFORMANCE & SCALE NOTES

### Supabase Free Tier ขีดจำกัด
| ทรัพยากร | ขีดจำกัด | แนวทาง |
|---|---|---|
| Database | 500 MB | archive session_answers เก่ากว่า 90 วัน |
| API Requests | 2M/เดือน | เพียงพอสำหรับ MVP |
| Realtime | 200 concurrent | จำกัด PvP room พร้อมกัน |
| Storage | 1 GB | เก็บ PDF user upload |
| Edge Functions | 500K/เดือน | เพียงพอสำหรับ MVP |

### ป้องกันช้าเมื่อ user เยอะ
- เปิด **PgBouncer (Connection Pooling)** ใน Supabase dashboard
- Leaderboard: ใช้ **materialized view** หรือ cache ใน Pinia refresh ทุก 60 วิ (ไม่ query realtime)
- ตั้ง **retention policy**: ลบ session_answers เก่ากว่า 90 วัน, ลบ quiz_sets ที่ inactive เกิน 6 เดือน

### PvP — ข้อควรระวัง
- Game logic validate บน **Edge Function เท่านั้น** (ป้องกัน client-side cheat)
- Disconnect > 30 วิ = lose อัตโนมัติ
- ใช้ Supabase Broadcast channel ส่ง event ระหว่าง client โดยตรง

---

## 10. PIXEL ART ASSET SPECIFICATION

### หลักการทั่วไป
- สไตล์: **2D Pixel Art** — น่ารัก มีความเท่ ไม่ซับซ้อน
- Color palette: ใช้ **32 สีหรือน้อยกว่าต่อ sprite** เพื่อให้ดู pixel art จริงๆ
- Anti-aliasing: **ปิด** เสมอ (ห้าม smooth edge)
- Export: **PNG ใส (transparent background)** เสมอ ยกเว้น BG

---

### 10.1 Player Character Sprite Sheet

**Canvas Size:** 48×48 px ต่อ frame  
**Sheet Layout:** horizontal strip (frame ต่อ frame เรียงซ้ายไปขวา)

| Animation | Frame Count | FPS | รายละเอียด |
|---|---|---|---|
| **Idle** | 4 frames | 6 fps | หายใจ — ตัวขึ้น-ลงเล็กน้อย 1-2px, กระพริบตา frame 4 |
| **Attack** | 6 frames | 12 fps | วิ่งเข้า → ยกอาวุธ → ฟัน → ถอย → กลับ Idle |
| **Hit (Light)** | 3 frames | 10 fps | ตัวสั่น, flash สีขาว 1 frame |
| **Hit (Heavy)** | 5 frames | 10 fps | ตัวปลิว 3-4px ไปด้านหลัง + knockback dust |
| **Skill Cast** | 5 frames | 10 fps | ท่าชาร์จ → เอฟเฟกต์แสง → ปล่อยท่า |
| **Ultimate** | 8 frames | 12 fps | pose + aura ล้อมรอบ → โจมตีรุนแรง → landing |
| **Death** | 6 frames | 8 fps | ล้มลง → fade out หรือ ×_× expression |
| **Victory** | 4 frames | 6 fps | กระโดด หรือ ชูกำปั้น |

**Sprite Sheet ตัวอย่าง layout:**
```
[Idle 1][Idle 2][Idle 3][Idle 4] ← row 0
[Atk 1][Atk 2][Atk 3][Atk 4][Atk 5][Atk 6] ← row 1
[HitL1][HitL2][HitL3] ← row 2
[HitH1][HitH2][HitH3][HitH4][HitH5] ← row 3
[Skill1][Skill2][Skill3][Skill4][Skill5] ← row 4
[Ult1]..[Ult8] ← row 5
[Death1]..[Death6] ← row 6
[Win1]..[Win4] ← row 7
```

---

### 10.2 Monster Sprite Sheet

**Canvas Size:** 64×64 px ต่อ frame (มอนสเตอร์ใหญ่กว่า player)  
**Boss:** 96×96 px

| Animation | Frame Count | FPS | รายละเอียด |
|---|---|---|---|
| **Idle** | 4 frames | 6 fps | ลอยขึ้น-ลง 1-2px หรือ หายใจ, ตาขยิบ |
| **Angry / Rage** | 4 frames | 8 fps | สีเปลี่ยน (shift สีแดงขึ้น), ตัวสั่นเล็กน้อย |
| **Attack** | 5 frames | 12 fps | ยืดแขน/กรงเล็บ → ฟาด → ดึงกลับ |
| **Hit** | 3 frames | 10 fps | flash สีขาว + ตัวสั่น |
| **Death** | 6 frames | 8 fps | ล้มลง → สลายเป็น pixel กระจาย |
| **Special Skill** | 6 frames | 10 fps | ชาร์จ aura → ปล่อยท่า (Stun, Blind ฯลฯ) |

**Monster ทั้ง 5 ตัว — Palette แนะนำ:**
| Stage | Monster | สีหลัก | สีเด่น |
|---|---|---|---|
| 1 | Slime | เขียวอ่อน | เขียวเข้ม |
| 2 | Goblin | เขียวมะกอก | น้ำตาลดิน |
| 3 | Orc | เทาเขียว | น้ำตาลเข้ม |
| 4 | Dark Mage | ม่วงเข้ม | ทอง |
| 5 | Boss | แดงเข้ม/ดำ | ส้มไฟ |

---

### 10.3 Background (BG) ต่อ Stage

**Size:** 480×270 px (16:9, ×2 จาก game canvas 240×135)  
**Layer:** แยกเป็น 2-3 layer สำหรับ parallax scrolling

| Stage | Scene | Palette หลัก | องค์ประกอบ |
|---|---|---|---|
| 1 | ทุ่งหญ้า กลางวัน | เขียว, ฟ้าอ่อน | เมฆขยับ, หญ้าแกว่ง |
| 2 | ป่าไม้ เย็น | เขียวเข้ม, น้ำตาล | ใบไม้ร่วง, แสงลอดต้นไม้ |
| 3 | ถ้ำหิน | เทา, น้ำตาลเข้ม | หิน, torchlight กะพริบ |
| 4 | หอคอยมนต์ | ม่วงเข้ม, น้ำเงิน | rune glow, เมฆลอย |
| 5 (Boss) | ห้องบัลลังก์มืด | ดำ, แดง, ทอง | เปลวไฟ, particle ลอย |

**BG Layer Structure:**
```
Layer 0 (Farthest): sky / solid color gradient
Layer 1 (Mid): hills / trees / structures — parallax 0.3x
Layer 2 (Near): ground / platform — parallax 0.6x
Layer 3 (Foreground): อุปกรณ์ต่อสู้, pillars — parallax 1x
```

---

### 10.4 UI Sprites

**HP Bar:**
- ขนาด: 64×8 px (fill bar)
- 3 สี: สีเขียว (>50%), เหลือง (25-50%), แดง (<25%)
- มี border/frame แยก 1 ชั้น

**Skill / Mana Gauge:**
- ขนาด: 48×6 px
- สี: ฟ้า → ม่วง เมื่อเต็ม

**Bar Time Gauge:**
- ขนาด: 80×6 px (กว้างกว่า HP bar)
- สี: ขาว / เหลือง เมื่อใกล้เต็ม

**Coin Icon:** 16×16 px (สีทอง, หมุน 4 frame)

**Damage Number Font:** Pixel font ขนาด 8px ขึ้นไป สีแดง (ผู้เล่นโดน) / สีเหลือง (มอนสเตอร์โดน)

---

## 11. AI IMAGE PROMPT TEMPLATES (สำหรับ Midjourney / DALL-E / Stable Diffusion)

### หลักการ Prompt Pixel Art
```
[subject description], pixel art, 2D sprite, [color palette], 
transparent background, 16-bit style, cute but cool, 
game asset, no anti-aliasing, crisp edges, [size]px sprite
```

---

### 11.1 Player Character

**Idle Pose:**
```
chibi warrior character, idle standing pose, pixel art, 2D game sprite, 
pastel blue armor, white scarf, small sword at side, slight bounce animation frame, 
transparent background, 48x48px, cute but cool, 16-bit RPG style, 
crisp pixel edges, no anti-aliasing, no gradients
```

**Attack Pose:**
```
chibi warrior character, mid-attack swing pose, sword raised overhead, 
motion blur pixel trail, pixel art, 2D game sprite, 48x48px, 
blue armor, dynamic action pose, transparent background, 
16-bit style, crisp edges, game asset
```

**Hit (Heavy) Pose:**
```
chibi warrior character, taking heavy damage, knocked back pose, 
leaning backward, white flash overlay, pixel art, 2D game sprite, 48x48px, 
blue armor, pain expression, transparent background, 16-bit RPG style
```

**Ultimate Skill Pose:**
```
chibi warrior character, ultimate skill activation, golden aura surrounding body, 
arms spread wide, glowing eyes, dramatic pose, pixel art, 2D game sprite, 48x48px, 
blue and gold armor, particle effects, transparent background, 16-bit style
```

---

### 11.2 Monster — Slime (Stage 1)

```
cute green slime monster, pixel art, 2D game sprite, 64x64px, 
round blob shape, big eyes, slightly menacing but cute, 
lime green body with darker green outline, 
transparent background, 16-bit RPG style, game asset, no anti-aliasing
```

**Angry/Rage variant:**
```
angry green slime monster, rage mode, pixel art, 2D game sprite, 64x64px, 
red-tinted green color, furrowed brows, small sharp teeth showing, 
trembling/shaking frame, transparent background, 16-bit RPG style
```

---

### 11.3 Monster — Boss (Stage 5)

```
dark demon boss monster, massive intimidating figure, 
pixel art, 2D game sprite, 96x96px, 
deep crimson and black armor, glowing orange eyes, 
large horns, fire particles around body, 
transparent background, 16-bit RPG style, game asset, 
dramatic and cool, no anti-aliasing, crisp edges
```

**Rage Mode:**
```
dark demon boss monster, enrage phase, pixel art, 2D game sprite, 96x96px, 
body glowing red-orange, cracked armor with light escaping, 
aura flaring outward, intense expression, 
transparent background, 16-bit RPG style
```

---

### 11.4 Background — Stage 1 (ทุ่งหญ้า)

```
pixel art background, 2D RPG game scene, peaceful grassland daytime, 
rolling green hills, blue sky with fluffy pixel clouds, 
small pixel trees in distance, warm sunlight, 
480x270px, 16-bit style, tiled-ready, no characters, 
vibrant color palette, game background asset
```

### 11.5 Background — Stage 5 (Boss Room)

```
pixel art background, 2D RPG game scene, dark throne room, 
black stone walls, large glowing red runes on floor, 
flickering torch flames, dark purple sky visible through broken windows, 
ominous atmosphere, 480x270px, 16-bit style, 
dramatic dark color palette, game background asset, no characters
```

---

## 12. DEVELOPMENT ROADMAP

```
Phase 1 — MVP (1-2 เดือน)
├── Battle system: HP, Bar Time, Cooldown, 4 ตัวเลือก, Streak gauge
├── 5 monster stages + basic patterns
├── Prompt Generator (Topic Mode)
├── Auth (Email + Google OAuth)
├── บันทึก game_sessions + ประวัติการเล่น
└── Deploy บน Vercel

Phase 2 — Content & Economy (1-2 เดือน)
├── Document Upload Mode (PDF/TXT → AI → JSON)
├── Leaderboard (top 10 per quiz_set)
├── Coin system (earn + balance display)
├── Shop UI (character skin)
└── Boss special mechanics (Decoy, Vanishing, No-Miss Zone)

Phase 3 — Social & PvP (2-3 เดือน)
├── PvP Room (room code → share → battle)
├── Room settings (cooldown, HP, bar_speed ปรับเองได้)
├── Skill shop (passive items, ultimate skills)
├── Mobile UI optimization
└── Performance tuning (index, cache, pooling)
```

---

## 13. HOW TO USE THIS SKILL.md

เมื่อต้องการให้ AI ช่วยพัฒนาส่วนใดส่วนหนึ่ง ให้แนบไฟล์นี้พร้อมระบุว่า:

```
Context: ใช้ QUIZSLAYER_SKILL.md นี้เป็น reference หลัก
Task: [สิ่งที่ต้องการ เช่น "สร้าง Vue component สำหรับ Battle Screen"]
Constraints: [ข้อจำกัดเพิ่มเติม ถ้ามี]
```

**ตัวอย่าง Task ที่ใช้ได้:**
- "สร้าง Pinia store สำหรับ battle state ตาม mechanics ใน SKILL.md"
- "เขียน Supabase Edge Function สำหรับ validate คำตอบ PvP"
- "ออกแบบ Vue component HP Bar ที่ scale ตาม HP System ในข้อ 2.3"
- "เขียน Master Prompt สำหรับ Document Mode ตาม section 6"
- "สร้าง Phaser 3 scene สำหรับ battle animation ของ Stage 1"
