# 🎯 QuizSlayer - Quiz Management System Guide

## 📋 Overview

ระบบจัดการชุดข้อสอบแบบครบวงจร พร้อมฟีเจอร์:
- 🔍 **ระบบค้นหาและกรองขั้นสูง** - ค้นหา กรอง เรียงลำดับ
- 🏷️ **ระบบแท็ก (Tags)** - จัดหมวดหมู่ด้วยแท็กหลายแท็ก
- ❤️ **ระบบถูกใจ (Likes)** - กดไลค์ชุดข้อสอบที่ชอบ
- 📊 **ระบบสถิติ** - Views, Plays, Shares, Likes tracking
- 🎨 **ไอคอนและสี** - เลือกไอคอนและสีให้ชุดข้อสอบ
- 🔗 **ระบบแชร์** - แชร์ลิงก์หรือ social media
- 🌐 **สาธารณะ/ส่วนตัว** - ควบคุมการมองเห็นชุดข้อสอบ

---

## 🗄️ Database Schema

### การเปลี่ยนแปลงใน `quiz_sets` table:

```sql
ALTER TABLE quiz_sets ADD COLUMN:
  - category TEXT (general/science/math/history/language/technology/art/sports/other)
  - difficulty TEXT (easy/normal/hard/expert)
  - icon_name TEXT (book-open, calculator, flask, etc.)
  - icon_color TEXT (red, blue, green, yellow, purple, pink, orange, teal)
  - cover_image_url TEXT (optional)
```

### Tables ใหม่:

#### 1. **tags** - แท็กสำหรับจัดหมวดหมู่
```sql
- id UUID PRIMARY KEY
- name TEXT UNIQUE
- slug TEXT UNIQUE
- created_at TIMESTAMPTZ
```

#### 2. **quiz_tags** - ความสัมพันธ์ Quiz ↔ Tags (Many-to-Many)
```sql
- quiz_set_id UUID → quiz_sets(id)
- tag_id UUID → tags(id)
- created_at TIMESTAMPTZ
PRIMARY KEY (quiz_set_id, tag_id)
```

#### 3. **quiz_likes** - การกดถูกใจ
```sql
- user_id UUID → profiles(id)
- quiz_set_id UUID → quiz_sets(id)
- created_at TIMESTAMPTZ
PRIMARY KEY (user_id, quiz_set_id)
```

#### 4. **quiz_stats** - สถิติชุดข้อสอบ
```sql
- quiz_set_id UUID PRIMARY KEY → quiz_sets(id)
- views_count INTEGER (จำนวนครั้งที่ดู)
- shares_count INTEGER (จำนวนครั้งที่แชร์)
- plays_count INTEGER (จำนวนครั้งที่เล่น)
- likes_count INTEGER (จำนวนไลค์)
- updated_at TIMESTAMPTZ
```

---

## 🔧 Database Functions

### 1. **toggle_quiz_like(quiz_set_id)** - กดถูกใจ/ยกเลิกถูกใจ
```sql
-- เรียกใช้:
SELECT * FROM toggle_quiz_like('uuid-here');

-- Return: { is_liked: boolean, likes_count: integer }
```

### 2. **record_quiz_view(quiz_set_id)** - บันทึกการดู
```sql
SELECT record_quiz_view('uuid-here');
-- เพิ่ม views_count +1
```

### 3. **record_quiz_share(quiz_set_id)** - บันทึกการแชร์
```sql
SELECT record_quiz_share('uuid-here');
-- เพิ่ม shares_count +1 (ต้อง authenticated)
```

### 4. **record_quiz_play(quiz_set_id)** - บันทึกการเล่น
```sql
SELECT record_quiz_play('uuid-here');
-- เพิ่ม plays_count +1
```

### 5. **add_or_get_tag(tag_name)** - สร้างหรือดึงแท็ก
```sql
SELECT add_or_get_tag('JavaScript');
-- Return: tag_id (UUID)
-- สร้างแท็กใหม่ถ้าไม่มี หรือ return id ถ้ามีแล้ว
```

