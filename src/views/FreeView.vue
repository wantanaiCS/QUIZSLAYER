<template>
  <div class="free-page max-w-2xl mx-auto px-4 py-6 relative z-10">

    <!-- Confirm Dialog (ใช้ ConfirmDialog component แทน inline overlay) -->
    <ConfirmDialog
      v-model="showConfirm"
      title="ออกจากการทำข้อสอบ?"
      message="ความคืบหน้าและเวลาที่สะสมจะหายไปทั้งหมด"
      confirm="ออกเลย"
      cancel="ทำต่อ"
      :danger="true"
      @confirm="confirmReset"
      @cancel="showConfirm = false"
    />

    <!-- Header -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-qs-card border border-green-500/30 text-green-400 text-xs font-semibold mb-4">
        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true"></span>
        Free Mode — ไม่มี Game Over
      </div>
      <h1 class="text-2xl font-bold text-qs-text mb-1 flex items-center justify-center gap-2">
        <PhBooks :size="24" weight="duotone" class="text-qs-primary" aria-hidden="true" />
        Free Practice
      </h1>
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
        <router-link to="/generator" class="btn-primary gap-2">
          <PhSparkle :size="16" weight="duotone" aria-hidden="true" />
          สร้างชุดข้อสอบ
        </router-link>
      </div>

      <div v-else>
        <!-- Search box -->
        <div class="input-group mb-3">
          <PhMagnifyingGlass :size="14" class="input-icon" aria-hidden="true" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาชุดข้อสอบ..."
            class="input pl-9 text-sm"
          />
        </div>

        <!-- Set list -->
        <div class="space-y-2">
          <div
            v-for="set in filteredSets"
            :key="set.id"
            class="card-hover p-4 cursor-pointer flex items-center gap-4"
            :class="{ 'border-qs-primary shadow-qs': selectedSet?.id === set.id }"
            @click="selectedSet = set"
          >
            <div class="flex-1 min-w-0">
              <div class="font-bold text-qs-text truncate mb-1">{{ set.title }}</div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-qs-muted text-xs">{{ set.questions?.[0]?.count ?? 0 }} ข้อ</span>
                <!-- Difficulty badges -->
                <span v-for="(cnt, diff) in setDifficultyMap[set.id]" :key="diff"
                  class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  :class="{
                    'bg-green-900/30 text-qs-success': diff === 'easy',
                    'bg-yellow-900/30 text-qs-warning': diff === 'normal',
                    'bg-red-900/30 text-qs-danger': diff === 'hard',
                  }"
                >{{ diff }} {{ cnt }}</span>
                <!-- Last score -->
                <span v-if="lastScoreMap[set.id] != null"
                  class="text-[10px] text-qs-accent font-semibold">
                  ครั้งล่าสุด {{ lastScoreMap[set.id] }}%
                </span>
              </div>
            </div>
            <div v-if="selectedSet?.id === set.id" class="flex-shrink-0">
              <PhCheckCircle :size="18" weight="fill" class="text-qs-primary" aria-hidden="true" />
            </div>
          </div>
          <p v-if="filteredSets.length === 0" class="text-center text-qs-muted text-sm py-6">ไม่พบชุดข้อสอบที่ค้นหา</p>
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
          <span v-else class="inline-flex items-center gap-1.5">
            <PhBooks :size="15" weight="duotone" aria-hidden="true" />
            เริ่มทำโจทย์
          </span>
        </button>
      </div>
    </div>

    <!-- Step 2: ทำโจทย์ -->
    <div v-else-if="step === 'quiz'" class="animate-fade-in">

      <!-- Progress bar + Timer -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1.5">
          <div class="flex items-center gap-2">
            <span class="text-xs text-qs-muted">ข้อที่ {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <!-- Review round badge -->
            <span v-if="isReviewRound" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-qs-warning/20 border border-qs-warning/40 text-qs-warning">
              <PhArrowsClockwise :size="10" weight="bold" aria-hidden="true" />
              รอบทบทวน {{ skippedQueue.length + (answered.value ? 0 : 1) }} ข้อ
            </span>
          </div>
          <div class="flex items-center gap-3">
            <!-- Streak -->
            <Transition name="pop">
              <span v-if="streak >= 2" class="inline-flex items-center gap-1 text-xs font-bold text-orange-400 tabular-nums">
                <PhFlame :size="13" weight="fill" aria-hidden="true" />
                {{ streak }} ต่อ!
              </span>
            </Transition>
            <!-- Timer -->
            <span class="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-qs-accent tabular-nums">
              <PhTimer :size="13" weight="duotone" aria-hidden="true" />
              {{ elapsedFormatted }}
            </span>
            <span class="inline-flex items-center gap-1 text-xs font-bold" :class="scoreColor">
              <PhCheckCircle :size="13" weight="fill" aria-hidden="true" />
              {{ correctCount }} / {{ answeredCount }}
            </span>
          </div>
        </div>
        <div class="w-full h-2 bg-qs-bg rounded-full overflow-hidden border border-qs-border">
          <div class="h-full rounded-full bg-qs-primary transition-all duration-500" :style="{ width: progressPct + '%' }"></div>
        </div>
      </div>

      <!-- Keyboard hint -->
      <p class="text-[10px] text-qs-muted text-right mb-2 select-none">
        กด A/B/C/D เลือกคำตอบ · Space/Enter ถัดไป · S ข้ามข้อ (จะกลับมาทบทวน)
      </p>

      <!-- Question card -->
      <div class="card p-5 mb-4">
        <p class="text-xs font-pixel text-qs-accent mb-3">{{ currentIndex + 1 }}/{{ questions.length }}</p>
        <p class="font-bold text-qs-text text-base leading-relaxed mb-5">{{ currentQ?.question_text }}</p>

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
            <span class="font-bold text-qs-muted/60 text-sm flex-shrink-0 mt-0.5">{{ ['A','B','C','D'][idx] }}</span>
            <span class="text-sm leading-snug">{{ opt }}</span>
          </button>
        </div>

        <!-- Explanation -->
        <Transition name="slide-down">
          <div v-if="answered" class="mt-4 p-3 rounded-qs border text-sm"
            :class="isCorrect ? 'border-qs-success/40 bg-green-900/10 text-qs-success' : 'border-qs-danger/40 bg-red-900/10'"
          >
            <div class="font-bold mb-1 flex items-center gap-1.5">
              <PhCheckCircle v-if="isCorrect"  :size="15" weight="fill" class="text-qs-success" aria-hidden="true" />
              <PhXCircle     v-else             :size="15" weight="fill" class="text-qs-danger"  aria-hidden="true" />
              <span :class="isCorrect ? 'text-qs-success' : 'text-qs-danger'">
                {{ isCorrect ? 'ถูกต้อง!' : `ผิด — คำตอบที่ถูก: ${currentQ?.options?.[currentQ?.correct_index]}` }}
              </span>
            </div>
            <div v-if="currentQ?.explanation" class="text-qs-muted text-xs flex items-start gap-1 mt-1">
              <PhLightbulb :size="12" weight="duotone" class="text-qs-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
              {{ currentQ.explanation }}
            </div>
          </div>
        </Transition>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button class="btn-ghost flex-shrink-0 text-sm gap-1" @click="askConfirmReset">
          <PhArrowLeft :size="14" weight="bold" aria-hidden="true" />
          กลับ
        </button>
        <!-- ยังไม่ตอบ: แสดงปุ่ม Skip (เฉพาะรอบแรก) -->
        <button v-if="!answered && !isReviewRound" class="btn-ghost flex-1 text-sm text-qs-muted gap-1" @click="skipQuestion">
          <PhSkipForward :size="14" weight="bold" aria-hidden="true" />
          ข้ามข้อ (ทบทวนทีหลัง)
        </button>
        <!-- รอบทบทวน: ต้องตอบ ไม่มีปุ่ม skip -->
        <span v-else-if="!answered && isReviewRound" class="flex-1 text-center text-xs text-qs-muted self-center flex items-center justify-center gap-1">
          <PhArrowsClockwise :size="12" weight="bold" aria-hidden="true" />
          รอบทบทวน — กรุณาตอบข้อนี้
        </span>
        <!-- ตอบแล้ว ไม่ใช่ข้อสุดท้าย -->
        <button v-else-if="!isLast" class="btn-primary flex-1 text-sm gap-1" @click="nextQuestion">
          ถัดไป
          <PhArrowRight :size="14" weight="bold" aria-hidden="true" />
        </button>
        <!-- ตอบแล้ว ข้อสุดท้าย -->
        <button v-else class="btn-gold flex-1 text-sm gap-1" @click="finishQuiz">
          <PhFlagCheckered :size="14" weight="bold" aria-hidden="true" />
          ดูผลลัพธ์
        </button>
      </div>
    </div>

    <!-- Step 3: ผลลัพธ์ -->
    <div v-else-if="step === 'result'" class="animate-slide-up">
      <div class="card p-6 text-center mb-4">
        <!-- Result icon (Phosphor แทน emoji) -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-full flex items-center justify-center" :class="resultIconBg">
            <component :is="resultIcon" :size="36" weight="duotone" :class="resultIconColor" aria-hidden="true" />
          </div>
        </div>
        <h2 class="text-xl font-bold text-qs-text mb-1">{{ resultTitle }}</h2>
        <p class="text-qs-muted text-sm mb-5">{{ resultCaption }}</p>

        <!-- Stats grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
            <div class="text-xl font-bold text-qs-success">{{ correctCount }}</div>
            <div class="text-[11px] text-qs-muted">ตอบถูก</div>
          </div>
          <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
            <div class="text-xl font-bold text-qs-danger">{{ wrongCount }}</div>
            <div class="text-[11px] text-qs-muted">ตอบผิด</div>
          </div>
          <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
            <div class="text-xl font-bold text-qs-accent">{{ scorePct }}%</div>
            <div class="text-[11px] text-qs-muted">คะแนน</div>
          </div>
          <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
            <div class="text-xl font-bold text-qs-accent font-mono tabular-nums">{{ elapsedFormatted }}</div>
            <div class="text-[11px] text-qs-muted">เวลารวม</div>
          </div>
        </div>

        <!-- เฉลี่ย/ข้อ -->
        <p v-if="answeredCount > 0" class="text-xs text-qs-muted mb-5 flex flex-wrap items-center justify-center gap-3">
          <span class="inline-flex items-center gap-1">
            <PhLightning :size="12" weight="fill" class="text-qs-accent" aria-hidden="true" />
            เฉลี่ย <span class="text-qs-text font-semibold ml-1">{{ avgSecPerQ }} วิ/ข้อ</span>
          </span>
          <span v-if="skippedCount > 0" class="inline-flex items-center gap-1">
            <PhSkipForward :size="12" weight="bold" class="text-qs-muted" aria-hidden="true" />
            ข้าม <span class="text-qs-text font-semibold mx-1">{{ skippedCount }}</span> ข้อ
          </span>
        </p>

        <div class="flex gap-3">
          <button class="btn-ghost flex-1 text-sm" @click="reset">เลือกชุดใหม่</button>
          <button class="btn-primary flex-1 text-sm gap-1" @click="restartSameSet">
            <PhArrowsClockwise :size="14" weight="bold" aria-hidden="true" />
            เล่นซ้ำ
          </button>
        </div>
      </div>

      <!-- Answer review -->
      <div class="card p-4">
        <div class="font-bold text-qs-text mb-3 text-sm">สรุปคำตอบ</div>
        <div class="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          <div
            v-for="(log, i) in answerLog"
            :key="i"
            class="rounded-qs border p-3 text-sm"
            :class="{
              'border-qs-success/30 bg-green-900/8': log.correct,
              'border-qs-danger/30 bg-red-900/8': !log.correct && !log.skipped,
              'border-qs-border bg-qs-surface/40': log.skipped,
            }"
          >
            <div class="flex items-start gap-2">
              <!-- Result icon per log entry -->
              <PhCheckCircle v-if="log.correct"   :size="15" weight="fill" class="text-qs-success flex-shrink-0 mt-0.5" aria-hidden="true" />
              <PhSkipForward v-else-if="log.skipped" :size="15" weight="bold" class="text-qs-muted flex-shrink-0 mt-0.5" aria-hidden="true" />
              <PhXCircle     v-else                :size="15" weight="fill" class="text-qs-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div class="min-w-0 w-full">
                <p class="text-qs-text leading-snug">{{ i + 1 }}. {{ log.question }}
                  <span v-if="log.reviewRound" class="ml-1 inline-flex items-center gap-0.5 text-[10px] text-qs-warning font-semibold">
                    <PhArrowsClockwise :size="9" weight="bold" aria-hidden="true" />
                    ทบทวน
                  </span>
                </p>
                <div v-if="!log.correct && !log.skipped" class="text-xs text-qs-muted mt-1">
                  ตอบ: <span class="font-semibold">{{ log.chosen_label }}. {{ log.chosen }}</span>
                  <span class="text-qs-success ml-3">เฉลย: <span class="font-semibold">{{ log.correct_label }}. {{ log.correct_answer }}</span></span>
                </div>
                <div v-if="log.skipped" class="text-xs text-qs-muted mt-1">
                  ข้ามข้อ — เฉลย: <span class="text-qs-success font-semibold">{{ log.correct_label }}. {{ log.correct_answer }}</span>
                </div>
                <!-- Explanation -->
                <div v-if="log.explanation && !log.correct" class="flex items-start gap-1 text-xs text-qs-muted mt-1.5 pt-1.5 border-t border-qs-border/50">
                  <PhLightbulb :size="12" weight="duotone" class="text-qs-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {{ log.explanation }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useAuthStore } from '@/stores/authStore'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import {
  PhBooks, PhSparkle, PhMagnifyingGlass, PhCheckCircle, PhXCircle,
  PhArrowLeft, PhArrowRight, PhArrowsClockwise, PhSkipForward,
  PhFlagCheckered, PhFlame, PhTimer, PhLightbulb, PhLightning,
  PhTrophy, PhStar, PhThumbsUp,
} from '@phosphor-icons/vue'

