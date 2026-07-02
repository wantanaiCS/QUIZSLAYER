# QuizSlayer 🗡️

> Educational RPG Web Game — ต่อสู้กับมอนสเตอร์ด้วยการตอบคำถาม

[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-4.5-646cff?logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3FCF8E?logo=supabase)](https://supabase.com)
[![Phaser](https://img.shields.io/badge/Phaser-4.1-EC5F2C)](https://phaser.io)

## 🎮 Overview

**QuizSlayer** เป็น Educational RPG ที่ผสมผสานการเรียนรู้เข้ากับความสนุกของเกม RPG ผู้เล่นต่อสู้กับมอนสเตอร์ 5 ตัวโดยการตอบคำถาม 4 ตัวเลือกแบบ turn-based พร้อมระบบ **Dynamic Bar Time** ที่ทำให้ทุกการต่อสู้เร้าใจและไม่เหมือนเดิม

### ✨ Key Features

- 🎯 **3 Game Modes**: Solo Battle (PvE), PvP Battle (Real-time), FREE Mode (Practice)
- ⚔️ **Dynamic Battle System**: Bar Time, Streak Combo, Skill Gauge, และระบบ HP ที่ปรับตามความยาก
- 🤖 **AI Quiz Generator**: สร้างชุดคำถามด้วย AI จากหัวข้อหรืออัปโหลดเอกสาร
- 👥 **Real-time PvP**: ต่อสู้กับเพื่อนแบบ real-time ผ่าน Supabase Realtime (WebSocket)
- 🎁 **Lucky Box System**: รับไอเทมพิเศษทุก 5 ข้อในโหมด PvP
- 📊 **Battle History**: ติดตามสถิติและประวัติการเล่นทั้งหมด
- 🎨 **Phaser 3 Animation**: กราฟิก 2D Pixel Art สไตล์ Cute & Cool
- 🔐 **Authentication**: Email/Password + Google OAuth


---

## ⚡ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Vue 3 (Composition API) | 3.5.34 |
| **Build Tool** | Vite | 4.5.14 ⚠️ |
| **Styling** | TailwindCSS | 3.4.19 |
| **Game Engine** | Phaser | 4.1.0 |
| **State Management** | Pinia | 3.0.4 |
| **Routing** | Vue Router | 4.6.4 |
| **Backend** | Supabase (PostgreSQL) | 2.108.1 |
| **Real-time** | Supabase Realtime | WebSocket |
| **Auth** | Supabase Auth | Email + OAuth |
| **Deployment** | Vercel | — |

> ⚠️ **Critical**: โปรเจกต์นี้ **ต้องใช้ Vite 4.5.14** เท่านั้น เนื่องจากตัวแปรโฟลเดอร์มีอักขระ `#` (Windows path issue)  
> ดูรายละเอียดใน [project-context.md](.kiro/steering/project-context.md)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm หรือ yarn
- Supabase Account (free tier)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/wantanaiCS/QUIZSLAYER.git
cd QUIZSLAYER

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# แก้ไข .env ใส่ค่าดังนี้:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 4. Setup Supabase Database
# ไปที่ Supabase Dashboard → SQL Editor
# รันไฟล์ตามลำดับ:
# - supabase/schema.sql (หลัก)
# - supabase/migrations/add_free_mode.sql (FREE mode)
# - supabase/pvp_setup.sql (PvP mode)

# 5. Run development server
npm run dev
```


**เปิดเบราว์เซอร์ที่**: `http://127.0.0.1:5173`

> 💡 **หมายเหตุ**: `npm run dev` จะทำการ build ก่อน แล้วเริ่ม preview server (ไม่ใช่ hot-reload dev mode)  
> เมื่อแก้ไขโค้ด ต้องรันคำสั่งใหม่ทุกครั้ง

---

## 🎯 Game Modes

### 1. 🗡️ Solo Mode (Arcade)
เล่นคนเดียว ต่อสู้กับมอนสเตอร์ 5 ตัวต่อเนื่อง

**Features:**
- เลือกชุดคำถามและระดับความยาก (Easy/Normal/Hard)
- ระบบ HP ปรับตามความยาก (Easy: 60%, Normal: 35%, Hard: 15%)
- Streak System: ตอบถูกติดกัน 3 ข้อ → Skill | 5 ข้อ → Ultimate
- บันทึกประวัติและคะแนน
- รับเหรียญเมื่อชนะ

### 2. ⚔️ PvP Mode (Real-time Battle)
ต่อสู้กับเพื่อนแบบ real-time ผ่าน WebSocket

**Features:**
- สร้างห้องและแชร์ Room Code (6 ตัวอักษร)
- ปรับแต่ง Room Settings: Turn Timer, HP Mode, Bar Speed
- **Rock-Paper-Scissors**: เลือกผู้เริ่มก่อน (เสมอ → เป่าใหม่)
- **Lucky Box**: ทุก 5 ข้อ รับไอเทมพิเศษ (HP+, Damage+, Shield)
- **Turn Timer**: นับถอยหลัง ไม่ตอบ = ตอบผิดอัตโนมัติ
- **Rematch**: เล่นใหม่ได้ทันทีหลังจบเกม
- Real-time Sync ผ่าน Supabase Broadcast

### 3. 📝 FREE Mode (Practice)
ฝึกทำข้อสอบไม่จำกัดครั้ง ไม่มีเหรียญ

**Features:**
- ไม่มีมอนสเตอร์ ไม่มี HP
- เน้นฝึกและท่องจำคำถาม
- บันทึกประวัติและเปอร์เซ็นต์ความถูกต้อง
- ไม่ได้รับเหรียญ (protected 3 layers)

---

## ⚔️ Battle Mechanics

### Dynamic Bar Time System
```
ผู้เล่น [████████░░] 80%
มอนสเตอร์ [█████░░░░░] 50%
→ ผู้เล่นถึง 100% ก่อน → ได้ turn ก่อน
```

- **ไม่ใช่ Turn-Based แบบเดิม**: ใครเติม Bar ได้เร็วกว่าได้ turn ก่อน
- **Streak Bonus**: ตอบถูกติดกัน → Bar เร็วขึ้น + ดาเมจเพิ่ม
- **Monster Attack**: ถ้า Bar มอนสเตอร์เต็มก่อน → โจมตีผู้เล่นอัตโนมัติ

### HP System

**Player HP Formula:**
```
Player Max HP = floor(total_questions × hp_ratio)

hp_ratio:
  Easy   → 0.6  (ผิดได้ 60% ของจำนวนข้อ)
  Normal → 0.35 (ผิดได้ 35%)
  Hard   → 0.15 (ผิดได้ 15%)
```

**Monster HP Formula:**
```
Monster HP = max(20, ceil(questions_per_stage × difficulty_multiplier))

difficulty_multiplier:
  Easy   → 2.0
  Normal → 3.0
  Hard   → 4.5
```

**Damage:**
- ✅ ตอบถูก → โจมตีมอนสเตอร์ (ดาเมจปรับตาม Streak)
- ❌ ตอบผิด → โดน 1 HP (Easy/Normal) หรือ 2 HP (Hard)

### Cooldown System

เมื่อถึง turn มีเวลาตอบจำกัด:

| Mode | Cooldown | หมายเหตุ |
|---|---|---|
| **Easy** | ไม่จำกัด | ตอบได้ช้าสบายๆ |
| **Normal** | 10 วินาที | เหมาะกับผู้เล่นทั่วไป |
| **Hard** | 7 วินาที | ท้าทาย! |
| **PvP** | ปรับเองได้ | Host ตั้งได้ 0-60 วินาที |

> ⏱️ หมดเวลา → ถือว่าตอบผิด


### Streak & Skill System

```
Streak Counter: [●●●○○]

3 ติดกัน → ⚡ Skill Lv.1 (ดาเมจพิเศษ)
5 ติดกัน → 💥 Ultimate Skill (ดาเมจหนักหรือฟื้น HP)
```

- **Combo Streak**: ตอบถูกติดกัน → สะสม Skill Gauge
- **Skill Shop** (Phase 3): ซื้อท่าไม้ตายเพิ่มด้วยเหรียญ
- ตอบผิด 1 ครั้ง → Streak รีเซ็ต (กลับเป็น 0)

---

## 🎁 Lucky Box System (PvP Only)

ทุก 5 ข้อในโหมด PvP จะมี Lucky Box ให้เลือก

```
┌─────┐ ┌─────┐ ┌─────┐
│  ❓  │ │  ❓  │ │  ❓  │
└─────┘ └─────┘ └─────┘
```

**ไอเทมที่มี:**
- 💊 **Double HP**: ฟื้น HP ×2
- ⚡ **Lightning Strike**: ดาเมจเพิ่ม ×1.5
- 🛡️ **Shield**: ลดดาเมจรับ 50%
- ⏱️ **Time Freeze**: ตอบช้าได้ +5 วินาที
- 🔥 **Critical Hit**: ดาเมจครั้งต่อไป ×2

**Flow:**
1. **Preview** → เห็นไอเทมทั้ง 3 แบบไม่เปิด
2. **Description** → อ่านคำอธิบายก่อนเลือก
3. **Confirm** → ยืนยันแล้วใช้ทันที

---

## 🤖 AI Quiz Generator

สร้างชุดคำถามด้วย AI ผ่าน **Master Prompt** ที่ออกแบบมาให้ได้ JSON ที่ใช้งานได้เลย

### Input Modes

1. **Topic Mode**: พิมพ์หัวข้อ + เลือกความยาก → ระบบสร้าง Master Prompt
2. **Document Mode** (Phase 2): อัปโหลด PDF/TXT → inject เข้า Master Prompt

### Master Prompt Template

```
You are a quiz generator for QuizSlayer RPG game.
Generate exactly {N} multiple choice questions.

Rules:
- Each question: 4 options (index 0-3)
- correct_index is 0-based (0=A, 1=B, 2=C, 3=D)
- Distribute correct_index evenly (NOT all A or all D)
- Distribute difficulty: {easy_count} easy, {normal_count} normal, {hard_count} hard
- Return ONLY valid JSON array. No markdown. No explanation.

Topic: {user_input}

JSON format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0,
    "difficulty": "easy",
    "explanation": "optional short explanation"
  }
]
```

### Answer Shuffle Protection

- **Fisher-Yates Shuffle**: ทุกชุดคำถามจะถูกสับ options อัตโนมัติ
- **Seeded Shuffle**: ใช้ seed + timestamp → คำถามออกมาไม่เหมือนเดิม
- ป้องกัน AI สร้างคำตอบซ้ำที่ตำแหน่งเดียว (เช่น ถูกทุกข้อที่ A)

---

## 📁 Project Structure

```
QUIZSLAYER/
├── public/
│   ├── assets/                 # Phaser sprites
│   │   ├── orc/                # Orc animations (6 states)
│   │   └── soldier/            # Soldier animations (4 states)
│   ├── bg_01.png ~ bg_05.png   # Background per stage
│   └── icons.svg               # UI icon sprite
│
├── src/
│   ├── views/                  # Page Components
│   │   ├── HomeView.vue        # หน้าแรก + menu
│   │   ├── BattleView.vue      # Solo battle
│   │   ├── PvPLobbyView.vue    # PvP lobby (create/join)
│   │   ├── PvPBattleView.vue   # PvP battle + RPS + Lucky Box
│   │   ├── FreeView.vue        # FREE mode practice
│   │   ├── HistoryView.vue     # Battle history
│   │   ├── ProfileView.vue     # User profile
│   │   ├── QuizGeneratorView.vue # AI Quiz Generator
│   │   └── LoginView.vue       # Auth (Email + Google)
│   │
│   ├── stores/                 # Pinia State Management
│   │   ├── authStore.js        # User auth + session
│   │   ├── battleStore.js      # Solo battle logic
│   │   ├── pvpStore.js         # PvP real-time sync
│   │   ├── quizStore.js        # Quiz CRUD + shuffle
│   │   ├── playerStore.js      # Player stats + history
│   │   └── achievementStore.js # Achievements (future)
│   │
│   ├── components/
│   │   ├── battle/             # Battle UI components
│   │   │   ├── HPBar.vue       # HP bar with color transition
│   │   │   ├── BarTime.vue     # Dynamic turn bar
│   │   │   ├── QuestionCard.vue # Question + 4 options
│   │   │   └── SkillGauge.vue  # Streak meter
│   │   │
│   │   ├── pvp/                # PvP components
│   │   │   ├── PlayerCard.vue  # Player info + HP
│   │   │   ├── RPSPicker.vue   # Rock Paper Scissors
│   │   │   ├── LuckyBox.vue    # Lucky box selector
│   │   │   └── RematchOverlay.vue # Rematch UI
│   │   │
│   │   ├── quiz/               # Quiz management
│   │   │   ├── QuizCard.vue    # Quiz set card
│   │   │   ├── ShareDialog.vue # Share quiz dialog
│   │   │   └── TagManager.vue  # Tag editor
│   │   │
│   │   └── ui/                 # Reusable UI
│   │       ├── GameIcon.vue    # SVG icon wrapper
│   │       ├── ToastProvider.vue # Toast notifications
│   │       └── ConfirmDialog.vue # Confirm modal
│   │
│   ├── lib/
│   │   ├── supabase.js         # Supabase client + mock mode
│   │   └── phaser/
│   │       ├── BattleScene.js  # Solo battle scene
│   │       ├── PvPScene.js     # PvP battle scene
│   │       └── config.js       # Phaser config
│   │
│   ├── utils/
│   │   └── battleCalculator.js # HP, damage, bar speed formulas
│   │
│   ├── router/
│   │   └── index.js            # Vue Router routes
│   │
│   ├── App.vue                 # Root component
│   ├── main.js                 # App entry point
│   └── style.css               # Global Tailwind + custom CSS
│
├── supabase/
│   ├── schema.sql              # Main database schema
│   ├── pvp_setup.sql           # PvP tables + RLS
│   └── migrations/
│       └── add_free_mode.sql   # FREE mode migration
│
├── .env.example                # Environment template
├── vite.config.js              # Vite 4.5.14 config
├── tailwind.config.js          # Tailwind config
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Users
users (
  id uuid PK,
  email text,
  username text,
  avatar_id int,
  coins int default 0,
  created_at timestamp
)

-- Quiz Sets
quiz_sets (
  id uuid PK,
  owner_id uuid FK → users,
  title text,
  source text,            -- 'topic_input' | 'document_upload'
  is_public boolean,
  created_at timestamp
)

-- Questions
questions (
  id uuid PK,
  quiz_set_id uuid FK → quiz_sets,
  stage int,              -- 1-5 (stage number)
  question_text text,
  options jsonb,          -- ["A", "B", "C", "D"]
  correct_index int,      -- 0-3
  difficulty text,        -- 'easy' | 'normal' | 'hard'
  explanation text
)

-- Game Sessions
game_sessions (
  id uuid PK,
  player_id uuid FK → users,
  quiz_set_id uuid FK → quiz_sets,
  mode text,              -- 'solo' | 'pvp' | 'free'
  difficulty text,
  score int,
  result text,            -- 'win' | 'lose'
  monsters_cleared int,
  coins_earned int,
  played_at timestamp
)

-- PvP Tables
pvp_rooms (
  id uuid PK,
  room_code char(6),
  host_id uuid FK → users,
  guest_id uuid FK → users,
  quiz_set_id uuid FK → quiz_sets,
  status text,            -- 'waiting' | 'rps' | 'playing' | 'lucky_box' | 'finished'
  settings jsonb,         -- { turnTimeLimit, hpMode, barSpeed }
  created_at timestamp
)

pvp_sessions (
  id uuid PK,
  room_id uuid FK → pvp_rooms,
  winner_id uuid FK → users,
  final_hp_host int,
  final_hp_guest int,
  total_questions int,
  finished_at timestamp
)
```

### Indexes (Performance)

```sql
CREATE INDEX idx_game_sessions_player ON game_sessions(player_id);
CREATE INDEX idx_questions_quiz_set ON questions(quiz_set_id);
CREATE INDEX idx_pvp_rooms_code ON pvp_rooms(room_code);
CREATE INDEX idx_pvp_rooms_status ON pvp_rooms(status);
```

### Row Level Security (RLS)

- ✅ **เปิดทุกตาราง**
- ผู้ใช้อ่าน/เขียนได้เฉพาะข้อมูลของตัวเอง
- `quiz_sets`: อ่านได้ถ้า `is_public = true` หรือ `owner_id = auth.uid()`

---

## 🔧 Configuration

### Environment Variables

```env
# Supabase Config
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: AI API Keys (for future quiz generator)
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### Mock Mode

ถ้าไม่มี Supabase credentials → `isMockMode = true` → ใช้ localStorage

- ✅ ทดสอบ UI ได้โดยไม่ต้องตั้ง DB
- ✅ ใช้งาน Quiz Generator ได้
- ❌ ไม่มี Auth (ใช้ mock user)
- ❌ ไม่มี PvP (ต้องมี Realtime)

### Vite Config (IMPORTANT!)

```js
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  // ไม่ต้องมี workaround พิเศษ
  // Vite 4.5.14 + preview mode แก้ปัญหา # ใน path แล้ว
})
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite build && vite preview --host 127.0.0.1",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

> ⚠️ **อย่าเปลี่ยน** `dev` script เป็น `"vite"` จะทำงานไม่ได้เพราะ path issue

---

## 🎨 UI Design

### Theme

- **สไตล์**: 2D Pixel Art — Cute but Cool
- **Palette**: 32 สีหรือน้อยกว่า (Pixel Art style)
- **Font**: Pixel-inspired สำหรับ damage numbers

### Sprite Specifications

| Asset | Size | Frames | FPS |
|---|---|---|---|
| **Player** | 48×48px | 4-8 frames/animation | 6-12 fps |
| **Monster** | 64×64px | 4-6 frames/animation | 6-10 fps |
| **Boss** | 96×96px | 6-8 frames/animation | 8-12 fps |
| **Background** | 480×270px | 2-3 layers (parallax) | — |

### Animations

**Player States:**
- Idle, Attack, Hit (Light), Hit (Heavy), Skill Cast, Ultimate, Death, Victory

**Monster States:**
- Idle, Angry/Rage, Attack, Hit, Death, Special Skill

---

## 🚀 Deployment

### Build for Production

```bash
# 1. Build
npm run build

# 2. Test production build locally
npm run preview

# 3. Deploy to Vercel
# - Connect GitHub repo
# - Auto-deploy on push to main
# - Add environment variables in Vercel dashboard
```

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### Performance Tips

- ✅ Enable **PgBouncer** (Connection Pooling) in Supabase
- ✅ Cache leaderboard queries (refresh ทุก 60 วิ)
- ✅ Archive old `game_sessions` (เก่ากว่า 90 วัน)
- ✅ Optimize images: WebP format สำหรับ backgrounds
- ✅ Use CDN สำหรับ static assets

---

## 🧪 Testing Checklist

### Solo Mode
- [ ] สร้างชุดคำถามใหม่ → เล่นได้
- [ ] เลือก Easy/Normal/Hard → HP ถูกต้อง
- [ ] Streak System → Skill Gauge เติม
- [ ] ตอบผิด → HP ลด
- [ ] ชนะ → บันทึก history + ได้เหรียญ
- [ ] แพ้ → บันทึก history + ไม่ได้เหรียญ

### PvP Mode
- [ ] สร้างห้อง → ได้ Room Code
- [ ] คัดลอก Code → เข้าห้องได้
- [ ] RPS Round → ผลลัพธ์ตรงกันทั้ง 2 ฝ่าย
- [ ] Battle → Turn switching ถูกต้อง
- [ ] HP Sync → real-time update
- [ ] Lucky Box (ข้อที่ 5) → ทั้ง 2 ฝ่ายเห็นเหมือนกัน
- [ ] Timer → countdown ถูกต้อง
- [ ] Disconnect → จัดการได้

### FREE Mode
- [ ] เลือกชุดคำถาม → เล่นได้
- [ ] ตอบคำถาม → บันทึก history
- [ ] ไม่ได้เหรียญ (protected)
- [ ] แสดงเปอร์เซ็นต์ความถูกต้อง

### History
- [ ] แสดง Solo sessions
- [ ] แสดง PvP sessions
- [ ] แสดง FREE sessions (ป้าย "FREE" สีเขียว)
- [ ] Filter by mode

---

## 🗺️ Roadmap

### ✅ Phase 1 — MVP (Completed)
- [x] Battle system: HP, Bar Time, Cooldown, Streak
- [x] 5 monster stages (basic patterns)
- [x] AI Quiz Generator (Topic Mode)
- [x] Auth (Email + Google OAuth)
- [x] Battle History
- [x] FREE Mode (practice)
- [x] **PvP Mode** (real-time battle)
- [x] **Lucky Box System**
- [x] Deployed on Vercel

### 🚧 Phase 2 — Content & Economy (In Progress)
- [ ] Document Upload Mode (PDF/TXT → AI → JSON)
- [ ] Leaderboard (top players per quiz)
- [ ] Coin System (economy balance)
- [ ] Shop UI (character skins)
- [ ] Boss Special Mechanics (Decoy, Vanishing, No-Miss)
- [ ] Achievement System

### 🔮 Phase 3 — Advanced Features
- [ ] Advanced PvP Room Settings
- [ ] Skill Shop (passive items, ultimate skills)
- [ ] Mobile UI Optimization
- [ ] Performance Tuning (index, cache, pooling)
- [ ] Tournament Mode (bracket system)
- [ ] Clan/Guild System

---

## 📚 Documentation

| Document | Description |
|---|---|
| [QUIZSLAYER_SKILL.md](./QUIZSLAYER_SKILL.md) | 📖 Complete project spec (must-read for AI) |
| [AI_QUIZ_GENERATOR_GUIDE.md](./AI_QUIZ_GENERATOR_GUIDE.md) | 🤖 AI quiz generation guide |
| [FREE_MODE_HISTORY_SETUP.md](./FREE_MODE_HISTORY_SETUP.md) | 📝 FREE mode setup guide |
| [PVP_QUICK_START.md](./PVP_QUICK_START.md) | ⚔️ PvP quick start (15 min) |
| [PVP_DEPLOYMENT_GUIDE.md](./PVP_DEPLOYMENT_GUIDE.md) | 🚀 PvP full deployment guide |
| [PVP_TESTING_CHECKLIST.md](./PVP_TESTING_CHECKLIST.md) | ✅ PvP testing checklist |
| [PVP_TROUBLESHOOTING.md](./PVP_TROUBLESHOOTING.md) | 🔧 PvP troubleshooting |

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Failed to load url /src/main.js"
**สาเหตุ**: Vite 5.x ไม่รองรับ `#` character ใน Windows path

**แก้ไข**:
```bash
# 1. ตรวจสอบ Vite version
npm list vite
# ต้องเป็น 4.5.14

# 2. ถ้าไม่ใช่ ติดตั้งใหม่
npm install vite@4.5.14 @vitejs/plugin-vue@4.6.2 --save-dev

# 3. ตรวจสอบ package.json
# "dev": "vite build && vite preview --host 127.0.0.1"

# 4. ตรวจสอบ index.html
# <script type="module" src="./src/main.js"></script>
# ต้องเป็น relative path (./) ไม่ใช่ absolute (/)
```

#### ❌ "value 'free' violates check constraint"
**สาเหตุ**: ยังไม่รัน FREE mode migration

**แก้ไข**:
```sql
-- ไปที่ Supabase SQL Editor
-- รันไฟล์: supabase/migrations/add_free_mode.sql
BEGIN;
ALTER TABLE game_sessions DROP CONSTRAINT game_sessions_mode_check;
ALTER TABLE game_sessions ADD CONSTRAINT game_sessions_mode_check 
  CHECK (mode IN ('solo','pvp','free'));
COMMIT;
```

#### ❌ PvP Room Code ไม่ทำงาน
**สาเหตุ**: Realtime publication ยังไม่เปิด

**แก้ไข**:
1. Supabase Dashboard → Database → Publications
2. เลือก `supabase_realtime`
3. Toggle `pvp_rooms` = **ON**
4. Click **Save**

#### ❌ "Cannot read property of undefined" in PvP
**สาเหตุ**: Store state ยังไม่ initialize

**แก้ไข**:
- Hard refresh (Ctrl+Shift+R)
- Clear localStorage
- ตรวจสอบ Network tab → Realtime connection = connected

---

## 🤝 Contributing

เรายินดีรับ contributions! สำหรับการพัฒนาใหม่:

1. Fork repo นี้
2. สร้าง branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. เปิด Pull Request

### Development Guidelines

- ใช้ **Composition API** (ไม่ใช่ Options API)
- ตั้งชื่อ component แบบ **PascalCase** (เช่น `BattleView.vue`)
- ใช้ **Tailwind classes** แทน custom CSS เมื่อเป็นไปได้
- เพิ่ม comment สำหรับ logic ที่ซับซ้อน
- Test บน **2 devices** สำหรับ PvP features

---

## 📊 Performance & Scale

### Supabase Free Tier Limits

| Resource | Limit | Strategy |
|---|---|---|
| Database | 500 MB | Archive old sessions (>90 days) |
| API Requests | 2M/month | Sufficient for MVP |
| Realtime | 200 concurrent | Limit PvP rooms |
| Storage | 1 GB | Store user-uploaded PDFs |
| Edge Functions | 500K/month | Sufficient for MVP |

### Optimization Strategies

1. **Connection Pooling**: เปิด PgBouncer ใน Supabase
2. **Leaderboard Cache**: Refresh ทุก 60 วิ (ไม่ query real-time)
3. **Data Retention**: ลบ sessions เก่ากว่า 90 วัน, quiz_sets ไม่ใช้งาน > 6 เดือน
4. **Asset Optimization**: ใช้ WebP, lazy load images
5. **PvP Validation**: Logic validate บน Edge Function (ป้องกัน cheat)

---

## 🔐 Security

### Client-Side Protection
- RPS picks → committed ก่อนเผย (ไม่ให้เห็นก่อนเวลา)
- Answer validation → ส่ง hash แทน index
- Item usage → validate บน backend

### Server-Side Protection (Future)
- Edge Function validate PvP results
- Rate limiting (ป้องกัน spam)
- RLS policies ทุกตาราง

### Data Privacy
- ข้อมูล user: เข้าถึงได้เฉพาะเจ้าของ
- Quiz sets: `is_public` flag
- Battle history: เห็นเฉพาะของตัวเอง

---

## 📄 License

This project is licensed under the **MIT License**.

```
Copyright (c) 2024 QuizSlayer Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 📞 Contact & Support

- **GitHub**: [wantanaiCS/QUIZSLAYER](https://github.com/wantanaiCS/QUIZSLAYER)
- **Issues**: [GitHub Issues](https://github.com/wantanaiCS/QUIZSLAYER/issues)
- **Documentation**: See [docs folder](./docs)

---

## 🙏 Acknowledgments

- **Vue.js Team** — amazing reactive framework
- **Vite Team** — blazing fast build tool
- **Supabase Team** — open-source Firebase alternative
- **Phaser Team** — powerful 2D game engine
- **TailwindCSS Team** — utility-first CSS framework
- **Community Contributors** — thank you! 🎉

---

<div align="center">

**Built with ❤️ by QuizSlayer Team**

⭐ Star us on GitHub if you like this project!

[🎮 Play Now](https://your-vercel-url.vercel.app) | [📖 Docs](./QUIZSLAYER_SKILL.md) | [🐛 Report Bug](https://github.com/wantanaiCS/QUIZSLAYER/issues)

</div>
