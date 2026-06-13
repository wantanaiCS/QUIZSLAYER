# 🚀 PvP Quick Start - 15 นาทีแรก

> ขั้นตอนด่วนเพื่อให้ระบบ PvP ทำงาน

---

## ⏱️ ขั้นตอน 1 (3 นาที): Database Setup

### 1.1 เปิด Supabase Dashboard

```
1. ไปที่ https://app.supabase.com
2. ล็อกอิน
3. เลือก project QUIZSLAYER
```

### 1.2 รัน SQL Script

```
1. SQL Editor → New Query
2. Copy-paste ทั้งหมดจาก: supabase/pvp_setup.sql
3. Click RUN
4. ตรวจสอบ 0 errors
```

### 1.3 Enable Realtime

```
1. Database → Publications
2. ค้นหา "supabase_realtime"
3. Toggle "pvp_rooms" = ON
4. Save
```

✅ **Database Setup เสร็จ**

---

## ⏱️ ขั้นตอน 2 (3 นาที): Local Setup

### 2.1 Install Dependencies

```bash
cd r:\C#\QUIZSLAYER
npm install
```

### 2.2 Start Dev Server

```bash
npm run dev
# เปิด http://localhost:5173
```

✅ **Dev Server พร้อม**

---

## ⏱️ ขั้นตอน 3 (3 นาที): Test 1 Person

### 3.1 เข้า PvP Lobby

```
1. ล็อกอิน
2. ไปที่ /pvp
```

### 3.2 สร้างห้อง

```
1. Click "🏠 สร้างห้อง"
2. เลือก Quiz Set
3. เลือกสี
4. Click "🏠 สร้างห้อง"
5. ได้โค้ด room
```

### 3.3 เข้าห้องเดียวกัน (Incognito Tab)

```
1. เปิด Incognito window
2. ไปที่ /pvp
3. Click "🚪 เข้าห้อง"
4. ใส่โค้ด
5. เลือกสี
```

### 3.4 Start Game

```
Host Tab: Click "⚔️ เริ่มเกม!"
ทั้ง 2 tab ควรเห็น RPS screen
```

### 3.5 Play RPS

```
Host: Click Rock/Paper/Scissors
Guest: Click Rock/Paper/Scissors
ควรเห็นผลลัพธ์ → Battle screen
```

### 3.6 Answer Questions

```
ตอบ 5 ข้อ → ควรเห็น Lucky Box
เล่นต่อจนใครสักคน HP = 0
```

✅ **1-Player Mock Test ผ่าน**

---

## ⏱️ ขั้นตอน 4 (3 นาที): Test 2 People

### 4.1 Prepare 2 Windows

```
Window 1 (Host):
- http://localhost:5173
- Login Account A
- PvP → Create Room → Get Code (e.g., XY7K9Z)

Window 2 (Guest):
- http://localhost:5173 (Incognito)
- Login Account B
- PvP → Join Room → Input Code XY7K9Z
```

### 4.2 Check Realtime Sync

```
⏳ รอ 1-2 วินาที
Window 1 ควรเห็น Guest เข้ามา (realtime)
ปุ่ม "⚔️ เริ่มเกม!" ควร active
```

### 4.3 Start Game & Play

```
Window 1: Click "⚔️ เริ่มเกม!"
ทั้ง 2 ควรเห็น RPS screen พร้อมกัน
ตอบ → Battle → Play
```

### 4.4 ตรวจสอบ HP Sync

```
✓ Window 1: Host HP 20, Guest HP 16
✓ Window 2: Host HP 20, Guest HP 16
← ต้องตรงกัน
```

✅ **2-Player Realtime Test ผ่าน**

---

## 🆘 Quick Troubleshooting

| Error | Fix |
|-------|-----|
| Guest ไม่เห็น host เข้า | Refresh page / Check Realtime enabled |
| "Supabase connection failed" | Check `.env` VITE_SUPABASE_* |
| HP ไม่ลด | Check battleCalculator.js damage logic |
| RPS ไม่สรุปผล | Check browser console |
| Images ไม่ปรากฏ | Check `public/assets/` มี file ไหม |

---

## ✅ ถ้าทั้งหมดผ่าน

```
🎉 PvP System Ready!
→ ดู PVP_DEPLOYMENT_GUIDE.md สำหรับขั้นตอนเต็ม
→ ดู Phase 5 สำหรับ edge cases
→ ดู Phase 6 สำหรับ production deployment
```

---

**Time: 15 minutes | Difficulty: Easy**
