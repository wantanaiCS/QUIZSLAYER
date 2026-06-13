<template>
  <div class="max-w-4xl mx-auto px-4 py-12">

    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-qs-text mb-2">🤖 AI Quiz Generator</h1>
      <p class="text-qs-muted">ระบุหัวข้อ → สร้าง Prompt → วางใน AI → Import เล่นเลย</p>
    </div>

    <!-- Step Indicator -->
    <div class="flex items-center justify-center gap-2 mb-10 text-xs font-medium">
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="flex items-center gap-2"
      >
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all"
          :class="currentStep > i
            ? 'bg-qs-success text-white'
            : currentStep === i
              ? 'bg-qs-primary text-white shadow-qs-glow'
              : 'bg-qs-surface border border-qs-border text-qs-muted'"
        >
          <span v-if="currentStep > i">✓</span>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <span :class="currentStep === i ? 'text-qs-text' : 'text-qs-muted'">{{ step }}</span>
        <span v-if="i < steps.length - 1" class="text-qs-border mx-1">→</span>
      </div>
    </div>

    <!-- ─── Step 0: ตั้งค่า ─────────────────────────── -->
    <div v-if="currentStep === 0" class="card p-8 animate-slide-up">
      <!-- Mode tabs -->
      <div class="flex gap-2 mb-8 p-1 bg-qs-surface rounded-qs border border-qs-border w-fit">
        <button
          v-for="mode in modes"
          :key="mode.key"
          class="px-5 py-2 rounded-[9px] text-sm font-medium transition-all"
          :class="activeMode === mode.key
            ? 'bg-qs-primary text-white shadow-qs'
            : 'text-qs-muted hover:text-qs-text'"
          @click="activeMode = mode.key"
        >
          {{ mode.label }}
        </button>
      </div>

      <!-- Topic Mode -->
      <div v-if="activeMode === 'topic'" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-qs-muted mb-2">หัวข้อ / Topic <span class="text-qs-danger">*</span></label>
          <input
            v-model="topic"
            type="text"
            placeholder="เช่น: ประวัติศาสตร์ไทย, Python Programming, Organic Chemistry"
            class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text placeholder-qs-muted focus:outline-none focus:border-qs-primary transition-colors"
            @keydown.enter="goToStep1"
          />
        </div>

        <div class="grid sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-qs-muted mb-2">จำนวนข้อ</label>
            <select v-model="numQuestions" class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text focus:outline-none focus:border-qs-primary">
              <option v-for="n in [10, 15, 20, 25, 30, 50]" :key="n" :value="n">{{ n }} ข้อ</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-qs-muted mb-2">ภาษา</label>
            <select v-model="lang" class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text focus:outline-none focus:border-qs-primary">
              <option value="thai">ภาษาไทย</option>
              <option value="english">English</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-qs-muted mb-2">ความยาก</label>
            <select v-model="difficulty" class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text focus:outline-none focus:border-qs-primary">
              <option value="mixed">Mixed (แนะนำ)</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <button class="btn-primary w-full py-4" :disabled="!topic.trim()" @click="goToStep1">
          ✨ สร้าง Master Prompt →
        </button>
      </div>

      <!-- Document Mode -->
      <div v-else class="space-y-5">
        <div
          class="border-2 border-dashed border-qs-border rounded-qs p-12 text-center transition-colors cursor-pointer"
          :class="isDragging ? 'border-qs-primary bg-qs-primary/5' : 'hover:border-qs-primary/50'"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleFileDrop"
          @click="fileInput?.click()"
        >
          <div class="text-4xl mb-4">{{ docFile ? '📄' : '📁' }}</div>
          <p v-if="docFile" class="text-qs-text font-medium mb-1">{{ docFile.name }}</p>
          <p v-if="docFile" class="text-qs-muted text-xs">{{ (docFile.size / 1024).toFixed(1) }} KB — คลิกเพื่อเปลี่ยน</p>
          <p v-else class="text-qs-muted mb-2">ลาก TXT / PDF มาวาง หรือคลิกเพื่อเลือกไฟล์</p>
          <p v-if="!docFile" class="text-qs-muted text-xs">รองรับ .txt | .pdf (ขนาดไม่เกิน 2 MB)</p>
          <input ref="fileInput" type="file" accept=".txt,.pdf" class="hidden" @change="handleFileSelect" />
        </div>

        <div v-if="docFile" class="grid sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-qs-muted mb-2">จำนวนข้อ</label>
            <select v-model="numQuestions" class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text focus:outline-none focus:border-qs-primary">
              <option v-for="n in [10, 15, 20, 25, 30]" :key="n" :value="n">{{ n }} ข้อ</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-qs-muted mb-2">ภาษา</label>
            <select v-model="lang" class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text focus:outline-none focus:border-qs-primary">
              <option value="thai">ภาษาไทย</option>
              <option value="english">English</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-qs-muted mb-2">ความยาก</label>
            <select v-model="difficulty" class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text focus:outline-none focus:border-qs-primary">
              <option value="mixed">Mixed (แนะนำ)</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <button v-if="docFile" class="btn-primary w-full py-4" @click="goToStep1Doc">
          ✨ สร้าง Master Prompt จากเอกสาร →
        </button>

        <div v-if="docError" class="p-3 rounded-qs bg-red-900/20 border border-qs-danger text-qs-danger text-sm">
          {{ docError }}
        </div>
      </div>
    </div>

    <!-- ─── Step 1: Prompt ──────────────────────────── -->
    <div v-if="currentStep === 1" class="space-y-6 animate-slide-up">
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-qs-text">📋 Master Prompt — Copy ไปวางใน AI</h3>
          <button class="btn-secondary text-xs px-3 py-1.5 gap-1.5" @click="copyPrompt">
            {{ copied ? '✅ Copied!' : '📋 Copy' }}
          </button>
        </div>
        <pre class="bg-qs-bg rounded-qs p-4 text-xs text-qs-muted overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">{{ generatedPrompt }}</pre>
      </div>

      <!-- AI Links -->
      <div class="card p-5">
        <p class="text-sm font-medium text-qs-text mb-3">วาง Prompt ใน AI ที่ต้องการ:</p>
        <div class="flex flex-wrap gap-3">
          <a
            v-for="ai in aiLinks"
            :key="ai.name"
            :href="ai.url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-secondary text-xs px-4 py-2 gap-2"
          >
            {{ ai.icon }} {{ ai.name }}
          </a>
        </div>
        <p class="text-xs text-qs-muted mt-3">1. คลิก Copy ด้านบน → 2. เปิด AI → 3. วาง → 4. รับ JSON กลับมา</p>
      </div>

      <!-- JSON Import -->
      <div class="card p-6">
        <h3 class="font-bold text-qs-text mb-4">📥 วาง JSON ที่ได้จาก AI</h3>

        <div v-if="importError" class="mb-4 p-3 rounded-qs bg-red-900/20 border border-qs-danger text-qs-danger text-sm">
          ❌ {{ importError }}
        </div>

        <textarea
          v-model="jsonInput"
          rows="8"
          placeholder='วาง JSON array ที่ได้จาก AI ที่นี่...\n\n[\n  {\n    "question": "คำถาม...",\n    "options": ["ตัวเลือก A", "B", "C", "D"],\n    "correct_index": 0,\n    "difficulty": "easy"\n  }\n]'
          class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text placeholder-qs-muted text-xs font-mono focus:outline-none focus:border-qs-primary transition-colors resize-y"
          @input="importError = ''"
        ></textarea>

        <div class="flex gap-3 mt-4">
          <button class="btn-secondary flex-shrink-0" @click="currentStep = 0">← แก้ไข</button>
          <button
            class="btn-primary flex-1 py-3"
            :disabled="!jsonInput.trim()"
            @click="parseAndPreview"
          >
            🔍 ตรวจสอบ JSON →
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Step 2: Preview ────────────────────────── -->
    <div v-if="currentStep === 2" class="space-y-6 animate-slide-up">

      <!-- Summary -->
      <div class="card p-6">
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 class="font-bold text-qs-text mb-1">✅ JSON ถูกต้อง — พร้อม Import</h3>
            <p class="text-qs-muted text-sm">{{ parsedQuestions.length }} ข้อ · {{ stageCount }} ด่าน</p>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <span
              v-for="(count, diff) in difficultyCount"
              :key="diff"
              class="px-2.5 py-1 rounded-full text-xs font-medium"
              :class="{
                'bg-green-900/30 text-qs-success border border-qs-success/30': diff === 'easy',
                'bg-yellow-900/30 text-qs-warning border border-qs-warning/30': diff === 'normal',
                'bg-red-900/30 text-qs-danger border border-qs-danger/30': diff === 'hard',
              }"
            >
              {{ diff }}: {{ count }}
            </span>
          </div>
        </div>

        <!-- Stage distribution bar -->
        <div class="mb-5">
          <p class="text-xs text-qs-muted mb-2">การกระจายตามด่าน:</p>
          <div class="flex gap-1">
            <div
              v-for="stage in 5"
              :key="stage"
              class="flex-1 rounded text-center text-xs py-1.5 font-medium transition-all"
              :class="questionsByStage[stage]?.length
                ? 'bg-qs-primary/20 border border-qs-primary/40 text-qs-primary'
                : 'bg-qs-surface border border-qs-border text-qs-muted'"
            >
              <div class="text-base mb-0.5">{{ stageEmoji[stage] }}</div>
              <div>{{ questionsByStage[stage]?.length ?? 0 }}ข้อ</div>
            </div>
          </div>
        </div>

        <!-- Title input -->
        <div>
          <label class="block text-sm font-medium text-qs-muted mb-2">ชื่อชุดข้อสอบ <span class="text-qs-danger">*</span></label>
          <input
            v-model="setTitle"
            type="text"
            placeholder="เช่น: ประวัติศาสตร์ไทย 20 ข้อ"
            maxlength="60"
            class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text placeholder-qs-muted focus:outline-none focus:border-qs-primary transition-colors"
          />
        </div>
      </div>

      <!-- Question Preview (แสดง 3 ข้อแรก) -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-qs-text">ตัวอย่างข้อสอบ (3 ข้อแรก)</h3>
          <button
            class="text-xs text-qs-primary hover:underline"
            @click="showAllPreview = !showAllPreview"
          >
            {{ showAllPreview ? 'ย่อลง' : `ดูทั้งหมด ${parsedQuestions.length} ข้อ` }}
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="(q, i) in showAllPreview ? parsedQuestions : parsedQuestions.slice(0, 3)"
            :key="i"
            class="p-4 bg-qs-surface rounded-qs border border-qs-border"
          >
            <div class="flex items-start gap-3 mb-3">
              <span class="text-xs font-pixel text-qs-muted flex-shrink-0 mt-0.5">Q{{ i + 1 }}</span>
              <p class="text-sm text-qs-text">{{ q.question }}</p>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="(opt, oi) in q.options"
                :key="oi"
                class="text-xs px-3 py-2 rounded-[8px] border transition-colors"
                :class="oi === q.correct_index
                  ? 'bg-green-900/20 border-qs-success text-qs-success'
                  : 'bg-qs-bg border-qs-border text-qs-muted'"
              >
                <span class="font-bold mr-1">{{ ['A','B','C','D'][oi] }}.</span>{{ opt }}
              </div>
            </div>
            <p v-if="q.explanation" class="text-xs text-qs-muted mt-2 pl-1">
              💡 {{ q.explanation }}
            </p>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-3">
        <button class="btn-secondary" @click="currentStep = 1">← แก้ไข JSON</button>
        <button
          class="btn-gold flex-1 py-3 text-base"
          :disabled="!setTitle.trim() || quizStore.loading"
          @click="doImport"
        >
          <span v-if="quizStore.loading">⏳ กำลัง Import...</span>
          <span v-else>🎮 Import & เล่นเลย!</span>
        </button>
      </div>

      <div v-if="importError" class="p-3 rounded-qs bg-red-900/20 border border-qs-danger text-qs-danger text-sm">
        ❌ {{ importError }}
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quizStore'

