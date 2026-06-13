# ✅ PvP System - Testing Checklist

> Copy ไฟล์นี้ และใช้เป็น checklist ขณะ test

---

## 📌 Phase 1: Database Setup

**Start Date:** ___________  
**Completed Date:** ___________

### Supabase Dashboard

- [ ] เปิด Supabase Dashboard ได้
- [ ] เลือก QUIZSLAYER project
- [ ] ไปที่ SQL Editor

### SQL Script Execution

- [ ] Copy supabase/pvp_setup.sql ทั้งหมด
- [ ] วาง SQL ลง SQL Editor
- [ ] Click RUN
- [ ] ไม่มี error (0 errors)
- [ ] Console แสดง "pvp_rooms created"
- [ ] Console แสดง "pvp_sessions created"
- [ ] Console แสดง "generate_room_code exists"

### RLS Policies Check

**pvp_rooms table:**
- [ ] ไปที่ pvp_rooms → RLS tab
- [ ] เห็น policy "pvp_rooms_select"
- [ ] เห็น policy "pvp_rooms_insert"
- [ ] เห็น policy "pvp_rooms_update"

**pvp_sessions table:**
- [ ] ไปที่ pvp_sessions → RLS tab
- [ ] เห็น policy "pvp_sessions_select"
- [ ] เห็น policy "pvp_sessions_insert"

### Realtime Configuration

- [ ] ไปที่ Database → Publications
- [ ] ค้นหา "supabase_realtime"
- [ ] Toggle pvp_rooms = ON
- [ ] Save

**✅ Phase 1 Status:** ___________

---

## 📌 Phase 2: Local Development Setup

**Start Date:** ___________  
**Completed Date:** ___________

### Node.js & npm

- [ ] node --version ≥ v18
- [ ] npm --version ≥ v9

### Dependencies

```bash
cd r:\C#\QUIZSLAYER
```

- [ ] rmdir /s /q node_modules (if exists)
- [ ] npm install สำเร็จ
- [ ] ไม่มี error ในการติดตั้ง
- [ ] node_modules folder มีขนาด ~500MB+
- [ ] package-lock.json updated

### Environment Variables

ตรวจสอบไฟล์ `.env`:

- [ ] มี VITE_SUPABASE_URL
- [ ] มี VITE_SUPABASE_ANON_KEY
- [ ] มี VITE_APP_NAME
- [ ] มี VITE_APP_URL

### Dev Server

```bash
npm run dev
```

- [ ] Dev server เริ่ม 0 errors
- [ ] console แสดง "Local: http://localhost:5173/"
- [ ] เปิด browser ได้
- [ ] เห็นหน้า Home page

**✅ Phase 2 Status:** ___________

---

## 📌 Phase 3: Mock Mode Testing (1 Person)

**Start Date:** ___________  
**Completed Date:** ___________  
**Tester:** ___________  
**Account:** ___________

### Navigation to PvP

- [ ] ล็อกอิน ได้
- [ ] ไปที่ /pvp ได้
- [ ] เห็นหน้า "⚔️ PvP Battle"
- [ ] เห็น "🏠 สร้างห้อง" button
- [ ] เห็น "🚪 เข้าห้อง" button

### Create Room (Host)

#### Step 1: Select Quiz

- [ ] คลิก "🏠 สร้างห้อง"
- [ ] ดู quiz set list
- [ ] ไม่มี loading spinner (quiz loaded)
- [ ] เห็น quiz set อย่างน้อย 1 ชุด
- [ ] คลิกเลือก quiz set ได้
- [ ] ปุ่ม "ถัดไป →" active

#### Step 2: Select Color

- [ ] คลิก "ถัดไป →"
- [ ] เห็นหน้า "เลือกสีตัวละคร"
- [ ] เห็น 4 สี: Red, Blue, Yellow, Green
- [ ] คลิกเลือกสี (เช่น Red) ได้
- [ ] สีที่เลือกแสดงผลเห็นชัด
- [ ] ปุ่ม "🏠 สร้างห้อง" active