const quizStore = useQuizStore()
const authStore = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const step          = ref('pick')   // 'pick' | 'quiz' | 'result'
const selectedSet   = ref(null)
const isLoading     = ref(false)
const questions     = ref([])
const currentIndex  = ref(0)
const answered      = ref(false)
const selectedIdx   = ref(null)
const correctCount  = ref(0)
const answeredCount = ref(0)
const skippedCount  = ref(0)
const answerLog     = ref([])
const streak        = ref(0)
const searchQuery   = ref('')
const showConfirm   = ref(false)

// ข้อที่ข้ามไว้รอทบทวน (เก็บ index ของ question ใน questions array)
const skippedQueue  = ref([])
// กำลังอยู่ในรอบทบทวน
const isReviewRound = ref(false)

// last score per set (stored in memory during session)
const lastScoreMap = ref({})

// ── Timer ──────────────────────────────────────────────────────────────────
const elapsedSeconds = ref(0)
let timerInterval = null

function startTimer() {
  elapsedSeconds.value = 0
  clearInterval(timerInterval)
  timerInterval = setInterval(() => { elapsedSeconds.value++ }, 1000)
}
function stopTimer() {
  clearInterval(timerInterval)
  timerInterval = null
}

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

const filteredSets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return availableSets.value
  return availableSets.value.filter(s => s.title.toLowerCase().includes(q))
})

