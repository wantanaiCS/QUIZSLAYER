# QuizSlayer — UX/UI Redesign Master Plan
**Version:** 1.0 | **Date:** 2025 | **Status:** Planning Phase

---

## Table of Contents
1. [Problem Statement](#1-problem-statement)
2. [Design Direction](#2-design-direction)
3. [Design System](#3-design-system)
4. [Component Library](#4-component-library)
5. [Page-by-Page Redesign Spec](#5-page-by-page-redesign-spec)
6. [New Feature Proposals](#6-new-feature-proposals)
7. [Animation & Interaction Guide](#7-animation--interaction-guide)
8. [Responsive Strategy](#8-responsive-strategy)
9. [Implementation Task Breakdown](#9-implementation-task-breakdown)
10. [File Change Map](#10-file-change-map)

---

## 1. Problem Statement

ระบบ UI ปัจจุบันของ QuizSlayer มีปัญหาดังนี้:

- **Emoji ใน navigation และ content** — render ต่างกันในแต่ละ OS/platform ดูไม่ consistent
- **Card layout ซ้ำซาก** — ทุกหน้าใช้ `.card` pattern เดิม ไม่มี visual hierarchy ที่ชัดเจน
- **ขาด micro-interactions** — ปุ่ม, input, state transitions ไม่มีลูกเล่นที่ทำให้รู้สึกว่าระบบ "มีชีวิต"
- **Home page ไม่ใช่ personal hub** — ผู้ใช้ที่ login แล้วยังเห็นหน้า landing เดิมที่ไม่มีข้อมูลส่วนตัว
- **ไม่มี Achievement / Progression system** — ไม่มีแรงจูงใจระยะยาวให้กลับมาเล่น
- **Logo ใหม่ยังไม่ถูก integrate** — Pixel art sword+? mark ที่ออกแบบไว้ยังไม่ได้ใช้จริงในระบบ
- **Responsive ยังมีช่องว่าง** — iPad (768-1024px) ใช้ layout ที่ไม่ได้ optimize
- **ไม่มี Toast/Notification system** — error/success ใช้ inline text แยกกันในแต่ละ component

---

## 2. Design Direction

### 2.1 Visual Identity — "Premium SaaS x Dark RPG"

**Core Aesthetic:** Clean dark surfaces + gaming energy
**Reference feels:** Linear.app structure + FF XIV lobby + Notion dark mode

คุณสมบัติหลัก:
- Dark background ที่มี depth ชัดเจน (4 layers)
- Gaming accent สีม่วง/ฟ้า/ทอง ใช้อย่าง restrained
- Typography ผสม pixel font (identity) + sans-serif (readability)
- Glow effects เฉพาะจุด interactive สำคัญ ไม่ใช้ทั่วไป
- Glass morphism เฉพาะ navbar และ overlay
- Phosphor Icons (duotone/bold) แทน emoji ทั้งระบบ

### 2.2 Logo Integration

Logo: pixel art sword + ? mark + QUIZSLAYER text

```
Navbar desktop  : img logo-icon.png (32px) + img logo.png (full text)
Navbar mobile   : img logo-icon.png (28px) เท่านั้น
Login page      : Full logo ขนาดใหญ่ center, animate float
Loading screen  : Logo + spinning ring
Favicon         : logo-icon.png export 32x32
```

ข้อกำหนดการใช้ใน code:
- เก็บไว้ที่ `public/logo.png` (full) และ `public/logo-icon.png` (icon)
- ใช้ `<img class="pixel">` เสมอเพื่อ preserve pixel rendering
- ห้าม scale เกิน 2x จาก original pixel dimension

### 2.3 Color System

เพิ่มเติมจาก design system เดิม (ไม่ลบของเดิม):

```js
// tailwind.config.js — เพิ่มใน extend.colors.qs
qs: {
  // ของเดิมทั้งหมดคงไว้ เพิ่มต่อท้าย:
  'depth-4' : '#1f2438',  // elevated card
  'cyan'    : '#4fc3f7',  // mana/tech accent
  'indigo'  : '#818cf8',  // primary hover state
  'xp'      : '#a78bfa',  // XP bar color
  'rank-s'  : '#f4c842',
  'rank-a'  : '#c084fc',
  'rank-b'  : '#60a5fa',
  'rank-c'  : '#34d399',
}
```

### 2.4 Typography Scale

```
Display    : font-pixel, 3xl-6xl          — hero, logo text
H1         : font-sans 700, 2xl-3xl       — page titles
H2         : font-sans 600, xl-2xl        — section headers
H3         : font-sans 600, lg            — card titles
Body       : font-sans 400, sm-base       — content
Caption    : font-sans 400, xs            — timestamps, meta
Label      : font-sans 500, xs uppercase  — form labels (tracking-wide)
Pixel-num  : font-pixel, xs              — scores, codes, badges only
```

---

## 3. Design System

### 3.1 Spacing & Breakpoints

```
Content max-width:
  Narrow   : max-w-lg  (512px)   — forms, auth
  Default  : max-w-4xl (896px)   — most pages
  Wide     : max-w-6xl (1152px)  — dashboard, lists
  Full     : none                — battle screen

Breakpoints:
  Mobile    : < 640px
  Tablet    : 640-1023px
  iPad Pro  : 1024-1279px    (target specifically)
  Desktop   : 1280px+
```

### 3.2 Elevation System

```
L0 Flat    : bg-qs-surface  | no shadow   | no border
L1 Card    : bg-qs-card     | shadow-card | border-qs-border
L2 Raised  : bg-qs-depth-4  | shadow-qs   | border-qs-border/60
L3 Float   : bg-qs-card     | shadow-qs-glow | border-qs-primary/20
L4 Overlay : bg-qs-depth-3  | backdrop-blur-xl | border-qs-border
```

### 3.3 Border Radius

```
Sharp  : rounded-none   — pixel art elements เท่านั้น
Small  : rounded-lg     — chips, badges, tags
Medium : rounded-qs (12px) — cards, inputs, buttons
Large  : rounded-qs-lg (20px) — modals, large cards
Full   : rounded-full   — avatars, pills, dot indicators
```

---

## 4. Component Library

### 4.1 Icon System — Phosphor Icons

ติดตั้ง: `npm install @phosphor-icons/vue`

| Emoji เดิม | Phosphor Icon    | Weight  | ใช้ใน              |
|-----------|------------------|---------|-------------------|
| sword     | PhSword          | bold    | nav, buttons      |
| pvp       | PhUsersThree     | duotone | nav, pvp lobby    |
| book      | PhBooks          | duotone | nav               |
| robot     | PhRobot          | duotone | generator         |
| list      | PhListBullets    | bold    | nav, my quizzes   |
| scroll    | PhScroll         | duotone | nav, history      |
| coin      | PhCoins          | duotone | coin display      |
| trophy    | PhTrophy         | duotone | win result        |
| skull     | PhSkull          | duotone | lose result       |
| sparkle   | PhSparkle        | duotone | AI generator      |
| fire      | PhFlame          | duotone | streak            |
| heart     | PhHeart          | fill    | HP bar            |
| lightning | PhLightning      | fill    | skill gauge       |
| gamepad   | PhGameController | duotone | feature cards     |
| house     | PhHouse          | duotone | pvp host          |
| door      | PhDoorOpen       | duotone | pvp join          |
| pencil    | PhPencilSimple   | bold    | edit              |
| folder    | PhFolder         | duotone | file upload       |
| copy      | PhCopy           | bold    | clipboard         |
| check     | PhCheckCircle    | fill    | success           |
| close     | PhX              | bold    | close             |
| back      | PhArrowLeft      | bold    | back nav          |
| warning   | PhWarning        | duotone | danger mechanic   |
| bell      | PhBell           | duotone | notifications     |
| medal     | PhMedal          | duotone | achievements      |
| user      | PhUser           | bold    | profile           |
| palette   | PhPalette        | duotone | customization     |

### 4.2 Button Variants

```css
/* .btn — base */
.btn {
  @apply inline-flex items-center justify-center gap-2
         px-5 py-2.5 rounded-qs font-semibold text-sm
         transition-all duration-200 cursor-pointer select-none
         active:scale-95
         focus-visible:outline-none focus-visible:ring-2
         focus-visible:ring-qs-primary/50;
}

/* .btn-primary — gradient + shimmer on hover */
.btn-primary {
  background: linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%);
  @apply text-white shadow-qs relative overflow-hidden;
  @apply hover:shadow-qs-glow hover:brightness-110;
}
.btn-primary::after {
  content: '';
  @apply absolute inset-0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}
.btn-primary:hover::after { transform: translateX(100%); }

/* .btn-ghost */
.btn-ghost {
  @apply btn bg-transparent border border-qs-border text-qs-muted;
  @apply hover:border-qs-primary/50 hover:text-qs-text hover:bg-qs-surface;
}

/* .btn-icon */
.btn-icon {
  @apply w-9 h-9 rounded-qs flex items-center justify-center
         bg-qs-surface border border-qs-border text-qs-muted
         hover:border-qs-primary/50 hover:text-qs-primary
         transition-all duration-150;
}
```

### 4.3 Card Variants

```css
/* Dashboard stat widget */
.card-stat {
  @apply bg-qs-depth-4 border border-qs-border rounded-qs p-4
         flex flex-col gap-1
         hover:border-qs-primary/30 transition-all duration-200;
}

/* Feature card with icon */
.card-feature {
  @apply card-hover p-6 flex flex-col gap-3 group cursor-default;
}
.card-feature .icon-wrap {
  @apply w-10 h-10 rounded-qs flex items-center justify-center
         bg-qs-primary/10 text-qs-primary
         group-hover:bg-qs-primary/20 group-hover:scale-110
         transition-all duration-300;
}

/* Quiz set card with top accent line */
.card-quiz {
  @apply card-hover p-5 cursor-pointer relative overflow-hidden;
}
.card-quiz::before {
  content: '';
  @apply absolute top-0 left-0 right-0 h-0.5;
  background: linear-gradient(90deg, transparent, #6c63ff, transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.card-quiz:hover::before,
.card-quiz.selected::before { opacity: 1; }

/* Achievement card */
.card-achievement {
  @apply relative p-4 rounded-qs border text-center
         flex flex-col items-center gap-2;
}
.card-achievement.locked {
  @apply bg-qs-surface border-qs-border opacity-40 grayscale;
}
.card-achievement.unlocked {
  @apply bg-gradient-to-b from-qs-primary/10 to-transparent
         border-qs-primary/30;
}
```

### 4.4 Input Fields

```css
.input {
  @apply w-full px-4 py-3 bg-qs-surface border border-qs-border
         rounded-qs text-qs-text placeholder-qs-muted
         focus:outline-none focus:border-qs-primary
         focus:ring-1 focus:ring-qs-primary/20
         transition-all duration-200;
}
.input-error { @apply input border-qs-danger focus:border-qs-danger focus:ring-qs-danger/20; }
.input-label { @apply block text-xs font-medium text-qs-muted uppercase tracking-wide mb-1.5; }

/* Input with leading icon */
.input-group { @apply relative; }
.input-group .input { @apply pl-10; }
.input-group .input-icon { @apply absolute left-3 top-1/2 -translate-y-1/2 text-qs-muted; }
```

### 4.5 Badge / Chip System

```css
/* Rank badges */
.badge-rank-s { @apply badge bg-qs-rank-s/20 text-qs-rank-s border-qs-rank-s/40; }
.badge-rank-a { @apply badge bg-qs-rank-a/20 text-qs-rank-a border-qs-rank-a/40; }
.badge-rank-b { @apply badge bg-qs-rank-b/20 text-qs-rank-b border-qs-rank-b/40; }
.badge-rank-c { @apply badge bg-qs-rank-c/20 text-qs-rank-c border-qs-rank-c/40; }

/* Difficulty badges */
.badge-easy   { @apply badge bg-green-900/30 text-qs-success border-qs-success/30; }
.badge-normal { @apply badge bg-yellow-900/30 text-qs-warning border-qs-warning/30; }
.badge-hard   { @apply badge bg-red-900/30 text-qs-danger border-qs-danger/30; }
```

### 4.6 Toast / Notification System (ใหม่)

ไฟล์ใหม่ที่ต้องสร้าง:
- `src/composables/useToast.js` — state management
- `src/components/ui/ToastItem.vue` — single toast render
- `src/components/ui/ToastProvider.vue` — container mount ใน App.vue

Spec:
```
Position  : top-right, mt-16 (ใต้ navbar)
Types     : success | error | warning | info
Animation : translateX(100%) => 0 slide in, fade out
Duration  : 3000ms auto-dismiss, error = 5000ms
Max shown : 3 พร้อมกัน (queue ที่เกิน)
```

Usage:
```js
const { toast } = useToast()
toast.success('บันทึกสำเร็จ')
toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
toast.info('คะแนนอัปเดตแล้ว')
```

### 4.7 StepIndicator Component (ใหม่)

`src/components/ui/StepIndicator.vue`

```
Props:
  steps   : string[]
  current : number

Visual:
  completed : filled circle + PhCheckCircle, green
  current   : filled circle + number, primary glow ring
  future    : outline circle + number, muted
  connector : animate fill ซ้าย->ขวา เมื่อก้าวผ่าน
```

### 4.8 AnimatedCounter Component (ใหม่)

`src/components/ui/AnimatedCounter.vue`

```
Props:
  value    : number
  duration : number (ms, default 600)
  prefix   : string optional
  suffix   : string optional

Behavior:
  mount/value change => count up easeOutCubic ด้วย requestAnimationFrame
```

### 4.9 AvatarFrame Component (ใหม่)

`src/components/ui/AvatarFrame.vue`

```
Props:
  name   : string   (แสดง initial)
  color  : string   (gradient key จาก AVATAR_GRADIENTS)
  size   : 'sm' | 'md' | 'lg' | 'xl'
  rank?  : string   (แสดง rank ring)
  online?: boolean  (แสดง green dot)

Sizes:
  sm  : w-8 h-8   text-xs
  md  : w-10 h-10 text-sm
  lg  : w-16 h-16 text-xl
  xl  : w-24 h-24 text-3xl
```

### 4.10 ConfirmDialog Component (ใหม่)

`src/components/ui/ConfirmDialog.vue`

แทนที่ `window.confirm()` ทั้งระบบ

```
Props:
  title   : string
  message : string
  confirm : string (button label)
  cancel  : string (button label)
  danger? : boolean (confirm button = btn-danger)

Emits: confirm, cancel
```

---

## 5. Page-by-Page Redesign Spec

### 5.1 App.vue — Navbar

เปลี่ยน:
- Logo: `<img class="pixel">` แทน div + emoji
- Nav links: เพิ่ม Phosphor icon ซ้ายแต่ละ link
- Active indicator: gradient underline animate width 0 -> 100%
- Coins: PhCoins duotone + AnimatedCounter แทน emoji
- เพิ่ม PhBell button ด้านขวา (placeholder สำหรับ achievement notification)
- Mobile: Bottom sheet slide-up แทน dropdown ลงมา
- Backdrop: `backdrop-blur-md bg-qs-depth-0/80`

Nav links array ใหม่:
```js
[
  { to: '/battle',     icon: 'PhSword',       label: 'Battle'     },
  { to: '/pvp',        icon: 'PhUsersThree',  label: 'PvP'        },
  { to: '/free',       icon: 'PhBooks',       label: 'Free Mode'  },
  { to: '/generator',  icon: 'PhRobot',       label: 'Generator'  },
  { to: '/my-quizzes', icon: 'PhListBullets', label: 'My Quizzes' },
  { to: '/history',    icon: 'PhScroll',      label: 'History'    },
]
```

---

### 5.2 HomeView — Dashboard Hub

Logged-out (Landing Page):
```
Hero section:
  Logo ใหญ่ animate-float (CSS keyframe)
  Headline: font-pixel gradient text
  2 CTA buttons: [Battle] [Create Quiz]

Monster Stages (5 cards):
  CSS colored circle + stage number แทน emoji
  Monster name + mechanic chip badge

Features Grid:
  card-feature + PhIcon duotone large
  Hover: icon scale + card lift
```

Logged-in (Personal Dashboard):
```
Header:
  "ยินดีต้อนรับกลับ, [Name]" + level/streak badge

Layout:
  Desktop  : 3-col grid
  iPad Pro : 2-col grid
  Mobile   : 1-col stack

Col 1 — Quick Actions (2x2 grid):
  [Battle] [PvP] [Generator] [My Quizzes]

Col 2-3 — Right Panel:
  Row 1: Stats widgets (4 cards, AnimatedCounter)
         Wins | Win Rate | Best Score | Coins
  Row 2: Recent Battles (3 mini cards)
  Row 3: Next Achievement preview + progress bar
```

---

### 5.3 LoginView

```
Layout:
  Full-screen dark bg + subtle radial gradient
  Center card max-w-md:
    Logo ขนาดใหญ่ (animate-float)
    Tab switcher: [เข้าสู่ระบบ] [สมัครสมาชิก] — slide indicator
    Google OAuth button: gradient border + Google SVG icon
    Divider "หรือ"
    Form fields: input-group + leading icons (PhEnvelope, PhLock, PhUser)
    Submit button: btn-primary full width

Interactions:
  Tab switch   : slide indicator + fade content
  Error        : card shake animation + toast
  Submit load  : spinner icon in button
  Success      : PhCheckCircle bounce -> redirect
```

---

### 5.4 BattleView — Setup Steps

Step 1 — Quiz Selection:
```
StepIndicator ด้านบน (3 steps)
Quiz cards (.card-quiz):
  top accent line (animate on hover/selected)
  Title + Public/Private badge
  Question count + visual fill bar
  Author name (ถ้า public)
```

Step 2 — Difficulty:
```
Easy  : PhShieldCheck duotone green
Normal: PhSword duotone yellow
Hard  : PhFlame duotone red

Selected: border-primary + glow ring + icon scale-up
```

Battle HUD — Mechanic Badges:
```
Danger Zone   : PhWarning duotone + "Damage x2" red pulse badge
Counter Attack: PhLightning duotone + "สวนกลับ 40%" purple badge
COUNTER!      : PhLightningSlash fill + animate-pulse
Boss errors   : PhSkull + "x/3" counter
Cooldown      : PhTimer + "Xs"
```

Battle End Overlay:
```
Victory: PhTrophy duotone gold — scale-in + glow-pulse (2s loop)
Defeat : PhSkull duotone       — fade-in only (no bounce, intentional)
Stats  : AnimatedCounter component
Answer log: PhCheckCircle (correct) / PhXCircle (wrong) แทน text
```

---

### 5.5 PvPLobbyView

Mode Select:
```
2 cards:
  PhHouse (xl, duotone) + "สร้างห้อง" + desc + PhArrowRight
  PhDoorOpen (xl, duotone) + "เข้าร่วม" + desc + PhArrowRight
Hover: card lift + icon glow
```

Room Code Display:
```
แสดงทีละตัวใน box แยก 6 boxes:
  ┌──┐ ┌──┐ ┌──┐  ┌──┐ ┌──┐ ┌──┐
  │A │ │B │ │C │  │1 │ │2 │ │3 │
  └──┘ └──┘ └──┘  └──┘ └──┘ └──┘
  font-pixel, color: qs-accent

Copy button: PhCopy -> PhCheckCircle + qs-success (1.5s)
```

Waiting Room:
```
Host row : AvatarFrame (md) + name + "(คุณ)" chip
Guest row: AvatarFrame (md) animate-pulse ถ้ารอ, fill เมื่อ join
Status   : PhWifiHigh / PhWifiSlash แทน dot สี
```

---

### 5.6 ProfileView

```
Layout Desktop: 2-col (left: avatar+actions | right: stats+history)
Layout Mobile : 1-col stack

Header Card:
  AvatarFrame (xl) + gradient frame ตาม character color
  Name + edit button (PhPencilSimple)
  Email + join date
  Logout: btn-danger ghost style

Stats Row (4 cards, AnimatedCounter):
  Coins | Games | Wins | Win Rate

Achievement Preview (ใหม่):
  3 recent unlocked badges
  "ดูทั้งหมด" link -> /achievements

Game History:
  Timeline style แทน list
  Max-height scroll
  result icon + title + meta + score/coins per row
```

---

### 5.7 HistoryView

```
Header: Stats summary 4 widgets (AnimatedCounter)

Filter bar (ใหม่):
  [ทั้งหมด] [ชนะ] [แพ้] [Solo] [PvP]
  computed filter client-side

Session cards:
  Left  : result icon (PhTrophy/PhSkull, large duotone)
  Center: quiz title + meta row (mode / stage / ถูก / เวลา)
  Right : score (AnimatedCounter) + coins earned
  Expand: collapsed answer summary on click
```

---

### 5.8 QuizGeneratorView

```
Step Indicator: StepIndicator component (3 steps)

Step 0 — ตั้งค่า:
  input-group fields + leading icons
  Toggle file source: card toggle redesign
  AI support cards: PhIcon + name + note

Step 1 — Prompt:
  Prompt card: monospace dark bg + btn-icon (copy/expand)
  AI links: btn-ghost + PhArrowSquareOut

Step 2 — Preview & Import:
  Difficulty badges: badge-easy/normal/hard
  Show/hide answer: PhEye / PhEyeSlash toggle
  Import button: btn-primary full width
```

---

### 5.9 QuizManageView

```
Header: title + [+ สร้างใหม่] button

Quiz cards grid (2-col desktop, 1-col mobile):
  .card-quiz + top accent line
  Title + Public/Private badge
  Question count + created date
  Actions: [PhPencil edit] [PhTrash delete] [PhPlay play]
  Delete: ConfirmDialog component (ไม่ใช้ window.confirm)
```

---

### 5.10 FreeView

```
Simple version of BattleView step 1
ไม่มี difficulty selection (no penalty)
Quick start: เลือก set -> เล่นเลย
Question: layout กว้างกว่า, show answer immediately
Result: simple summary ไม่บันทึก history
```

---

## 6. New Feature Proposals

### 6.1 Achievement & Badge System

Scope: Frontend display + badge unlock logic (ใช้ player sessions ที่มีอยู่ ไม่ต้อง DB ใหม่)

Badge Definitions:

```
Combat:
  First Blood    — ชนะ battle แรก
  Slayer         — ชนะ 10 battles
  Legend         — ชนะ 50 battles
  Perfect Run    — ชนะโดยไม่เสีย HP เลย
  Speed Demon    — ชนะภายใน 3 นาที
  Hard Boiled    — ชนะ Hard mode

Knowledge:
  Scholar        — ตอบถูกรวม 100 ข้อ
  Streak Master  — Streak 5 ติดกันใน 1 game
  Full Marks     — ตอบถูกทุกข้อใน 1 game

PvP:
  Challenger     — เล่น PvP ครั้งแรก
  Duelist        — ชนะ PvP 5 ครั้ง
  Champion       — ชนะ PvP 20 ครั้ง

Creator:
  Architect      — สร้าง quiz set แรก
  Master Builder — สร้าง 5 quiz sets
  AI Conjurer    — ใช้ AI generator ครั้งแรก
```

UI Components:
- `src/components/achievements/AchievementBadge.vue`
- `src/components/achievements/AchievementToast.vue` (unlock notification)
- `src/views/AchievementsView.vue`
- Route: `/achievements`

Logic:
- `src/stores/achievementStore.js` — คำนวณจาก playerStore.sessions
- Unlock toast trigger หลังจบ battle และตอน login

---

### 6.2 Character / Avatar Customization

Scope: เลือก avatar gradient + title badge ใน profile

Avatar Gradient Presets (10 options):
```js
const AVATAR_GRADIENTS = {
  purple : ['#6c63ff', '#9c27b0'],  // default
  fire   : ['#ff4757', '#ff9800'],
  ocean  : ['#4fc3f7', '#1565c0'],
  forest : ['#43d98f', '#2e7d32'],
  gold   : ['#f4c842', '#ff6f00'],
  rose   : ['#f06292', '#ad1457'],
  void   : ['#37474f', '#263238'],
  ice    : ['#b3e5fc', '#4fc3f7'],
  toxic  : ['#ccff90', '#76ff03'],
  cosmic : ['#ce93d8', '#7c4dff'],
}
```

Title Badges (unlock ผ่าน achievements):
```
เริ่มต้น       : "Slayer Apprentice"
ชนะ 10 battle  : "Battle-Hardened"
ชนะ PvP 5      : "Duelist"
Perfect Run    : "Flawless"
ชนะ Hard 5     : "Iron Will"
Legend badge   : "Legendary"
```

UI:
- Profile tab "ปรับแต่ง" -> color swatches + title selector
- Live preview บน AvatarFrame
- บันทึกลง Supabase `profiles.avatar_gradient`, `profiles.title_badge`

Files:
- `src/components/profile/AvatarCustomizer.vue`
- `supabase/migration_avatar_customization.sql`

---

### 6.3 Dashboard Widgets

Widget 1 — Quick Actions Grid:
```
4 buttons (2x2): Battle, PvP, Generator, My Quizzes
PhIcon duotone large + label + subtle desc
```

Widget 2 — Stats Row:
```
4 AnimatedCounter cards: Total wins | Win rate | Best score | Coins
```

Widget 3 — Recent Battles:
```
3 mini session cards: icon + title + result + score
"ดูทั้งหมด" link -> /history
```

Widget 4 — Next Achievement:
```
Badge icon (locked, semi-visible) + name + progress bar
"X/Y เพื่อปลดล็อก"
```

---

## 7. Animation & Interaction Guide

### 7.1 Principles

```
1. Purpose over decoration  — animation ต้องมีความหมาย ไม่ใส่เพราะสวย
2. Fast but noticeable      — duration 150-400ms เท่านั้น
3. Ease out for entries     — สิ่งที่ปรากฏ = ease-out (เร็วก่อน ช้าปลาย)
4. Ease in for exits        — สิ่งที่หายไป = ease-in (ช้าก่อน เร็วปลาย)
5. Spring for interactive   — ปุ่ม, card select = cubic-bezier(0.68,-0.55,0.27,1.55)
6. No loop animations       — ยกเว้น loading state และ glow-pulse บน CTA หลัก
```

### 7.2 Micro-interaction Catalogue

Button:
```
Hover   : brightness(1.1) + shadow glow (200ms ease)
Press   : scale(0.95) (100ms)
Shimmer : ::after translateX (500ms ease) — btn-primary only
Loading : spinner replace text (CSS spin)
```

Card:
```
Hover   : translateY(-2px) + border-color shift (200ms)
Select  : border-primary + top accent line fade in (300ms)
```

Input:
```
Focus   : border-color + ring-1 (150ms)
Error   : border-danger + shake keyframe (400ms, once)
Success : border-success (150ms)
```

Navigation:
```
Active link   : gradient underline scaleX 0->1 (300ms ease-out)
Page transition: opacity + translateY(8px)->0 (200ms)
Mobile menu   : translateY(100%)->0 slide-up (250ms ease-out)
```

Stats / Numbers:
```
Mount  : count up 0->value (600ms easeOutCubic via RAF)
Update : scale(1.1)->1 + color flash (300ms)
```

Results:
```
Victory trophy : scale(0.3)->1 bounceIn (500ms) + glow-pulse 2s loop
Defeat skull   : opacity 0->1 fadeIn (400ms) — no bounce intentionally
Badge unlock   : scale(0)->1.1->1 + CSS particle burst (600ms)
```

### 7.3 CSS Keyframes ที่ต้องเพิ่มใน style.css

```css
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes badgeUnlock {
  0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
  60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes underlineExpand {
  0%   { transform: scaleX(0); transform-origin: left; }
  100% { transform: scaleX(1); transform-origin: left; }
}

@keyframes slideUpMobile {
  0%   { transform: translateY(100%); }
  100% { transform: translateY(0); }
}

@keyframes numberPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes cardShake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-8px); }
  40%       { transform: translateX(8px); }
  60%       { transform: translateX(-5px); }
  80%       { transform: translateX(5px); }
}

@keyframes floatLogo {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
```

CSS Variables เพิ่ม:
```css
:root {
  --animate-badge-unlock : badgeUnlock 0.6s cubic-bezier(0.68,-0.55,0.27,1.55);
  --animate-underline    : underlineExpand 0.3s ease-out;
  --animate-slide-mobile : slideUpMobile 0.25s ease-out;
  --animate-number-pop   : numberPop 0.3s ease;
  --animate-float-logo   : floatLogo 3s ease-in-out infinite;
}
```

---

## 8. Responsive Strategy

### 8.1 Breakpoint Philosophy

```
Mobile    (< 640px)    : Single column, bottom sheet menus,
                         compact HUD, full-width buttons
Tablet    (640-1023px) : 2-col grids, side-by-side forms
iPad Pro  (1024-1279px): 3-col grids, sidebar-style panels,
                         navbar แสดง icon+label ครบ
Desktop   (1280px+)    : Max-width containers, 4-col grids,
                         battle screen 2-col layout
```

### 8.2 Component Responsive Rules

Navbar:
```
< 640px   : logo-icon only + hamburger => bottom sheet
640-1023  : logo-icon + text + icon-only nav + hamburger
1024px+   : full logo + icon+label nav + right panel full
```

HomeView Dashboard:
```
< 640px   : stack all widgets vertically
640-1023  : 2-col (quick actions | stats)
1024px+   : 3-col (actions | recent | achievement)
```

Battle HUD:
```
< 640px   : HP bars compact, mechanic badges stack below canvas
640-1023  : HP bars full, badges in row
1280px+   : 2-col (canvas left | question right)
```

Achievement Grid:
```
< 640px   : 2-col grid
640-1023  : 3-col grid
1024px+   : 4-col grid
```

### 8.3 Touch & Pointer Considerations

```css
/* Touch targets: min 44x44px สำหรับ iPad/mobile */
@media (pointer: coarse) {
  .btn            { min-height: 44px; }
  .btn-icon       { min-width: 44px; min-height: 44px; }
  .answer-option  { min-height: 52px; }
  .card-quiz      { min-height: 72px; }
}

/* Hover effects เฉพาะ pointer:fine (mouse) */
@media (hover: hover) and (pointer: fine) {
  /* hover styles ทั้งหมด */
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-float-logo,
  .animate-pulse,
  .btn-primary::after { animation: none !important; }
}
```

---

## 9. Implementation Task Breakdown

> แต่ละ task สามารถ demo ได้หลัง complete, ไม่มี orphaned code

---

### Task 1: Install Phosphor Icons + Design System Foundation

**Objective:** ติดตั้ง icon library และ extend tailwind + style.css

Implementation:
- `npm install @phosphor-icons/vue`
- `tailwind.config.js` — เพิ่ม colors: depth-4, cyan, indigo, xp, rank variants
- `src/style.css` — เพิ่ม CSS keyframes ทั้งหมดจาก section 7.3
- `src/style.css` — เพิ่ม classes: .btn-ghost, .btn-icon, .card-stat, .card-feature, .card-quiz, .card-achievement, .input, .input-label, .input-group, badges
- ทดสอบ import PhSword ใน HomeView ชั่วคราว

**Demo:** `npm run dev` ไม่มี error, PhSword icon แสดงได้

---

### Task 2: Toast / Notification System

**Objective:** Global toast ที่ทุก component ใช้ได้

Implementation:
- สร้าง `src/composables/useToast.js`
- สร้าง `src/components/ui/ToastItem.vue`
- สร้าง `src/components/ui/ToastProvider.vue`
- Mount `<ToastProvider />` ใน `App.vue`
- แทนที่ inline error ใน LoginView ด้วย `toast.error()`

**Demo:** Login ผิด -> red toast slide in จาก top-right, auto-dismiss 5s

---

### Task 3: Reusable UI Components

**Objective:** สร้าง shared components ก่อน implement หน้าต่าง ๆ

Implementation:
- `src/components/ui/StepIndicator.vue` (props: steps[], current)
- `src/components/ui/AnimatedCounter.vue` (props: value, duration, prefix, suffix)
- `src/components/ui/AvatarFrame.vue` (props: name, color, size, rank, online)
- `src/components/ui/ConfirmDialog.vue` (แทน window.confirm)

**Demo:** ใส่ StepIndicator ทดสอบใน QuizGeneratorView, AnimatedCounter ใน ProfileView stats

---

### Task 4: Navbar Redesign

**Objective:** Navbar ใหม่ครบ desktop + mobile (bottom sheet)

Implementation:
- อัปเดต `App.vue`
- ใช้ `<img src="/logo-icon.png" class="pixel">` (สร้าง placeholder ถ้ายังไม่มีไฟล์)
- เพิ่ม Phosphor icon ใน nav links array
- Active indicator: animated gradient underline (CSS + router-link-active)
- Coins: PhCoins duotone + AnimatedCounter
- เพิ่ม PhBell placeholder button
- Mobile: fixed bottom-0 bottom sheet

**Demo:** Navbar 3 breakpoint, active underline animate, mobile bottom sheet slide-up

---

### Task 5: LoginView Redesign

**Objective:** Login page UX ใหม่ครบ

Implementation:
- Logo float animation
- Tab component: Login / Register + slide indicator
- input-group + leading icons (PhEnvelope, PhLock, PhUser)
- Google button: gradient border + SVG icon
- Error: card shake animation + toast
- Submit: spinner state

**Demo:** Logo float, tab switch slide, error -> shake + toast

---

### Task 6: HomeView — Personal Dashboard

**Objective:** Home page เป็น personal hub เมื่อ login

Implementation:
- `v-if="authStore.isLoggedIn"` สลับ Landing / Dashboard
- Dashboard: quick action grid, stats widgets (AnimatedCounter), recent battles
- Landing redesign: hero + stage cards (CSS badge แทน emoji) + feature grid
- แทน emoji ทั้งหมดด้วย Phosphor icons

**Demo:** Login -> dashboard พร้อม stats animated, logout -> landing redesign

---

### Task 7: BattleView — Full Redesign

**Objective:** Setup steps + battle HUD + end overlay

Implementation:
- Step 1: .card-quiz + top accent line + question count bar
- Step 2: difficulty cards + PhIcons
- StepIndicator บนสุด
- HUD mechanic badges: Phosphor icons ทั้งหมด
- Battle end: PhTrophy/PhSkull + AnimatedCounter + icon log

**Demo:** ครบ step 1->2->3, mechanic badges ไม่มี emoji, end screen stats count-up

---

### Task 8: QuizGeneratorView Redesign

**Objective:** 3 steps ครบด้วย component ใหม่

Implementation:
- StepIndicator ด้านบน
- input-group + icons ทุก field
- Prompt card: monospace dark bg + btn-icon
- Difficulty badges
- แทน emoji ทั้งหมด

**Demo:** 3 steps ครบ, ไม่มี emoji เลย, step indicator animate

---

### Task 9: PvPLobbyView Redesign

**Objective:** PvP lobby + room code boxes + AvatarFrame

Implementation:
- Mode select cards: PhHouse/PhDoorOpen large
- Room code: 6 แยก boxes font-pixel
- Copy: icon toggle PhCopy -> PhCheckCircle
- Player list: AvatarFrame component
- Timer presets: pill buttons redesign

**Demo:** Room code 6 boxes, copy icon toggle, player list AvatarFrame

---

### Task 10: ProfileView Redesign

**Objective:** Profile ใหม่ + layout responsive + achievement preview

Implementation:
- AvatarFrame (xl)
- Stats 4 cards AnimatedCounter
- History: timeline style
- Achievement preview section (3 badges placeholder)
- Logout: btn-danger ghost

**Demo:** Profile 2-col desktop, stats count-up, timeline history

---

### Task 11: HistoryView Redesign

**Objective:** History + filter bar ใช้งานได้

Implementation:
- Stats row: AnimatedCounter 4 widgets
- Filter bar: computed filter [ทั้งหมด/ชนะ/แพ้/Solo/PvP]
- Session cards: icon + meta + score
- แทน emoji ทั้งหมด

**Demo:** Filter ใช้งานได้, stats count-up, ไม่มี emoji

---

### Task 12: Achievement System

**Objective:** Store + badge UI + unlock toast ทำงานครบ

Implementation:
- `src/stores/achievementStore.js`: badge definitions + `computeUnlocked(sessions)`
- `src/components/achievements/AchievementBadge.vue`
- `src/views/AchievementsView.vue`
- Route `/achievements`
- Unlock toast หลัง battle end
- Achievement preview ใน HomeView + ProfileView

**Demo:** ชนะ battle -> "Achievement Unlocked" toast, /achievements แสดง grid badges

---

### Task 13: Character Customization

**Objective:** Avatar gradient + title badge selector บันทึกได้

Implementation:
- Tab "ปรับแต่ง" ใน ProfileView
- `src/components/profile/AvatarCustomizer.vue`: gradient swatches + live preview
- `authStore.js`: updateAvatarGradient(), updateTitleBadge()
- `supabase/migration_avatar_customization.sql`: เพิ่ม column avatar_gradient, title_badge
- AvatarFrame รับ gradient prop

**Demo:** เลือก gradient -> preview live -> save -> AvatarFrame ทุกหน้าอัปเดต

---

### Task 14: QuizManageView & QuizEditView Polish

**Objective:** Manage + Edit ใช้ components ใหม่ครบ

Implementation:
- QuizManageView: card-quiz grid + PhPencil/PhTrash/PhPlay actions
- ConfirmDialog แทน window.confirm ตอนลบ
- QuizEditView: input-group fields
- แทน emoji ทั้งหมด

**Demo:** ลบ quiz -> ConfirmDialog สวย, manage grid ครบ

---

### Task 15: Final Polish & Responsive QA

**Objective:** ตรวจสอบทุกหน้าทุก breakpoint

Checklist:
- [ ] ไม่มี emoji หลงเหลือในทุกหน้า
- [ ] Mobile (375px), Tablet (640px), iPad Pro (1024px), Desktop (1280px)
- [ ] Touch targets >= 44px บน pointer:coarse
- [ ] Toast system ทุกกรณี
- [ ] AnimatedCounter ทำงานใน profile, history, dashboard
- [ ] ไม่มี console error ทุกหน้า
- [ ] `npm run build` ผ่านสะอาด

**Demo:** Walk-through ทุกหน้าบน 4 breakpoint ไม่มี layout แตก

---

## 10. File Change Map

### ไฟล์ที่ต้องแก้ไข (existing)

| File | Changes |
|------|---------|
| `package.json` | เพิ่ม `@phosphor-icons/vue` ใน dependencies |
| `tailwind.config.js` | เพิ่ม colors ใหม่ (depth-4, cyan, indigo, xp, rank variants) |
| `src/style.css` | เพิ่ม CSS classes, keyframes ทั้งหมด |
| `src/App.vue` | Navbar redesign ทั้งหมด |
| `src/views/HomeView.vue` | Landing + Dashboard split |
| `src/views/LoginView.vue` | Full redesign |
| `src/views/BattleView.vue` | Step 1&2 + HUD + end overlay |
| `src/views/PvPLobbyView.vue` | Full redesign |
| `src/views/PvPBattleView.vue` | Icon replacements + minor polish |
| `src/views/ProfileView.vue` | Full redesign + customization tab |
| `src/views/HistoryView.vue` | Full redesign + filter bar |
| `src/views/QuizGeneratorView.vue` | Icon replacements + StepIndicator |
| `src/views/QuizManageView.vue` | Card redesign + ConfirmDialog |
| `src/views/QuizEditView.vue` | Input groups + minor polish |
| `src/views/FreeView.vue` | Icon replacements |
| `src/router/index.js` | เพิ่ม route `/achievements` |
| `src/stores/authStore.js` | เพิ่ม updateAvatarGradient(), updateTitleBadge() |

### ไฟล์ใหม่ที่ต้องสร้าง

| File | Purpose |
|------|---------|
| `public/logo.png` | Logo full version (pixel art) |
| `public/logo-icon.png` | Logo icon only (sword + ?) |
| `src/composables/useToast.js` | Toast state composable |
| `src/components/ui/ToastItem.vue` | Single toast component |
| `src/components/ui/ToastProvider.vue` | Toast container |
| `src/components/ui/StepIndicator.vue` | Reusable step stepper |
| `src/components/ui/AnimatedCounter.vue` | Count-up number display |
| `src/components/ui/AvatarFrame.vue` | Avatar with gradient + ring |
| `src/components/ui/ConfirmDialog.vue` | Confirm modal (replaces window.confirm) |
| `src/components/achievements/AchievementBadge.vue` | Badge display component |
| `src/components/achievements/AchievementToast.vue` | Unlock notification |
| `src/components/profile/AvatarCustomizer.vue` | Gradient + title selector |
| `src/stores/achievementStore.js` | Achievement logic + unlock detection |
| `src/views/AchievementsView.vue` | Achievement grid page |
| `supabase/migration_avatar_customization.sql` | DB migration: avatar_gradient, title_badge |

### ไฟล์ที่ห้ามแตะ (critical)

| File | เหตุผล |
|------|--------|
| `package.json` scripts | Vite 4 workaround — ห้ามเปลี่ยน dev script เด็ดขาด |
| `index.html` | ต้องใช้ relative path `./src/main.js` เท่านั้น |
| `vite.config.js` | Vite 4.5.14 config |
| `src/lib/phaser/` | Phaser scene logic ไม่เกี่ยวกับ UI |
| `src/utils/battleCalculator.js` | Game logic |
| `supabase/schema.sql` | Base schema — ใช้ migration files แทน |

---

## Appendix A: Phosphor Icon Weight Guide

```
thin     : 0.5px stroke — background decorative
light    : 1px stroke
regular  : 1.5px stroke — inline กับ text
bold     : 2px stroke   — nav, buttons, UI controls
fill     : solid fill   — active state, HP/skill indicators
duotone  : 2-tone       — feature icons, empty state, large decorative
```

## Appendix B: Accessibility Notes

```
Focus ring  : focus-visible:ring-2 ring-qs-primary/50 บนทุก interactive element
Contrast    : qs-text (#e8eaf6) บน qs-card (#1a1e30) = 9.1:1 (AAA)
Touch target: min 44x44px สำหรับ pointer:coarse (iOS HIG standard)
Icons       : PhIcon ใส่ aria-hidden="true" เสมอ เพราะมี label กำกับ
Icon-only   : ต้องมี aria-label บน button ที่ไม่มี visible text
Screen reader: ลำดับ heading h1->h2->h3 ต้องถูกต้องทุกหน้า
```

## Appendix C: Quick Implementation Checklist

ก่อน implement แต่ละหน้า:
- [ ] อ่านไฟล์ปัจจุบันก่อนเสมอ
- [ ] ไม่เปลี่ยน battle logic, store logic ที่ไม่เกี่ยว
- [ ] แทน emoji ด้วย Phosphor icon + aria-hidden="true"
- [ ] ทุก form field ใช้ .input-group + .input-label
- [ ] ทุก error/success ใช้ toast แทน inline text
- [ ] ทดสอบ 4 breakpoint: 375px, 640px, 1024px, 1280px
- [ ] ตรวจ console errors หลัง build

---

*QuizSlayer UI Redesign Plan v1.0 — Ready for Implementation*
