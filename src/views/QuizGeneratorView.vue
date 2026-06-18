<template>
  <div class="page-container">

    <!-- Header -->
    <div class="page-header">
      <div class="page-header-title">
        <GameIcon name="artificial-intelligence" :size="24" class="text-qs-gold" />
        <h1 class="page-title" style="color: #f4c842;">AI QUIZ GENERATOR</h1>
      </div>
      <p class="page-description">ระบุหัวข้อ → สร้าง Prompt → วางใน AI → Import เล่นเลย</p>
    </div>

    <!-- Step Indicator -->
    <div class="mb-10">
      <StepIndicator :steps="steps" :current="currentStep" />
    </div>

    <!-- ─── Step 0: ตั้งค่า ─────────────────────────── -->
    <div v-if="currentStep === 0" class="card p-8 animate-slide-up space-y-6">

      <!-- หัวข้อ -->
      <div>
        <label class="input-label" for="gen-topic">
          หัวข้อ / Topic <span class="text-qs-danger">*</span>
        </label>
        <div class="input-group">
          <PhSparkle :size="16" class="input-icon" aria-hidden="true" />
          <input
            id="gen-topic"
            v-model="topic"
            type="text"
            placeholder="เช่น: ประวัติศาสตร์ไทย, Python Programming, Organic Chemistry"
            class="input"
            @keydown.enter="goToStep1"
          />
        </div>
      </div>

      <!-- รายละเอียดเพิ่มเติม -->
      <div>
        <label class="input-label" for="gen-details">
          รายละเอียดเพิ่มเติม
          <span class="text-xs font-normal text-qs-muted normal-case ml-1">(Optional)</span>
        </label>
        <textarea
          id="gen-details"
          v-model="topicDetails"
          rows="3"
          placeholder="ระบุหัวข้อย่อย, ขอบเขต, หรือข้อกำหนดพิเศษ"
          class="input resize-none"
        ></textarea>
        <p class="text-xs text-qs-muted mt-1 flex items-center gap-1">
          <PhLightbulb :size="12" weight="duotone" aria-hidden="true" />
          ยิ่งระบุละเอียด AI จะสร้างข้อสอบได้ตรงกว่า
        </p>
      </div>

      <!-- ─── แหล่งข้อมูล (Optional toggle) ─── -->
      <div class="border border-qs-border rounded-qs overflow-hidden">
        <!-- Toggle header -->
        <button
          class="w-full flex items-center justify-between px-4 py-3 bg-qs-surface hover:bg-qs-depth-4 transition-colors text-left"
          @click="useSourceFile = !useSourceFile"
        >
          <div class="flex items-center gap-3">
            <PhFolder :size="18" weight="duotone" class="text-qs-muted flex-shrink-0" aria-hidden="true" />
            <div>
              <p class="text-sm font-medium text-qs-text">มีไฟล์แหล่งข้อมูล</p>
              <p class="text-xs text-qs-muted">ระบุให้ AI ออกข้อสอบจากเนื้อหาไฟล์นั้น</p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <span v-if="useSourceFile" class="text-xs text-qs-success font-medium">เปิดใช้งาน</span>
            <span v-else class="text-xs text-qs-muted">Optional</span>
            <div class="w-10 h-5 rounded-full transition-colors flex-shrink-0" :class="useSourceFile ? 'bg-qs-primary' : 'bg-qs-border'">
              <div class="w-4 h-4 bg-white rounded-full mt-0.5 transition-transform shadow" :class="useSourceFile ? 'translate-x-5' : 'translate-x-0.5'"></div>
            </div>
          </div>
        </button>

        <!-- Content when toggle ON -->
        <div v-if="useSourceFile" class="p-4 border-t border-qs-border space-y-4">
          <div class="rounded-qs bg-qs-bg border border-qs-border p-4 space-y-3 text-xs">
            <p class="font-semibold text-qs-text text-sm">วิธีใช้งาน</p>
            <div class="space-y-2 text-qs-muted">
              <div class="flex gap-2">
                <span class="text-qs-primary font-bold flex-shrink-0">1.</span>
                <p>กด <span class="text-qs-text font-medium">สร้าง Master Prompt</span> — ระบบจะเพิ่มคำสั่งให้ AI อ่านเนื้อหาจากไฟล์ที่คุณแนบ</p>
              </div>
              <div class="flex gap-2">
                <span class="text-qs-primary font-bold flex-shrink-0">2.</span>
                <p>เปิด AI → <strong class="text-qs-warning">อัปโหลดหรือแนบไฟล์ของคุณก่อน</strong> (PDF, Word, สไลด์ ฯลฯ)</p>
              </div>
              <div class="flex gap-2">
                <span class="text-qs-primary font-bold flex-shrink-0">3.</span>
                <p>กด Copy แล้ววาง Prompt — AI จะสร้างข้อสอบจากเนื้อหาไฟล์โดยตรง</p>
              </div>
            </div>
            <div class="pt-2 border-t border-qs-border">
              <p class="font-medium text-qs-text mb-2">AI ที่รองรับการอัปโหลดไฟล์:</p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div v-for="ai in aiWithFileSupport" :key="ai.name"
                  class="flex items-start gap-2 p-2 rounded-qs bg-qs-surface border border-qs-border">
                  <span class="flex-shrink-0 text-base">{{ ai.icon }}</span>
                  <div>
                    <p class="font-medium text-qs-text">{{ ai.name }}</p>
                    <p class="text-qs-muted text-[10px] leading-relaxed">{{ ai.note }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Settings grid ─── -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="input-label" for="gen-num">จำนวนข้อ <span class="text-xs font-normal normal-case ml-1">(1–100)</span></label>
          <input
            id="gen-num"
            v-model.number="numQuestions"
            type="number" min="1" max="100" placeholder="20"
            class="input"
            @input="clampNumQuestions"
          />
          <p class="text-xs mt-1.5 transition-colors" :class="questionCountHint.color">{{ questionCountHint.text }}</p>
        </div>
        <div>
          <label class="input-label" for="gen-lang">ภาษา</label>
          <select id="gen-lang" v-model="lang" class="input">
            <option value="thai">ภาษาไทย</option>
            <option value="english">English</option>
          </select>
        </div>
        <div>
          <label class="input-label" for="gen-diff">ความยาก</label>
          <select id="gen-diff" v-model="difficulty" class="input">
            <option value="mixed">Mixed (แนะนำ)</option>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label class="input-label" for="gen-expl">คำอธิบายเฉลย</label>
          <select id="gen-expl" v-model="explanationLength" class="input">
            <option value="short">สั้น — 1 ประโยค (ประหยัด Token)</option>
            <option value="long">ยาว — อ่านแล้วเข้าใจได้เลย</option>
          </select>
          <p class="text-xs text-qs-muted mt-1.5">
            {{ explanationLength === 'short' ? 'เหมาะสำหรับทบทวนเร็วๆ' : 'อธิบายเหตุผล + บริบทครบ' }}
          </p>
        </div>
      </div>

      <button class="btn-primary w-full py-4 gap-2" :disabled="!topic.trim()" @click="goToStep1">
        <PhSparkle :size="18" weight="duotone" aria-hidden="true" />
        สร้าง Master Prompt
        <PhArrowRight :size="16" weight="bold" aria-hidden="true" />
      </button>
    </div>

    <!-- ─── Step 1: Prompt ──────────────────────────── -->
    <div v-if="currentStep === 1" class="space-y-6 animate-slide-up">
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-qs-text">📋 Master Prompt — Copy ไปวางใน AI</h3>
            <p class="text-xs text-qs-muted mt-0.5">
              หัวข้อ: <span class="text-qs-text">{{ topic }}</span>
              <span v-if="useSourceFile" class="ml-2 text-qs-success">· 📁 ใช้ไฟล์แหล่งข้อมูล</span>
            </p>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button class="btn-icon" :aria-label="showFullPrompt ? 'ย่อ Prompt' : 'ดู Prompt เต็ม'" @click="showFullPrompt = !showFullPrompt">
              <PhEye v-if="!showFullPrompt" :size="15" weight="duotone" aria-hidden="true" />
              <PhEyeSlash v-else :size="15" weight="duotone" aria-hidden="true" />
            </button>
            <button class="btn-icon" :aria-label="copied ? 'คัดลอกแล้ว' : 'คัดลอก Prompt'" @click="copyPrompt">
              <PhCopy v-if="!copied" :size="15" weight="bold" aria-hidden="true" />
              <PhCheckCircle v-else :size="15" weight="fill" class="text-qs-success" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Prompt summary / full -->
        <div v-if="!showFullPrompt" class="bg-qs-bg rounded-qs p-4 text-xs text-qs-muted space-y-1.5">
          <p><span class="text-qs-text font-medium">หัวข้อ:</span> {{ topic }}</p>
          <p v-if="topicDetails"><span class="text-qs-text font-medium">รายละเอียด:</span> {{ topicDetails.substring(0, 120) }}{{ topicDetails.length > 120 ? '...' : '' }}</p>
          <p v-if="useSourceFile"><span class="text-qs-text font-medium">โหมด:</span> ใช้ไฟล์แหล่งข้อมูล</p>
          <p><span class="text-qs-text font-medium">จำนวน:</span> {{ numQuestions }} ข้อ · <span class="text-qs-text font-medium">ภาษา:</span> {{ lang === 'thai' ? 'ไทย' : 'English' }} · <span class="text-qs-text font-medium">ความยาก:</span> {{ difficulty }}</p>
          <div class="pt-2 border-t border-qs-border text-center">กด "ดูเต็ม" เพื่อดู Prompt ทั้งหมด หรือ "Copy" เพื่อใช้งานเลย</div>
        </div>
        <pre v-else class="bg-qs-bg rounded-qs p-4 text-xs text-qs-muted overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">{{ generatedPrompt }}</pre>

        <!-- Reminder: upload file to AI before sending -->
        <div v-if="useSourceFile" class="mt-3 p-3 rounded-qs bg-qs-primary/10 border border-qs-primary/40 text-xs text-qs-text space-y-1">
          <p class="font-semibold">📁 Prompt นี้ตั้งค่าให้ใช้ไฟล์แหล่งข้อมูล</p>
          <p class="text-qs-muted">อย่าลืม: <strong class="text-qs-warning">อัปโหลดหรือแนบไฟล์ใน AI ก่อน</strong> แล้วค่อยวาง Prompt — AI จะอ่านไฟล์และสร้างข้อสอบจากเนื้อหานั้นโดยตรง</p>
        </div>
      </div>

      <!-- AI Links -->
      <div class="card p-5">
        <p class="text-sm font-medium text-qs-text mb-3">วาง Prompt ใน AI ที่ต้องการ:</p>
        <div class="flex flex-wrap gap-3">
          <a
            v-for="ai in aiLinks" :key="ai.name"
            :href="ai.url" target="_blank" rel="noopener noreferrer"
            class="btn-ghost text-xs px-4 py-2 gap-2"
          >
            {{ ai.icon }} {{ ai.name }}
            <PhArrowSquareOut :size="13" weight="bold" aria-hidden="true" />
          </a>
        </div>
        <p class="text-xs text-qs-muted mt-3">1. Copy Prompt → 2. เปิด AI → 3. วาง → 4. รับ JSON กลับมา</p>
      </div>

      <!-- JSON Import -->
      <div class="card p-6">
        <h3 class="font-bold text-qs-text mb-4">📥 วาง JSON ที่ได้จาก AI</h3>
        <div v-if="importError" class="mb-4 p-3 rounded-qs bg-red-900/20 border border-qs-danger/40 text-qs-danger text-sm flex items-start gap-2">
          <PhXCircle :size="16" weight="fill" class="flex-shrink-0 mt-0.5" aria-hidden="true" />
          {{ importError }}
        </div>
        <textarea
          v-model="jsonInput"
          rows="8"
          placeholder='วาง JSON array ที่ได้จาก AI ที่นี่...'
          class="input font-mono text-xs resize-y"
          @input="importError = ''"
        ></textarea>
        <div class="flex gap-3 mt-4">
          <button class="btn-ghost flex-shrink-0 gap-1" @click="currentStep = 0">
            <PhArrowLeft :size="14" weight="bold" aria-hidden="true" />
            แก้ไข
          </button>
          <button class="btn-primary flex-1 py-3 gap-2" :disabled="!jsonInput.trim()" @click="parseAndPreview">
            <PhMagnifyingGlass :size="16" weight="bold" aria-hidden="true" />
            ตรวจสอบ JSON
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Step 2: Preview ────────────────────────── -->
    <div v-if="currentStep === 2" class="space-y-6 animate-slide-up">
      <div class="card p-6">
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 class="font-bold text-qs-text mb-1">✅ JSON ถูกต้อง — พร้อม Import</h3>
            <p class="text-qs-muted text-sm">{{ parsedQuestions.length }} ข้อ · {{ stageCount }} ด่าน · คำอธิบาย{{ explanationLength === 'short' ? 'สั้น' : 'ละเอียด' }}</p>
          </div>
          <div class="flex gap-2 flex-shrink-0 flex-wrap justify-end">
            <span
              v-for="(count, diff) in difficultyCount" :key="diff"
              :class="{
                'badge-easy':   diff === 'easy',
                'badge-normal': diff === 'normal',
                'badge-hard':   diff === 'hard',
              }"
            >{{ diff }}: {{ count }}</span>
          </div>
        </div>

        <div>
          <label class="input-label" for="gen-title">ชื่อชุดข้อสอบ <span class="text-qs-danger">*</span></label>
          <input
            id="gen-title"
            v-model="setTitle" type="text"
            placeholder="เช่น: ประวัติศาสตร์ไทย 20 ข้อ"
            maxlength="60"
            class="input"
          />
        </div>
      </div>

      <!-- Question Preview -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-qs-text">ตัวอย่างข้อสอบ (3 ข้อแรก)</h3>
          <div class="flex gap-3 items-center">
            <button
              class="text-xs px-3 py-1.5 rounded-qs transition-colors flex items-center gap-1.5"
              :class="showAnswers
                ? 'bg-qs-danger/20 text-qs-danger border border-qs-danger/30'
                : 'bg-qs-success/20 text-qs-success border border-qs-success/30'"
              @click="showAnswers = !showAnswers"
            >
              <PhEyeSlash v-if="showAnswers" :size="13" weight="duotone" aria-hidden="true" />
              <PhEye      v-else             :size="13" weight="duotone" aria-hidden="true" />
              {{ showAnswers ? 'ซ่อนเฉลย' : 'แสดงเฉลย' }}
            </button>
            <button class="text-xs text-qs-primary hover:underline" @click="showAllPreview = !showAllPreview">
              {{ showAllPreview ? 'ย่อลง' : `ดูทั้งหมด ${parsedQuestions.length} ข้อ` }}
            </button>
          </div>
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
                v-for="(opt, oi) in q.options" :key="oi"
                class="text-xs px-3 py-2 rounded-[8px] border transition-colors"
                :class="showAnswers && oi === q.correct_index
                  ? 'bg-green-900/20 border-qs-success text-qs-success'
                  : 'bg-qs-bg border-qs-border text-qs-muted'"
              ><span class="font-bold mr-1">{{ ['A','B','C','D'][oi] }}.</span>{{ opt }}</div>
            </div>
            <p v-if="showAnswers && q.explanation" class="text-xs mt-2 pl-1 leading-relaxed"
              :class="explanationLength === 'long'
                ? 'text-qs-text bg-qs-surface/60 rounded-qs p-2 border-l-2 border-qs-primary'
                : 'text-qs-muted'"
            >{{ explanationLength === 'long' ? '📖 ' : '💡 ' }}{{ q.explanation }}</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button class="btn-ghost gap-1" @click="currentStep = 1">
          <PhArrowLeft :size="14" weight="bold" aria-hidden="true" />
          แก้ไข JSON
        </button>
        <button
          class="btn-gold flex-1 py-3 text-base gap-2"
          :disabled="!setTitle.trim() || quizStore.loading"
          @click="doImport"
        >
          <span v-if="quizStore.loading" class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" aria-hidden="true"></span>
            กำลัง Import...
          </span>
          <template v-else>
            <PhGameController :size="18" weight="duotone" aria-hidden="true" />
            Import &amp; เล่นเลย!
          </template>
        </button>
      </div>

      <div v-if="importError" class="p-3 rounded-qs bg-red-900/20 border border-qs-danger/40 text-qs-danger text-sm flex items-start gap-2">
        <PhXCircle :size="16" weight="fill" class="flex-shrink-0 mt-0.5" aria-hidden="true" />
        {{ importError }}
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quizStore'
import StepIndicator from '@/components/ui/StepIndicator.vue'
import {
  PhRobot, PhSparkle, PhFolder, PhLightbulb,
  PhArrowRight, PhArrowLeft, PhArrowSquareOut,
  PhEye, PhEyeSlash, PhCopy, PhCheckCircle, PhXCircle,
  PhMagnifyingGlass, PhGameController,
} from '@phosphor-icons/vue'