### 6. **get_popular_tags(limit)** - ดึงแท็กยอดนิยม
```sql
SELECT * FROM get_popular_tags(20);
-- Return: แท็กที่ใช้บ่อยที่สุด เรียงตาม usage_count
```

---

## 📊 View: `quiz_sets_with_details`

View สำหรับดึงข้อมูลชุดข้อสอบพร้อมข้อมูลทั้งหมด:

```sql
SELECT * FROM quiz_sets_with_details
WHERE is_public = true
ORDER BY likes_count DESC;
```

**คอลัมน์ที่ได้:**
- ทุกคอลัมน์จาก `quiz_sets`
- `author_name` - ชื่อผู้สร้าง
- `likes_count` - จำนวนไลค์
- `views_count` - จำนวนครั้งที่ดู
- `plays_count` - จำนวนครั้งที่เล่น
- `shares_count` - จำนวนครั้งที่แชร์
- `is_liked` - ผู้ใช้ปัจจุบันกดไลค์หรือไม่ (boolean)
- `tags` - array ของแท็ก (JSON)

---

## 💻 Frontend Components

### 1. **QuizCard.vue** - การ์ดแสดงชุดข้อสอบ

**Props:**
```javascript
{
  quiz: Object,        // ข้อมูลชุดข้อสอบ
  isOwner: Boolean,    // เจ้าของหรือไม่
  showAuthor: Boolean, // แสดงชื่อผู้สร้าง
  disabled: Boolean    // ปิดใช้งานปุ่ม
}
```

**Events:**
```javascript
@play="handlePlay"           // เล่นชุดข้อสอบ
@edit="handleEdit"           // แก้ไข (เจ้าของเท่านั้น)
@delete="handleDelete"       // ลบ (เจ้าของเท่านั้น)
@share="handleShare"         // แชร์
@toggle-like="handleLike"    // กดถูกใจ/ยกเลิก
@tag-click="handleTagClick"  // คลิกแท็ก (เพื่อกรอง)
```

**Features:**
- แสดงไอคอนหรือรูปภาพปก (cover_image_url)
- แสดงแท็กสูงสุด 3 แท็ก (แสดง +N ถ้ามากกว่า)
- แสดงสถิติ (likes, views, plays) แบบ hover
- ปุ่มถูกใจพร้อม animation
- Badge หมวดหมู่และความยาก

---

### 2. **ShareDialog.vue** - Dialog สำหรับแชร์

**Props:**
```javascript
{
  modelValue: Boolean,  // เปิด/ปิด dialog
  quiz: Object         // ข้อมูลชุดข้อสอบที่จะแชร์
}
```

**Features:**
- คัดลอกลิงก์ (copy to clipboard)
- แชร์ผ่าน LINE, Facebook, Twitter
- แสดงตัวอย่างชุดข้อสอบ (ชื่อ, ไอคอน, จำนวนข้อ)
- บันทึก share count อัตโนมัติเมื่อแชร์

**URL Format:**
```
https://your-domain.com/quiz/:quizId
```

---

### 3. **TagManager.vue** - จัดการแท็กในชุดข้อสอบ

**Props:**
```javascript
{
  modelValue: Array,  // แท็กที่เลือก [{ id, name, slug }, ...]
  disabled: Boolean,  // ปิดใช้งาน
  maxTags: Number    // จำนวนแท็กสูงสุด (default: 10)
}
```

**Features:**
- Autocomplete จากแท็กที่มีอยู่
- สร้างแท็กใหม่ (กด Enter)
- แสดงแท็กยอดนิยมด้านล่าง (quick add)
- Validation (2-30 ตัวอักษร, ไม่ซ้ำ)
- Visual tag chips พร้อมปุ่มลบ

