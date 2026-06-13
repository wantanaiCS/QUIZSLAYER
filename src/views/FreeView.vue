<template>
  <div class="free-page max-w-2xl mx-auto px-4 py-6">

    <!-- Header -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-qs-card border border-green-500/30 text-green-400 text-xs font-semibold mb-4">
        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
        Free Mode — ไม่มี Game Over
      </div>
      <h1 class="text-2xl font-bold text-qs-text mb-1">📖 Free Practice</h1>
      <p class="text-qs-muted text-sm">ทำโจทย์สบาย ๆ ไม่มีเวลา ไม่มีพลังชีวิต</p>
    </div>

    <!-- Step 1: เลือกชุดข้อสอบ -->
    <div v-if="step === 'pick'" class="animate-slide-up">
      <div v-if="isLoading" class="space-y-3">
        <div v-for="n in 3" :key="n" class="card p-4 animate-pulse">
          <div class="h-4 bg-qs-border rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-qs-border rounded w-1/4"></div>
        </div>
      </div>

      <div v-else-if="availableSets.length === 0" class="card p-10 text-center">
        <p class="text-qs-muted mb-4">ยังไม่มีชุดข้อสอบ</p>
        <router-link to="/generator" class="btn-primary">✨ สร้างชุดข้อสอบ</router-link>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="set in availableSets"
          :key="set.id"
          class="card-hover p-4 cursor-pointer flex items-center gap-4"
          :class="{ 'border-qs-primary shadow-qs': selectedSet?.id === set.id }"
          @click="selectedSet = set"
        >
          <div class="flex-1 min-w-0">
            <div class="font-bold text-qs-text truncate">{{ set.title }}</div>
            <div class="text-qs-muted text-xs mt-0.5">{{ set.questions?.[0]?.count ?? 0 }} ข้อ</div>
          </div>
          <div v-if="selectedSet?.id === set.id" class="text-qs-primary text-lg flex-shrink-0">✓</div>
        </div>
      </div>

      <div class="mt-6">
        <button
          class="btn-primary w-full"
          :disabled="!selectedSet || isLoading"
          @click="startFree"
        >
          <span v-if="isLoading" class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            กำลังโหลด...
          </span>
          <span v-else>📖 เริ่มทำโจทย์</span>
        </button>
      </div>
    </div>

    <!-- Step 2: ทำโจทย์ -->
    <div v-else-if="step === 'quiz'" class="animate-fade-in">

      <!-- Progress bar -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-xs text-qs-muted">ข้อที่ {{ currentIndex + 1 }} / {{ questions.length }}</span>
          <span class="text-xs font-bold" :class="scoreColor">
            ✅ {{ correctCount }} / {{ answeredCount }}
          </span>
        </div>
        <div class="w-full h-2 bg-qs-bg rounded-full overflow-hidden border border-qs-border">
          <div
            class="h-full rounded-full bg-qs-primary transition-all duration-500"
            :style="{ width: progressPct + '%' }"
          ></div>
        </div>
      </div>

      <!-- Question card -->
      <div class="card p-5 mb-4">
        <p class="text-xs font-pixel text-qs-accent mb-3">
          {{ currentIndex + 1 }}/{{ questions.length }}
        </p>
        <p class="font-bold text-qs-text text-base leading-relaxed mb-5">
          {{ currentQ?.question_text }}
        </p>

        <!-- Options -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            v-for="(opt, idx) in currentQ?.options ?? []"
            :key="idx"
            class="answer-option flex items-start gap-3 !px-4 !py-3 text-left"
            :class="optionClass(idx)"
            :disabled="answered"
            @click="submitAnswer(idx)"
          >
            <span class="font-bold text-qs-muted/60 text-sm flex-shrink-0 mt-0.5">
              {{ ['A','B','C','D'][idx] }}
            </span>
            <span class="text-sm leading-snug">{{ opt }}</span>
          </button>
        </div>

        <!-- Explanation -->
        <Transition name="slide-down">
          <div v-if="answered" class="mt-4 p-3 rounded-qs border text-sm"
            :class="isCorrect
              ? 'border-qs-success/40 bg-green-900/10 text-qs-success'
              : 'border-qs-danger/40 bg-red-900/10'"
          >
            <div class="font-bold mb-1">
              {{ isCorrect ? '✅ ถูกต้อง!' : `❌ ผิด — คำตอบที่ถูก: ${currentQ?.options?.[currentQ?.correct_index]}` }}
            </div>
            <div v-if="currentQ?.explanation" class="text-qs-muted text-xs">
              💡 {{ currentQ.explanation }}
            </div>
          </div>
        </Transition>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button class="btn-secondary flex-1 text-sm" @click="reset">
          ← กลับ
        </button>
        <button
          v-if="answered && !isLast"
          class="btn-primary flex-1 text-sm"
          @click="nextQuestion"
        >
          ถัดไป →
        </button>
        <button
          v-else-if="answered && isLast"
          class="btn-gold flex-1 text-sm"
          @click="step = 'result'"
        >
          🏁 ดูผลลัพธ์
        </button>
      </div>
    </div>

    <!-- Step 3: ผลลัพธ์ -->
    <div v-else-if="step === 'result'" class="animate-slide-up">
      <div class="card p-6 text-center mb-4">
        <div class="text-5xl mb-3">{{ resultEmoji }}</div>
        <h2 class="text-xl font-bold text-qs-text mb-1">{{ resultTitle }}</h2>
        <p class="text-qs-muted text-sm mb-5">{{ resultCaption }}</p>

        <div class="grid grid-cols-3 gap-3 mb-5">
          <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
            <div class="text-xl font-bold text-qs-success">{{ correctCount }}</div>
            <div class="text-[11px] text-qs-muted">ตอบถูก</div>
          </div>
          <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
            <div class="text-xl font-bold text-qs-danger">{{ questions.length - correctCount }}</div>
            <div class="text-[11px] text-qs-muted">ตอบผิด</div>
          </div>
          <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
            <div class="text-xl font-bold text-qs-accent">{{ scorePct }}%</div>
            <div class="text-[11px] text-qs-muted">คะแนน</div>
          </div>
        </div>

        <div class="flex gap-3">
          <button class="btn-secondary flex-1 text-sm" @click="reset">เลือกชุดใหม่</button>
          <button class="btn-primary flex-1 text-sm" @click="restartSameSet">เล่นซ้ำ</button>
        </div>
      </div>

      <!-- Answer review -->
      <div class="card p-4">
        <div class="font-bold text-qs-text mb-3 text-sm">สรุปคำตอบ</div>
        <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="(log, i) in answerLog"
            :key="i"
            class="rounded-qs border p-3 text-sm"
            :class="log.correct ? 'border-qs-success/30 bg-green-900/8' : 'border-qs-danger/30 bg-red-900/8'"
          >
            <div class="flex items-start gap-2">
              <span class="flex-shrink-0 font-bold" :class="log.correct ? 'text-qs-success' : 'text-qs-danger'">
                {{ log.correct ? '✅' : '❌' }}
              </span>
              <div class="min-w-0">
                <p class="text-qs-text leading-snug">{{ i + 1 }}. {{ log.question }}</p>
                <p v-if="!log.correct" class="text-xs text-qs-muted mt-1">
                  ตอบ: {{ log.chosen }} <span class="text-qs-success ml-2">เฉลย: {{ log.correct_answer }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useAuthStore } from '@/stores/authStore'