// difficulty breakdown per set (from cached question counts)
const setDifficultyMap = computed(() => {
  const map = {}
  for (const set of availableSets.value) {
    const qs = set.questions ?? []
    // questions here may be aggregate counts — skip if no difficulty info
    const breakdown = {}
    for (const q of qs) {
      if (q.difficulty) {
        breakdown[q.difficulty] = (breakdown[q.difficulty] ?? 0) + 1
      }
    }
    if (Object.keys(breakdown).length > 0) map[set.id] = breakdown
  }
  return map
})

const currentQ    = computed(() => questions.value[currentIndex.value] ?? null)
// isLast: ถ้าอยู่ใน review round → ดูจาก queue, ถ้าไม่ใช่ → ดูจาก index ปกติ
const isLast      = computed(() => {
  if (isReviewRound.value) return skippedQueue.value.length === 0
  return currentIndex.value >= questions.value.length - 1 && skippedQueue.value.length === 0
})
const isCorrect   = computed(() => selectedIdx.value === currentQ.value?.correct_index)
const progressPct = computed(() =>
  questions.value.length ? Math.round((answeredCount.value / questions.value.length) * 100) : 0
)
const scoreColor = computed(() => {
  if (!answeredCount.value) return 'text-qs-muted'
  const r = correctCount.value / answeredCount.value
  return r >= 0.8 ? 'text-qs-success' : r >= 0.5 ? 'text-qs-accent' : 'text-qs-danger'
})
const scorePct = computed(() =>
  questions.value.length ? Math.round((correctCount.value / questions.value.length) * 100) : 0
)
const wrongCount = computed(() => questions.value.length - correctCount.value - skippedCount.value)
const avgSecPerQ = computed(() => {
  if (!answeredCount.value) return 0
  return Math.round(elapsedSeconds.value / answeredCount.value)
})
const resultIcon = computed(() => {
  const p = scorePct.value
  if (p >= 90) return PhTrophy
  if (p >= 70) return PhStar
  if (p >= 50) return PhThumbsUp
  return PhBooks
})
const resultIconBg = computed(() => {
  const p = scorePct.value
  if (p >= 90) return 'bg-yellow-900/30'
  if (p >= 70) return 'bg-green-900/30'
  if (p >= 50) return 'bg-blue-900/30'
  return 'bg-qs-surface'
})
const resultIconColor = computed(() => {
  const p = scorePct.value
  if (p >= 90) return 'text-qs-gold'
  if (p >= 70) return 'text-qs-success'
  if (p >= 50) return 'text-qs-primary'
  return 'text-qs-muted'
})
const resultTitle = computed(() => {
  const p = scorePct.value
  if (p >= 90) return 'ยอดเยี่ยม!'
  if (p >= 70) return 'เก่งมาก!'
  if (p >= 50) return 'พอใช้ได้'
  return 'ลองใหม่อีกครั้งนะ'
})
const resultCaption = computed(() => `ตอบถูก ${correctCount.value} จาก ${questions.value.length} ข้อ`)
const elapsedFormatted = computed(() => {
  const s = elapsedSeconds.value
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})