const router    = useRouter()
const quizStore = useQuizStore()

// ─── State ────────────────────────────────────────────
const topic             = ref('')
const topicDetails      = ref('')
const numQuestions      = ref(20)
const lang              = ref('thai')
const difficulty        = ref('mixed')
const explanationLength = ref('short')
const generatedPrompt   = ref('')
const jsonInput         = ref('')
const setTitle          = ref('')
const copied            = ref(false)
const importError       = ref('')
const currentStep       = ref(0)
const showAllPreview    = ref(false)
const showAnswers       = ref(false)
const parsedQuestions   = ref([])
const showFullPrompt    = ref(false)

// Source file (optional)
const useSourceFile = ref(false)

// ─── Static ───────────────────────────────────────────
const steps = ['ตั้งค่า', 'Copy Prompt', 'Preview & Import']

const aiLinks = [
  { name: 'ChatGPT', icon: '🤖', url: 'https://chat.openai.com' },
  { name: 'Claude',  icon: '✦',  url: 'https://claude.ai' },
  { name: 'Gemini',  icon: '♊',  url: 'https://gemini.google.com' },
]

const aiWithFileSupport = [
  {
    name: 'ChatGPT',
    icon: '🤖',
    note: 'รองรับ PDF, Word, Excel, TXT, รูปภาพ ผ่านไอคอน 📎 — ต้องใช้ GPT-4o ขึ้นไป',
  },
  {
    name: 'Claude',
    icon: '✦',
    note: 'รองรับ PDF, Word, TXT, รูปภาพ, หลายไฟล์พร้อมกัน — รองรับ context ยาวมาก',
  },
  {
    name: 'Gemini',
    icon: '♊',
    note: 'รองรับ PDF, ไฟล์ Google Drive, รูปภาพ — เชื่อม Google Workspace ได้โดยตรง',
  },
]