#### Step 3: Room Created

- [ ] คลิก "🏠 สร้างห้อง"
- [ ] ปุ่มมี loading spinner
- [ ] หลัง 2-3 วินาที → เห็นโค้ด room 6 หลัก
  - โค้ด: ___________
- [ ] ปุ่ม "📋 คัดลอก" ทำงาน
- [ ] เห็น Waiting Room card:
  - [ ] Host name ถูกต้อง
  - [ ] Host status: 🟢 (online)
  - [ ] Guest status: ⚫ (waiting)
  - [ ] ปุ่ม "⚔️ เริ่มเกม!" disabled (เพราะ guest ยังไม่เข้า)

### Join Room (Guest - Incognito Tab)

#### Open Incognito Window

- [ ] เปิด Incognito window ใหม่
- [ ] ไปที่ http://localhost:5173

#### Guest Actions

- [ ] ล็อกอิน (หรือ logout แล้ว login อีกครั้ง)
- [ ] ไปที่ /pvp
- [ ] คลิก "🚪 เข้าห้อง"
- [ ] ใส่โค้ด room (จาก Host)
  - โค้ด: ___________
- [ ] เลือกสี (เช่น Blue)
- [ ] คลิก "🚪 เข้าห้อง"
- [ ] ปุ่มมี loading spinner
- [ ] หลัง 2-3 วินาที → เห็น Waiting Room card

#### Check Host Tab (Realtime)

- [ ] Guest info ปรากฏบน Host tab (ไม่ต้องรีเฟรช)
- [ ] Guest name ถูกต้อง
- [ ] Guest status: 🟢 (online)
- [ ] ปุ่ม "⚔️ เริ่มเกม!" active

### RPS Phase

#### Host Click Start Game

- [ ] Host click "⚔️ เริ่มเกม!"
- [ ] ทั้ง 2 tab เห็น RPS screen
- [ ] เห็นข้อความ "เลือก Rock, Paper, Scissors"
- [ ] เห็น 3 ปุ่ม: ✊ ✋ ✌️

#### Host & Guest Pick RPS

**Host Tab:**
- [ ] คลิก ✊ (Rock)
- [ ] เห็น "เลือก: Rock"

**Guest Tab (หลังจาก 1-2 วินาที):**
- [ ] คลิก ✌️ (Scissors)
- [ ] เห็น "เลือก: Scissors"

#### RPS Result

**Both Tabs:**
- [ ] เห็นผลลัพธ์ RPS:
  ```
  Host: ✊ Rock
  Guest: ✌️ Scissors
  Host Wins!
  ```

- [ ] หลัง 2-3 วินาที → Battle screen ขึ้น

### Battle Phase - Question 1

#### Screen Layout

- [ ] เห็น Turn indicator:
  - Host tab: "⚔️ ตาของคุณ!"
  - Guest tab: "⏳ รอ Host..."
- [ ] เห็น HP bars:
  - Host: 20/20
  - Guest: 20/20
- [ ] เห็น Question text
- [ ] เห็น 4 ตัวเลือก (A, B, C, D)

#### Host Answer (Turn 1)

- [ ] Host คลิก option ใดก็ได้ (เช่น C)
- [ ] ปุ่มแสดง animation (flash color)
- [ ] หลัง 1 วินาที → ปุ่มแสดงสีเขียว (✓) หรือแดง (✗)
- [ ] HP ลดลง (ถ้าตอบผิด) หรือลดขึ้นของ Guest (ถ้าตอบถูก)
- [ ] Question ข้อต่อไปปรากฏ
- [ ] Turn เปลี่ยนไป Guest

#### Guest Answer (Turn 2)

- [ ] Guest tab แสดง "⚔️ ตาของคุณ!"
- [ ] Host tab แสดง "⏳ รอ Guest..."
- [ ] Guest คลิกตัวเลือก
- [ ] HP อัปเดต
- [ ] Turn เปลี่ยนกลับไป Host

### Continue Battle - Question 5