**วิธีใช้:**
```vue
<TagManager 
  v-model="selectedTags" 
  :disabled="loading"
  :max-tags="10"
/>
```

---

### 4. **PopularTags.vue** - Widget แท็กยอดนิยม

**Props:**
```javascript
{
  tags: Array,          // แท็กยอดนิยม
  selectedTags: Array,  // แท็กที่เลือกอยู่ (ids)
  loading: Boolean,     // กำลังโหลด
  compact: Boolean,     // โหมดกะทัดรัด
  defaultLimit: Number  // จำนวนแท็กแสดงเริ่มต้น (default: 12)
}
```

**Events:**
```javascript
@toggle-tag="handleToggleTag"  // คลิกแท็ก
@clear-all="handleClearAll"    // ล้างแท็กทั้งหมด
```

**Features:**
- แสดงอันดับ 1-3 ด้วยเหรียญรางวัล (🥇🥈🥉)
- แสดง usage count
- Checkmark เมื่อเลือก
- ปุ่ม "แสดงเพิ่มเติม/แสดงน้อยลง"

---

### 5. **useQuizFilter** Composable - ระบบกรอง

**การใช้งาน:**
```javascript
import { useQuizFilter } from '@/composables/useQuizFilter'

const quizzes = ref([...])
const filter = useQuizFilter(quizzes)

// กรอง
filter.searchText.value = 'JavaScript'
filter.selectedTags.value = ['tag-id-1', 'tag-id-2']
filter.selectedCategory.value = 'technology'
filter.selectedDifficulty.value = 'normal'
filter.sortBy.value = 'most_liked'
filter.showOnlyLiked.value = true

// ผลลัพธ์
const results = filter.filteredQuizzes.value  // ชุดข้อสอบที่กรองแล้ว
const stats = filter.filterStats.value        // สถิติ
```

**ตัวเลือกการเรียงลำดับ (sortBy):**
- `'popular'` - ยอดนิยม (ผสม likes, plays, views + recency)
- `'newest'` - ใหม่ล่าสุด
- `'oldest'` - เก่าสุด
- `'most_liked'` - ถูกใจมากสุด
- `'most_played'` - เล่นมากสุด
- `'alphabetical'` - เรียงตาม ก-ฮ

**Methods:**
```javascript
filter.resetFilters()          // รีเซ็ตทั้งหมด
filter.toggleTag(tagId)        // เปิด/ปิดแท็ก
filter.removeTag(tagId)        // ลบแท็ก
filter.isTagSelected(tagId)    // เช็คว่าเลือกแท็กหรือไม่
```

---

## 🎨 QuizEditView - แก้ไขชุดข้อสอบ

### ฟีเจอร์ที่เพิ่ม:

#### 1. **Icon Picker** - เลือกไอคอน
12 ไอคอนให้เลือก:
- 📖 book-open (หนังสือ)
- 🧮 calculator (เครื่องคิดเลข)
- 🧪 flask (หลอดทดลอง)
- 📜 scroll (ม้วนหนังสือ)
- 💬 chat-text (พูดคุย)
- 💻 computer (คอมพิวเตอร์)
- 🎨 palette (จานสี)
- ⚽ soccer-ball (ฟุตบอล)
- 🧠 brain (สมอง)
- 🎯 target (เป้าหมาย)
- 💡 lightbulb (หลอดไฟ)
- 🚀 rocket (จรวด)

#### 2. **Color Selector** - เลือกสี
8 สีให้เลือก: red, blue, green, yellow, purple, pink, orange, teal

#### 3. **Category Dropdown** - หมวดหมู่
- ทั่วไป (general)
- วิทยาศาสตร์ (science)
- คณิตศาสตร์ (math)
- ประวัติศาสตร์ (history)
- ภาษา (language)
- เทคโนโลยี (technology)
- ศิลปะ (art)
- กีฬา (sports)
- อื่นๆ (other)

