# QuizSlayer — UI Redesign Implementation Plan

## 🎯 Design Goals

1. **ฟอนต์ภาษาไทย** → ใช้ Prompt หรือ Sarabun (modern, game-friendly)
2. **ฟอนต์หัวข้อภาษาอังกฤษ** → ใช้ Press Start 2P (Pixel font) แบบสม่ำเสมอทุกหน้า
3. **องค์ประกอบเป็นมาตรฐาน** → Layout pattern เดียวกันทุกหน้า

---

## 🔤 Typography System

### New Font Stack
```
Thai Body Text:    'Prompt' (or 'Sarabun' as fallback)
English Headings:  'Press Start 2P' (Pixel font) — ใช้สำหรับหัวข้อทุกหน้า
Body English:      'Outfit' (secondary)
Pixel UI:          'Press Start 2P' (stats, badges, game UI)
```

### Font Hierarchy
| Element | Font | Size | Weight | Transform |
|---------|------|------|--------|-----------|
| Page Title (Eng) | Press Start 2P | 18px | — | uppercase |
| Section Heading (Eng) | Press Start 2P | 14px | — | uppercase |
| Body Thai | Prompt | 14px | 400 | — |
| Body English | Outfit | 14px | 500 | — |
| Stats/Badges | Press Start 2P | 10-12px | — | — |

---

## 📐 Standardized Page Header Pattern

**ทุกหน้าจะใช้ layout header pattern แบบเดียวกัน:**

```vue
<template>
  <div class="page-container">
    <!-- ✅ Standard Header Pattern -->
    <div class="page-header">
      <!-- Icon + Pixel Title -->
      <div class="page-header-title">
        <GameIcon name="icon-name" :size="24" class="text-qs-primary" />
        <h1 class="page-title">ENGLISH TITLE</h1>
      </div>
      <!-- Description (Thai) -->
      <p class="page-description">คำอธิบายภาษาไทย</p>
    </div>

    <!-- Content -->
    <div class="page-content">
      <!-- Section with consistent heading -->
      <section class="page-section">
        <h2 class="section-title">SECTION NAME</h2>
        <p class="section-description">รายละเอียดภาษาไทย</p>
        <!-- Section content -->
      </section>
    </div>
  </div>
</template>
```

---

## 🎨 Page-by-Page Redesign

### 1. **HomeView.vue**
**Before:** Logo ใหญ่, หัวข้อ "เลือกโหมดที่ใช่" (Thai)  
**After:**
- Hero: Logo + tagline Thai (ไม่เปลี่ยน)
- Section: `<h2 class="section-title">GAME MODES</h2>`
- Description: "4 โหมดเกม รองรับทุกสไตล์การเล่น" (Thai)
- Feature Section: `GAME SYSTEMS` (Pixel Eng)

---

### 2. **BattleView.vue**
**Before:** "Battle Arena" (Eng) + Step Indicator  
**After:**
- Header:
  ```vue
  <div class="page-header-title">
    <GameIcon name="sword" :size="24" />
    <h1 class="page-title">BATTLE ARENA</h1>
  </div>
  <p class="page-description">เลือกชุดข้อสอบและโหมดความยาก แล้วลงสนาม</p>
  ```
- Stage Section: `<h2 class="section-title">5 STAGES</h2>`

---

### 3. **PvPBattleView.vue**
**Before:** "PvP Battle" (Eng) + icon  
**After:**
- Header:
  ```vue
  <div class="page-header-title">
    <GameIcon name="crossed-swords" :size="24" />
    <h1 class="page-title">PVP BATTLE</h1>
  </div>
  <p class="page-description">แข่งตอบคำถามกับเพื่อนแบบ Real-time</p>
  ```

---

### 4. **PvPLobbyView.vue**
**Before:** "PvP Battle" (Eng) + icon inline  
**After:**
- Same pattern:
  ```vue
  <div class="page-header-title">
    <GameIcon name="users-three" :size="24" />
    <h1 class="page-title">PVP LOBBY</h1>
  </div>
  <p class="page-description">สร้างห้องหรือเข้าห้องเพื่อแข่งกับเพื่อน</p>
  ```