- [ ] ตอบคำถามต่อไปอีก 3 ข้อ
- [ ] HP sync ถูกต้อง (ทั้ง 2 tab เห็นค่าเดียวกัน)
- [ ] Turn switching ทำงาน

### Lucky Box Phase (ที่ Question 5)

- [ ] หลังจากตอบข้อ 5 → Lucky Box screen ปรากฏ
- [ ] เห็น "🎁 เลือก 1 ใน 3 ของขวัญ"
- [ ] เห็น 3 ใบ card

#### Pick Lucky Card

**Host Tab:**
- [ ] คลิก Card 1
- [ ] ควรเห็น item ที่ได้ (icon + ชื่อ)

**Items Examples:**
- Good item: 💊 Double HP, ⚔️ Power Strike, 🛡️ Shield, etc.
- Trap: 💣 Bomb, 🧊 Freeze

#### Handle Trap vs Good Item

**ถ้า Good Item:**
- [ ] Item เพิ่มไป inventory
- [ ] เห็น item icon บน PlayerCard

**ถ้า Trap:**
- [ ] Damage apply ทันที (ถ้า Bomb: -3 HP)
- [ ] Freeze timer เริ่ม (ถ้า Freeze: 10 วินาที)

#### Back to Battle

- [ ] หลัง 1-2 วินาที → กลับ battle screen
- [ ] Turn เปลี่ยนไปอีกฝ่าย

### Use Item (Optional)

**ถ้าได้ Good Item ในลัก ก้อมและมี item:**

- [ ] เห็น item icon บน PlayerCard
- [ ] คลิก item icon
- [ ] Item effect apply:
  - 💊 Double HP: HP +5
  - ⚔️ Power Strike: damage ×2 ครั้งต่อไป
  - 🛡️ Shield: block damage ครั้งต่อไป
  - etc.
- [ ] Item ถูกลบออก

### Game Finish

**Play ต่อจนใคร HP = 0:**

- [ ] ทั้ง 2 tab เห็น Victory/Defeat screen
- [ ] ผู้ชนะแสดงถูกต้อง:
  - ผู้ชนะ: ___________
  - HP เหลือ: ___________
- [ ] เห็น "🏆 ชนะแล้ว!" หรือ "💀 แพ้แล้ว..."
- [ ] เห็น stats:
  - [ ] HP เหลือของ host
  - [ ] HP เหลือของ guest

#### Game End Actions

- [ ] คลิก "🚪 กลับหน้าหลัก" → กลับ PvP Lobby
- [ ] คลิก "🔄 เล่นใหม่" → กลับ PvP Lobby

**✅ Phase 3 Status:** ___________

---

## 📌 Phase 4: Realtime Testing (2 People)

**Start Date:** ___________  
**Completed Date:** ___________

### Prepare 2 Devices

**Device 1 (Host):**
- [ ] Browser 1 / Window 1
- [ ] URL: http://localhost:5173
- [ ] Login: Account A (________________)
- [ ] Navigate: /pvp

**Device 2 (Guest):**
- [ ] Browser 2 / Incognito Window
- [ ] URL: http://localhost:5173
- [ ] Login: Account B (________________)
- [ ] Navigate: /pvp

### Device 1: Create Room

- [ ] Click "🏠 สร้างห้อง"
- [ ] Select Quiz Set
- [ ] Select Color (Red)
- [ ] Click "🏠 สร้างห้อง"
- [ ] ได้ Room Code: ___________
- [ ] Waiting room ปรากฏ

### Device 2: Join Room

- [ ] Click "🚪 เข้าห้อง"
- [ ] Input Room Code: ___________
- [ ] Select Color (Blue)
- [ ] Click "🚪 เข้าห้อง"
- [ ] Waiting room ปรากฏ

### Realtime Sync Test

**Device 1 (Host):**
- [ ] ⏳ รอ 1-2 วินาที
- [ ] ควรเห็น Guest info (ไม่ต้อง refresh page)
- [ ] Guest name: ___________
- [ ] Guest status: 🟢 (online)
- [ ] ปุ่ม "⚔️ เริ่มเกม!" active