#### 4. **Difficulty Dropdown** - ความยาก
- ง่าย (easy)
- ปานกลาง (normal)
- ยาก (hard)
- ผู้เชี่ยวชาญ (expert)

#### 5. **TagManager** - จัดการแท็ก
- เพิ่มแท็กได้สูงสุด 10 แท็ก
- Autocomplete และสร้างแท็กใหม่
- แสดงแท็กยอดนิยม

#### 6. **Stats Display** - แสดงสถิติ
- จำนวนข้อสอบ
- จำนวนไลค์
- จำนวนเล่น
- จำนวนดู

#### 7. **Visibility Toggle** - สาธารณะ/ส่วนตัว
Toggle switch สำหรับเปลี่ยนสถานะการมองเห็น

---

## 🔄 QuizManageView - จัดการชุดข้อสอบ

### Tab Navigation:

#### 1. **Tab "ชุดข้อสอบของฉัน"**
- แสดงเฉพาะชุดข้อสอบที่สร้างเอง
- ไม่มีระบบกรอง (แสดงทั้งหมด)
- ปุ่ม: เล่น, แก้ไข, แชร์, ลบ

#### 2. **Tab "ชุดข้อสอบสาธารณะ"**
- แสดงชุดข้อสอบสาธารณะทั้งหมด
- **PopularTags Widget** - แท็กยอดนิยมด้านบน
- **ระบบกรองขั้นสูง:**
  - 🔍 Search bar - ค้นหาชื่อ, คำอธิบาย, แท็ก
  - 🏷️ Tags filter - กรองตามแท็ก (AND logic)
  - 📂 Category filter - กรองตามหมวดหมู่
  - 🎯 Difficulty filter - กรองตามความยาก
  - ❤️ Liked only toggle - แสดงเฉพาะที่ถูกใจ
  - 🔀 Sort options - เรียงลำดับ
- **Filter Stats** - แสดง "แสดง X จาก Y ชุดข้อสอบ"
- ปุ่ม: เล่น, ถูกใจ, แชร์, (แก้ไข/ลบ ถ้าเป็นเจ้าของ)

### Empty States:
- ยังไม่มีชุดข้อสอบของฉัน → ปุ่มสร้างชุดข้อสอบ
- ยังไม่มีชุดข้อสอบสาธารณะ → ข้อความแจ้ง
- ไม่พบผลลัพธ์ → ปุ่มล้างตัวกรอง

---

## 📦 quizStore Methods

### Tags Methods:
```javascript
// โหลดแท็กทั้งหมด
await quizStore.fetchTags()

// โหลดแท็กยอดนิยม
await quizStore.fetchPopularTags(limit)

// สร้างหรือดึงแท็ก
const tag = await quizStore.addOrGetTag('JavaScript')

// เพิ่มแท็กให้ชุดข้อสอบ
await quizStore.addTagToQuiz(quizSetId, tagId)

// ลบแท็กจากชุดข้อสอบ
await quizStore.removeTagFromQuiz(quizSetId, tagId)
```

### Stats Methods:
```javascript
// กดถูกใจ/ยกเลิก
await quizStore.toggleLike(quizSetId)

// บันทึกการดู
await quizStore.recordView(quizSetId)

// บันทึกการแชร์
await quizStore.recordShare(quizSetId)

// บันทึกการเล่น
await quizStore.recordPlay(quizSetId)
```

### Quiz CRUD Methods:
```javascript
// โหลดชุดข้อสอบสาธารณะ
await quizStore.fetchPublicSets()

// โหลดชุดข้อสอบของฉัน
await quizStore.fetchMySets()

// โหลดชุดข้อสอบเต็ม (พร้อมคำถาม)
await quizStore.loadQuizSet(quizSetId)

// อัปเดตข้อมูลชุดข้อสอบ
await quizStore.updateQuizSet(quizSetId, {
  title: 'ชื่อใหม่',
  category: 'technology',
  icon_name: 'computer',
  icon_color: 'blue',
  is_public: true
})

// ลบชุดข้อสอบ
await quizStore.deleteQuizSet(quizSetId)
```

