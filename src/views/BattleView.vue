<template>
  <div class="battle-page max-w-6xl mx-auto px-4 py-6 md:py-12" :class="{ 'is-playing': step === 3 }">
    <div v-if="step < 3" class="text-center mb-12">
      <h1 class="text-3xl font-bold text-qs-text mb-2">⚔️ Battle Arena</h1>
      <p class="text-qs-muted">เลือกชุดข้อสอบและโหมดความยาก แล้วลงสนาม!</p>
    </div>

    <!-- Step 1: Select Quiz Set -->
    <div v-if="step === 1" class="animate-slide-up">
      <h2 class="text-xl font-bold text-qs-text mb-6">1. เลือกชุดข้อสอบ</h2>

      <!-- Loading skeleton -->
      <div v-if="isLoadingSets" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="n in 3" :key="n" class="card p-5 animate-pulse">
          <div class="h-4 bg-qs-border rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-qs-border rounded w-1/4"></div>
        </div>
      </div>
      <div v-else-if="availableSets.length === 0" class="card p-12 text-center">
        <p class="text-qs-muted mb-4">ยังไม่มีชุดข้อสอบ สร้างชุดแรกก่อนเลย!</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <router-link to="/generator" class="btn-primary">สร้างชุดข้อสอบ</router-link>
          <button class="btn-secondary" @click="reloadSets">🔄 โหลดใหม่</button>
        </div>
      </div>
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="set in availableSets"
          :key="set.id"
          class="card-hover p-5 cursor-pointer"
          :class="{ 'border-qs-primary shadow-qs': selectedSet?.id === set.id }"
          @click="selectedSet = set"
        >
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-bold text-qs-text">{{ set.title }}</h3>
            <span v-if="set.is_public" class="stage-badge bg-green-900/30 text-qs-success text-xs">Public</span>
          </div>
          <p class="text-qs-muted text-sm">{{ set.questions?.[0]?.count ?? 0 }} ข้อ</p>
        </div>
      </div>

      <div class="text-center mt-8">
        <button class="btn-primary px-10" :disabled="!selectedSet" @click="step = 2">
          ถัดไป →
        </button>
      </div>
    </div>

    <!-- Step 2: Select Difficulty -->
    <div v-if="step === 2" class="animate-slide-up max-w-lg mx-auto">
      <h2 class="text-xl font-bold text-qs-text mb-6 text-center">2. เลือกโหมดความยาก</h2>
      <div class="space-y-4 mb-8">
        <div
          v-for="diff in difficulties"
          :key="diff.key"
          class="card-hover p-5 cursor-pointer flex items-center gap-4"
          :class="{ 'border-qs-primary shadow-qs': selectedDiff === diff.key }"
          @click="selectedDiff = diff.key"
        >
          <span class="text-3xl">{{ diff.emoji }}</span>
          <div class="flex-1">
            <div class="font-bold text-qs-text mb-1">{{ diff.label }}</div>
            <div class="text-qs-muted text-sm">{{ diff.desc }}</div>
          </div>
          <div v-if="selectedDiff === diff.key" class="text-qs-primary text-xl">✓</div>
        </div>
      </div>
      <div class="flex gap-4">
        <button class="btn-secondary flex-1" @click="step = 1">← กลับ</button>
        <button class="btn-primary flex-1" :disabled="!selectedDiff || loadingBattle" @click="startBattle">
          <span v-if="loadingBattle" class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            กำลังโหลด...
          </span>
          <span v-else>⚔️ เริ่มต่อสู้!</span>
        </button>
      </div>
    </div>

    <!-- Step 3: Battle Screen -->
    <div v-if="step === 3" class="battle-layout animate-fade-in max-w-3xl mx-auto">
      <!-- Top: HP Bars -->
      <div class="flex justify-between items-end mb-2 px-2">
        <div>
          <div class="text-sm font-bold text-qs-muted mb-1">{{ authStore.displayName || 'Hero' }}</div>
          <HPBar :hp="battleStore.playerHP" :maxHp="battleStore.playerMaxHP" isPlayer />
        </div>
        <div class="text-right">
          <div class="text-sm font-bold text-qs-danger mb-1">{{ currentStageInfo?.monster || 'Monster' }} (Stage {{ battleStore.currentStageId }})</div>
          <HPBar :hp="battleStore.monsterHP" :maxHp="battleStore.monsterMaxHP" />
        </div>
      </div>

      <!-- Middle: Phaser + Time Bars -->
      <div class="battle-canvas card p-0 overflow-hidden mb-4 relative shadow-qs border-2 border-qs-border bg-qs-surface">
        <div id="phaser-container" class="w-full h-full"></div>
        
        <!-- Hero + Monster Time Bars -->
        <BarTime
          :playerProgress="battleStore.playerBar"
          :monsterProgress="battleStore.monsterBar"
          :streak="battleStore.streak"
          class="absolute bottom-1 left-0 right-0 z-10"
        />
      </div>

      <div class="flex justify-between items-center mb-6 px-2">
        <button class="btn-secondary text-xs px-3 py-1" @click="step = 1; reset()">← หนี (ยอมแพ้)</button>
        <SkillGauge
          :streak="battleStore.streak"
          :charge="battleStore.skillCharge"
          :gaugePct="battleStore.skillGaugePct"
          :ready="battleStore.skillReady"
          :skillUsed="battleStore.skillUsed"
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
        :disabled="battleStore.phase !== 'player_turn' || showResult"
        :showResult="showResult"
        :selectedIndex="selectedIndex"
        :hiddenOptions="hiddenOptions"
        @answer="handleAnswer"
      />
      
      <!-- Battle End Overlay -->
      <div v-if="battleStore.phase === 'game_over' || battleStore.phase === 'victory'" 
           class="fixed inset-0 z-50 flex items-center justify-center bg-qs-bg/80 backdrop-blur-sm">
        <div class="card p-6 text-center max-w-2xl w-full mx-4 animate-slide-up max-h-[92vh] overflow-y-auto">
          <div class="text-6xl mb-4 animate-float">{{ battleStore.phase === 'victory' ? '🏆' : '💀' }}</div>
          <h2 class="text-2xl font-bold mb-2" :class="battleStore.phase === 'victory' ? 'text-qs-success' : 'text-qs-danger'">
            {{ battleStore.phase === 'victory' ? 'Victory!' : 'Game Over' }}
          </h2>
          <p class="text-qs-muted mb-5">
            {{ endCaption }}
          </p>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
              <div class="text-lg font-bold text-qs-text">{{ battleStore.score }}</div>
              <div class="text-[11px] text-qs-muted">คะแนน</div>
            </div>
            <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
              <div class="text-lg font-bold text-qs-success">{{ battleStore.totalCorrect }}</div>
              <div class="text-[11px] text-qs-muted">ตอบถูก</div>
            </div>
            <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
              <div class="text-lg font-bold text-qs-danger">{{ wrongAnswers }}</div>
              <div class="text-[11px] text-qs-muted">ตอบผิด</div>
            </div>
            <div class="bg-qs-surface border border-qs-border rounded-qs p-3">
              <div class="text-lg font-bold text-qs-accent">{{ formattedDuration }}</div>
              <div class="text-[11px] text-qs-muted">เวลา</div>
            </div>
            <div class="bg-qs-surface border border-qs-border rounded-qs p-3 col-span-2 md:col-span-1">
              <div class="text-lg font-bold text-qs-gold">+{{ battleStore.result === 'win' ? battleStore.coinsEarned : 0 }}</div>
              <div class="text-[11px] text-qs-muted">coins</div>
            </div>
          </div>
          <div class="text-left bg-qs-surface border border-qs-border rounded-qs p-4 mb-6">
            <div class="font-bold text-qs-text mb-3">สรุปคำตอบรอบนี้</div>
            <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div
                v-for="(answer, index) in battleStore.answerLog"
                :key="`${answer.question_id}-${index}`"
                class="rounded-qs border p-3"
                :class="answer.is_correct ? 'border-qs-success/40 bg-green-900/10' : 'border-qs-danger/40 bg-red-900/10'"
              >
                <div class="flex items-start gap-2">
                  <span class="font-bold" :class="answer.is_correct ? 'text-qs-success' : 'text-qs-danger'">
                    {{ answer.is_correct ? 'ถูก' : 'ผิด' }}
                  </span>
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
            <button class="btn-secondary flex-1" @click="step = 1; reset()">กลับหน้าเลือก</button>
            <button class="btn-primary flex-1" @click="startBattle">เล่นซ้ำ</button>
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