### Start Game

**Device 1:**
- [ ] Click "⚔️ เริ่มเกม!"

**Device 2:**
- [ ] ควรเห็น RPS screen เหมือนกัน

### RPS Round

**Device 1 (Host):**
- [ ] Pick: ✊ (Rock)

**Device 2 (Guest):**
- [ ] Pick: ✌️ (Scissors)

**Both:**
- [ ] ควรเห็นผลลัพธ์เหมือนกัน
- [ ] Battle screen ขึ้น

### Battle - HP Sync

**Device 1:**
- [ ] Host HP: _________ / Guest HP: _________

**Device 2:**
- [ ] Host HP: _________ / Guest HP: _________

- [ ] ทั้ง 2 ค่าต้องเหมือนกัน ✓

### Turn Test

**Device 1 (Host - ตาเขา):**
- [ ] เห็น "⚔️ ตาของคุณ!"
- [ ] ตอบคำถาม (เช่น C)

**Device 2 (Guest - รอเขา):**
- [ ] เห็น "⏳ รอ Host..."
- [ ] ตัวละคร Host animation (attack/hurt)

**Device 1 (เสร็จ Host turn):**
- [ ] Turn เปลี่ยน: "⏳ รอ Guest..."

**Device 2 (Guest - ตาเขา):**
- [ ] เห็น "⚔️ ตาของคุณ!"

### Continue Play

- [ ] ตอบ 5 ข้อ
- [ ] ทั้ง 2 ควรเห็นข้อมูลเหมือนกันเสมอ:
  - [ ] Question ข้อเดียวกัน
  - [ ] HP ตรงกัน
  - [ ] Turn ตรงกัน

### Lucky Box Sync

**เมื่อถึง Question 5:**
- [ ] ทั้ง 2 เห็น Lucky Box screen
- [ ] Card ที่เห็นเหมือนกันไหม?
  - Card 1: ___________
  - Card 2: ___________
  - Card 3: ___________

**Device 1 Pick Card:**
- [ ] Pick Card 1 → Item: ___________

**Device 2:**
- [ ] ควรเห็น Item picked (sync)

### Game Finish

**ตอบจนใคร HP = 0:**

- [ ] ทั้ง 2 เห็น Victory/Defeat พร้อมกัน
- [ ] ผู้ชนะตรงกัน
- [ ] HP ตรงกัน

**✅ Phase 4 Status:** ___________

---

## 📌 Phase 5: Edge Cases

**Start Date:** ___________  
**Completed Date:** ___________

### Test 5.1: Network Disconnect

**Device 1:** เล่นอยู่  
**Device 2:** ปลั๊ก WiFi

- [ ] Device 1 ควรแสดง disconnect message
- [ ] Game end อัตโนมัติ หรือ pause?
- [ ] ผลลัพธ์: ___________

### Test 5.2: Page Refresh

**Device 1:** เล่นอยู่  
**Device 2:** F5 refresh

- [ ] Device 2 กลับไป PvP Lobby
- [ ] Device 1 ควรแสดง disconnect message
- [ ] Game end ถูกต้องไหม?
- [ ] ผลลัพธ์: ___________

### Test 5.3: Close Browser Tab

**Device 1:** เล่นอยู่  
**Device 2:** ปิด tab

- [ ] Device 1 ควรแสดง disconnect
- [ ] Host ชนะอัตโนมัติ?
- [ ] ผลลัพธ์: ___________

### Test 5.4: Rapid Clicks

**Device 2:** คลิก A, B, C เร็วๆ ขณะ load

- [ ] เฉพาะ click แรกนับ
- [ ] Clicks อื่นไม่เกิด effect
- [ ] ผลลัพธ์: ___________

### Test 5.5: Slow Network

**ใน DevTools → Throttle → Slow 4G:**

- [ ] Game sync ช้า แต่ถูกต้อง
- [ ] ไม่มี data corruption
- [ ] UI สามารถ interact ได้
- [ ] ผลลัพธ์: ___________

