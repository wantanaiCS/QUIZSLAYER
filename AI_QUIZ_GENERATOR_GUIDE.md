# AI Quiz Generator — คู่มือการใช้งาน

## ✨ ภาพรวม

QuizSlayer มี **Master Prompt** ที่ออกแบบมาเพื่อ generate ข้อสอบคุณภาพสูงจาก AI

### รองรับ AI ทั้งหมด:
- ✅ **ChatGPT** (OpenAI) — แนะนำ GPT-4 ขึ้นไป
- ✅ **Google Gemini** — แนะนำ Gemini 1.5 Pro
- ✅ **Claude** (Anthropic) — Claude 3 ทุกรุ่น
- ✅ AI อื่นๆ ที่รองรับ JSON output

---

## 🔧 ปัญหาที่ระบบแก้ไขอัตโนมัติ

### 1. Smart Quotes (Curly Quotes)
**ปัญหา:** Gemini ใช้ `""` แทน `""`  
**การแก้:** ระบบแปลงเป็น straight quotes อัตโนมัติ

### 2. Unescaped Quotes ภายใน String
**ปัญหา:** `"คำว่า "Blue" คือ"` (invalid JSON)  
**การแก้:** แปลงเป็น `"คำว่า 'Blue' คือ"`

### 3. Markdown Code Blocks
**ปัญหา:** AI ใส่ ` ```json ... ``` `  
**การแก้:** ระบบลบ code blocks อัตโนมัติ

### 4. Incorrect correct_index Distribution
**ปัญหา:** AI ใส่คำตอบเป็น A ทั้งหมด  
**การแก้:** Prompt สั่งให้กระจายแบบสุ่ม (~25% ต่อตัวเลือก)

---

## 📋 Master Prompt Features

Prompt ที่ระบบ generate มีคุณสมบัติ:

### JSON Format Rules
- ✅ ใช้ straight quotes `"` เท่านั้น
- ✅ ห้ามใช้ smart quotes `""` 
- ✅ ใช้ single quotes `'` สำหรับ quotes ภายใน text
- ✅ ห้ามใส่ markdown หรือข้อความนอก JSON
- ✅ Return เฉพาะ JSON array `[...]`

### Content Quality Rules
- ✅ คำถามชัดเจนและทดสอบได้
- ✅ 4 ตัวเลือกที่มีความน่าเชื่อถือ
- ✅ กระจาย correct_index แบบสุ่ม
- ✅ มี explanation ทุกข้อ (1-2 ประโยค)
- ✅ กระจาย difficulty ตามที่ระบุ

---

## 🎯 วิธีใช้งาน

### Step 1: สร้าง Prompt
1. เปิด **Quiz Generator** ในระบบ
2. เลือก Mode:
   - **Topic Mode**: ระบุหัวข้อ (เช่น "ประวัติศาสตร์ไทย")
   - **Document Mode**: อัพโหลดไฟล์ (.txt, .pdf)
3. ตั้งค่า:
   - จำนวนข้อ (10-50)
   - ภาษา (ไทย/English)
   - ความยาก (Mixed/Easy/Normal/Hard)
4. กด **"สร้าง Master Prompt"**

### Step 2: Copy Prompt ไปใส่ AI
1. กด **"📋 Copy Prompt"**
2. เปิด ChatGPT, Gemini, หรือ Claude
3. Paste prompt และกด Enter
4. รอ AI generate JSON

### Step 3: Import JSON กลับมา
1. Copy **JSON ทั้งหมด** จาก AI (รวม `[...]`)
2. กลับมาที่ QuizSlayer
3. Scroll ลง scroll ด้านล่างหัวข้อ **"หรือ วาง JSON จาก AI"**
4. Paste JSON ลงใน text area
5. กด **"🔍 Preview ข้อสอบ"**
6. ตรวจสอบข้อสอบ → กรอกชื่อชุดและ tags
7. กด **"💾 บันทึกชุดข้อสอบ"**

---

## 💡 เคล็ดลับเพิ่มเติม

### สำหรับ Gemini
- ใช้ **Gemini 1.5 Pro** จะได้ผลลัพธ์ดีกว่า Flash
- ถ้า Gemini ใส่ข้อความอธิบายนอก JSON → ลบออกก่อน paste
- Gemini มักจะใส่ smart quotes → ระบบแก้ให้อัตโนมัติ