const quizStore = useQuizStore()
const authStore = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const step        = ref('pick')   // 'pick' | 'quiz' | 'result'
const selectedSet = ref(null)
const isLoading   = ref(false)
const questions   = ref([])       // shuffled flat array
const currentIndex = ref(0)
const answered     = ref(false)
const selectedIdx  = ref(null)
const correctCount = ref(0)
const answeredCount = ref(0)
const answerLog    = ref([])

// ── Computed ───────────────────────────────────────────────────────────────
const availableSets = computed(() => {
  const userId = authStore.user?.id
  const seen = new Set()
  return quizStore.quizSets.filter(s => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return s.is_public || s.author_id === userId
  })
})

const currentQ   = computed(() => questions.value[currentIndex.value] ?? null)
const isLast     = computed(() => currentIndex.value >= questions.value.length - 1)
const isCorrect  = computed(() => selectedIdx.value === currentQ.value?.correct_index)
const progressPct = computed(() => questions.value.length
  ? Math.round((answeredCount.value / questions.value.length) * 100)
  : 0
)
const scoreColor = computed(() => {
  if (!answeredCount.value) return 'text-qs-muted'
  const r = correctCount.value / answeredCount.value
  if (r >= 0.8) return 'text-qs-success'
  if (r >= 0.5) return 'text-qs-accent'
  return 'text-qs-danger'
})
const scorePct = computed(() =>
  questions.value.length
    ? Math.round((correctCount.value / questions.value.length) * 100)
    : 0
)
const resultEmoji = computed(() => {
  const p = scorePct.value
  if (p >= 90) return '🏆'
  if (p >= 70) return '🎉'
  if (p >= 50) return '👍'
  return '📚'
})
const resultTitle = computed(() => {
  const p = scorePct.value
  if (p >= 90) return 'ยอดเยี่ยม!'
  if (p >= 70) return 'เก่งมาก!'
  if (p >= 50) return 'พอใช้ได้'
  return 'ลองใหม่อีกครั้งนะ'
})
const resultCaption = computed(() =>
  `ตอบถูก ${correctCount.value} จาก ${questions.value.length} ข้อ`
)

