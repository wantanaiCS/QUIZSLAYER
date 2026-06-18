# PvP Battle History Implementation — Complete

## 📊 สรุปการทำงาน

**วันที่:** 18 มิถุนายน 2026  
**สถานะ:** ✅ เสร็จสมบูรณ์

---

## 🎯 ปัญหาที่พบ

ก่อนหน้านี้:
- ✅ โหมด Solo บันทึกประวัติได้ปกติ
- ❌ โหมด PvP **ไม่มีการบันทึกประวัติเลย**
- ❌ ไม่มีการเรียก `playerStore.saveSession()` ใน PvPBattleView
- ❌ ไม่มีระบบติดตามคำตอบและผลการแข่งขัน

---

## ✨ สิ่งที่เพิ่มเข้ามา

### 1. **pvpStore.js** — เพิ่มระบบติดตามและบันทึก

#### State Variables เพิ่มเติม:
```javascript
const quizSetTitle    = ref(null)  // ชื่อชุดข้อสอบสำหรับ history
const myAnswerLog     = ref([])    // บันทึกคำตอบของผู้เล่น
const myCorrectCount  = ref(0)     // นับจำนวนข้อที่ตอบถูก
const sessionSaved    = ref(false) // ป้องกันบันทึกซ้ำ
```

#### ฟังก์ชันใหม่ `savePvpSession()`:
```javascript
async function savePvpSession() {
  // ป้องกัน duplicate saves
  if (sessionSaved.value) return null
  sessionSaved.value = true

  // เช็คว่าเกมเริ่มจริง
  if (!gameStartTime.value || !quizSetId.value) return null

  const iWon = winner.value === myRole.value
  const durationSeconds = Math.round((Date.now() - gameStartTime.value) / 1000)

  // คำนวณคะแนน
  let score = myCorrectCount.value * 10  // 10 คะแนนต่อข้อถูก
  if (iWon) score += 50                  // โบนัสชนะ 50 คะแนน
  score += (MAX_HP - (MAX_HP - myHp.value)) * 2  // โบนัส HP ที่เหลือ

  // คำนวณเหรียญ
  let coins = 0
  if (iWon) {
    coins = 20 + myCorrectCount.value * 2  // ชนะ: 20 เริ่มต้น + 2 ต่อข้อถูก
  } else {
    coins = Math.max(5, myCorrectCount.value)  // แพ้: ขั้นต่ำ 5 หรือ 1 ต่อข้อถูก
  }

  return await playerStore.saveSession({
    quiz_set_id: quizSetId.value,
    quiz_title: quizSetTitle.value ?? 'PvP Match',
    difficulty: 'pvp',
    stage_reached: 1,
    result: iWon ? 'win' : 'lose',
    score,
    monsters_killed: 0,
    total_answered: myAnswerLog.value.length,
    total_correct: myCorrectCount.value,
    duration_seconds: durationSeconds,
    coins_earned: coins,
    answer_summary: myAnswerLog.value,
    mode: 'pvp',
  })
}
```

#### อัปเดต `submitAnswer()`:
- เพิ่มการบันทึกคำตอบแต่ละข้อใน `myAnswerLog`
- เพิ่มการนับคำตอบที่ถูกใน `myCorrectCount`

```javascript
// Track my answer for history
myAnswerLog.value.push({
  question_id:   q.id ?? null,
  question_text: q.question_text,
  chosen_index:  chosenIndex,
  correct_index: q.correct_index,
  is_correct:    isCorrect,
  chosen_answer: chosenIndex >= 0 ? q.options?.[chosenIndex] : null,
  correct_answer: q.options?.[q.correct_index] ?? null,
})
if (isCorrect) myCorrectCount.value++
```

#### อัปเดต `setQuizSet()`:
- รับพารามิเตอร์ `quizTitle` เพิ่มเติม
- Sync ชื่อชุดข้อสอบไปยัง guest ผ่าน `fullState()`

#### Reset ใน Rematch:
- รีเซ็ต `myAnswerLog`, `myCorrectCount`, `sessionSaved` เมื่อ rematch
- เตรียมพร้อมสำหรับเกมใหม่

---

### 2. **PvPLobbyView.vue** — ส่งชื่อชุดข้อสอบ

```javascript
pvp.setQuizSet(fullSet.questions, fullSet.id, fullSet.title)
//                                             ^^^^^^^^^^^^^ เพิ่ม title
```

---

### 3. **PvPBattleView.vue** — เรียก savePvpSession เมื่อจบเกม

```javascript
watch(() => pvp.status, (newStatus) => {
  // ... existing code ...
  
  // ★ Save PvP session when game finishes
  if (newStatus === 'finished') {
    pvp.savePvpSession()
  }
})
```

---

### 4. **HistoryView.vue** — ปรับการแสดงผล PvP

- แสดง badge "PvP" ด้านหน้าแทนความยาก
- ซ่อน "Stage X/5" สำหรับโหมด PvP
- คงแสดง: correct/total, duration, date

```vue
<span v-if="session.mode === 'pvp'" class="badge ...">PvP</span>
<span v-else>{{ session.difficulty }}</span>
<!-- Stage only for solo -->
<span v-if="session.mode !== 'pvp'">Stage {{ session.stage_reached }}/5</span>
```

---

