---
inclusion: always
---

# QuizSlayer — Project Context (Always Read This First)

**🚨 CRITICAL RULES FOR AI ASSISTANTS:**
1. **NEVER suggest upgrading Vite** to version 5.x or newer
2. **NEVER change** `package.json` dev script from `vite build && vite preview`
3. **NEVER change** `index.html` script src to absolute path `/src/main.js`
4. **ALWAYS verify** Vite version is `4.5.14` before making changes
5. **IF build fails** → check these 3 files first: `package.json`, `index.html`, `vite.config.js`

---

## ⚠️ DATABASE SETUP REQUIRED

### FREE MODE History Support
To enable FREE MODE battle history recording, you **MUST run the SQL migration**:

📄 File: `supabase/migrations/add_free_mode.sql` or use `FREE_MODE_SQL_COMMANDS.sql`

**Steps:**
1. Go to Supabase Console → SQL Editor
2. Copy commands from `FREE_MODE_SQL_COMMANDS.sql`
3. Paste and execute in SQL Editor
4. Confirm with ✅ "Success"

See: `FREE_MODE_HISTORY_SETUP.md` for full instructions.

---

## ⚠️ CRITICAL: Known Environment Issues

### 1. Windows Path with `#` Character — MUST USE VITE 4.x
The project lives at `r:\C#\QUIZSLAYER`. The `#` in the folder name `C#` is a **permanent constraint**.

**What this causes:**
- Vite 5.x and newer **CANNOT handle `#` character** in Windows paths correctly
- The dev server (`vite`) will fail with "Failed to load url /src/main.js" errors
- The `#` character gets URL-encoded incorrectly causing module resolution to break

**✅ REQUIRED FIX: Use Vite 4.5.14 + Preview Mode**

```bash
npm install vite@4.5.14 @vitejs/plugin-vue@4.6.2 --save-dev
```

**CRITICAL: package.json MUST use this dev script:**
```json
{
  "scripts": {
    "dev": "vite build && vite preview --host 127.0.0.1",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**CRITICAL: index.html MUST use relative path:**
```html
<script type="module" src="./src/main.js"></script>
```
**NOT** `src="/src/main.js"` (absolute path will break build)

**⚠️ IMPORTANT: `npm run dev` behavior:**
- Runs `vite build` first (production build, takes 10-15 seconds)
- Then starts `vite preview` server at `http://127.0.0.1:5173/`
- This is **NOT hot-reload dev mode** — you must restart after code changes
- This is a **workaround** for the `#` character limitation

**🚫 DO NOT upgrade to Vite 5.x or newer** — it will break immediately.

**🚫 DO NOT change to `"dev": "vite"` in package.json** — regular dev server doesn't work.

**If dev server fails:** verify Vite version is 4.5.14 and index.html uses `./src/main.js` (relative path).

---

### 2. PostCSS + Tailwind CSS Compatibility
**Vite 4.x + Tailwind 3.x supports** `@media` blocks nested inside `@layer` in both dev and build modes.

**Correct usage:**
```css
@layer components {
  .answer-option { ... }
  
  @media (hover: hover) and (pointer: fine) {
    .answer-option:hover { ... }
  }
}
```

**Note:** If you upgrade to Vite 5+ in the future, you may need to move `@media` outside `@layer` blocks.
```

---

## Project Overview

- **Stack:** Vue 3 + Vite 4.5.14 + TailwindCSS + Phaser 3 + Pinia + Supabase
- **Location:** `r:\C#\QUIZSLAYER`
- **Dev command:** `npm run dev` → builds first, then serves at `http://127.0.0.1:5173/`
- **Build command:** `npm run build`

### Required Dependencies (MUST NOT CHANGE):
```json
{
  "devDependencies": {
    "vite": "^4.5.14",
    "@vitejs/plugin-vue": "^4.6.2",
    "tailwindcss": "^3.4.19",
    "postcss": "^8.5.15",
    "autoprefixer": "^10.5.0"
  },
  "dependencies": {
    "vue": "^3.5.34",
    "vue-router": "^4.6.4",
    "pinia": "^3.0.4",
    "phaser": "^4.1.0",
    "@supabase/supabase-js": "^2.108.1"
  }
}
```

**🚫 DO NOT run `npm update` or upgrade Vite/plugin-vue** — it will break the build.

## Architecture

```
src/
  views/          # Page components (BattleView, PvPBattleView, PvPLobbyView, ...)
  stores/         # Pinia stores (authStore, battleStore, pvpStore, quizStore, playerStore)
  components/
    battle/       # HPBar, BarTime, QuestionCard, SkillGauge
    pvp/          # PlayerCard, LuckyBox, RPSPicker, RematchOverlay
  lib/
    supabase.js   # Supabase client (isMockMode flag)
    phaser/       # BattleScene.js, PvPScene.js, config.js
  router/         # Vue Router
  utils/          # battleCalculator.js
  style.css       # Global Tailwind + custom CSS
```

## Key Behaviors

### Mock Mode
When `VITE_SUPABASE_URL` is missing or placeholder → `isMockMode = true` → no real DB calls. Test without Supabase.

### PvP Flow
`waiting → rps → playing → lucky_box (every 5 questions) → finished`

RPS draw → reset both picks, players re-pick (does NOT random-decide).

### Turn Timer
`pvpStore.turnTimeLimit` (seconds, 0 = unlimited). Set by host at room creation. Synced to guest via `state_sync`. When timer hits 0 → `submitAnswer(-1)` = wrong answer.

### Answer Shuffle
`importFromJSON()` in `quizStore` runs Fisher-Yates shuffle on options before saving → correct_index gets redistributed (prevents all-A answers from AI).

Question order uses `seededShuffle(questions, (seed + Date.now()) % 999983)` — different every game.

## Recent Changes & Bug Fixes

### Critical Files (DO NOT MODIFY):
| File | Critical Settings |
|------|------------------|
| `package.json` | `"dev": "vite build && vite preview --host 127.0.0.1"` + Vite 4.5.14 |
| `index.html` | `<script type="module" src="./src/main.js"></script>` (relative path) |
| `vite.config.js` | Simple config without special workarounds |

### Files Modified in PvP System:
| File | What Changed |
|------|-------------|
| `src/stores/pvpStore.js` | RPS draw re-pick, turn timer, seeded shuffle |
| `src/views/PvPLobbyView.vue` | Timer preset UI, clear joinCode on join |
| `src/views/PvPBattleView.vue` | Timer countdown bar, double-submit guard |
| `src/views/BattleView.vue` | Double-submit guard |
| `src/components/pvp/LuckyBox.vue` | Preview → description → confirm flow |
| `src/components/pvp/PlayerCard.vue` | Item popover (replaces tooltip) |
| `src/components/pvp/RPSPicker.vue` | "เป่าใหม่" text on draw |
| `src/views/QuizGeneratorView.vue` | AI prompt for distributing correct_index |
| `src/stores/quizStore.js` | Fisher-Yates shuffle on import |
