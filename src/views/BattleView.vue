<template>
  <div class="battle-page max-w-6xl mx-auto px-4 py-6 md:py-12 relative z-10" :class="{ 'is-playing': step === 3 }">

    <!-- Step header + indicator -->
    <div v-if="step < 3" class="text-center mb-10">
      <div class="page-header-title">
        <GameIcon name="sword" :size="24" class="text-qs-primary" />
        <h1 class="page-title">BATTLE ARENA</h1>
      </div>
      <p class="page-description">เลือกชุดข้อสอบและโหมดความยาก แล้วลงสนาม!</p>
      <div class="mt-6">
        <StepIndicator :steps="['เลือกชุดข้อสอบ','เลือกความยาก','ต่อสู้!']" :current="step - 1" />
      </div>
    </div>

    <!-- Step 1: Select Quiz Set -->
    <div v-if="step === 1" class="animate-slide-up">

      <!-- Loading skeleton -->
      <div v-if="isLoadingSets" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="n in 3" :key="n" class="card p-5 animate-pulse">
          <div class="h-4 bg-qs-border rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-qs-border rounded w-1/4"></div>
        </div>
      </div>
      <div v-else-if="availableSets.length === 0" class="card p-12 text-center">
        <PhBooks :size="40" weight="duotone" class="mx-auto mb-4 text-qs-border" aria-hidden="true" />
        <p class="text-qs-muted mb-6">ยังไม่มีชุดข้อสอบ สร้างชุดแรกก่อนเลย!</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <router-link to="/generator" class="btn-primary gap-2">
            <PhRobot :size="16" weight="duotone" aria-hidden="true" />
            สร้างชุดข้อสอบ
          </router-link>
          <button class="btn-ghost gap-2" @click="reloadSets">
            <PhArrowsClockwise :size="16" weight="bold" aria-hidden="true" />
            โหลดใหม่
          </button>
        </div>
      </div>
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="set in availableSets"
          :key="set.id"
          class="card-quiz"
          :class="{ 'selected border-qs-primary shadow-qs': selectedSet?.id === set.id }"
          @click="selectedSet = set"
        >
          <div class="flex items-start justify-between mb-3 gap-2">
            <h3 class="font-bold text-qs-text leading-snug">{{ set.title }}</h3>
            <span v-if="set.is_public" class="badge-public flex-shrink-0">Public</span>
            <span v-else class="badge-private flex-shrink-0">Private</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-qs-muted">
            <PhListBullets :size="14" weight="bold" aria-hidden="true" />
            {{ set.questions?.[0]?.count ?? 0 }} ข้อ
          </div>
          <!-- Progress fill bar -->
          <div class="mt-3 h-0.5 bg-qs-border rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              style="background: linear-gradient(90deg, #6c63ff, #8b5cf6);"
              :style="{ width: selectedSet?.id === set.id ? '100%' : '0%' }"
            ></div>
          </div>
        </div>
      </div>

      <div class="text-center mt-8">
        <button class="btn-primary px-10 gap-2" :disabled="!selectedSet" @click="step = 2">
          ถัดไป
          <PhArrowRight :size="16" weight="bold" aria-hidden="true" />
        </button>
      </div>

      <!-- 5 Stages info -->
      <div class="mt-14 mb-2">
        <h2 class="section-title">5 STAGES</h2>
        <p class="section-description">แต่ละด่านมีกลไกพิเศษที่ยากขึ้นเรื่อยๆ</p>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div
            v-for="stage in stages"
            :key="stage.id"
            class="card p-4 text-center group hover:border-qs-primary/40 transition-colors duration-200 cursor-default"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 font-pixel text-xs font-bold text-white"
              :style="{ background: stage.gradient }"
              aria-hidden="true"
            >
              {{ stage.id }}
            </div>
            <div class="text-[10px] font-pixel mb-0.5" :class="stage.color">Stage {{ stage.id }}</div>
            <div class="font-bold text-qs-text text-xs mb-1.5">{{ stage.name }}</div>
            <div class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-qs-surface border border-qs-border text-qs-muted">
              {{ stage.mechanic }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Select Difficulty -->
    <div v-if="step === 2" class="animate-slide-up max-w-lg mx-auto">
      <div class="space-y-4 mb-8">
        <div
          v-for="diff in difficulties"
          :key="diff.key"
          class="card-hover p-5 cursor-pointer flex items-center gap-4"
          :class="{ 'border-qs-primary shadow-qs ring-1 ring-qs-primary/30': selectedDiff === diff.key }"
          @click="selectedDiff = diff.key"
        >
          <!-- Difficulty icon -->
          <div class="w-12 h-12 rounded-qs flex items-center justify-center flex-shrink-0 transition-all duration-200"
               :class="[
                 diff.key === 'easy'   ? 'bg-green-900/30 text-qs-success' : '',
                 diff.key === 'normal' ? 'bg-yellow-900/30 text-qs-warning' : '',
                 diff.key === 'hard'   ? 'bg-red-900/30 text-qs-danger' : '',
                 selectedDiff === diff.key ? 'scale-110' : '',
               ]">
            <component :is="diff.icon" :size="24" weight="duotone" aria-hidden="true" />
          </div>
          <div class="flex-1">
            <div class="font-bold text-qs-text mb-1">{{ diff.label }}</div>
            <div class="text-qs-muted text-sm">{{ diff.desc }}</div>
          </div>
          <PhCheckCircle
            v-if="selectedDiff === diff.key"
            :size="20" weight="fill" class="text-qs-primary flex-shrink-0"
            aria-hidden="true"
          />
        </div>
      </div>
      <div class="flex gap-4">
        <button class="btn-ghost flex-1 gap-1" @click="step = 1">
          <PhArrowLeft :size="15" weight="bold" aria-hidden="true" />
          กลับ
        </button>
        <button class="btn-primary flex-1 gap-2" :disabled="!selectedDiff || loadingBattle" @click="startBattle">
          <span v-if="loadingBattle" class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></span>
            กำลังโหลด...
          </span>
          <template v-else>
            <PhSword :size="16" weight="bold" aria-hidden="true" />
            เริ่มต่อสู้!
          </template>
        </button>
      </div>
    </div>

    <!-- Step 3: Battle Screen -->
    <div v-if="step === 3" class="battle-layout animate-fade-in max-w-3xl mx-auto">
      <!-- Top: HP Bars -->
      <div class="flex justify-between items-end mb-2 px-1 gap-2">
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-qs-muted mb-1 truncate">{{ authStore.displayName || 'Hero' }}</div>
          <HPBar :hp="battleStore.playerHP" :maxHp="battleStore.playerMaxHP" isPlayer />
        </div>
        <div class="flex-1 min-w-0 text-right">
          <div class="text-xs font-bold text-qs-danger mb-1 truncate">{{ currentStageInfo?.monster }} <span class="text-qs-muted">(S{{ battleStore.currentStageId }})</span></div>
          <HPBar :hp="battleStore.monsterHP" :maxHp="battleStore.monsterMaxHP" />
        </div>
      </div>

      <!-- Middle: Phaser + Time Bars -->
      <div class="battle-canvas card p-0 overflow-hidden mb-2 relative shadow-qs border-2 border-qs-border bg-qs-surface">
        <div id="phaser-container" class="w-full h-full"></div>
        
        <!-- Hero + Monster Time Bars -->
        <BarTime
          :playerProgress="battleStore.playerBar"
          :monsterProgress="battleStore.monsterBar"
          :streak="battleStore.streak"
          class="absolute bottom-1 left-0 right-0 z-10"
        />
      </div>

      <div class="flex flex-wrap justify-between items-center gap-2 mb-3 px-1">
        <button class="btn-ghost text-xs px-3 py-1.5 flex-shrink-0 gap-1" @click="step = 1; reset()">
          <PhArrowLeft :size="13" weight="bold" aria-hidden="true" />
          หนี
        </button>
        
        <!-- Stage Mechanic Indicators -->
        <div class="flex flex-wrap items-center gap-1.5 text-xs flex-1 justify-center">
          <!-- Stage 3: Danger Zone Indicator -->
          <div v-if="battleStore.currentStageId === 3 && battleStore.inDangerZone"
               class="inline-flex items-center gap-1.5 px-2 py-1 bg-red-900/30 border border-qs-danger rounded-qs text-qs-danger animate-pulse whitespace-nowrap">
            <PhWarning :size="13" weight="duotone" aria-hidden="true" />
            Damage ×2
          </div>

          <!-- Stage 4: Counter Attack Indicator -->
          <div v-if="battleStore.currentStageId === 4"
               class="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-900/30 border border-purple-500 rounded-qs text-purple-300 whitespace-nowrap">
            <PhLightning :size="13" weight="duotone" aria-hidden="true" />
            สวนกลับ 40%
          </div>
          <Transition name="fade-lock">
            <div v-if="battleStore.currentStageId === 4 && battleStore.counterAttackTriggered"
                 class="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-900/60 border border-purple-400 rounded-qs text-purple-200 font-bold animate-pulse whitespace-nowrap">
              <PhLightning :size="13" weight="fill" aria-hidden="true" />
              COUNTER!
            </div>
          </Transition>

          <!-- Stage 5: Boss Mechanic Indicators -->
          <div v-if="battleStore.currentStageId === 5" class="flex items-center gap-1.5 flex-wrap">
            <div class="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-900/30 border border-purple-500 rounded-qs text-purple-300 whitespace-nowrap">
              <PhSkull :size="13" weight="duotone" aria-hidden="true" />
              {{ battleStore.bossStageErrors }}/3
            </div>
            <div class="inline-flex items-center gap-1.5 px-2 py-1 bg-orange-900/30 border border-orange-500 rounded-qs text-orange-300 whitespace-nowrap">
              <PhTimer :size="13" weight="duotone" aria-hidden="true" />
              {{ battleStore.effectiveCooldown }}s
            </div>
          </div>
        </div>
        
        <SkillGauge
          :streak="battleStore.streak"
          :charge="battleStore.skillCharge"
          :gaugePct="battleStore.skillGaugePct"
          :ready="battleStore.skillReady"
          :skillUsed="battleStore.skillUsed"
          :monsterHpPct="battleStore.monsterHPPct"
          @use-skill="handleUseSkill"
        />
      </div>

      <!-- Bottom: Question Card -->
      <QuestionCard 
        :question="currentQuestion"
        :questionNumber="currentQuestionNumber"
        :totalQuestions="totalQuizQuestions"
        :cooldownLeft="battleStore.cooldownLeft"
        :maxCooldown="maxCooldown"
        :disabled="!canAnswer"
        :waitingForBar="!playerBarFull && !battleStore.cooldownActive"
        :heroBarPct="battleStore.playerBar"
        :showResult="showResult"
        :selectedIndex="selectedIndex"
        :hiddenOptions="hiddenOptions"
        @answer="handleAnswer"
      />
      
      <!-- Battle End Overlay -->
      <div v-if="battleStore.phase === 'game_over' || battleStore.phase === 'victory'" 
           class="fixed inset-0 z-50 flex items-center justify-center bg-qs-bg/80 backdrop-blur-sm">
        <div class="card p-6 text-center max-w-2xl w-full mx-4 animate-slide-up max-h-[92vh] overflow-y-auto">
          <!-- Result icon -->
          <div class="mb-4">
            <PhTrophy v-if="battleStore.phase === 'victory'"
              :size="64" weight="duotone" class="text-qs-gold mx-auto animate-bounce-in"
              :style="battleStore.phase === 'victory' ? 'filter: drop-shadow(0 0 20px rgba(244,200,66,0.5))' : ''"
              aria-hidden="true"
            />
            <PhSkull v-else :size="64" weight="duotone" class="text-qs-danger mx-auto animate-fade-in" aria-hidden="true" />
          </div>
          <h2 class="text-2xl font-bold mb-2" :class="battleStore.phase === 'victory' ? 'text-qs-success' : 'text-qs-danger'">
            {{ battleStore.phase === 'victory' ? 'Victory!' : 'Game Over' }}
          </h2>
          <p class="text-qs-muted mb-5 text-sm">{{ endCaption }}</p>

          <!-- Stats grid -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
              <div class="text-lg font-bold text-qs-text">
                <AnimatedCounter :value="battleStore.score" :duration="800" />
              </div>
              <div class="text-[11px] text-qs-muted">คะแนน</div>
            </div>
            <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
              <div class="text-lg font-bold text-qs-success">
                <AnimatedCounter :value="battleStore.totalCorrect" />
              </div>
              <div class="text-[11px] text-qs-muted">ตอบถูก</div>
            </div>
            <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
              <div class="text-lg font-bold text-qs-danger">
                <AnimatedCounter :value="wrongAnswers" />
              </div>
              <div class="text-[11px] text-qs-muted">ตอบผิด</div>
            </div>
            <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
              <div class="text-lg font-bold text-qs-accent">{{ formattedDuration }}</div>
              <div class="text-[11px] text-qs-muted">เวลา</div>
            </div>
            <div class="bg-qs-surface border border-qs-border rounded-qs p-3 col-span-2 md:col-span-1">
              <div class="text-lg font-bold text-qs-gold flex items-center justify-center gap-1">
                <PhCoins :size="16" weight="duotone" aria-hidden="true" />
                <AnimatedCounter :value="battleStore.result === 'win' ? battleStore.coinsEarned : 0" prefix="+" />
              </div>
              <div class="text-[11px] text-qs-muted">coins</div>
            </div>
          </div>

          <!-- Answer log -->
          <div class="text-left bg-qs-surface border border-qs-border rounded-qs p-4 mb-6">
            <div class="font-bold text-qs-text mb-3 text-sm">สรุปคำตอบรอบนี้</div>
            <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div
                v-for="(answer, index) in battleStore.answerLog"
                :key="`${answer.question_id}-${index}`"
                class="rounded-qs border p-3"
                :class="answer.is_correct ? 'border-qs-success/40 bg-green-900/10' : 'border-qs-danger/40 bg-red-900/10'"
              >
                <div class="flex items-start gap-2">
                  <PhCheckCircle v-if="answer.is_correct" :size="16" weight="fill" class="text-qs-success flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <PhXCircle     v-else                   :size="16" weight="fill" class="text-qs-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div class="flex-1">
                    <div class="text-sm text-qs-text">{{ index + 1 }}. {{ answer.question_text }}</div>
                    <div class="text-xs text-qs-muted mt-1">ตอบ: {{ answer.chosen_answer ?? '-' }}</div>
                    <div v-if="!answer.is_correct" class="text-xs text-qs-success mt-1">เฉลย: {{ answer.correct_answer }}</div>
                  </div>
                </div>
              </div>
              <div v-if="battleStore.answerLog.length === 0" class="text-sm text-qs-muted text-center py-4">
                ยังไม่มีคำตอบในรอบนี้
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button class="btn-ghost flex-1" @click="step = 1; reset()">กลับหน้าเลือก</button>
            <button class="btn-primary flex-1 gap-2" @click="startBattle">
              <PhArrowsClockwise :size="15" weight="bold" aria-hidden="true" />
              เล่นซ้ำ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import Phaser from 'phaser'
import { PHASER_CONFIG } from '@/lib/phaser/config'
import { useQuizStore } from '@/stores/quizStore'
import { useBattleStore } from '@/stores/battleStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useAuthStore } from '@/stores/authStore'
import { useBattleLoop } from '@/composables/useBattleLoop'
import { STAGES, getCooldownSeconds } from '@/utils/battleCalculator'

import HPBar from '@/components/battle/HPBar.vue'
import BarTime from '@/components/battle/BarTime.vue'
import SkillGauge from '@/components/battle/SkillGauge.vue'
import QuestionCard from '@/components/battle/QuestionCard.vue'
import StepIndicator from '@/components/ui/StepIndicator.vue'
import AnimatedCounter from '@/components/ui/AnimatedCounter.vue'
import { useToast } from '@/composables/useToast'
import {
  PhSword, PhArrowRight, PhArrowLeft, PhArrowsClockwise,
  PhCheckCircle, PhXCircle, PhWarning, PhLightning, PhSkull,
  PhTimer, PhTrophy, PhCoins, PhBooks, PhRobot, PhListBullets,
  PhShieldCheck, PhFlame,
} from '@phosphor-icons/vue'

const quizStore   = useQuizStore()
const battleStore = useBattleStore()
const playerStore = usePlayerStore()
const authStore   = useAuthStore()
const { toast }   = useToast()

const step          = ref(1)
const selectedSet   = ref(null)
const selectedDiff  = ref('normal')
const loadingBattle = ref(false)
const isLoadingSets = ref(false)
let gameInstance    = null

// UI State for answering
const showResult = ref(false)
const selectedIndex = ref(null)
const isSubmitting = ref(false)   // guard against double-submit
const hiddenOptions = ref([])
let mechanicsTimer = null
let rageStageIds = new Set()
let sessionSavedForRun = false

const difficulties = [
  { key: 'easy',   label: 'Easy',   icon: PhShieldCheck, desc: 'ไม่มี Cooldown, HP เยอะ — เหมาะสำหรับมือใหม่' },
  { key: 'normal', label: 'Normal', icon: PhSword,        desc: 'Cooldown 10 วิ — โหมดมาตรฐาน' },
  { key: 'hard',   label: 'Hard',   icon: PhFlame,        desc: 'Cooldown 7 วิ, ดาเมจ ×2 — สำหรับสายเดือด' },
]

const stages = [
  { id: 1, name: 'Slime',     color: 'text-monster-slime',  mechanic: 'Tutorial',        gradient: 'linear-gradient(135deg, #6fcf5a, #43d98f)' },
  { id: 2, name: 'Goblin',    color: 'text-monster-goblin', mechanic: 'Shuffle Options', gradient: 'linear-gradient(135deg, #8fbc56, #6fcf5a)' },
  { id: 3, name: 'Orc',       color: 'text-monster-orc',    mechanic: 'Danger Zone',     gradient: 'linear-gradient(135deg, #78909c, #546e7a)' },
  { id: 4, name: 'Dark Mage', color: 'text-monster-mage',   mechanic: 'Counter Attack',  gradient: 'linear-gradient(135deg, #9c27b0, #6c63ff)' },
  { id: 5, name: 'Boss',      color: 'text-monster-boss',   mechanic: 'Rage / Decoy',    gradient: 'linear-gradient(135deg, #c62828, #ff4757)' },
]
// แสดงชุดข้อสอบ public ทุกชุด + private ของตัวเอง (ไม่ซ้ำ)
const availableSets = computed(() => {
  const userId = authStore.user?.id
  const seen = new Set()
  return quizStore.quizSets.filter(s => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return s.is_public || s.author_id === userId
  })
})

