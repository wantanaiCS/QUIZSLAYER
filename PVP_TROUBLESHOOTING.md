# 🔧 PvP Troubleshooting Guide

> แก้ไข issues ทั่วไป

---

## 🔴 Category 1: Database Issues

### ❌ Error: "Supabase Connection Failed"

**สาเหตุ:**
- `.env` variables ผิด
- Network ขาด
- Supabase server down

**แก้ไข:**

#### Step 1: ตรวจสอบ .env

```bash
# ดู .env ว่ามี
cat r:\C#\QUIZSLAYER\.env

# ควรเห็น:
VITE_SUPABASE_URL=https://yvrbnghjulfmaveckiwa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (อันยาว)
```

#### Step 2: ตรวจสอบ Key ถูกต้อง

ไปที่ Supabase Dashboard:
1. https://app.supabase.com
2. Select QUIZSLAYER project
3. Settings → API
4. Copy "anon" key (ส่วน public)
5. Paste ไป `.env` แทน

#### Step 3: Restart Dev Server

```bash
# ใน terminal
Ctrl+C  # stop dev server
npm run dev  # start ใหม่
```

#### Step 4: ลบ Browser Cache

```
Chrome:
1. Ctrl+Shift+Delete
2. Clear browsing data
3. Reload page
```

---

### ❌ Error: "RLS Policy Violation"

**สาเหตุ:**
- Policies ไม่ setup ถูก
- User ไม่มี permission

**แก้ไข:**

#### Step 1: ตรวจสอบ Policies

Supabase Dashboard → Database → Tables → pvp_rooms → RLS

**ควรเห็น:**
```
✓ pvp_rooms_select
✓ pvp_rooms_insert
✓ pvp_rooms_update
```

#### Step 2: ลบและสร้างใหม่

1. ลบ policies ทั้งหมด:
   - Click each policy → Delete
2. รัน SQL script ใหม่:
   - SQL Editor → New Query
   - Copy ทั้งหมดจาก `supabase/pvp_setup.sql`
   - RUN

#### Step 3: ตรวจสอบ Policies ใหม่

```
✓ ควรเห็น policies ใหม่
✓ ทั้ง 3 tables (pvp_rooms, pvp_sessions)
```

---

### ❌ Error: "Table doesn't exist" (on first run)

**สาเหตุ:**
- SQL script ไม่รัน
- ลืมรัน SQL script

**แก้ไข:**

1. ไปที่ Supabase → SQL Editor
2. New Query
3. Copy ทั้งหมดจาก `supabase/pvp_setup.sql`
4. RUN
5. ตรวจสอบ 0 errors

---

### ❌ Error: "Guest ไม่เห็น Host update" (Realtime not working)

**สาเหตุ:**
- Realtime ไม่ enable บน pvp_rooms
- Channel ไม่ subscribe ถูกต้อง

**แก้ไข:**

#### Step 1: Enable Realtime

Supabase Dashboard:
1. Database → Publications
2. ค้นหา "supabase_realtime"
3. Show all tables
4. Toggle **pvp_rooms** = ON
5. Save

#### Step 2: Restart Dev Server

```bash
Ctrl+C
npm run dev
```

#### Step 3: Test Realtime

- Device 1: Create room
- Device 2: Join room
- ⏳ รอ 1-2 วินาที
- Device 1: ควรเห็น Guest (realtime)

**ถ้ายังไม่เห็น:**
- [ ] Refresh page (F5)
- [ ] Check browser console สำหรับ errors
- [ ] Check network tab (WebSocket connected?)

---

## 🔴 Category 2: UI / Component Issues

### ❌ Error: "Cannot read property 'roomCode' of undefined"

**สาเหตุ:**
- pvpStore ไม่ initialize
- Navigation ไป PvPBattleView โดยไม่สร้าง/เข้าห้อง

**แก้ไข:**

```javascript
// ใน PvPBattleView.vue
onMounted(() => {
  if (!pvp.roomCode) {
    router.push('/pvp')  // กลับไปสร้างห้องใหม่
    return
  }
  // ... initialize game
})
```