// ─── Computed ─────────────────────────────────────────
const questionCountHint = computed(() => {
  const n = numQuestions.value
  const isLong = explanationLength.value === 'long'
  if (!n || n < 1) return { text: 'กรุณาระบุจำนวนข้อ', color: 'text-qs-muted' }
  if (n <= 10)  return { text: '✅ ปลอดภัยทุก AI รวมถึง free tier', color: 'text-qs-success' }
  if (n <= 15)  return { text: '✅ เหมาะสำหรับ AI ฟรี', color: 'text-qs-success' }
  if (n <= 20)  return { text: isLong ? '⚠️ 20 ข้อ + คำอธิบายยาว อาจหนักสำหรับ AI ฟรี' : '⭐ จำนวนที่เหมาะที่สุด — สมดุล token/เนื้อหา', color: isLong ? 'text-qs-warning' : 'text-qs-primary' }
  if (n <= 25)  return { text: isLong ? '🔴 เสี่ยงสร้างไม่เสร็จใน AI ฟรี' : '⚠️ แนะนำ AI Pro หรือคำอธิบายสั้น', color: 'text-qs-warning' }
  if (n <= 30)  return { text: isLong ? '🔴 เสี่ยงสูง AI ตัด output กลางคัน' : '⚠️ AI Pro เท่านั้น', color: 'text-qs-warning' }
  return { text: '🔴 ต้องใช้ AI Pro + คำอธิบายสั้น', color: 'text-qs-danger' }
})