---

## 🎯 Mock Mode Support

ระบบรองรับ **Mock Mode** สำหรับการทดสอบโดยไม่ต้องมี Supabase:

```javascript
// ใน lib/supabase.js
export const isMockMode = !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL === 'your-project-url'
```

**ฟีเจอร์ที่รองรับ Mock Mode:**
- ✅ Tags (mock tags ใน memory)
- ✅ Likes (toggle ใน memory)
- ✅ Views, Shares, Plays (increment ใน memory)
- ✅ Quiz CRUD (localStorage)
- ✅ Popular tags (คำนวณจาก mock data)

---

## 🚀 Deployment Checklist

### 1. **Run Migration**
```sql
-- รัน migration file
\i supabase/migration_quiz_management_system.sql
```

### 2. **Verify Tables**
```sql
-- ตรวจสอบ tables
SELECT * FROM tags LIMIT 5;
SELECT * FROM quiz_tags LIMIT 5;
SELECT * FROM quiz_likes LIMIT 5;
SELECT * FROM quiz_stats LIMIT 5;
```

### 3. **Test Functions**
```sql
-- ทดสอบ functions
SELECT add_or_get_tag('Test Tag');
SELECT * FROM get_popular_tags(10);
SELECT * FROM quiz_sets_with_details LIMIT 5;
```

### 4. **Test RLS Policies**
```sql
-- ทดสอบ RLS (ต้อง login ก่อน)
SELECT * FROM quiz_sets_with_details WHERE is_public = true;
SELECT * FROM toggle_quiz_like('quiz-id-here');
```

### 5. **Frontend Build**
```bash
npm run build
```

### 6. **Test Complete Flow**
1. สร้างชุดข้อสอบใหม่
2. เพิ่ม icon, color, category, difficulty
3. เพิ่มแท็ก 3-5 แท็ก
4. ตั้งเป็นสาธารณะ
5. ไปที่ tab สาธารณะ
6. ทดสอบ: ค้นหา, กรองตามแท็ก, กรองตามหมวดหมู่
7. กดถูกใจ
8. แชร์ลิงก์
9. เล่นชุดข้อสอบ
10. ตรวจสอบสถิติ (views, plays, likes)

---

## 🐛 Troubleshooting

### ปัญหา: ไอคอนไม่แสดง
**สาเหตุ:** gradient classes ยังไม่ได้เพิ่มใน CSS

**แก้ไข:** ตรวจสอบ `src/style.css` มี classes:
```css
.bg-gradient-red { ... }
.bg-gradient-blue { ... }
/* ... etc */
```

### ปัญหา: แท็กไม่แสดง
**สาเหตุ:** ยังไม่ได้เรียก `fetchTags()` หรือ `fetchPopularTags()`

**แก้ไข:**
```javascript
onMounted(async () => {
  await quizStore.fetchTags()
  await quizStore.fetchPopularTags()
})
```

### ปัญหา: Toggle like ไม่ทำงาน
**สาเหตุ:** User ยังไม่ login

**แก้ไข:** ตรวจสอบ `authStore.user` มีค่าหรือไม่

### ปัญหา: Quiz stats ไม่อัปเดต
**สาเหตุ:** View `quiz_sets_with_details` ยังไม่ refresh

**แก้ไข:** เรียก `fetchPublicSets()` หรือ `fetchMySets()` ใหม่

---

## 📚 Resources