**Test:**
1. เข้า `/pvp/battle` โดยตรง (ไม่สร้างห้อง)
2. ควรกลับไป `/pvp` อัตโนมัติ

---

### ❌ Error: "Images ไม่ปรากฏ" (Phaser Sprites)

**สาเหตุ:**
- Assets path ผิด
- Files ไม่อยู่ในโฟลเดอร์ที่ถูกต้อง

**แก้ไข:**

#### Step 1: ตรวจสอบ Assets Folder

```
✓ public/assets/orc/Orc-Idle.png
✓ public/assets/soldier/Soldier-Idle.png
```

#### Step 2: ตรวจสอบ PvPScene.js

```javascript
// ใน src/lib/phaser/PvPScene.js
this.load.image('orc-idle', '/assets/orc/Orc-Idle.png')
this.load.image('soldier-idle', '/assets/soldier/Soldier-Idle.png')
```

**Path ควรจะ:**
- `/assets/...` (absolute from public/)
- NOT `./assets/...`
- NOT `src/assets/...`

#### Step 3: Restart Dev Server

```bash
npm run dev
```

---

### ❌ Error: "Answer button ไม่ response เมื่อคลิก"

**สาเหตุ:**
- `canAnswer` computed property = false
- Turn ไม่ถูกต้อง
- Status ไม่ใช่ 'playing'

**แก้ไข:**

ตรวจสอบ console:
```javascript
// ใน browser console
pvp.isMyTurn        // ต้อง true
pvp.status          // ต้อง 'playing'
pvp.isFrozen        // ต้อง false
pvp.currentQ        // ต้อง object ไม่ null
```

ถ้า false:
- [ ] Check Turn indicator (ต้องเป็น "⚔️ ตาของคุณ!")
- [ ] Check Status (ต้อง "playing")
- [ ] Check isFrozen (ต้อง false)

---

### ❌ Error: "HP ไม่ลด/เพิ่มเมื่อตอบ"

**สาเหตุ:**
- `submitAnswer()` ไม่เรียก
- Damage logic ผิด
- HP calculation ผิด

**แก้ไข:**

#### Check 1: submitAnswer Logic

```javascript
// ใน pvpStore.js
function submitAnswer(chosenIndex) {
  if (!isMyTurn.value || !currentQ.value) return  // ← ตรวจสอบ
  
  const isCorrect = chosenIndex === currentQ.value.correct_index
  let dmg = isCorrect ? DAMAGE_PER_CORRECT : DAMAGE_PER_WRONG
  // ...
}
```

#### Check 2: Damage Values

```javascript
const DAMAGE_PER_WRONG = 3   // ตอบผิด
const DAMAGE_PER_CORRECT = 4 // ตอบถูก
```

#### Check 3: HP Update

```javascript
// ตอบถูก → damage opponent
if (isCorrect) {
  if (role === 'host') guestHp.value = Math.max(0, guestHp.value - damage)
  else                  hostHp.value  = Math.max(0, hostHp.value  - damage)
}
```

**Test:**
1. Host ตอบถูก → Guest HP ลด ✓
2. Host ตอบผิด → Host HP ลด ✓

---

## 🔴 Category 3: Realtime / Network Issues

### ❌ Error: "Guest ไม่เห็น Host ตอบข้อสอบ"

**สาเหตุ:**
- Broadcast message ไม่ส่ง
- Channel ไม่ subscribe
- Message ไม่ handle ถูก

**แก้ไข:**

#### Check 1: Broadcast ส่งหรือไม่

```javascript
// ใน pvpStore.js → submitAnswer()
broadcast('answer', payload)  // ← ต้องเรียก
```

#### Check 2: Channel Subscribed

```javascript
function subscribeChannel(code) {
  channel = supabase.channel(`pvp:${code}`, {...})
  channel
    .on('broadcast', { event: 'answer' }, e => onAnswer(e.payload))
    .subscribe()
}
```

#### Check 3: Browser Console

```javascript
// ใน browser console
supabase.getChannels()  // ควรเห็น channel ที่ active
```

