# FREE MODE HISTORY SETUP — SQL Editor Required

## ⚠️ สำคัญ: คุณต้องรันคำสั่ง SQL บน Supabase

การแก้ไข JavaScript/Vue ไม่เพียงพอ — ต้อง **อัปเดตฐานข้อมูล** เพื่อให้ FREE MODE บันทึกได้

---

## 📋 ขั้นตอนการตั้งค่า

### ขั้นตอนที่ 1: เปิด Supabase SQL Editor

1. ไปที่ https://app.supabase.com
2. เลือก Project ของคุณ
3. ไปที่ **SQL Editor** (ด้านซ้าย sidebar)
4. กด **+ New Query**

---

### ขั้นตอนที่ 2: รันคำสั่ง SQL นี้

**คัดลอกและวาง คำสั่งทั้งหมด** ลงใน SQL Editor:

```sql
-- Add FREE mode support to game_sessions table
-- This allows FREE MODE history tracking

BEGIN;

-- Drop the existing constraint
ALTER TABLE public.game_sessions
DROP CONSTRAINT game_sessions_mode_check;

-- Add new constraint with 'free' mode
ALTER TABLE public.game_sessions
ADD CONSTRAINT game_sessions_mode_check CHECK (mode IN ('solo','pvp','free'));

COMMIT;
```

---

### ขั้นตอนที่ 3: รันคำสั่ง

1. กด **Ctrl+Enter** หรือคลิกปุ่ม **Execute** (สีน้ำเงิน)
2. รอให้เสร็จ — ควรจะเห็น ✅ "Success" ด้านล่าง
3. หากเห็น error → ดูข้อมูลใน "Error" tab

---

## ✅ ผลลัพธ์หลังจากรันสำเร็จ

- ✅ FREE MODE สามารถบันทึกเซสชั่นได้
- ✅ ประวัติจะแสดงใน HISTORY ด้วยป้าย "FREE"
- ✅ ไม่มีเหรียญรางวัล (coins_earned = 0)

---

## 🔍 ตรวจสอบ: SQL Query หลังจากอัปเดต

หากต้องการตรวจสอบว่าอัปเดตเรียบร้อย ให้รันคำสั่งนี้:

```sql
-- Check the constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'game_sessions' AND constraint_name LIKE '%mode%';

-- Check data type of mode column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'game_sessions' AND column_name = 'mode';
```

ควรเห็น mode เป็น `text` และ constraint มี `'free'` อยู่ในตัวเลือก

---

## 📝 ไฟล์ที่แก้ไขสำหรับ FREE MODE

| ไฟล์ | การแก้ไข |
|------|---------|
| `src/views/FreeView.vue` | เพิ่มบันทึกเซสชั่น |
| `src/views/HistoryView.vue` | แสดง FREE MODE ใน history |
| `supabase/schema.sql` | อัปเดต mode constraint |
| **supabase/migrations/add_free_mode.sql** | ✅ **รันไฟล์นี้ใน SQL Editor** |

---

## ❓ FAQ

**Q: ต้องรันคำสั่ง SQL ทุกครั้งหรือ?**
- ไม่ — รันครั้งเดียวเพื่ออัปเดตฐานข้อมูล

**Q: จะเกิดอะไรถ้าไม่รัน SQL?**
- FREE MODE จะพยายามบันทึก แต่ **ถูก reject** เพราะ 'free' ไม่อยู่ใน constraint

**Q: หากเกิด error "constraint already exists"?**
- ลบสองบรรทัดแรก (DROP) และรันเฉพาะ ADD constraint

---

## 🚀 เสร็จแล้ว!

หลังจากรัน SQL ให้:

1. ไปทดสอบ FREE MODE
2. ทำแบบฝึกหัด → จบ → ตรวจสอบใน HISTORY
3. ควรจะเห็นการบันทึก ✅

