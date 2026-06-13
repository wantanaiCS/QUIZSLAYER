# 🎮 QuizSlayer PvP - Deployment Guide

> ขั้นตอนการ setup, test, และ deploy ระบบ PvP อย่างละเอียด

---

## 📋 Table of Contents

1. [Phase 1: Database Setup](#phase-1-database-setup)
2. [Phase 2: Local Development Setup](#phase-2-local-development-setup)
3. [Phase 3: Testing - 1 Người (Mock Mode)](#phase-3-testing-1-person-mock-mode)
4. [Phase 4: Testing - 2 คน (Realtime)](#phase-4-testing-2-people-realtime)
5. [Phase 5: Edge Cases Testing](#phase-5-edge-cases-testing)
6. [Phase 6: Production Deployment](#phase-6-production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Phase 1: Database Setup

### Step 1.1: เปิด Supabase Dashboard

1. ไปที่ https://app.supabase.com
2. ล็อกอิน ด้วยบัญชี wantanaiCS
3. เลือก project **QUIZSLAYER** (ซึ่งอยู่ที่ `yvrbnghjulfmaveckiwa`)

```
📍 หน้า Dashboard
URL: https://app.supabase.com/project/yvrbnghjulfmaveckiwa
```

---

### Step 1.2: รันสคริปต์ PvP SQL

1. ไปที่ **SQL Editor** ในเมนูด้านซ้าย
2. คลิก **"New Query"** และชื่อว่า `PvP_Setup`
3. **คัดลอกทั้งหมด** จากไฟล์ `supabase/pvp_setup.sql` ของโปรเจกต์

   ```bash
   # Windows: เปิด PowerShell และรัน
   Get-Content "r:\C#\QUIZSLAYER\supabase\pvp_setup.sql" | Set-Clipboard
   ```

4. วาง (Ctrl+V) ลงใน SQL Editor
5. คลิก **RUN** (หรือ Ctrl+Enter)

**⏳ รอจน error ขึ้นเป็น 0 (ถ้ามี warning เล็กน้อยไม่ต้องห่วง)**

**ตรวจสอบผล:**
- ดูมี message ว่า `pvp_rooms created` ✓
- ดูมี message ว่า `pvp_sessions created` ✓
- ดูมี message ว่า `generate_room_code exists` ✓

---

### Step 1.3: ตรวจสอบ RLS Policies

ไปยัง **Database** → **Tables** ในเมนูด้านซ้าย

#### ตรวจสอบ `pvp_rooms` table:

1. ไปที่ **pvp_rooms** table → **RLS** tab
2. คุณควรเห็น policies:
   - ✓ `pvp_rooms_select` 
   - ✓ `pvp_rooms_insert`
   - ✓ `pvp_rooms_update`

**ถ้าไม่เห็น** → เมื่อสคริปต์ที่หนึ่งรันสำเร็จ policies ควรถูกสร้าง

#### ตรวจสอบ `pvp_sessions` table:

1. ไปที่ **pvp_sessions** table → **RLS** tab
2. คุณควรเห็น policies:
   - ✓ `pvp_sessions_select`
   - ✓ `pvp_sessions_insert`

---

### Step 1.4: ✅ เปิด Realtime สำหรับ pvp_rooms (สำคัญ!)

**ทำไมต้องเปิด?** ไม่เปิด → 2 คนจะไม่เห็นการเปลี่ยนแปลงแบบเรียลไทม์

1. ไปที่ **Database** → **Publications** ในเมนูด้านซ้าย
2. ล่าง section **"supabase_realtime"** → ดูตาราที่ enabled
3. ค้นหา **pvp_rooms** 
   - **ถ้ายังไม่มี**: คลิก **"Show all"** → toggle **pvp_rooms** เป็น ON ✓
   - **ถ้ามีแล้ว**: ปล่อยไว้เหมือนเดิม ✓

**Realtime enable เสร็จแล้ว** → guest ที่เข้าห้องจะปรากฏแบบเรียลไทม์

---

### ✅ Checkpoint 1.5: Database Setup เสร็จ

ตรวจสอบ:
- [ ] SQL script รัน 0 errors
- [ ] pvp_rooms table มี RLS enable
- [ ] pvp_sessions table มี RLS enable
- [ ] pvp_rooms publish บน Realtime

**ถ้าเสร็จแล้ว** → ไปยัง Phase 2

---

## Phase 2: Local Development Setup

### Step 2.1: ตรวจสอบ Node.js และ npm

```bash
node --version    # ควรจะ v18+
npm --version     # ควรจะ v9+
```

**ถ้าไม่มี:**
- ดาวน์โหลด Node.js จาก https://nodejs.org (LTS version)
- Restart terminal หลังติดตั้ง

---

### Step 2.2: ติดตั้ง Dependencies

```bash
cd r:\C#\QUIZSLAYER

# ลบ node_modules เก่า (ถ้ามี)
rmdir /s /q node_modules
del package-lock.json

# ติดตั้ง dependencies ใหม่
npm install

# รอจน package ทั้งหมดติดตั้ง...
```

**ตรวจสอบ:**
- [ ] ไม่มี error (warning เล็กน้อยไม่ต้องห่วง)
- [ ] ไม่มี message ว่า "failed"
- [ ] Folder `node_modules` มีขนาด ~500MB ขึ้นไป

---

### Step 2.3: ตรวจสอบ Environment Variables

เปิดไฟล์ `.env`:

```bash
# ตรวจสอบว่ามี
VITE_SUPABASE_URL=https://yvrbnghjulfmaveckiwa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi... (อันยาวๆ)
VITE_APP_NAME=QuizSlayer
VITE_APP_URL=http://localhost:5173
```

**ถ้าไม่ครบ** → เปิด `.env.example` และคัดลอกมา

---

### Step 2.4: เริ่ม Dev Server

```bash
npm run dev

# คุณควรเห็น output:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

**เปิด browser:**
1. ไปที่ http://localhost:5173
2. คุณควรเห็นหน้า Home
3. สามารถ Login ได้ไหม?

**ถ้าเห็น error:**
- [ ] Supabase connection failed → ตรวจสอบ `.env` variables
- [ ] CORS error → check Supabase URL ถูกต้องไหม
- [ ] Module not found → รัน `npm install` อีกครั้ง

---

### ✅ Checkpoint 2.5: Dev Server Setup เสร็จ

- [ ] `npm install` สำเร็จไม่มี error
- [ ] `npm run dev` เริ่มทำงาน
- [ ] http://localhost:5173 เปิดได้
- [ ] สามารถ Login ได้ (ถ้ามี auth)

---

## Phase 3: Testing - 1 Person (Mock Mode)

**ที่สำคัญ:** Mock mode ใช้ในการทดสอบเพียงคนเดียวโดยไม่ต้องเชื่อมต่อกับ Supabase

### Step 3.1: เข้า PvP Lobby

1. ล็อกอิน ด้วยบัญชีใดก็ได้
2. ไปที่เมนู → **PvP** (หรือ navigate ไป `/pvp`)
3. คุณควรเห็นหน้า "⚔️ PvP Battle"

```
📍 Expected Screen:
┌─────────────────┐
│  ⚔️ PvP Battle  │
│  แข่งตอบคำถาม  │
├─────────────────┤
│  🏠 สร้างห้อง   │
│  🚪 เข้าห้อง    │
└─────────────────┘
```

---

### Step 3.2: Mock Mode - Host (สร้างห้อง)

1. คลิก **🏠 สร้างห้อง**
2. คลิก **"ถัดไป →"** (ในหน้า Step 1)
3. เลือกสี เช่น **🔴 Red** → คลิก **"ถัดไป →"**
4. คลิก **🏠 สร้างห้อง**

**ตรวจสอบผล:**

```
✓ ได้โค้ดห้อง 6 หลัก (เช่น ABC123)
✓ ปุ่ม "📋 คัดลอก" ทำงาน
✓ เห็น "รอเพื่อนเข้าห้อง..."
✓ Waiting room card แสดงชื่อของคุณ
```

---

### Step 3.3: Mock Mode - Guest (เข้าห้อง)

**ในหน้า host ยังรอ guest**

1. **เปิด Browser Tab หรือ Incognito ใหม่** (หรือ logout แล้ว login ด้วยบัญชีอื่น)
2. ไปที่ http://localhost:5173/pvp
3. คลิก **🚪 เข้าห้อง**
4. ใส่โค้ดห้องจาก host (เช่น ABC123)
5. เลือกสี เช่น **🔵 Blue**
6. คลิก **🚪 เข้าห้อง**

**ตรวจสอบผล:**

```
✓ ดูว่า host tab เห็น guest เข้ามาหรือเปล่า (Realtime)
✓ Host tab: ปุ่ม "⚔️ เริ่มเกม!" active (ไม่ disabled)
✓ Guest tab: เห็น "รอ Host เริ่มเกม..."
```

---

### Step 3.4: Mock Mode - Start Game

**ใน Host Tab:**
1. คลิก **⚔️ เริ่มเกม!**
2. ควรเห็น RPS (Rock-Paper-Scissors) screen

**ใน Guest Tab:**
1. ควรเห็น RPS screen ด้วย (Realtime sync)

**RPS Screen:**

```
┌──────────────────────────────┐
│  เลือก Rock, Paper, Scissors │
│  ✋ ✌️ ✊                      │
│                              │
│  [Host Name] vs [Guest Name] │
└──────────────────────────────┘
```

---

### Step 3.5: Mock Mode - Play RPS

**ใน Host Tab:**
1. คลิก **✊ Rock** (หรืออย่างไรก็ได้)
2. ควรเห็น "ของคุณ: Rock"

**ใน Guest Tab:**
1. คลิก **✌️ Scissors** (ให้ host ชนะ)
2. ควรเห็น "ของคุณ: Scissors"

**หลังจาก 2-3 วินาที:**
1. ทั้ง 2 tab ควรเห็นผลลัพธ์:
   ```
   Host ชนะ Rock vs Scissors
   ```
2. หลังจากนั้น → **Playing Phase** ขึ้นมา

---

### Step 3.6: Mock Mode - Answer Questions

**Battle Screen:**

```
┌─────────────────────────────────────────┐
│  ⚔️ ตาของคุณ!          ⏳ รอคู่แข่ง...  │
├─────────────────────────────────────────┤
│  [HP Bar Host: 20/20]  [HP Bar Guest: 20/20] │
│                                         │
│  ข้อที่ 1                               │
│  "คำถามว่า..."                          │
│                                         │
│  A. ตัวเลือก A                         │
│  B. ตัวเลือก B                         │
│  C. ตัวเลือก C (✓ คำตอบถูก)            │
│  D. ตัวเลือก D                         │
└─────────────────────────────────────────┘
```

---

### Step 3.7: Mock Mode - Answer Test

**ใน Host Tab (ตาของ Host):**
1. ดู Question ว่าเขียนอะไร
2. คลิก **ตัวเลือก C** (ตัวที่ 3)

**ตรวจสอบผล:**

```
✓ ปุ่มปรากฏ "wrong" class (สีแดง) ถ้าตอบผิด
✓ ปุ่มปรากฏ "correct" class (สีเขียว) ถ้าตอบถูก
✓ HP ลดลง (damage applied)
✓ Turn เปลี่ยนไป Guest
✓ ข้อต่อไป load ขึ้น
```

**ใน Guest Tab (หลังจาก 1 วินาที):**
1. ตัวละครของ host ควรแสดง animation (attack/hurt)
2. ตอบคำถามข้อถัดไป

---

### Step 3.8: Mock Mode - Lucky Box (ทุก 5 ข้อ)

หลังจาก 5 ข้อแรก:
1. Screen ควรเปลี่ยนไปหน้า **Lucky Box**

```
┌──────────────────────────────────────────┐
│  🎁 เลือก 1 ใน 3 ของขวัญ               │
│                                         │
│  [Card 1]  [Card 2]  [Card 3]          │
│  ❓        ❓        ❓                 │
│                                         │
│  คลิกเพื่อเลือก...                     │
└──────────────────────────────────────────┘
```

2. คลิก**ใดก็ได้** (เช่น Card 1)
3. ควรแสดง item ที่ได้ (เช่น 💊 Double HP)

**ตรวจสอบผล:**

```
✓ ได้ item ถูกต้อง
✓ ถ้าเป็น trap (💣 Bomb, 🧊 Freeze) → damage/freeze apply ทันที
✓ ถ้า good item → add ไป inventory
✓ กลับไป battle screen
```

---

### Step 3.9: Mock Mode - Use Item

**ถ้าได้ good item (เช่น 💊 Double HP):**

1. ดูที่ PlayerCard ของคุณ → ควรเห็น item icon
2. คลิก item icon เพื่อใช้

**ตรวจสอบผล:**

```
✓ Item ถูกลบออก
✓ Effect apply ถูกต้อง (HP เพิ่ม, next damage ×2, etc.)
```

---

### Step 3.10: Mock Mode - Game Finish

เล่นต่อจนกว่า **HP ใครซักคน = 0**

1. Screen ควรแสดง **Victory/Defeat Screen**

```
┌────────────────────────────────┐
│  🏆 ชนะแล้ว!                   │
│  (หรือ 💀 แพ้แล้ว...)          │
│                                │
│  HP เหลือ: 5/20               │
│  ข้อที่ตอบ: 20 ข้อ            │
│                                │
│  [🚪 กลับหน้าหลัก] [🔄 เล่นใหม่]│
└────────────────────────────────┘
```

2. คลิก **🔄 เล่นใหม่** → กลับ PvP Lobby

---

### ✅ Checkpoint 3.11: Mock Mode Testing เสร็จ

- [ ] สร้างห้องได้
- [ ] เข้าห้องได้
- [ ] RPS round ทำงาน
- [ ] ตอบคำถาม HP ลดลง
- [ ] Lucky box ปรากฏทุก 5 ข้อ
- [ ] Items ใช้ได้
- [ ] Game finish screen ปรากฏ

**ถ้าเสร็จแล้ว** → ไปยัง Phase 4

---

## Phase 4: Testing - 2 People (Realtime)

**ที่สำคัญ:** ทดสอบเบอร์นี้จริงๆ ต้องใช้ Realtime ของ Supabase

### Step 4.1: Prepare 2 Devices/Browsers

**Device 1 (Host):**
- Chrome/Firefox window ที่ 1
- http://localhost:5173
- Login ด้วย Account A

**Device 2 (Guest):**
- Chrome/Firefox window ที่ 2 (หรือ Incognito)
- http://localhost:5173
- Login ด้วย Account B (หรือ logout แล้ว)

**ถ้าไม่มี 2 accounts:**
1. ไปที่ Supabase → Authentication → Users
2. สร้าง user ใหม่ 2 อัน
   - Account A: email `test1@example.com` password `test1234`
   - Account B: email `test2@example.com` password `test1234`

---

### Step 4.2: Device 1 (Host) - Create Room

**Device 1 (สมมติหน้าจอ PC):**

1. Login ด้วย Account A
2. ไปที่ **PvP** → **🏠 สร้างห้อง**
3. **Step 1:** เลือก Quiz Set (เช่น "English Vocab") → **ถัดไป →**
4. **Step 2:** เลือกสี (เช่น 🔴 Red) → **🏠 สร้างห้อง**
5. **รอจนได้โค้ด** (เช่น `XY7K9Z`)

```
✓ Waiting room card
✓ โค้ด room แสดง
✓ Status: "รอเพื่อนเข้าห้อง..."
```

---

### Step 4.3: Device 2 (Guest) - Join Room

**Device 2 (สมมติ Laptop):**

1. Login ด้วย Account B
2. ไปที่ **PvP** → **🚪 เข้าห้อง**
3. ใส่โค้ด: `XY7K9Z` (จาก Device 1)
4. เลือกสี (เช่น 🔵 Blue)
5. คลิก **🚪 เข้าห้อง**

```
✓ Guest waiting room card
✓ ข้อความ: "รอ Host เริ่มเกม..."
```

---

### Step 4.4: ✅ Realtime Sync Test

**ตรวจสอบใน Device 1 (Host):**

```
⏳ รอ 1-2 วินาที... ← realtime sync ไม่ใช่ instant
✓ ควรเห็น guest info ปรากฏ:
   - Guest Name: [Account B email]
   - Status: "🟢 เข้ามาแล้ว"
✓ ปุ่ม "⚔️ เริ่มเกม!" active (ไม่ disabled)
```

**ถ้าไม่เห็น guest:**

```
❌ Realtime ไม่ทำงาน
→ Check Supabase Dashboard → Publications → pvp_rooms enabled?
→ Try refresh Page
```

---

### Step 4.5: Device 1 - Start Game

**Device 1 (Host):**
1. คลิก **⚔️ เริ่มเกม!**
2. ควรเห็น **RPS Screen**

**Device 2 (Guest):**
1. ควรเห็น **RPS Screen** ด้วย (ไม่ต้องคลิก)

---

### Step 4.6: RPS Round - Realtime

**Device 1 (Host):**
1. คลิก **✊ Rock**
2. เห็น "เลือก: Rock" บน UI

**Device 2 (Guest):**
1. รอ 1-2 วินาที...
2. ควรเห็นคำว่า "✋ Paperเลือก" (committed hash)
3. คลิก **✌️ Scissors**

**หลังจาก 2-3 วินาที:**
1. **ทั้ง 2 Screen** ควรแสดง:
   ```
   Host: ✊ Rock
   Guest: ✌️ Scissors
   ← Host ชนะ
   ```

2. ถัดไป → **Battle Screen** เปิด

---

### Step 4.7: Battle - Host's Turn

**Device 1 (Host - ตาเขา):**

1. ควรเห็น "⚔️ ตาของคุณ!"
2. Question แสดง
3. คลิกตัวเลือก (เช่น A, B, C, หรือ D)

```
✓ Answer ถูก → damage guest HP
✓ Answer ผิด → damage host HP
```

**Device 2 (Guest - รอเขา):**

1. ควรเห็น "⏳ รอ [Host Name]..."
2. ตัวละคร Host ควร animate attack/hurt

---

### Step 4.8: Battle - Real HP Sync

**ตรวจสอบ:**

```
✓ Device 1 แสดง: Host HP 20, Guest HP 16 (เช่น)
✓ Device 2 แสดง: Host HP 20, Guest HP 16 (เหมือนกัน)
← ต้องตรงกันเพราะ realtime sync
```

**ถ้าไม่ตรงกัน:**

```
❌ State sync ไม่ทำงาน
→ Check browser console สำหรับ errors
→ Check Supabase status
```

---

### Step 4.9: Turn Switching Test

**Device 2 (Guest - ตาเขา):**

1. ผ่านการรอจาก Host
2. ปุ่มปรากฏ: "⚔️ ตาของคุณ!"
3. คลิกตัวเลือก
4. HP ลดลง (ถ้าตอบผิด)

**Device 1 (Host - รอเขา):**

1. ตัวละคร Guest ควร animate
2. Turn ควรเปลี่ยนกลับมา

---

### Step 4.10: Lucky Box Sync

หลังจาก 5 ข้อ:

**Device 1:**
```
🎁 Lucky Box ปรากฏ
[Card 1] [Card 2] [Card 3]
```

**Device 2:**
```
🎁 Lucky Box ปรากฏ (เหมือนกัน)
[Card 1] [Card 2] [Card 3]
```

1. **Device 1** คลิก Card 1 ได้ 💊 Double HP
2. **Device 2** ควรเห็น item picked (realtime)

---

### Step 4.11: Game Finish - 2 Player

เล่นต่อจนใครสักคน HP = 0

**ทั้ง 2 Device:**
1. ควรเห็น Victory/Defeat Screen พร้อมกัน
2. เห็นผู้ชนะเหมือนกัน

---

### ✅ Checkpoint 4.12: Realtime Testing เสร็จ

- [ ] Guest เห็นเข้าห้องเรียลไทม์
- [ ] RPS sync ถูกต้อง
- [ ] Battle phase sync HP/Turn/Items
- [ ] Lucky box ทั้ง 2 เห็นเหมือนกัน
- [ ] Victory/Defeat sync

**ถ้าเสร็จแล้ว** → ไปยัง Phase 5

---

## Phase 5: Edge Cases Testing

### Test 5.1: Network Disconnect

**Scenario:** Guest ปลั๊ก WiFi ขณะเล่น

1. **Device 1 (Host):** กำลังเล่น
2. **Device 2 (Guest):** ปลั๊ก WiFi/Turn off WiFi
3. **ตรวจสอบ Device 1:**
   ```
   ❌ ควรแสดง "Guest disconnected"
   ✓ Host ชนะโดยอัตโนมัติ หรือ
   ✓ Game paused รอ reconnect
   ```

---

### Test 5.2: Page Refresh

**Scenario:** Guest ปลั๊ยรีเฟรช page

1. **Device 1 (Host):** กำลังเล่น
2. **Device 2 (Guest):** F5 Refresh page
3. **ตรวจสอบ:**
   ```
   ✓ Guest กลับมา PvP Lobby
   ✓ ห้องยังเหลือหรือหรือสิ้น?
   → ควรจบเกมและ Host ชนะ
   ```

---

### Test 5.3: Close Browser Tab

**Scenario:** Guest ปิด Tab

1. **Device 1 (Host):** กำลังเล่น
2. **Device 2 (Guest):** ปิด browser tab
3. **ตรวจสอบ Device 1:**
   ```
   ✓ Host ควรชนะ (Guest disconnected)
   ```

---

### Test 5.4: Rapid Clicks

**Scenario:** Guest คลิก answer 3 ครั้งขณะ load

1. **Device 1 (Host):** ตอบ A (ถูก)
2. **Device 2 (Guest):** คลิก A, B, C เร็วๆ
3. **ตรวจสอบ:**
   ```
   ✓ เฉพาะ click แรกนับ
   ✓ Clicks อื่นๆ ไม่เกิด effect
   ```

---

### Test 5.5: Slow Network

**Scenario:** ทำเป็นเครือข่ายช้า (ใน DevTools)

1. **Device 1 & 2:** Chrome DevTools → Network → Throttling → "Slow 4G"
2. **เล่น 1 round** สังเกต:
   ```
   ✓ Data sync ช้า แต่ผลลัพธ์ถูกต้อง
   ✓ ไม่มี data corruption
   ✓ UI ยังสามารถ interact ได้
   ```

---

### Test 5.6: Room Code Uniqueness

**Scenario:** สร้าง 3 ห้องพร้อมกัน

1. **Device 1:** สร้างห้อง → ได้โค้ด `ABC123`
2. **Device 1:** สร้างห้องอีก → ได้โค้ด `DEF456` (ต่างจากข้างบน? ✓)
3. **Device 1:** สร้างห้องอีก → ได้โค้ด `GHI789` (ต่างจากข้างบน? ✓)

```
✓ โค้ดทั้ง 3 ควรต่างกัน
✓ ไม่มี duplicate
```

---

### Test 5.7: Invalid Room Code

1. **Device 1 (Host):** สร้างห้อง → โค้ด `XY7K9Z`
2. **Device 2 (Guest):** ใส่โค้ด `XY7K99` (ผิด 1 ตัว)
3. **ตรวจสอบ:**
   ```
   ✓ Error message: "ไม่พบห้อง หรือห้องเต็มแล้ว"
   ✓ Guest ไม่เข้าห้อง
   ```

---

### Test 5.8: Multiple Guests Joining

**Scenario:** Guest 2 คน พยายามเข้าห้องเดียวกัน

1. **Device 1 (Host):** สร้างห้อง `ABC123`
2. **Device 2 (Guest 1):** เข้าห้อง `ABC123` → สำเร็จ ✓
3. **Device 3 (Guest 2):** เข้าห้อง `ABC123` → ควรได้ error:
   ```
   ❌ "ห้องเต็มแล้ว"
   ```

---

### Test 5.9: Items Edge Case

**Scenario:** ใช้ Shield ต่อ Shield

1. ได้ Shield 2 อัน
2. ตอบผิด ครั้งที่ 1 → Shield ป้องกัน (HP = 20)
3. ตอบผิด ครั้งที่ 2 → Shield อีกอัน ป้องกัน (HP = 20)

```
✓ ทั้ง 2 ครั้ง Shield ทำงาน
✓ HP ไม่ลด
```

---

### Test 5.10: Freeze Timer

**Scenario:** โดน Freeze จากข้อ Lucky Box

1. Pick Lucky Box → ได้ 🧊 Freeze
2. ตรวจสอบ:
   ```
   ✓ ปุ่ม Answer disabled
   ✓ Countdown 10 วินาที กำลังนับ
   ✓ หลัง 10 วินาที → enabled อีก
   ```

---

### ✅ Checkpoint 5.11: Edge Cases Testing เสร็จ

- [ ] Network disconnect handled
- [ ] Page refresh handled
- [ ] Rapid clicks ไม่ bug
- [ ] Room code unique
- [ ] Invalid code shows error
- [ ] Only 1 guest per room
- [ ] Items use correctly
- [ ] Freeze timer works

**ถ้าเสร็จแล้ว** → ไปยัง Phase 6

---

## Phase 6: Production Deployment

### Step 6.1: Build Production

```bash
cd r:\C#\QUIZSLAYER

# Build
npm run build

# ตรวจสอบ:
# ✓ Output folder: dist/
# ✓ ไม่มี error
# ✓ File size ≈ 1-3 MB (gzipped)
```

---

### Step 6.2: Test Production Build Locally

```bash
# Preview production build
npm run preview

# เปิด http://localhost:4173
# Test:
# ✓ หน้า load ขึ้น
# ✓ PvP ทำงาน
# ✓ ไม่มี console errors
```

---

### Step 6.3: Deploy ไป Vercel (หรือ Platform อื่น)

**สมมติ deploy ไป Vercel:**

1. ไปที่ https://vercel.com
2. ล็อกอิน
3. สร้าง project ใหม่ จาก GitHub repo
4. Set environment variables:
   ```
   VITE_SUPABASE_URL=https://yvrbnghjulfmaveckiwa.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ... (อันยาวๆ)
   VITE_APP_NAME=QuizSlayer
   VITE_APP_URL=https://quizslayer.vercel.app
   ```
5. Deploy

---

### Step 6.4: Post-Deploy Testing

1. เปิด https://quizslayer.vercel.app
2. ทดสอบ 2 คน PvP แบบเดียวกับ Phase 4
3. ตรวจสอบ:
   ```
   ✓ Realtime sync ทำงาน
   ✓ ไม่มี CORS errors
   ✓ Database connection ถูกต้อง
   ✓ Images/assets load ขึ้น
   ```

---

### ✅ Checkpoint 6.5: Production Deployment เสร็จ

- [ ] Build สำเร็จ 0 errors
- [ ] Production preview ทำงาน
- [ ] Deploy ไป Vercel สำเร็จ
- [ ] 2 Player PvP ทำงาน บน production URL

---

## Troubleshooting

### ❌ Error: "Supabase Connection Failed"

**สาเหตุ:**
- `.env` variables ผิด
- URL/Key หมดอายุ

**แก้ไข:**
1. ตรวจสอบ `.env`
2. ไปที่ Supabase → Settings → API
3. Copy ANON KEY ใหม่
4. Update `.env`
5. Restart dev server

---

### ❌ Error: "RLS Policy Violation"

**สาเหตุ:**
- Policies ไม่ setup ถูกต้อง

**แก้ไข:**
1. ไปที่ Supabase → Database → pvp_rooms → RLS
2. ลบ policies เก่า
3. รัน SQL script ใหม่ (Phase 1.2)

---

### ❌ Error: "Guest ไม่เห็น Host Updates"

**สาเหตุ:**
- Realtime ไม่ enable

**แก้ไข:**
1. ไปที่ Supabase → Database → Publications
2. Enable `pvp_rooms` table บน `supabase_realtime`
3. Refresh browser

---

### ❌ Error: "Cannot read property 'broadcast' of null"

**สาเหตุ:**
- Channel ไม่ subscribe

**แก้ไข:**
- ตรวจสอบว่า `subscribeChannel()` ถูกเรียก
- Check browser console เพื่อ logs

---

### ❌ Performance: "Game ช้า / Lag"

**แก้ไข:**
1. ปิด DevTools
2. ปิด Extensions
3. ตรวจสอบ network (Throttle ไม่มี)
4. Clear browser cache

---

### ❌ Images ไม่ load (Phaser Sprites)

**สาเหตุ:**
- Assets path ผิด

**แก้ไข:**
1. ตรวจสอบ `public/assets/` มีไฟล์ไหม
2. ตรวจสอบ PvPScene.js load ถูกต้อง path

---

## 📝 Checklist Before Going Live

- [ ] Database setup complete (Step 1.1-1.5)
- [ ] Dev dependencies installed (Step 2.1-2.5)
- [ ] Mock mode testing passed (Step 3.1-3.11)
- [ ] 2-player realtime testing passed (Step 4.1-4.12)
- [ ] Edge cases tested (Step 5.1-5.11)
- [ ] Production build tested (Step 6.1-6.2)
- [ ] Live URL tested (Step 6.3-6.5)
- [ ] No console errors
- [ ] Performance acceptable
- [ ] All features working

---

## 🎉 Ready to Deploy!

ถ้าทั้งหมดผ่าน → ระบบ PvP พร้อมไป Live!

---

**Last Updated:** June 13, 2026
**Status:** Draft v1.0