---

### 5. **QuizManageView.vue**
**Before:** "ชุดข้อสอบของฉัน" (Thai)  
**After:**
- Header:
  ```vue
  <div class="page-header-title">
    <GameIcon name="list-bullets" :size="24" />
    <h1 class="page-title">MY QUIZZES</h1>
  </div>
  <p class="page-description">จัดการ แก้ไข และลบชุดข้อสอบที่สร้างไว้</p>
  ```

---

### 6. **HistoryView.vue**
**Before:** "ประวัติการต่อสู้" (Thai)  
**After:**
- Header:
  ```vue
  <div class="page-header-title">
    <GameIcon name="scroll-unfurled" :size="24" />
    <h1 class="page-title">BATTLE HISTORY</h1>
  </div>
  <p class="page-description">สถิติและบันทึกทุกสมรภูมิ</p>
  ```

---

### 7. **QuizGeneratorView.vue** (not in sample)
**Expected pattern:**
```vue
<div class="page-header-title">
  <GameIcon name="artificial-intelligence" :size="24" />
  <h1 class="page-title">AI QUIZ GENERATOR</h1>
</div>
<p class="page-description">สร้างข้อสอบด้วย AI จากหัวข้อหรือเอกสาร</p>
```

---

### 8. **ProfileView.vue** (not in sample)
**Expected pattern:**
```vue
<div class="page-header-title">
  <GameIcon name="user" :size="24" />
  <h1 class="page-title">PLAYER PROFILE</h1>
</div>
<p class="page-description">ข้อมูลโปรไฟล์และการตั้งค่าบัญชี</p>
```

---

### 9. **AchievementsView.vue** (not in sample)
**Expected pattern:**
```vue
<div class="page-header-title">
  <GameIcon name="trophy" :size="24" />
  <h1 class="page-title">ACHIEVEMENTS</h1>
</div>
<p class="page-description">คอลเลกชั่นความสำเร็จที่ปลดล็อกแล้ว</p>
```

---

## 🔧 CSS Changes

### New Utility Classes
```css
/* Page Layout */
.page-container {
  @apply max-w-6xl mx-auto px-4 py-10 relative z-10;
}

.page-header {
  @apply mb-8 text-center;
}

.page-header-title {
  @apply flex items-center justify-center gap-3 mb-2;
}

.page-title {
  @apply font-pixel text-lg text-qs-text uppercase tracking-wider;
  text-shadow: 0 0 10px rgba(79, 195, 247, 0.6);
}

.page-description {
  @apply text-qs-muted text-sm;
}

.page-content {
  @apply space-y-12;
}

.page-section {
  @apply space-y-6;
}

.section-title {
  @apply font-pixel text-sm text-qs-accent uppercase tracking-widest text-center mb-2;
}

.section-description {
  @apply text-qs-muted text-xs text-center mb-6;
}
```

---

## 📦 Implementation Steps

### Step 1: Update Fonts
- เพิ่ม Google Font: `Prompt` (Thai) หรือ `Sarabun`
- Update `style.css` `@import`
- Update `tailwind.config.js` font-family

### Step 2: Add CSS Utility Classes
- เพิ่ม `.page-*` classes ใน `style.css`

### Step 3: Update All View Files
Refactor ทีละหน้าตาม pattern ข้างต้น:
1. HomeView.vue
2. BattleView.vue
3. PvPBattleView.vue
4. PvPLobbyView.vue
5. QuizManageView.vue
6. HistoryView.vue
7. QuizGeneratorView.vue
8. QuizEditView.vue
9. ProfileView.vue
10. AchievementsView.vue
11. FreeView.vue
12. LoginView.vue

### Step 4: Verify Consistency
- ตรวจสอบว่าทุกหน้ามี:
  - ✅ Icon + Pixel Title (Eng)
  - ✅ Thai Description
  - ✅ Section titles เป็น Pixel Eng
  - ✅ Layout spacing เหมือนกัน

---