const router    = useRouter()
const quizStore = useQuizStore()

// ─── State ───────────────────────────────────────────
const activeMode     = ref('topic')
const topic          = ref('')
const numQuestions   = ref(20)
const lang           = ref('thai')
const difficulty     = ref('mixed')
const generatedPrompt = ref('')
const jsonInput      = ref('')
const setTitle       = ref('')
const copied         = ref(false)
const importError    = ref('')
const currentStep    = ref(0)
const showAllPreview = ref(false)
const parsedQuestions = ref([])

// Document mode
const docFile    = ref(null)
const docError   = ref('')
const isDragging = ref(false)
const fileInput  = ref(null)

// ─── Static data ─────────────────────────────────────
const modes = [
  { key: 'topic',    label: '📝 Topic Mode' },
  { key: 'document', label: '📄 Document Mode' },
]

const steps = ['ตั้งค่า', 'Copy Prompt', 'Preview & Import']

const aiLinks = [
  { name: 'ChatGPT',  icon: '🤖', url: 'https://chat.openai.com' },
  { name: 'Claude',   icon: '✦',  url: 'https://claude.ai' },
  { name: 'Gemini',   icon: '♊',  url: 'https://gemini.google.com' },
]

const stageEmoji = { 1: '🟢', 2: '👺', 3: '👹', 4: '🧙', 5: '👿' }