### Files Modified:
- `supabase/migration_quiz_management_system.sql` - Database migration
- `src/style.css` - Gradient color classes
- `src/stores/quizStore.js` - Store methods (already exists)
- `src/components/quiz/QuizCard.vue` - Quiz card component (already exists)
- `src/components/quiz/ShareDialog.vue` - Share dialog (already exists)
- `src/components/quiz/TagManager.vue` - Tag manager (already exists)
- `src/components/quiz/PopularTags.vue` - Popular tags widget (already exists)
- `src/composables/useQuizFilter.js` - Filter composable (already exists)
- `src/views/QuizManageView.vue` - Manage view (already exists)
- `src/views/QuizEditView.vue` - Edit view (updated styles)

### API Endpoints (via Supabase):
- `POST /rest/v1/rpc/toggle_quiz_like`
- `POST /rest/v1/rpc/record_quiz_view`
- `POST /rest/v1/rpc/record_quiz_share`
- `POST /rest/v1/rpc/record_quiz_play`
- `POST /rest/v1/rpc/add_or_get_tag`
- `GET /rest/v1/rpc/get_popular_tags`
- `GET /rest/v1/quiz_sets_with_details`

---

## ✅ Testing Checklist

- [ ] สร้างชุดข้อสอบใหม่ + เลือก icon, color, category, difficulty
- [ ] เพิ่มแท็ก 5 แท็ก (3 แท็กเก่า + 2 แท็กใหม่)
- [ ] บันทึกและตรวจสอบว่าข้อมูลถูกบันทึก
- [ ] ตั้งชุดข้อสอบเป็นสาธารณะ
- [ ] ไปที่ tab "ชุดข้อสอบสาธารณะ"
- [ ] ทดสอบค้นหา (ชื่อ, แท็ก)
- [ ] ทดสอบกรองตามแท็ก (เลือก 2-3 แท็ก)
- [ ] ทดสอบกรองตามหมวดหมู่
- [ ] ทดสอบกรองตามความยาก
- [ ] ทดสอบเรียงลำดับ (ยอดนิยม, ใหม่ล่าสุด, ถูกใจมากสุด)
- [ ] กดถูกใจชุดข้อสอบ → ตรวจสอบ likes_count เพิ่มขึ้น
- [ ] เปิด ShareDialog → คัดลอกลิงก์
- [ ] แชร์ผ่าน LINE/Facebook/Twitter
- [ ] ตรวจสอบ shares_count เพิ่มขึ้น
- [ ] เล่นชุดข้อสอบ → ตรวจสอบ plays_count เพิ่มขึ้น
- [ ] ดูชุดข้อสอบ → ตรวจสอบ views_count เพิ่มขึ้น
- [ ] ทดสอบ "แสดงเฉพาะที่ถูกใจ" toggle
- [ ] ทดสอบคลิกแท็กจาก QuizCard → ไปที่ tab สาธารณะพร้อมกรองแท็กนั้น
- [ ] ทดสอบ PopularTags widget → คลิกแท็ก → กรองชุดข้อสอบ
- [ ] ทดสอบล้างตัวกรอง → แสดงชุดข้อสอบทั้งหมด
- [ ] ทดสอบ Mock Mode (ไม่มี Supabase URL)
- [ ] ทดสอบ Empty States ทุกแบบ

---

## 🎉 Summary

ระบบจัดการชุดข้อสอบครบวงจรพร้อมใช้งาน! ✨

**Features เด่น:**
- 🔍 ค้นหาและกรองขั้นสูง (search, tags, category, difficulty, sort)
- ❤️ กดถูกใจและบันทึกชุดข้อสอบโปรด
- 📊 สถิติครบถ้วน (views, plays, shares, likes)
- 🎨 ปรับแต่งไอคอนและสี (12 icons × 8 colors = 96 combinations!)
- 🏷️ ระบบแท็กที่ทรงพลัง (unlimited tags, autocomplete, popular tags)
- 🔗 แชร์ง่าย (direct link + social media)
- 🌐 ควบคุมการมองเห็น (สาธารณะ/ส่วนตัว)
- 🎯 Mock Mode สำหรับการพัฒนาและทดสอบ

**Happy Quiz Managing! 🚀**