// ── Helpers ────────────────────────────────────────────────────────────────
function optionClass(idx) {
  if (!answered.value) return ''
  if (idx === currentQ.value.correct_index) return 'correct'
  if (idx === selectedIdx.value) return 'wrong'
  return 'opacity-40'
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Actions ────────────────────────────────────────────────────────────────
async function startFree() {
  if (!selectedSet.value) return
  isLoading.value = true
  const fullSet = await quizStore.loadQuizSet(selectedSet.value.id)
  isLoading.value = false
  if (!fullSet?.questions?.length) return

  questions.value  = shuffle(fullSet.questions)
  currentIndex.value = 0
  answered.value     = false
  selectedIdx.value  = null
  correctCount.value = 0
  answeredCount.value = 0
  answerLog.value    = []
  step.value = 'quiz'
}

function submitAnswer(idx) {
  if (answered.value) return
  selectedIdx.value = idx
  answered.value = true
  answeredCount.value++

  const q = currentQ.value
  const correct = idx === q.correct_index
  if (correct) correctCount.value++

  answerLog.value.push({
    question:       q.question_text,
    chosen:         q.options?.[idx] ?? '-',
    correct_answer: q.options?.[q.correct_index] ?? '-',
    correct,
  })
}

function nextQuestion() {
  currentIndex.value++
  answered.value    = false
  selectedIdx.value = null
}

function reset() {
  step.value        = 'pick'
  selectedSet.value = null
  questions.value   = []
  currentIndex.value = 0
  answered.value    = false
  selectedIdx.value = null
  correctCount.value = 0
  answeredCount.value = 0
  answerLog.value   = []
}

function restartSameSet() {
  const set = selectedSet.value
  reset()
  selectedSet.value = set
  startFree()
}

// ── Init ───────────────────────────────────────────────────────────────────
onMounted(async () => {
  isLoading.value = true
  await quizStore.fetchPublicSets()
  await quizStore.fetchMySets()
  isLoading.value = false
})
</script>

<style scoped>
.slide-down-enter-active { transition: all 0.3s ease; }
.slide-down-enter-from   { opacity: 0; transform: translateY(-8px); }
</style>