// ─── Computed ─────────────────────────────────────────
const difficultyCount = computed(() => {
  const counts = { easy: 0, normal: 0, hard: 0 }
  parsedQuestions.value.forEach(q => {
    const d = q.difficulty ?? 'normal'
    if (d in counts) counts[d]++
  })
  // Remove zeros
  return Object.fromEntries(Object.entries(counts).filter(([, v]) => v > 0))
})

const questionsByStage = computed(() => {
  const byStage = {}
  const perStage = Math.max(1, Math.ceil(parsedQuestions.value.length / 5))
  parsedQuestions.value.forEach((q, i) => {
    const stage = Math.min(5, Math.floor(i / perStage) + 1)
    if (!byStage[stage]) byStage[stage] = []
    byStage[stage].push(q)
  })
  return byStage
})

const stageCount = computed(() => Object.keys(questionsByStage.value).length)

// ─── Helpers ─────────────────────────────────────────
function getDifficultyDist() {
  const n = numQuestions.value
  if (difficulty.value === 'mixed') {
    const easy   = Math.floor(n * 0.4)
    const hard   = Math.floor(n * 0.2)
    const normal = n - easy - hard
    return `${easy} easy, ${normal} normal, ${hard} hard`
  }
  return `${n} ${difficulty.value}`
}