### สำหรับ ChatGPT
- **GPT-4** ทำได้ดีกว่า GPT-3.5 มาก
- GPT follow format ได้ดี แต่บางครั้งอาจใส่ markdown
- ถ้า GPT ไม่กระจาย correct_index → เตือนใน prompt ว่า "randomize better"

### สำหรับ Claude
- Claude follow instructions ได้ดีที่สุด
- มักจะ output JSON clean ไม่มี markdown
- แต่บางครั้งจะอธิบายก่อน/หลัง JSON → ลบออก

### ถ้า JSON มี Error
1. ดู error message ที่ระบบแสดง
2. ระบบจะบอก position และ context ของ error
3. แก้ใน text area หรือขอให้ AI generate ใหม่
4. ปัญหาที่พบบ่อย:
   - ขาด comma `,` ระหว่างข้อ
   - เปิด/ปิด bracket `[]{}` ไม่ครบ
   - มี trailing comma หลังข้อสุดท้าย

---

## 🔬 JSON Format Reference

```json
[
  {
    "question": "สีแดงในภาษาอังกฤษคือคำว่าอะไร?",
    "options": [
      "Blue",
      "Red",
      "Green",
      "Yellow"
    ],
    "correct_index": 1,
    "difficulty": "easy",
    "explanation": "Red แปลว่า สีแดง"
  },
  {
    "question": "คำถามข้อ 2...",
    "options": ["A", "B", "C", "D"],
    "correct_index": 2,
    "difficulty": "normal",
    "explanation": "อธิบายสั้นๆ"
  }
]
```

### Field Descriptions:
- **question**: คำถาม (string, required)
- **options**: ตัวเลือก 4 ตัว (array of 4 strings, required)
- **correct_index**: ตำแหน่งคำตอบที่ถูก (integer 0-3, required)
- **difficulty**: ระดับความยาก (`"easy"`, `"normal"`, หรือ `"hard"`, required)
- **explanation**: คำอธิบาย 1-2 ประโยค (string, required)

---

## ❓ Troubleshooting

### Q: AI ไม่ generate JSON ให้
**A:** ลองเพิ่มในตอนท้าย prompt: "Output ONLY the JSON array. Start immediately with `[`"

### Q: AI กระจาย correct_index ไม่ดี (คำตอบเป็น A ทั้งหมด)
**A:** Prompt ได้สั่งแล้ว แต่ถ้ายังไม่ดี ลองเพิ่ม:
```
CRITICAL: Verify correct_index distribution before outputting.
Statistics must show roughly 25% for each index (0, 1, 2, 3).
```

### Q: ระบบบอก "JSON ไม่ถูกต้อง"
**A:** 
1. ตรวจสอบว่า copy ครบทั้งหมดหรือยัง (ต้องมี `[` เปิดและ `]` ปิด)
2. ลบข้อความอธิบายนอก JSON ออก
3. ลบ markdown code blocks (```` ```json `````) ออก
4. ดู error message ที่ระบบแสดง — จะบอก position ที่ผิด

### Q: ข้อสอบภาษาไม่ถูกต้อง (ขอภาษาไทยแต่ได้ภาษาอังกฤษ)
**A:** ลอง regenerate ใหม่ และเน้นใน prompt ว่า:
```
CRITICAL: ALL content must be in Thai language.
Question, options, and explanation MUST be in Thai.
```

---

## 📊 ตัวอย่าง Prompt ที่ดี

### Example 1: Topic-based
```
Generate 15 questions about "ระบบสุริยะ" (Solar System)
- 5 easy: ชื่อดาวเคราะห์พื้นฐาน
- 7 normal: ข้อมูลเชิงลึกเกี่ยวกับดาวเคราะห์
- 3 hard: ปรากฏการณ์ทางดาราศาสตร์

Randomize correct_index properly!
```

### Example 2: Document-based
```
Generate 20 questions from this research paper about Machine Learning.
Focus on:
- Key concepts and definitions
- Algorithms and their applications  
- Advantages and limitations

Distribution: 30% easy, 50% normal, 20% hard
```

---

## ✅ Checklist สำหรับข้อสอบคุณภาพ

- [ ] คำถามชัดเจนและเฉพาะเจาะจง
- [ ] ตัวเลือกทั้ง 4 มีความเป็นไปได้
- [ ] correct_index กระจายดี (ไม่ใช่ A ทั้งหมด)
- [ ] explanation มีประโยชน์และถูกต้อง
- [ ] ความยากตรงกับเนื้อหา
- [ ] ภาษาถูกต้องและสอดคล้องทั้งชุด

---

**Happy Quiz Generating! 🎮✨**
