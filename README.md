# QuizSlayer 🗡️

> Educational RPG Web Game — ต่อสู้กับมอนสเตอร์ด้วยการตอบคำถาม

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase)](https://supabase.com)
[![Phaser 3](https://img.shields.io/badge/Phaser-3-EC5F2C)](https://phaser.io)

## 🎮 Overview

QuizSlayer เป็น Educational RPG ที่ผู้เล่นต่อสู้กับมอนสเตอร์ 5 ตัวโดยการตอบคำถาม 4 ตัวเลือก แบบ turn-based พร้อมระบบ Bar Time ที่ไดนามิก

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Vite |
| Styling | TailwindCSS 3 |
| Game Engine | Phaser 3 |
| State | Pinia |
| Routing | Vue Router 4 |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Deploy | Vercel |

## 🚀 Getting Started

```bash
# 1. Clone
git clone https://github.com/wantanaiCS/QUIZSLAYER.git
cd QUIZSLAYER

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# แก้ไข .env ใส่ Supabase credentials

# 4. Run dev server
npm run dev
```

## 📁 Project Structure

```
src/
├── lib/           # Supabase client
├── router/        # Vue Router (6 routes)
├── stores/        # Pinia stores
│   ├── authStore.js    # Auth state + Supabase Auth
│   ├── battleStore.js  # Core battle mechanics
│   ├── quizStore.js    # Quiz sets management
│   └── playerStore.js  # Player stats + history
├── utils/
│   └── battleCalculator.js  # HP, damage, bar speed formulas
├── views/         # Pages
│   ├── HomeView.vue
│   ├── BattleView.vue
│   ├── QuizGeneratorView.vue
│   ├── HistoryView.vue
│   ├── ProfileView.vue
│   └── LoginView.vue
└── components/    # Reusable components (Phase 1)
```

## ⚔️ Battle Mechanics

- **Bar Time System**: ใครเต็มก่อนได้ turn ก่อน
- **Cooldown**: Easy=ไม่จำกัด | Normal=10s | Hard=7s
- **HP**: คำนวณจากจำนวนข้อ × difficulty ratio
- **Streak**: ตอบถูก 3 ติดกัน → Skill | 5 ติดกัน → Ultimate

## 🗺️ Roadmap

- **Phase 1** (MVP): Battle system, 5 stages, AI Quiz Generator, Auth ✅
- **Phase 2**: Document Upload, Leaderboard, Coin/Shop
- **Phase 3**: PvP Mode, Skill Shop, Mobile optimization

## 📖 Reference

ดู [QUIZSLAYER_SKILL.md](./QUIZSLAYER_SKILL.md) สำหรับ spec เต็มของโปรเจกต์