const difficultyCount = computed(() => {
  const counts = { easy: 0, normal: 0, hard: 0 }
  parsedQuestions.value.forEach(q => { const d = q.difficulty ?? 'normal'; if (d in counts) counts[d]++ })
  return Object.fromEntries(Object.entries(counts).filter(([, v]) => v > 0))
})

const stageCount = computed(() => {
  const perStage = Math.max(1, Math.ceil(parsedQuestions.value.length / 5))
  const stages = new Set()
  parsedQuestions.value.forEach((_, i) => stages.add(Math.min(5, Math.floor(i / perStage) + 1)))
  return stages.size
})

// ─── Helpers ──────────────────────────────────────────
function clampNumQuestions() {
  const v = numQuestions.value
  if (!v || v < 1) numQuestions.value = 1
  if (v > 100) numQuestions.value = 100
}

function getDifficultyDist() {
  const n = numQuestions.value
  if (difficulty.value === 'mixed') {
    const easy = Math.floor(n * 0.4), hard = Math.floor(n * 0.2)
    return `${easy} easy, ${n - easy - hard} normal, ${hard} hard`
  }
  return `${n} ${difficulty.value}`
}

function buildPrompt(contentSection) {
  const langNote = lang.value === 'thai'
    ? 'IMPORTANT: Generate ALL questions, options, and explanations in Thai language ONLY.'
    : 'Generate all questions, options, and explanations in English ONLY.'
  const explanationRule = explanationLength.value === 'short'
    ? 'Each question must include a SHORT explanation (1 sentence only, max 20 words). Be concise.'
    : 'Each question must include a DETAILED explanation (2-4 sentences). Explain WHY the answer is correct with context.'
  const exampleExplanation = explanationLength.value === 'short'
    ? 'อธิบาย 1 ประโยคสั้นๆ ว่าทำไมตัวเลือก C ถูกต้อง'
    : 'อธิบาย 2-4 ประโยค ว่าทำไมตัวเลือก C ถูก พร้อมบริบทและเหตุผลให้ผู้อ่านเข้าใจได้เลย'

  return `You are a quiz generator for an educational RPG game called QuizSlayer.
Generate exactly ${numQuestions.value} multiple choice questions based on the content below.

CRITICAL JSON FORMAT RULES (MUST FOLLOW):
1. Return ONLY a valid JSON array starting with [ and ending with ]
2. NO markdown code blocks (no \`\`\`json or \`\`\`)
3. NO explanatory text before or after the JSON
4. Use ONLY straight double quotes " (ASCII 34) - NO curly quotes
5. If you need quotes inside text, use single quotes ' instead
6. All strings must be properly enclosed in double quotes

HTML/CODE TAG RULE (VERY IMPORTANT):
- NEVER use actual angle brackets < > inside JSON string values
- They will be stripped or cause empty strings
- Instead write tags as plain descriptive text:
  * <main> → "main tag" or "แท็ก main"
  * <div> → "div tag" or "แท็ก div"
  * <section> → "section tag"
  * <p> → "p tag" or "paragraph tag"
- For code/programming options, describe them without < >:
  * BAD:  "options": ["<main>", "<section>", "<article>", "<div>"]
  * GOOD: "options": ["แท็ก main", "แท็ก section", "แท็ก article", "แท็ก div"]

QUESTION GENERATION RULES:
- Each question must have exactly 4 options (array with 4 strings)
- CRITICAL: Every option string MUST be non-empty — empty string "" is NOT allowed
- correct_index is 0-based: 0=A, 1=B, 2=C, 3=D
- CRITICAL: Distribute correct_index RANDOMLY (~25% each index)
- AVOID patterns like all answers being 0 or sequential
- Difficulty distribution: ${getDifficultyDist()}
- ${explanationRule}
- ${langNote}

CONTENT QUALITY RULES:
- Questions must be clear, unambiguous, and testable
- Options should be plausible but only one correct
- Avoid "All of the above" or "None of the above"
- Ensure factual accuracy

${contentSection}

REQUIRED JSON FORMAT (HTML tag example — notice plain text options, no angle brackets):
[
  {
    "question": "HTML Semantic tag ใดใช้สำหรับเนื้อหาหลักของหน้าเว็บ?",
    "options": ["แท็ก main", "แท็ก section", "แท็ก article", "แท็ก div"],
    "correct_index": 0,
    "difficulty": "easy",
    "explanation": "แท็ก main ใช้ระบุเนื้อหาหลักของหน้า และควรมีเพียงหนึ่งเดียวต่อ document"
  },
  {
    "question": "คำถามที่ชัดเจน?",
    "options": ["ตัวเลือก A", "ตัวเลือก B", "ตัวเลือก C", "ตัวเลือก D"],
    "correct_index": 2,
    "difficulty": "normal",
    "explanation": "${exampleExplanation}"
  }
]

REMEMBER:
- Output ONLY the JSON array. No extra text or formatting.
- NO angle brackets < > in any string value
- ALL 4 options must be non-empty strings`
}