---

### ❌ Error: "Freeze Timer ไม่ทำงาน"

**สาเหตุ:**
- Timer ไม่ set ถูกต้อง
- Component re-render ทำลาย timer

**แก้ไข:**

#### Check 1: Timer Logic

```javascript
// ใน pvpStore.js
if (itemId === 'freeze') {
  freezeActive.value  = true
  freezeSeconds.value = 10
  if (freezeTimer) clearInterval(freezeTimer)
  freezeTimer = setInterval(() => {
    freezeSeconds.value--
    if (freezeSeconds.value <= 0) {
      freezeActive.value = false
      clearInterval(freezeTimer)
    }
  }, 1000)  // 1000ms = 1 วินาที
}
```

#### Check 2: Console Test

```javascript
// browser console
pvp.freezeActive     // ต้อง true ตอนโดน freeze
pvp.freezeSeconds    // ต้อง 10 → 9 → 8 ...
```

---

### ❌ Error: "Lucky Box Card ไม่ sync"

**สาเหตุ:**
- `drawLuckyCards()` ไม่เหมือนกัน
- Broadcast ไม่ส่ง cards
- Card index ไม่ตรงกัน

**แก้ไข:**

#### Check 1: Cards Draw Logic

```javascript
function drawLuckyCards() {
  const pool = [...PVP_ITEMS]  // ต้องมี item definitions
  const picked = []
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(idx, 1)[0])
  }
  return picked
}
```

#### Check 2: Broadcast Lucky Cards

```javascript
broadcast('state_sync', {
  luckyCards: luckyCards.value,  // ← ต้องส่ง
  luckyPicked: luckyPicked.value,
  // ...
})
```

#### Check 3: Both Devices

- Device 1: ได้ Cards A, B, C
- Device 2: ควรเห็น Cards A, B, C (เหมือนกัน)

---

## 🔴 Category 4: Performance Issues

### ❌ Error: "Game ช้า / Lag"

**สาเหตุ:**
- DevTools open → ลดประสิทธิภาพ 30-40%
- Many extensions → ขัดขวาง
- Browser ไม่ update

**แก้ไข:**

#### Step 1: ปิด DevTools

```
F12 → ปิด
```

#### Step 2: ลบ Extensions

Chrome:
1. More tools → Extensions
2. ปิด extensions ที่ไม่จำเป็น

#### Step 3: Clear Cache

```
Ctrl+Shift+Delete → Clear browsing data
```

#### Step 4: ใช้ Browser ที่ Latest

- Chrome: https://www.google.com/chrome/
- Firefox: https://www.mozilla.org/firefox/

---

### ❌ Error: "Memory Leak - Game ช้าลงเรื่อยๆ"

**สาเหตุ:**
- setInterval/setTimeout ไม่ clear
- Event listeners ไม่ remove
- Phaser scene ไม่ destroy

**แก้ไข:**

#### Check 1: Cleanup on Unmount

```javascript
// ใน PvPBattleView.vue
onUnmounted(() => {
  if (gameInstance) { 
    gameInstance.destroy(true)  // ← ต้องทำ
    gameInstance = null
  }
  pvp.leaveRoom()
})
```

#### Check 2: Clear Timers

```javascript
// ใน pvpStore.js → leaveRoom()
if (freezeTimer) clearInterval(freezeTimer)  // ← ต้องทำ
```

#### Check 3: Unsubscribe Channel

```javascript
// ใน pvpStore.js
function leaveRoom() {
  if (channel) {
    supabase.removeChannel(channel)  // ← ต้องทำ
    channel = null
  }
}
```

---

## 🔴 Category 5: Logic Issues

### ❌ Error: "RPS Result ผิด"

**สาเหตุ:**
- Win logic ผิด
- Hash reveal ผิด

**แก้ไข:**

```javascript
// ใน pvpStore.js
const RPS_WIN = {
  rock: 'scissors',
  scissors: 'paper',
  paper: 'rock'
}

function _calcRps(h, g) {
  if (h === g) return 'draw'
  return RPS_WIN[h] === g ? 'host_win' : 'guest_win'
}

// Test:
_calcRps('rock', 'scissors')   // host_win ✓
_calcRps('scissors', 'rock')   // guest_win ✓
_calcRps('rock', 'rock')       // draw ✓
```