// ── Helpers ────────────────────────────────────────────────────────────────
const LABELS = ['A', 'B', 'C', 'D']

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

// ── Confirm helpers ────────────────────────────────────────────────────────
function askConfirmReset() {
  showConfirm.value = true
}
function confirmReset() {
  showConfirm.value = false
  reset()
}

// ── Actions ────────────────────────────────────────────────────────────────
async function startFree() {
  if (!selectedSet.value) return
  isLoading.value = true
  const fullSet = await quizStore.loadQuizSet(selectedSet.value.id)
  isLoading.value = false
  if (!fullSet?.questions?.length) return

  questions.value     = shuffle(fullSet.questions)
  currentIndex.value  = 0
  answered.value      = false
  selectedIdx.value   = null
  correctCount.value  = 0
  answeredCount.value = 0
  skippedCount.value  = 0
  streak.value        = 0
  answerLog.value     = []
  skippedQueue.value  = []
  isReviewRound.value = false
  step.value          = 'quiz'
  startTimer()
}

function submitAnswer(idx) {
  if (answered.value) return
  selectedIdx.value = idx
  answered.value    = true
  answeredCount.value++

  const q       = currentQ.value
  const correct = idx === q.correct_index
  if (correct) {
    correctCount.value++
    streak.value++
  } else {
    streak.value = 0
  }

  // ถ้าอยู่ใน review round ข้อนี้เคยข้ามมาก่อน นับ skippedCount
  if (isReviewRound.value) skippedCount.value++

  answerLog.value.push({
    question:       q.question_text,
    chosen:         q.options?.[idx] ?? '-',
    chosen_label:   LABELS[idx] ?? '-',
    correct_answer: q.options?.[q.correct_index] ?? '-',
    correct_label:  LABELS[q.correct_index] ?? '-',
    explanation:    q.explanation ?? null,
    correct,
    skipped:        false,
    reviewRound:    isReviewRound.value,
  })
}

