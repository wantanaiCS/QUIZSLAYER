# ✅ FREE MODE History — Next Steps

## ทำเรียบร้อยแล้ว (Code Level)

- ✅ `src/views/FreeView.vue` — บันทึกผลลัพธ์
- ✅ `src/views/HistoryView.vue` — แสดงประวัติ FREE MODE
- ✅ `supabase/schema.sql` — อัปเดต constraint

---

## 🔴 ต้องทำ (Database Level)

### ⚠️ **STEP 1: รัน SQL ใน Supabase**

ตอนนี้ต้อง **อัปเดตฐานข้อมูล** เพื่อให้ FREE MODE ทำงาน

**ไปที่:**
1. https://app.supabase.com
2. เลือก Project ของคุณ
3. ไปที่ **SQL Editor**
4. กด **+ New Query**

**คัดลอกคำสั่งนี้:**

```sql
BEGIN;

ALTER TABLE public.game_sessions
DROP CONSTRAINT game_sessions_mode_check;

ALTER TABLE public.game_sessions
ADD CONSTRAINT game_sessions_mode_check CHECK (mode IN ('solo','pvp','free'));

COMMIT;
```

**คลิก Execute (หรือกด Ctrl+Enter)**

✅ ควรจะเห็น "Success"

---

### ⚠️ **STEP 2: ตรวจสอบ (Optional)**

รัน query นี้เพื่อยืนยัน:

```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'game_sessions' AND constraint_name LIKE '%mode%';
```

ควรเห็น constraint กับ 'free' อยู่ในตัวเลือก

---

## 🧪 STEP 3: ทดสอบระบบ

1. ไปที่ FREE MODE
2. ทำแบบฝึกหัดให้เสร็จ
3. ไปที่ HISTORY
4. ตรวจสอบว่าเห็นการบันทึก ✅

---

## 📂 ไฟล์ที่สร้างสำหรับ Reference

| ไฟล์ | วัตถุประสงค์ |
|------|-----------|
| `FREE_MODE_HISTORY_SETUP.md` | 📖 คู่มือตั้งค่าเต็มรูป |
| `FREE_MODE_SQL_COMMANDS.sql` | 📋 คำสั่ง SQL พร้อมใช้ |
| `supabase/migrations/add_free_mode.sql` | 🔧 Migration file |
| `FREE_MODE_NEXT_STEPS.md` | ⬅️ ไฟล์นี้ |

---

## ❓ ถ้าเกิด Error

### Error: "constraint ... already exists"
→ ลบบรรทัด `DROP CONSTRAINT` แล้วรันเฉพาะ `ADD CONSTRAINT`

### Error: "mode' for relation 'game_sessions' does not exist"
→ ตรวจสอบว่าตารางชื่อถูก (ต้อง `public.game_sessions`)

### Still not working?
→ ดู `FREE_MODE_HISTORY_SETUP.md` สำหรับแก้ไขปัญหา

---

## ✨ เสร็จแล้ว!

เมื่อดำเนินการเสร็จแล้ว FREE MODE จะ:
- ✅ บันทึกผลลัพธ์ทั้งหมด
- ✅ แสดงใน HISTORY ด้วยป้าย "FREE"
- ✅ ไม่รับเหรียญ (coins = 0)
- ✅ สามารถกรองตามโหมด