### Test 5.6: Room Code Uniqueness

**สร้าง 3 ห้องต่อเนื่อง:**

- [ ] Room 1 Code: ___________
- [ ] Room 2 Code: ___________
- [ ] Room 3 Code: ___________
- [ ] ทั้ง 3 ต่างกัน? ___________

### Test 5.7: Invalid Room Code

**Device 2:** ใส่โค้ดผิด (เช่น ABC999)

- [ ] ได้ error: "ไม่พบห้อง หรือห้องเต็มแล้ว"
- [ ] ไม่เข้าห้อง
- [ ] ผลลัพธ์: ___________

### Test 5.8: Multiple Guests

**3 Windows:**
- Window 1 (Host): สร้างห้อง ABC123
- Window 2 (Guest 1): เข้า ABC123 ✓
- Window 3 (Guest 2): เข้า ABC123 ❌

- [ ] Guest 2 ได้ error: "ห้องเต็มแล้ว"
- [ ] ผลลัพธ์: ___________

### Test 5.9: Items Edge Case

**ได้ Shield 2 อัน:**
- [ ] ตอบผิด ครั้ง 1 → Shield ป้องกัน (HP = 20)
- [ ] ตอบผิด ครั้ง 2 → Shield อีกอัน (HP = 20)
- [ ] ทั้ง 2 ป้องกัน? ___________

### Test 5.10: Freeze Timer

**โดน Freeze:**
- [ ] ปุ่ม Answer disabled
- [ ] Countdown 10 วินาที
- [ ] หลัง 10 วินาที enabled อีก
- [ ] ผลลัพธ์: ___________

**✅ Phase 5 Status:** ___________

---

## 📌 Phase 6: Production Build

**Start Date:** ___________  
**Completed Date:** ___________

### Build

```bash
npm run build
```

- [ ] Build สำเร็จ
- [ ] ไม่มี error
- [ ] dist/ folder มีขนาด 1-3 MB

### Test Production Build

```bash
npm run preview
# http://localhost:4173
```

- [ ] Production preview เปิดได้
- [ ] PvP ทำงาน
- [ ] ไม่มี console errors

### Deploy (Vercel/Platform)

- [ ] Deploy สำเร็จ
- [ ] Live URL: ___________

### Post-Deploy Test

- [ ] เปิด production URL
- [ ] 2-Player PvP ทำงาน
- [ ] Realtime sync ถูกต้อง
- [ ] ไม่มี CORS errors
- [ ] Images/assets load ขึ้น

**✅ Phase 6 Status:** ___________

---

## 📋 Final Checklist

### Database ✅
- [ ] pvp_rooms table created
- [ ] pvp_sessions table created
- [ ] RLS policies enabled
- [ ] Realtime enabled

### Code ✅
- [ ] No console errors
- [ ] No TypeErrors
- [ ] No network failures

### Features ✅
- [ ] Create room works
- [ ] Join room works (realtime)
- [ ] RPS round works
- [ ] Battle questions work
- [ ] HP sync works
- [ ] Lucky box works
- [ ] Items work
- [ ] Freeze timer works
- [ ] Game finish works

### Performance ✅
- [ ] No lag in 2-player game
- [ ] Realtime sync ≤ 2 seconds
- [ ] No memory leaks
- [ ] Mobile responsive

### Security ✅
- [ ] RLS protects data
- [ ] Can't modify opponent HP
- [ ] Room code unique
- [ ] No data injection

### Edge Cases ✅
- [ ] Network disconnect handled
- [ ] Page refresh handled
- [ ] Invalid room code
- [ ] Multiple guests rejected

---

## 🎉 Sign Off

**Overall Status:** ___________

**Tested By:** ___________  
**Date:** ___________

**Ready for Production?**
- [ ] YES - ทั้งหมดผ่าน!
- [ ] NO - ต้องแก้ไขเพิ่มเติม

**Notes:**
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

**Thank you for testing! 🚀**
