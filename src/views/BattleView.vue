<template>
  <div class="battle-page max-w-6xl mx-auto px-4 py-6 md:py-12" :class="{ 'is-playing': step === 3 }">
    <div v-if="step < 3" class="text-center mb-12">
      <h1 class="text-3xl font-bold text-qs-text mb-2">⚔️ Battle Arena</h1>
      <p class="text-qs-muted">เลือกชุดข้อสอบและโหมดความยาก แล้วลงสนาม!</p>
    </div>

    <!-- Step 1: Select Quiz Set -->
    <div v-if="step === 1" class="animate-slide-up">
      <h2 class="text-xl font-bold text-qs-text mb-6">1. เลือกชุดข้อสอบ</h2>

      <div v-if="quizStore.loading" class="text-center py-16 text-qs-muted">
        กำลังโหลด...
      </div>
      <div v-else-if="quizStore.quizSets.length === 0" class="card p-12 text-center">
        <p class="text-qs-muted mb-6">ยังไม่มีชุดข้อสอบ สร้างชุดแรกก่อนเลย!</p>
        <router-link to="/generator" class="btn-primary">สร้างชุดข้อสอบ</router-link>
      </div>
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="set in quizStore.quizSets"
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
        <button class="btn-primary flex-1" :disabled="!selectedDiff" @click="startBattle">
          ⚔️ เริ่มต่อสู้!
        </button>
      </div>
    </div>

    <!-- Step 3: Battle Screen -->
    <div v-if="step === 3" class="battle-layout animate-fade-in max-w-3xl mx-auto">
      <!-- Top: HP Bars -->
      <div class="flex justify-between items-end mb-2 px-2">
        <div>
          <div class="text-sm font-bold text-qs-muted mb-1">{{ playerStore.profile?.username || 'Hero' }}</div>
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
        
        <!-- Player Time Bar -->
        <BarTime :progress="battleStore.playerBar" class="absolute bottom-1 left-0 right-0 z-10" />
      </div>

      <div class="flex justify-between items-center mb-6 px-2">
        <button class="btn-secondary text-xs px-3 py-1" @click="step = 1; reset()">← หนี (ยอมแพ้)</button>
        <SkillGauge
          :streak="battleStore.streak"
          :gauge="battleStore.skillGauge"
          :ready="battleStore.skillReady"
          @use-skill="handleUseSkill"
        />
      </div>

      <!-- Bottom: Question Card -->
      <QuestionCard 
        :question="currentQuestion"
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
        <div class="card p-8 text-center max-w-md w-full mx-4 animate-slide-up">
          <div class="text-6xl mb-4 animate-float">{{ battleStore.phase === 'victory' ? '🏆' : '💀' }}</div>
          <h2 class="text-2xl font-bold mb-2" :class="battleStore.phase === 'victory' ? 'text-qs-success' : 'text-qs-danger'">
            {{ battleStore.phase === 'victory' ? 'Victory!' : 'Game Over' }}
          </h2>
          <p class="text-qs-muted mb-6">
            {{ battleStore.phase === 'victory' ? 'คุณพิชิตดันเจี้ยนนี้สำเร็จแล้ว!' : 'พ่ายแพ้... ลองใหม่อีกครั้ง!' }}
          </p>
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
import { useBattleLoop } from '@/composables/useBattleLoop'
import { STAGES, getCooldownSeconds } from '@/utils/battleCalculator'

import HPBar from '@/components/battle/HPBar.vue'
import BarTime from '@/components/battle/BarTime.vue'
import SkillGauge from '@/components/battle/SkillGauge.vue'
import QuestionCard from '@/components/battle/QuestionCard.vue'

const quizStore   = useQuizStore()
const battleStore = useBattleStore()
const playerStore = usePlayerStore()

const step          = ref(1)
const selectedSet   = ref(null)
const selectedDiff  = ref('normal')
let gameInstance    = null

// UI State for answering
const showResult = ref(false)
const selectedIndex = ref(null)
const hiddenOptions = ref([])
let mechanicsTimer = null

const difficulties = [
  { key: 'easy',   label: 'Easy',   emoji: '🟢', desc: 'ไม่มี Cooldown, HP เยอะ — เหมาะสำหรับมือใหม่' },
  { key: 'normal', label: 'Normal', emoji: '🟡', desc: 'Cooldown 10 วิ — โหมดมาตรฐาน' },
  { key: 'hard',   label: 'Hard',   emoji: '🔴', desc: 'Cooldown 7 วิ, ดาเมจ ×2 — สำหรับสายเดือด' },
]

const currentStageInfo = computed(() => STAGES[battleStore.currentStageId - 1] || STAGES[0])
const currentQuestion  = computed(() => battleStore.currentQuestion)
const maxCooldown      = computed(() => getCooldownSeconds(battleStore.difficulty) || 0)

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
  if (!gameInstance) return
  const scene = gameInstance.scene.getScene('BattleScene')
  
  if (scene && oldPhase === 'player_turn' && newPhase === 'monster_turn') {
    scene.events.emit('monsterAttack')
    setTimeout(() => {
      scene.events.emit('playerDamage', battleStore.lastDamageTaken)
    }, 150)
  }
  
  if (newPhase === 'game_over' || newPhase === 'victory') {
    if (scene && newPhase === 'game_over') {
      scene.events.emit('playerDeath')
    }
    await playerStore.saveSession({
      quiz_set_id: battleStore.quizSet.id,
      difficulty: battleStore.difficulty,
      stage_reached: battleStore.currentStageId,
      result: battleStore.result,
      score: battleStore.score,
      monsters_killed: battleStore.monstersCleared
    })
  }
})

watch(() => battleStore.phase, (newPhase) => {
  if (newPhase === 'stage_clear' && battleStore.currentStageId < 5) {
    setTimeout(() => {
      battleStore.nextStage()
    }, 900)
  }
})

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
  
  // Load full questions array from DB or Mock
  const fullSet = await quizStore.loadQuizSet(selectedSet.value.id)
  if (!fullSet || !fullSet.questions) {
    alert('ไม่สามารถโหลดข้อมูลชุดข้อสอบได้')
    return
  }
  
  battleStore.startBattle(fullSet, selectedDiff.value)
  step.value = 3
  showResult.value = false
  selectedIndex.value = null
  
  nextTick(() => {
    initPhaser()
  })
}

// Composable is active as soon as component mounts, but it only acts when store.phase === 'player_turn'
useBattleLoop()

function reset() {
  battleStore.resetBattle()
  selectedSet.value = null
  selectedDiff.value = 'normal'
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
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

onMounted(() => {
  quizStore.fetchPublicSets()
  quizStore.fetchMySets()
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