const currentStageInfo = computed(() => STAGES[battleStore.currentStageId - 1] || STAGES[0])
const currentQuestion  = computed(() => battleStore.currentQuestion)
// Stage 5 (Boss): Use dynamic pressure cooldown
const maxCooldown      = computed(() => {
  if (battleStore.currentStageId === 5) {
    return battleStore.effectiveCooldown
  }
  return getCooldownSeconds(battleStore.difficulty) || 0
})
const totalQuizQuestions = computed(() => battleStore.quizSet?.questions?.length ?? 0)

// Player Bar ต้องเต็ม 100 ก่อนถึงจะตอบได้
const playerBarFull = computed(() => battleStore.playerBar >= 100)
const canAnswer = computed(() =>
  battleStore.phase === 'player_turn' &&
  !showResult.value &&
  playerBarFull.value
)

// นับ unique questions ที่ตอบถูกแล้วทั้งหมด (ไม่นับซ้ำจากการวนข้อ)
const currentQuestionNumber = computed(() => {
  const questions = battleStore.quizSet?.questions ?? []
  if (!questions.length) return 0
  const prevCount = questions.filter(q => q.stage < battleStore.currentStageId).length
  // ใช้ correctInStage.size เพื่อนับเฉพาะข้อที่ unique (ไม่นับข้อที่วนซ้ำ)
  return prevCount + battleStore.correctInStage.size + 1
})
const wrongAnswers = computed(() => Math.max(0, battleStore.totalAnswered - battleStore.totalCorrect))
const formattedDuration = computed(() => {
  const seconds = battleStore.durationSeconds
  const minutes = Math.floor(seconds / 60)
  const rest = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${rest}`
})
const victoryCaptions = [
  'เก่งเกินต้าน ตอบจนมอนสเตอร์ต้องขอเปิดหนังสือเอง!',
  'ชนะแล้วรับเหรียญไปเลย สมองคมกว่าดาบอีกนะเนี่ย',
  'รอบนี้ไม่ใช่ดวง ฝีมือล้วน ๆ จัดไป!',
]
const defeatCaptions = [
  'ไปอ่านมาใหม่นะน้อง! มอนสเตอร์ยังงงว่ากล้ากดได้ไง',
  'เกมจบ แต่บทเรียนยังไม่จบ เปิดชีทก่อนกลับมาล้างแค้น!',
  'ตอบผิดไม่เป็นไร แต่ผิดซ้ำ ๆ อาจารย์เริ่มมองแล้วนะ',
]
const endCaption = computed(() => {
  const captions = battleStore.result === 'win' ? victoryCaptions : defeatCaptions
  const seed = (battleStore.score + battleStore.totalAnswered + battleStore.currentStageId) % captions.length
  return captions[seed]
})

// Stage Mechanics: ไม่มี blind/fake_answer แล้ว — ล้าง timer ที่ค้างไว้
watch(() => battleStore.currentQIndex, () => {
  hiddenOptions.value = []
  if (mechanicsTimer) {
    clearTimeout(mechanicsTimer)
    clearInterval(mechanicsTimer)
    mechanicsTimer = null
  }
})

// reset hiddenOptions เมื่อขึ้นด่านใหม่
watch(() => battleStore.currentStageId, () => {
  hiddenOptions.value = []
  if (mechanicsTimer) {
    clearTimeout(mechanicsTimer)
    clearInterval(mechanicsTimer)
    mechanicsTimer = null
  }
})

// Stage 4: Counter Attack animation — trigger เมื่อ store บอกว่าสวนกลับเกิดขึ้น
watch(() => battleStore.counterAttackTriggered, (triggered) => {
  if (!triggered) return
  const scene = gameInstance?.scene.getScene('BattleScene')
  if (!scene) return
  // delay เล็กน้อยหลัง player attack animation เสร็จ
  setTimeout(() => {
    scene.events.emit('monsterAttack')
    setTimeout(() => {
      scene.events.emit('playerDamage', battleStore.lastDamageTaken)
    }, 180)
  }, 400)
})

// Watch phase to trigger Phaser animations and save sessions
watch(() => battleStore.phase, async (newPhase, oldPhase) => {
  const scene = gameInstance?.scene.getScene('BattleScene')
  
  if (scene && oldPhase === 'player_turn' && newPhase === 'monster_turn') {
    scene.events.emit('monsterAttack')
    setTimeout(() => {
      scene.events.emit('playerDamage', battleStore.lastDamageTaken)
    }, 150)
  }
  
  if (newPhase === 'game_over' || newPhase === 'victory') {
    if (sessionSavedForRun) return
    sessionSavedForRun = true
    if (scene && newPhase === 'game_over') {
      scene.events.emit('playerDeath')
    }
    await playerStore.saveSession({
      quiz_set_id: battleStore.quizSet.id,
      quiz_title: battleStore.quizSet.title,
      difficulty: battleStore.difficulty,
      stage_reached: battleStore.currentStageId,
      result: battleStore.result,
      score: battleStore.score,
      monsters_killed: battleStore.monstersCleared,
      total_answered: battleStore.totalAnswered,
      total_correct: battleStore.totalCorrect,
      duration_seconds: battleStore.durationSeconds,
      coins_earned: battleStore.coinsEarned,
      answer_summary: battleStore.answerLog,
    })
  }
})

watch(() => battleStore.damageEventId, () => {
  const damage = battleStore.lastDamageTaken
  if (!damage || battleStore.phase === 'idle') return
  const scene = gameInstance?.scene.getScene('BattleScene')
  if (!scene) return

  scene.events.emit('monsterAttack')
  setTimeout(() => {
    scene.events.emit('playerDamage', damage)
  }, 180)
})

watch(() => battleStore.monsterHP, (hp, previousHp) => {
  if (!gameInstance || battleStore.phase !== 'player_turn') return
  if (!previousHp || hp <= 0 || hp >= previousHp) return
  if (hp > Math.ceil(battleStore.monsterMaxHP * 0.5)) return
  if (rageStageIds.has(battleStore.currentStageId)) return

  rageStageIds.add(battleStore.currentStageId)
  const scene = gameInstance.scene.getScene('BattleScene')
  setTimeout(() => {
    scene?.events.emit('monsterRage')
  }, 550)
})

watch(() => battleStore.phase, (newPhase) => {
  if (newPhase === 'stage_clear' && battleStore.currentStageId < 5) {
    // รอให้ death animation + particle + flash เล่นจบก่อน (~650ms)
    // Phaser จะรับ stageChanged แล้วเล่น: walk-in → title → fade
    setTimeout(() => {
      battleStore.nextStage()
    }, 650)
  }
})

watch(() => battleStore.currentStageId, (stageId) => {
  emitStageChanged(stageId)
})

function emitStageChanged(stageId, attempt = 0) {
  const scene = gameInstance?.scene.getScene('BattleScene')
  if (scene?.scene?.isActive()) {
    scene.events.emit('stageChanged', stageId)
    return
  }

  if (attempt < 6) {
    setTimeout(() => emitStageChanged(stageId, attempt + 1), 50)
  }
}

function initPhaser() {
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
  const config = {
    ...PHASER_CONFIG,
    parent: 'phaser-container',
  }
  gameInstance = new Phaser.Game(config)
}

async function startBattle() {
  if (!selectedSet.value) return
  
  loadingBattle.value = true
  // Load full questions array from DB or Mock
  const fullSet = await quizStore.loadQuizSet(selectedSet.value.id)
  loadingBattle.value = false

  if (!fullSet || !fullSet.questions?.length) {
    toast.error('ไม่สามารถโหลดข้อมูลชุดข้อสอบได้ กรุณาลองใหม่อีกครั้ง')
    return
  }
  
  battleStore.startBattle(fullSet, selectedDiff.value)
  sessionSavedForRun = false
  step.value = 3
  showResult.value = false
  selectedIndex.value = null
  rageStageIds = new Set()
  
  nextTick(() => {
    initPhaser()
    emitStageChanged(battleStore.currentStageId)
  })
}

// Composable is active as soon as component mounts, but it only acts when store.phase === 'player_turn'
useBattleLoop()

async function reloadSets() {
  isLoadingSets.value = true
  await quizStore.fetchPublicSets()
  await quizStore.fetchMySets()
  isLoadingSets.value = false
}

function reset() {
  battleStore.resetBattle()
  selectedSet.value = null
  selectedDiff.value = 'normal'
  loadingBattle.value = false
  rageStageIds = new Set()
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
  // re-fetch เสมอตอนกลับมา step 1 เพื่อให้ list อัปเดต
  reloadSets()
}

async function handleAnswer(idx) {
  if (battleStore.phase !== 'player_turn' || showResult.value || isSubmitting.value) return

  isSubmitting.value = true   // lock immediately
  selectedIndex.value = idx
  showResult.value = true
  battleStore.cooldownActive = false // Stop timer
  
  const isCorrect = idx === currentQuestion.value.correct_index
  const previousHP = battleStore.playerHP
  const previousMonsterHP = battleStore.monsterHP
  
  // Wait a bit to show result
  setTimeout(() => {
    battleStore.submitAnswer(idx)
    
    // Trigger animations
    if (gameInstance && isCorrect) {
      const scene = gameInstance.scene.getScene('BattleScene')
      if (scene) {
        scene.events.emit('playerAttack')
        setTimeout(() => {
          const damage = previousMonsterHP - battleStore.monsterHP
          scene.events.emit(
            battleStore.monsterHP <= 0 ? 'monsterDeath' : 'monsterDamage',
            damage,
          )
        }, 150)
      }
    }

    if (gameInstance && battleStore.playerHP < previousHP) {
      const scene = gameInstance.scene.getScene('BattleScene')
      scene?.events.emit('playerDamage', previousHP - battleStore.playerHP)
    }
    
    showResult.value = false
    selectedIndex.value = null
    isSubmitting.value = false
  }, 1500)
}

function handleUseSkill() {
  const scene = gameInstance?.scene.getScene('BattleScene')
  const result = battleStore.useSkill()
  if (!result || !scene) return

  scene.events.emit('playerAttack')
  if (battleStore.monsterHP <= 0) {
    scene.events.emit('monsterDeath', result.damage)
  } else {
    scene.events.emit('monsterDamage', result.damage)
  }
}

onMounted(async () => {
  isLoadingSets.value = true
  await quizStore.fetchPublicSets()
  await quizStore.fetchMySets()
  isLoadingSets.value = false
})

onUnmounted(() => {
  if (gameInstance) {
    gameInstance.destroy(true)
  }
  if (mechanicsTimer) {
    clearTimeout(mechanicsTimer)
    clearInterval(mechanicsTimer)
  }
})
</script>

<style scoped>
.battle-page.is-playing {
  width: 100%;
  max-width: none;
  min-height: calc(100vh - 5rem);
  padding: 0.5rem 1rem;
}

/* ── Desktop ≥1280px: 2-column side-by-side ── */
@media (min-width: 1280px) {
  .battle-page.is-playing .battle-layout {
    max-width: none;
    min-height: calc(100vh - 6rem);
    display: grid;
    grid-template-columns: minmax(380px, 0.95fr) minmax(420px, 1.05fr);
    grid-template-rows: auto auto auto;
    align-content: center;
    column-gap: 1.25rem;
  }

  .battle-page.is-playing .battle-layout > :nth-child(1),
  .battle-page.is-playing .battle-layout > :nth-child(2),
  .battle-page.is-playing .battle-layout > :nth-child(3) {
    grid-column: 1;
  }

  .battle-page.is-playing .battle-layout > :nth-child(4) {
    grid-column: 2;
    grid-row: 1 / span 3;
    align-self: center;
  }
}

/* ── Tablet & below <1280px: stack ── */
@media (max-width: 1279px) {
  .battle-page.is-playing {
    padding: 0.5rem 0.75rem;
    min-height: auto;
  }
  .battle-page.is-playing .battle-layout {
    display: flex;
    flex-direction: column;
    gap: 0;
    max-width: 600px;
    margin: 0 auto;
  }
}

/* ── Canvas height ── */
.battle-canvas {
  height: clamp(180px, 30vw, 340px);
}

@media (min-width: 1280px) {
  .battle-canvas {
    height: clamp(240px, 38vh, 360px);
  }
}

/* ── Mobile <480px: compact ── */
@media (max-width: 479px) {
  .battle-page.is-playing {
    padding: 0.25rem 0.5rem;
  }
  .battle-canvas {
    height: clamp(150px, 44vw, 220px);
  }
}
</style>