function skipQuestion() {
  if (answered.value) return
  // เพิ่ม index ปัจจุบันเข้า queue (ไม่นับเป็น skipped ทันที)
  skippedQueue.value.push(currentIndex.value)
  streak.value = 0

  // ถ้ายังมีข้อถัดไปในรอบปกติ
  if (!isReviewRound.value && currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    return
  }

  // จบรอบปกติแล้ว มีข้อที่ข้ามค้างอยู่ → เข้า review round
  if (skippedQueue.value.length > 0) {
    enterReviewRound()
  } else {
    finishQuiz()
  }
}

function enterReviewRound() {
  isReviewRound.value = true
  currentIndex.value  = skippedQueue.value.shift()
  answered.value      = false
  selectedIdx.value   = null
}

function nextQuestion() {
  if (isReviewRound.value) {
    // รอบทบทวน: ไปข้อถัดไปใน queue
    if (skippedQueue.value.length > 0) {
      currentIndex.value = skippedQueue.value.shift()
      answered.value     = false
      selectedIdx.value  = null
    } else {
      finishQuiz()
    }
    return
  }

  // รอบปกติ
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    answered.value    = false
    selectedIdx.value = null
  } else if (skippedQueue.value.length > 0) {
    // จบรอบปกติ มีข้อข้ามรอ → เข้า review round
    enterReviewRound()
  } else {
    finishQuiz()
  }
}