## 📋 ข้อมูลที่บันทึกใน PvP Session

| Field | ค่า | คำอธิบาย |
|-------|-----|----------|
| `mode` | `'pvp'` | ระบุว่าเป็นโหมด PvP |
| `difficulty` | `'pvp'` | ใช้แทนความยาก (easy/normal/hard) |
| `result` | `'win'` / `'lose'` | ผลชนะ/แพ้ |
| `score` | 0-300+ | คะแนน (10/ข้อ + 50 ชนะ + HP bonus) |
| `coins_earned` | ชนะ: 20+, แพ้: 5+ | เหรียญที่ได้รับ |
| `total_answered` | จำนวนข้อที่ตอบ | รวมทั้งถูกและผิด |
| `total_correct` | จำนวนข้อที่ตอบถูก | เฉพาะคำตอบที่ถูก |
| `duration_seconds` | วินาที | ระยะเวลาตั้งแต่ RPS จนจบ |
| `answer_summary` | Array | รายละเอียดคำตอบแต่ละข้อ |
| `stage_reached` | `1` | ไม่มี stage ใน PvP |
| `monsters_killed` | `0` | ไม่มี monsters ใน PvP |

---

## 🎮 การทำงานของระบบ

### Flow การบันทึก:
1. **เริ่มเกม** (RPS phase → Playing):
   - ตั้ง `gameStartTime.value = Date.now()`
   - รีเซ็ต `myAnswerLog`, `myCorrectCount`, `sessionSaved = false`

2. **ระหว่างเกม** (submitAnswer):
   - บันทึกคำตอบแต่ละข้อใน `myAnswerLog`
   - นับคำตอบถูกใน `myCorrectCount`

3. **จบเกม** (status → finished):
   - `PvPBattleView` watch ตรวจจับ `status === 'finished'`
   - เรียก `pvp.savePvpSession()`
   - คำนวณ score, coins, duration
   - บันทึกผ่าน `playerStore.saveSession()`
   - ป้องกันบันทึกซ้ำด้วย `sessionSaved` flag

4. **Rematch**:
   - รีเซ็ตข้อมูลทั้งหมด
   - เตรียมพร้อมบันทึกเกมใหม่

---

## 🧪 การทดสอบ

### ✅ Test Cases ที่ต้องผ่าน:

1. **ชนะเกม PvP**
   - บันทึกผลชนะ ✓
   - score > 50 ✓
   - coins ≥ 20 ✓
   - แสดงใน History พร้อม badge "PvP" ✓

2. **แพ้เกม PvP**
   - บันทึกผลแพ้ ✓
   - coins ≥ 5 ✓
   - แสดงใน History ✓

3. **Rematch**
   - บันทึกเกมแรก ✓
   - รีเซ็ตข้อมูล ✓
   - บันทึกเกมที่สองได้อีก ✓

4. **Filter ใน History**
   - "ทั้งหมด" — แสดงทั้ง Solo + PvP ✓
   - "PvP" — แสดงเฉพาะ PvP ✓
   - "Solo" — แสดงเฉพาะ Solo ✓
   - "ชนะ" — ทั้ง Solo + PvP ที่ชนะ ✓
   - "แพ้" — ทั้ง Solo + PvP ที่แพ้ ✓

5. **Mock Mode**
   - บันทึก localStorage สำเร็จ ✓
   - อ่านกลับมาแสดงได้ ✓

---

## 🔧 ไฟล์ที่แก้ไข

1. ✅ `src/stores/pvpStore.js`
   - เพิ่ม state tracking
   - เพิ่ม `savePvpSession()`
   - อัปเดต `submitAnswer()`, `setQuizSet()`, `$reset()`, `_checkRematchReady()`

2. ✅ `src/views/PvPLobbyView.vue`
   - ส่ง `fullSet.title` เข้า `setQuizSet()`

3. ✅ `src/views/PvPBattleView.vue`
   - เพิ่ม watch เรียก `savePvpSession()` เมื่อ finished

4. ✅ `src/views/HistoryView.vue`
   - ปรับ UI แสดง PvP badge
   - ซ่อน Stage สำหรับ PvP

---

## 🚀 ผลลัพธ์

✅ **Battle History ทำงานครบทุกโหมด:**
- ✅ Solo mode — บันทึกปกติ
- ✅ PvP mode — บันทึกเสร็จสมบูรณ์
- ✅ แสดงผลใน History พร้อม filter
- ✅ คำนวณ score และ coins ตามผลการแข่งขัน
- ✅ Mock mode รองรับ
- ✅ Rematch ไม่บันทึกซ้ำ

---

## 📝 หมายเหตุเพิ่มเติม

### Score Calculation:
- **Base:** 10 points × correct answers
- **Win Bonus:** +50 points
- **HP Preservation Bonus:** +2 × remaining HP

### Coins Calculation:
- **Win:** 20 base + (2 × correct answers)
- **Lose:** max(5, correct answers)

### ข้อจำกัด:
- PvP ไม่มี stage progression (แสดง stage_reached = 1 เสมอ)
- PvP ไม่มี monsters (monsters_killed = 0 เสมอ)
- difficulty แสดงเป็น "pvp" แทนระดับความยาก

---

**Implementation Date:** June 18, 2026  
**Status:** ✅ Fully Functional  
**Tested:** Mock Mode + Real DB
