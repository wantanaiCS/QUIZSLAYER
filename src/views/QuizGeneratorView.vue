<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-qs-text mb-2">🤖 AI Quiz Generator</h1>
      <p class="text-qs-muted">ระบุหัวข้อ หรืออัปโหลดเอกสาร → AI สร้างข้อสอบ → นำไปต่อสู้!</p>
    </div>

    <!-- Mode tabs -->
    <div class="flex gap-2 mb-8 p-1 bg-qs-surface rounded-qs border border-qs-border w-fit mx-auto">
      <button
        v-for="mode in modes"
        :key="mode.key"
        class="px-6 py-2 rounded-[9px] text-sm font-medium transition-all"
        :class="activeMode === mode.key
          ? 'bg-qs-primary text-white shadow-qs'
          : 'text-qs-muted hover:text-qs-text'"
        @click="activeMode = mode.key"
      >
        {{ mode.label }}
      </button>
    </div>

    <!-- Topic Mode -->
    <div v-if="activeMode === 'topic'" class="card p-8 animate-slide-up">
      <h2 class="font-bold text-qs-text mb-6">📝 Topic Mode</h2>

      <div class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-qs-muted mb-2">หัวข้อ / Topic</label>
          <input
            v-model="topic"
            type="text"
            placeholder="เช่น: ประวัติศาสตร์ไทย, Python Programming, Organic Chemistry"
            class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text placeholder-qs-muted focus:outline-none focus:border-qs-primary transition-colors"
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

        <button class="btn-primary w-full py-4" @click="generatePrompt">
          ✨ สร้าง Master Prompt
        </button>
      </div>
    </div>

    <!-- Document Mode -->
    <div v-if="activeMode === 'document'" class="card p-8 animate-slide-up">
      <h2 class="font-bold text-qs-text mb-6">📄 Document Mode</h2>
      <div class="border-2 border-dashed border-qs-border rounded-qs p-12 text-center hover:border-qs-primary transition-colors cursor-pointer">
        <div class="text-4xl mb-4">📁</div>
        <p class="text-qs-muted mb-2">ลาก PDF / TXT มาวาง หรือคลิกเพื่อเลือกไฟล์</p>
        <p class="text-qs-muted text-xs">(Feature coming in Phase 2)</p>
      </div>
    </div>

    <!-- Generated Prompt Output -->
    <div v-if="generatedPrompt" class="mt-8 card p-6 animate-slide-up">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-qs-text">📋 Master Prompt สำหรับ Copy ไปวางใน AI</h3>
        <button class="btn-secondary text-xs px-3 py-1" @click="copyPrompt">
          {{ copied ? '✅ Copied!' : '📋 Copy' }}
        </button>
      </div>
      <pre class="bg-qs-bg rounded-qs p-4 text-xs text-qs-muted overflow-x-auto whitespace-pre-wrap leading-relaxed">{{ generatedPrompt }}</pre>

      <div class="mt-6 p-4 bg-qs-surface rounded-qs border border-qs-border">
        <p class="text-sm font-medium text-qs-text mb-2">วิธีใช้:</p>
        <ol class="text-sm text-qs-muted space-y-1 list-decimal list-inside">
          <li>Copy Prompt ด้านบน</li>
          <li>นำไปวางใน ChatGPT / Claude / Gemini</li>
          <li>รับ JSON array กลับมา</li>
          <li>วางในช่องด้านล่าง แล้วกด Import</li>
        </ol>
      </div>

      <!-- JSON Import -->
      <div class="mt-6">
        <label class="block text-sm font-medium text-qs-muted mb-2">วาง JSON ที่ได้จาก AI ที่นี่</label>
        <textarea
          v-model="jsonInput"
          rows="6"
          placeholder='[{"question": "...", "options": [...], "correct_index": 0, "difficulty": "easy"}]'
          class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text placeholder-qs-muted text-xs font-mono focus:outline-none focus:border-qs-primary transition-colors"
        ></textarea>
        <div class="flex gap-3 mt-3">
          <input
            v-model="setTitle"
            type="text"
            placeholder="ชื่อชุดข้อสอบ..."
            class="flex-1 px-4 py-2 bg-qs-surface border border-qs-border rounded-qs text-qs-text placeholder-qs-muted focus:outline-none focus:border-qs-primary text-sm"
          />
          <button class="btn-gold" @click="importJSON" :disabled="!jsonInput || !setTitle">
            🎮 Import & เล่นเลย
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quizStore'

const router    = useRouter()
const quizStore = useQuizStore()

const activeMode    = ref('topic')
const topic         = ref('')
const numQuestions  = ref(20)
const lang          = ref('thai')
const difficulty    = ref('mixed')
const generatedPrompt = ref('')
const jsonInput     = ref('')
const setTitle      = ref('')
const copied        = ref(false)

const modes = [
  { key: 'topic',    label: '📝 Topic Mode' },
  { key: 'document', label: '📄 Document Mode' },
]

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

function generatePrompt() {
  if (!topic.value.trim()) return
  const langNote = lang.value === 'thai' ? 'Generate questions in Thai language.' : ''
  generatedPrompt.value = `You are a quiz generator for an educational RPG game called QuizSlayer.
Generate exactly ${numQuestions.value} multiple choice questions based on the topic below.

Rules:
- Each question must have exactly 4 options (index 0-3)
- correct_index is 0-based (0=A, 1=B, 2=C, 3=D)
- Distribute difficulty: ${getDifficultyDist()}
- Return ONLY a valid JSON array. No explanation. No markdown. No extra text.
${langNote}

Topic: ${topic.value}

JSON format:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correct_index": 0,
    "difficulty": "easy",
    "explanation": "optional short explanation"
  }
]`
  setTitle.value = topic.value
}

async function copyPrompt() {
  await navigator.clipboard.writeText(generatedPrompt.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function importJSON() {
  try {
    const questions = JSON.parse(jsonInput.value)
    const result = await quizStore.importFromJSON(setTitle.value, questions)
    if (result) {
      router.push({ name: 'battle' })
    }
  } catch (e) {
    alert('JSON ไม่ถูกต้อง กรุณาตรวจสอบรูปแบบ')
  }
}
</script>