function buildPrompt(contentSection) {
  const langNote = lang.value === 'thai'
    ? 'IMPORTANT: Generate ALL questions and options in Thai language.'
    : 'Generate all questions and options in English.'
  return `You are a quiz generator for an educational RPG game called QuizSlayer.
Generate exactly ${numQuestions.value} multiple choice questions based on the content below.

Rules:
- Each question must have exactly 4 options (index 0-3)
- correct_index is 0-based (0=A, 1=B, 2=C, 3=D)
- Distribute difficulty: ${getDifficultyDist()}
- Return ONLY a valid JSON array. No explanation. No markdown. No extra text.
- ${langNote}

${contentSection}

Required JSON format (array only, no wrapper):
[
  {
    "question": "คำถาม...",
    "options": ["ตัวเลือก A", "ตัวเลือก B", "ตัวเลือก C", "ตัวเลือก D"],
    "correct_index": 0,
    "difficulty": "easy",
    "explanation": "คำอธิบายสั้นๆ ว่าทำไมถึงถูก"
  }
]`
}

// ─── Step navigation ──────────────────────────────────
function goToStep1() {
  if (!topic.value.trim()) return
  generatedPrompt.value = buildPrompt(`Topic: ${topic.value.trim()}`)
  setTitle.value = topic.value.trim()
  currentStep.value = 1
}