---

### ❌ Error: "Question ไม่ shuffle ถูกต้อง"

**สาเหตุ:**
- Seed ไม่ตรงกัน
- Shuffle algorithm ผิด

**แก้ไข:**

```javascript
// ใน pvpStore.js
function seededShuffle(arr, seed) {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Test:
const q1 = seededShuffle([1,2,3,4,5], 12345)
const q2 = seededShuffle([1,2,3,4,5], 12345)
console.log(q1 === q2)  // ต้อง true (same seed = same result)
```

---

### ❌ Error: "Lucky Box ปรากฏที่ข้อผิด"

**สาเหตุ:**
- Lucky box trigger logic ผิด
- Question count ไม่ reset

**แก้ไข:**

```javascript
const LUCKY_BOX_EVERY = 5

// ใน _applyAnswer()
if (qa % LUCKY_BOX_EVERY === 0) {  // ← ต้องตรวจสอบ
  status.value  = 'lucky_box'
  luckyCards.value  = drawLuckyCards()
  luckyPicked.value = false
  return
}

// Test:
// Question 1-4: ไม่ปรากฏ lucky box
// Question 5: ปรากฏ lucky box ✓
// Question 6-9: ไม่ปรากฏ
// Question 10: ปรากฏ lucky box ✓
```

---

## 🔴 Category 6: Deployment Issues

### ❌ Error: "Production Build Failed"

**สาเหตุ:**
- TypeScript errors
- Import ผิด
- Dependencies ขาด

**แก้ไข:**

```bash
npm run build

# ถ้า error
# 1. อ่านข้อความ error อย่างดี
# 2. Fix ไฟล์ที่ error
# 3. รัน build อีกครั้ง
```

---

### ❌ Error: "Production Build สำเร็จ แต่ Page Blank"

**สาเหตุ:**
- Assets path ผิด
- CSS ไม่ load
- JavaScript error

**แก้ไช:**

#### Step 1: Test Locally First

```bash
npm run preview
# http://localhost:4173
```

#### Step 2: Check Browser Console

```
F12 → Console
ดู error messages
```

#### Step 3: Common Issues

```
❌ "Cannot find module" 
   → Fix import paths

❌ "CSS not loaded"
   → Check Tailwind build

❌ "CORS Error"
   → Check Supabase URL ถูกต้อง
```

---

### ❌ Error: "Live Site CORS Error"

**สาเหตุ:**
- Supabase URL ผิด
- Production domain ไม่ added ไป Supabase

**แก้ไข:**

#### Step 1: ตรวจสอบ .env.production

```
VITE_SUPABASE_URL=https://yvrbnghjulfmaveckiwa.supabase.co
VITE_SUPABASE_ANON_KEY=... (ถูกต้อง)
VITE_APP_URL=https://yourdomain.vercel.app
```

#### Step 2: Add Domain ไป Supabase

Supabase Dashboard:
1. Authentication → URL Configuration
2. Add "https://yourdomain.vercel.app" ไป Redirect URLs

#### Step 3: Restart Server

---

## 🆘 Still Having Issues?

### ✅ Checklist:

- [ ] Restarted dev server (Ctrl+C then npm run dev)
- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Checked browser console errors (F12)
- [ ] Checked Supabase Dashboard (status page)
- [ ] Tried different browser
- [ ] Updated .env variables
- [ ] Ran `npm install` again

### 📝 Debug Steps:

```javascript
// ใน browser console เมื่อเกิด issue:

// Check Store State
pvp.$state   // ดู state ทั้งหมด
pvp.roomCode
pvp.status
pvp.hostHp
pvp.guestHp

// Check Supabase
supabase.auth.getSession()  // logged in?
supabase.getChannels()      // channel active?

// Check Network
// DevTools → Network tab → ดู requests
```

---

**Last Updated:** June 13, 2026