## 🎯 Design Principles

1. **Pixel Headings = Game Identity**  
   ทุก heading ที่สำคัญใช้ Press Start 2P เพื่อเน้นความเป็น retro RPG

2. **Thai Readability = User Comfort**  
   ใช้ Prompt/Sarabun เพื่อให้อ่านง่าย ไม่ยาวเกินไป

3. **Icon Consistency = Visual Cue**  
   ทุกหน้ามี icon ซ้ายหัวข้อ ช่วยจำได้ง่าย

4. **Spacing Harmony = Clean Layout**  
   ใช้ Tailwind spacing scale แบบเดียวกัน (mb-2, mb-6, mb-8)

---

## 🚀 Migration Priority

**Phase 1 (High Priority):**
- HomeView ✅ (หน้าแรก impression)
- BattleView ✅ (main gameplay)
- PvPBattleView ✅ (multiplayer)

**Phase 2 (Medium Priority):**
- QuizManageView ✅
- HistoryView ✅
- QuizGeneratorView ✅

**Phase 3 (Low Priority):**
- ProfileView
- AchievementsView
- LoginView (minimal header, no change needed)

---

## 📝 Font Recommendation

**ฟอนต์ภาษาไทยที่แนะนำ:**

1. **Prompt** (Google Fonts) — modern, clean, เหมาะกับ UI เกม
2. **Sarabun** (Google Fonts) — legible, neutral
3. **Kanit** (Google Fonts) — bold, dynamic (ถ้าต้องการ personality มากกว่า)

**เลือก: Prompt** → เพราะ:
- ✅ ทันสมัย ไม่เครียด
- ✅ อ่านง่าย ตัวชัด
- ✅ มี weight หลากหลาย (300-800)
- ✅ เข้ากับ concept เกมแนว modern RPG

---

## 🎨 Color Consistency Check

**ตรวจสอบให้ icon + title ใช้สีเดียวกันทุกหน้า:**

| Page | Icon Color | Title Color | Description |
|------|-----------|-------------|-------------|
| Home | primary | text | — |
| Battle | primary | text | — |
| PvP Battle | danger | text | vs theme |
| PvP Lobby | primary | text | — |
| Quiz Manage | primary | text | — |
| History | primary | text | — |
| Generator | gold | text | AI theme |
| Profile | accent | text | personal theme |
| Achievements | gold | text | reward theme |

---

## ✅ Success Criteria

- [ ] ทุกหน้ามี Pixel English heading
- [ ] ทุก description / body text เป็น Thai font ที่อ่านง่าย
- [ ] Layout pattern เหมือนกันทุกหน้า
- [ ] Icon + Title alignment สม่ำเสมอ
- [ ] Spacing rhythm สอดคล้องกัน
- [ ] ไม่มี mixed Thai/Eng headings อีกต่อไป

---

## 📊 Before/After Comparison

| Element | Before | After |
|---------|--------|-------|
| HomeView heading | "เลือกโหมดที่ใช่" | "GAME MODES" (Pixel) |
| QuizManage heading | "ชุดข้อสอบของฉัน" | "MY QUIZZES" (Pixel) |
| History heading | "ประวัติการต่อสู้" | "BATTLE HISTORY" (Pixel) |
| Thai body text | Outfit (Eng font) | Prompt (Thai font) |
| English body text | Outfit | Outfit |

---

## 🔗 Implementation Checklist

- [ ] Add Prompt font to `style.css`
- [ ] Update Tailwind config
- [ ] Add `.page-*` utility classes
- [ ] Refactor HomeView
- [ ] Refactor BattleView
- [ ] Refactor PvPBattleView
- [ ] Refactor PvPLobbyView
- [ ] Refactor QuizManageView
- [ ] Refactor HistoryView
- [ ] Refactor QuizGeneratorView
- [ ] Refactor remaining views
- [ ] Test all pages for consistency
- [ ] Verify mobile responsive
- [ ] Commit changes

---

**Last Updated:** $(date)  
**Status:** 📋 Plan Ready — Ready for Implementation
