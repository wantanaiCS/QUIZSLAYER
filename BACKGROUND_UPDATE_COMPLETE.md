# ✅ Background Update — Complete

## สรุปการเปลี่ยนแปลง Background แต่ละโหมด

ทุกหน้าได้รับการอัปเดต Background และ Particle Effects ตามที่ระบุแล้ว

### 📋 รายการโหมดและ Background

| โหมด/หน้า | Background | Particle Effects | ไฟล์ |
|-----------|------------|------------------|------|
| **Battle Arena** | `bg_04.png` | ขี้เถ้า + สะเกร็ดไฟ (`ash-sparks`) | `BattleView.vue` ✅ |
| **PvP Battle** | `bg_05.png` | หิมะ + ขี้เถ้า (`snow-ash`) | `PvPBattleView.vue` ✅ |
| **Free Practice** | `bg_02.png` | หิ่งห้อยสีฟ้า (`fireflies-blue`) | `FreeView.vue` ✅ |
| **AI Quiz Generator** | `bg_03.png` | หิมะ (`snow`) | `QuizGeneratorView.vue` ✅ |
| **ชุดข้อสอบของฉัน** | `bg_01.png` | หิ่งห้อยเหมือนหน้า Home (`fireflies`) | `QuizManageView.vue` ✅ |
| **ประวัติการต่อสู้** | `bg_01.png` | หิ่งห้อยเหมือนหน้า Home (`fireflies`) | `HistoryView.vue` ✅ |
| **Profile** | `bg_01.png` | หิ่งห้อยเหมือนหน้า Home (`fireflies`) | `ProfileView.vue` ✅ |
| **Home** | `bg_01.png` | หิ่งห้อยสีเหลือง-เขียว (`fireflies`) | `HomeView.vue` ✅ (ใช้อยู่แล้ว) |

---

## 🎨 Particle Effects ที่ใช้งาน

### 1. **Fireflies** (หิ่งห้อย — สีเหลือง-เขียว)
- ใช้ใน: Home, ชุดข้อสอบของฉัน, ประวัติการต่อสู้, Profile
- Effect: `effect="fireflies"`
- จำนวน: 20 particles

### 2. **Fireflies Blue** (หิ่งห้อย — สีฟ้า-Cyan)
- ใช้ใน: Free Practice
- Effect: `effect="fireflies-blue"`
- จำนวน: 20 particles

### 3. **Snow** (หิมะ)
- ใช้ใน: AI Quiz Generator
- Effect: `effect="snow"`
- จำนวน: 25 particles

### 4. **Ash + Sparks** (ขี้เถ่า + สะเกร็ดไฟ)
- ใช้ใน: Battle Arena
- Effect: `effect="ash-sparks"`
- จำนวน: 30 particles (60% ash + 40% sparks)

### 5. **Snow + Ash** (หิมะ + ขี้เถ่า)
- ใช้ใน: PvP Battle
- Effect: `effect="snow-ash"`
- จำนวน: 35 particles (60% snow + 40% ash)

---

## 📝 โครงสร้าง BackgroundEffect Component

```vue
<BackgroundEffect 
  bg-image="/bg_XX.png"    <!-- Background image -->
  effect="effect-name"      <!-- Particle effect type -->
  :particle-count="20"      <!-- จำนวน particles -->
  :z-index="0"              <!-- z-index สำหรับ layering -->
/>
```

### Supported Effects:
- `fireflies` — หิ่งห้อยสีเหลือง-เขียว
- `fireflies-blue` — หิ่งห้อยสีฟ้า
- `snow` — หิมะ
- `ash` — ขี้เถ่า
- `sparks` — สะเกร็ดไฟ
- `ash-sparks` — ขี้เถ่า + สะเกร็ดไฟ (combined)
- `snow-ash` — หิมะ + ขี้เถ่า (combined)

---

## 🎯 การปรับแต่ง z-index Layer

ทุกหน้าได้รับการตั้งค่า z-index ให้ถูกต้อง:

```vue
<!-- Background Layer (z-index: 0) -->
<BackgroundEffect :z-index="0" />

<!-- Content Layer (z-index: 10) -->
<div class="relative z-10">
  <!-- เนื้อหาทั้งหมด -->
</div>
```

---

## ✨ Responsive & Performance

- **Particle Count** ปรับให้เหมาะสมกับแต่ละโหมด (20-35 particles)
- **Animation Duration** แตกต่างกันแต่ละ particle เพื่อความเป็นธรรมชาติ
- **Will-change** properties ใช้สำหรับ GPU acceleration
- **Pointer-events: none** บน particle layer เพื่อไม่ให้ขัดขวางการคลิก

---

## 🔧 Technical Implementation

### CSS Keyframes สำหรับ Particle Effects

- `@keyframes fireflyFloat` — การเคลื่อนที่ของหิ่งห้อย
- `@keyframes fireflyGlow` — แสงเรืองของหิ่งห้อยสีเหลือง
- `@keyframes fireflyGlowBlue` — แสงเรืองของหิ่งห้อยสีฟ้า
- `@keyframes snowFall` — การตกของหิมะ
- `@keyframes ashFloat` — การลอยของขี้เถ่า
- `@keyframes sparkRise` — การพุ่งขึ้นของสะเกร็ดไฟ
- `@keyframes sparkGlow` — แสงเรืองของสะเกร็ดไฟ

ทั้งหมดอยู่ใน `src/style.css`

---

## 🚀 การทดสอบ

เพื่อดู Background ที่เปลี่ยนแปลง:

```bash
npm run dev
```

แล้วเปิดดูแต่ละโหมด:
- `/battle` → bg_04 + ash-sparks
- `/pvp` → PvP Lobby (bg_01) → Battle (bg_05 + snow-ash)
- `/free` → bg_02 + fireflies-blue
- `/generator` → bg_03 + snow
- `/manage` → bg_01 + fireflies
- `/history` → bg_01 + fireflies
- `/profile` → bg_01 + fireflies
- `/` (Home) → bg_01 + fireflies

---

## 📦 ไฟล์ที่ถูกแก้ไข

1. ✅ `src/views/BattleView.vue` — เปลี่ยนเป็น bg_04 + ash-sparks
2. ✅ `src/views/PvPBattleView.vue` — เปลี่ยนเป็น bg_05 + snow-ash
3. ✅ `src/views/FreeView.vue` — เปลี่ยนเป็น bg_02 + fireflies-blue
4. ✅ `src/views/QuizGeneratorView.vue` — เปลี่ยนเป็น bg_03 + snow
5. ✅ `src/views/QuizManageView.vue` — เพิ่ม bg_01 + fireflies
6. ✅ `src/views/HistoryView.vue` — เพิ่ม bg_01 + fireflies
7. ✅ `src/views/ProfileView.vue` — เพิ่ม bg_01 + fireflies
8. ✅ `src/views/HomeView.vue` — ใช้อยู่แล้ว (bg_01 + fireflies)

---

## 🎨 Background Files ที่ใช้

ตรวจสอบไฟล์ background ใน `public/`:
- ✅ `bg_01.png` — Home, Manage, History, Profile
- ✅ `bg_02.png` — Free Practice
- ✅ `bg_03.png` — AI Generator
- ✅ `bg_04.png` — Battle Arena
- ✅ `bg_05.png` — PvP Battle

---

## ✨ เสร็จสมบูรณ์!

ทุก Background และ Particle Effects ได้รับการอัปเดตเรียบร้อยแล้ว 🎉

ระบบพร้อมใช้งานทันที — ไม่ต้อง restart dev server