// ─── Step navigation ──────────────────────────────────
async function goToStep1() {
  if (!topic.value.trim()) return

  let contentSection = `Topic: ${topic.value.trim()}`
  if (topicDetails.value.trim()) {
    contentSection += `\n\nAdditional Details:\n${topicDetails.value.trim()}`
  }

  // ถ้าผู้ใช้ระบุไฟล์แหล่งข้อมูล
  if (useSourceFile.value) {
    contentSection += `\n\n=== SOURCE FILE INSTRUCTION ===
IMPORTANT: The user will attach or upload a file to this conversation.
You MUST base ALL questions exclusively on the content of that attached file.
Do NOT generate questions from general knowledge — use ONLY content from the provided file.
If no file has been attached yet, ask the user to attach the file before proceeding.
=== END SOURCE FILE INSTRUCTION ===`
  }

  generatedPrompt.value = buildPrompt(contentSection)
  setTitle.value = topic.value.trim()
  currentStep.value = 1
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
  let parsed, cleaned = ''

  try {
    cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    // แก้ smart quotes → straight quotes (Gemini)
    cleaned = cleaned.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'")
    // แก้ HTML entities ที่ AI บางตัวอาจส่งมา เช่น &lt;main&gt; → <main>
    cleaned = cleaned.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    parsed = JSON.parse(cleaned)
  } catch (err) {
    const match = err.message.match(/position (\d+)/)
    if (match && cleaned) {
      const pos = parseInt(match[1])
      const ctx = cleaned.substring(Math.max(0, pos - 30), Math.min(cleaned.length, pos + 30))
      importError.value = `JSON ไม่ถูกต้อง — ${err.message}\n\nบริเวณที่ผิด: ...${ctx}...`
    } else {
      importError.value = `JSON ไม่ถูกต้อง — ${err.message}`
    }
    return
  }

  if (!Array.isArray(parsed)) { importError.value = 'ต้องเป็น JSON array (เริ่มด้วย [)'; return }
  if (parsed.length === 0) { importError.value = 'JSON array ว่างเปล่า'; return }

  const errors = []
  parsed.forEach((q, i) => {
    const qText = q.question ?? q.question_text
    if (!qText || typeof qText !== 'string') errors.push(`ข้อ ${i + 1}: ไม่มี field "question"`)
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`ข้อ ${i + 1}: "options" ต้องมี 4 ตัว`)
    } else {
      // ตรวจ options ว่างเปล่า (เกิดจาก AI ใส่ HTML tag แล้วถูก strip)
      const emptyOpts = q.options.filter(o => !o || String(o).trim() === '')
      if (emptyOpts.length > 0) {
        errors.push(`ข้อ ${i + 1}: มีตัวเลือกว่างเปล่า ${emptyOpts.length} ตัว — อาจเกิดจาก AI ใช้ HTML tag (<div> ฯลฯ) ในตัวเลือก ให้สั่ง AI ใหม่โดยใช้ข้อความธรรมดาแทน`)
      }
    }
    if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index > 3) errors.push(`ข้อ ${i + 1}: "correct_index" ต้องเป็น 0-3`)
  })

  if (errors.length > 0) {
    importError.value = errors.slice(0, 3).join(' | ') + (errors.length > 3 ? ` (+${errors.length - 3} ข้ออื่น)` : '')
    return
  }

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