async function goToStep1Doc() {
  if (!docFile.value) return
  docError.value = ''

  try {
    let text = ''
    if (docFile.value.type === 'text/plain' || docFile.value.name.endsWith('.txt')) {
      text = await docFile.value.text()
    } else {
      // PDF: แสดง prompt ให้ user ใช้เนื้อหาจาก PDF เอง
      text = `[เนื้อหาจากไฟล์: ${docFile.value.name}]\n\nกรุณา extract text จาก PDF แล้ววางตรงนี้ หรือสรุปเนื้อหาที่ต้องการออกข้อสอบ`
    }

    // ตัดข้อความถ้ายาวเกิน (~3000 chars) เพื่อไม่ให้ prompt ใหญ่เกิน
    const trimmedText = text.length > 3000
      ? text.slice(0, 3000) + '\n...[ตัดข้อความที่เหลือออกเพื่อความเหมาะสม]'
      : text

    generatedPrompt.value = buildPrompt(`Document Content:\n"""\n${trimmedText}\n"""`)
    setTitle.value = docFile.value.name.replace(/\.[^.]+$/, '')
    currentStep.value = 1
  } catch (err) {
    docError.value = 'อ่านไฟล์ไม่ได้: ' + err.message
  }
}

// ─── File handlers ────────────────────────────────────
function handleFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) validateAndSetFile(file)
}

function handleFileDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file) validateAndSetFile(file)
}

function validateAndSetFile(file) {
  docError.value = ''
  const allowed = ['text/plain', 'application/pdf']
  const isAllowedExt = file.name.endsWith('.txt') || file.name.endsWith('.pdf')
  if (!allowed.includes(file.type) && !isAllowedExt) {
    docError.value = 'รองรับเฉพาะ .txt และ .pdf เท่านั้น'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    docError.value = 'ขนาดไฟล์เกิน 2 MB'
    return
  }
  docFile.value = file
}

// ─── Copy ─────────────────────────────────────────────
async function copyPrompt() {
  await navigator.clipboard.writeText(generatedPrompt.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// ─── Parse & validate JSON ────────────────────────────
function parseAndPreview() {
  importError.value = ''
  const raw = jsonInput.value.trim()

  let parsed
  try {
    // รองรับกรณี AI ส่ง JSON ที่มี markdown code fence มาด้วย
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    importError.value = 'JSON ไม่ถูกต้อง — ตรวจสอบว่าเป็น array เริ่มต้นด้วย [ และจบด้วย ]'
    return
  }

  if (!Array.isArray(parsed)) {
    importError.value = 'ต้องเป็น JSON array เท่านั้น (เริ่มต้นด้วย [)'
    return
  }

  if (parsed.length === 0) {
    importError.value = 'JSON array ว่างเปล่า'
    return
  }

  // Validate each question
  const errors = []
  parsed.forEach((q, i) => {
    const num = i + 1
    // รองรับทั้ง "question" และ "question_text" จาก AI
    const questionText = q.question ?? q.question_text
    if (!questionText || typeof questionText !== 'string') {
      errors.push(`ข้อ ${num}: ไม่มี field "question"`)
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`ข้อ ${num}: "options" ต้องเป็น array 4 ตัว`)
    }
    if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index > 3) {
      errors.push(`ข้อ ${num}: "correct_index" ต้องเป็น 0-3`)
    }
  })

  if (errors.length > 0) {
    importError.value = errors.slice(0, 3).join(' | ') + (errors.length > 3 ? ` (+${errors.length - 3} ข้ออื่น)` : '')
    return
  }

  // Normalize field names (รองรับทั้ง question และ question_text)
  parsedQuestions.value = parsed.map(q => ({
    question:      q.question ?? q.question_text,
    options:       q.options,
    correct_index: q.correct_index,
    difficulty:    q.difficulty ?? 'normal',
    explanation:   q.explanation ?? null,
  }))

  currentStep.value = 2
}

// ─── Import ───────────────────────────────────────────
async function doImport() {
  importError.value = ''
  if (!setTitle.value.trim()) return

  try {
    const result = await quizStore.importFromJSON(setTitle.value.trim(), parsedQuestions.value)
    if (result) {
      router.push({ name: 'battle' })
    } else {
      importError.value = quizStore.error ?? 'Import ไม่สำเร็จ กรุณาลองใหม่'
    }
  } catch (err) {
    importError.value = err.message ?? 'เกิดข้อผิดพลาด'
  }
}
</script>