function finishQuiz() {
  stopTimer()
  // save last score for this session
  if (selectedSet.value) {
    lastScoreMap.value[selectedSet.value.id] = scorePct.value
  }
  step.value = 'result'
}

function reset() {
  stopTimer()
  step.value          = 'pick'
  selectedSet.value   = null
  questions.value     = []
  currentIndex.value  = 0
  answered.value      = false
  selectedIdx.value   = null
  correctCount.value  = 0
  answeredCount.value = 0
  skippedCount.value  = 0
  streak.value        = 0
  answerLog.value     = []
  skippedQueue.value  = []
  isReviewRound.value = false
  elapsedSeconds.value = 0
}

function restartSameSet() {
  const set = selectedSet.value
  reset()
  selectedSet.value = set
  startFree()
}

// ── Keyboard shortcuts ─────────────────────────────────────────────────────
function handleKeydown(e) {
  // ไม่ทำงานถ้ากำลัง type ใน input
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
  if (step.value !== 'quiz') return

  const key = e.key.toLowerCase()

  // A/B/C/D — เลือกคำตอบ
  if (!answered.value) {
    const map = { a: 0, b: 1, c: 2, d: 3 }
    if (key in map) {
      const idx = map[key]
      const opts = currentQ.value?.options ?? []
      if (idx < opts.length) submitAnswer(idx)
      return
    }
    // S — skip (ใช้ได้เฉพาะรอบแรก ไม่ใช่รอบทบทวน)
    if (key === 's' && !isReviewRound.value) {
      skipQuestion()
      return
    }
  }

  // Space / Enter — ถัดไป หรือ ดูผลลัพธ์
  if (answered.value && (key === ' ' || key === 'enter')) {
    e.preventDefault()
    if (isLast.value) finishQuiz()
    else nextQuestion()
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
onMounted(async () => {
  isLoading.value = true
  await quizStore.fetchPublicSets()
  await quizStore.fetchMySets()
  isLoading.value = false
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  stopTimer()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.slide-down-enter-active { transition: all 0.3s ease; }
.slide-down-enter-from   { opacity: 0; transform: translateY(-8px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.pop-enter-active  { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-enter-from    { opacity: 0; transform: scale(0.6); }
.pop-leave-active  { transition: opacity 0.2s ease; }
.pop-leave-to      { opacity: 0; }

.btn-danger {
  @apply px-4 py-2 rounded-qs font-semibold text-sm bg-qs-danger/20 border border-qs-danger text-qs-danger
         hover:bg-qs-danger hover:text-white transition-all;
}
</style>