const quizStore   = useQuizStore()
const battleStore = useBattleStore()
const playerStore = usePlayerStore()
const authStore   = useAuthStore()

const step          = ref(1)
const selectedSet   = ref(null)
const selectedDiff  = ref('normal')
const loadingBattle = ref(false)
const isLoadingSets = ref(false)
let gameInstance    = null

// UI State for answering
const showResult = ref(false)
const selectedIndex = ref(null)
const hiddenOptions = ref([])
let mechanicsTimer = null
let rageStageIds = new Set()
let sessionSavedForRun = false

const difficulties = [
  { key: 'easy',   label: 'Easy',   emoji: '🟢', desc: 'ไม่มี Cooldown, HP เยอะ — เหมาะสำหรับมือใหม่' },
  { key: 'normal', label: 'Normal', emoji: '🟡', desc: 'Cooldown 10 วิ — โหมดมาตรฐาน' },
  { key: 'hard',   label: 'Hard',   emoji: '🔴', desc: 'Cooldown 7 วิ, ดาเมจ ×2 — สำหรับสายเดือด' },
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
const maxCooldown      = computed(() => getCooldownSeconds(battleStore.difficulty) || 0)
const totalQuizQuestions = computed(() => battleStore.quizSet?.questions?.length ?? 0)

// นับ unique questions ที่ตอบถูกแล้วทั้งหมด (ไม่นับซ้ำจากการวนข้อ)
const currentQuestionNumber = computed(() => {
  const questions = battleStore.quizSet?.questions ?? []
  if (!questions.length) return 0
  const prevCount = questions.filter(q => q.stage < battleStore.currentStageId).length
  // answeredInStage นับเฉพาะข้อที่ตอบถูกผ่านไปแล้ว ไม่นับข้อปัจจุบันที่กำลังแสดง
  return prevCount + battleStore.answeredInStage + 1
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

// Stage Mechanics: Blind & Vanishing Choices
watch(() => battleStore.currentQuestion, (newQ) => {
  hiddenOptions.value = []
  if (mechanicsTimer) {
    clearTimeout(mechanicsTimer)
    clearInterval(mechanicsTimer)
  }
  
  if (!newQ || battleStore.phase !== 'player_turn') return
  
  const mechanics = currentStageInfo.value?.mechanics || []
  
  if (mechanics.includes('blind')) {
    // Blind: Hide all options after 3 seconds
    mechanicsTimer = setTimeout(() => {
      if (battleStore.phase === 'player_turn' && !showResult.value) {
        hiddenOptions.value = [0, 1, 2, 3]
      }
    }, 3000)
  }
  
  if (mechanics.includes('vanishing_choices')) {
    // Vanishing: remove one wrong answer every 2.5 seconds
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== newQ.correct_index)
    // shuffle wrongIndices
    for (let i = wrongIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrongIndices[i], wrongIndices[j]] = [wrongIndices[j], wrongIndices[i]]
    }
    
    let removedCount = 0
    mechanicsTimer = setInterval(() => {
      if (battleStore.phase !== 'player_turn' || showResult.value) {
        clearInterval(mechanicsTimer)
        return
      }
      if (removedCount < 2) {
        hiddenOptions.value.push(wrongIndices[removedCount])
        removedCount++
      } else {
        clearInterval(mechanicsTimer)
      }
    }, 2500)
  }
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
    alert('ไม่สามารถโหลดข้อมูลชุดข้อสอบได้ กรุณาลองใหม่อีกครั้ง')
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
  if (battleStore.phase !== 'player_turn' || showResult.value) return
  
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
  padding: 0.75rem 1.5rem;
}

.battle-page.is-playing .battle-layout {
  max-width: none;
  min-height: calc(100vh - 6.5rem);
  display: grid;
  grid-template-columns: minmax(420px, 0.9fr) minmax(440px, 1.1fr);
  grid-template-rows: auto auto auto;
  align-content: center;
  column-gap: 1rem;
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

.battle-canvas {
  height: clamp(240px, 42vh, 390px);
}

@media (max-width: 1023px) {
  .battle-page.is-playing {
    padding: 0.75rem 1rem;
  }

  .battle-page.is-playing .battle-layout {
    min-height: auto;
    display: block;
  }

  .battle-canvas {
    height: clamp(200px, 32vh, 280px);
  }
}
</style>
