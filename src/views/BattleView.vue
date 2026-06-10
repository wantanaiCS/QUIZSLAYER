<template>
  <div class="max-w-6xl mx-auto px-4 py-12">
    <div class="text-center mb-12">
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

    <!-- Battle Screen placeholder (Phase 1 implementation) -->
    <div v-if="step === 3" class="animate-fade-in">
      <div class="card p-8 text-center">
        <div class="text-6xl mb-4 animate-float">⚔️</div>
        <h2 class="text-2xl font-bold text-qs-text mb-2">กำลังโหลด Battle Scene...</h2>
        <p class="text-qs-muted">Phaser 3 Battle Engine จะถูก implement ใน Phase ถัดไป</p>
        <div class="mt-6 p-4 bg-qs-surface rounded-qs text-left text-sm font-mono text-qs-muted">
          <p>📌 Quiz Set: {{ selectedSet?.title }}</p>
          <p>🎮 Difficulty: {{ selectedDiff }}</p>
          <p>❤️ Player HP: {{ playerHP }}</p>
          <p>👹 Monster: {{ currentStage?.monster }}</p>
        </div>
        <button class="btn-secondary mt-6" @click="step = 1; reset()">← เลือกใหม่</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useBattleStore } from '@/stores/battleStore'
import { STAGES } from '@/utils/battleCalculator'

const quizStore   = useQuizStore()
const battleStore = useBattleStore()

const step          = ref(1)
const selectedSet   = ref(null)
const selectedDiff  = ref('normal')

const difficulties = [
  { key: 'easy',   label: 'Easy',   emoji: '🟢', desc: 'ไม่มี Cooldown, HP เยอะ — เหมาะสำหรับมือใหม่' },
  { key: 'normal', label: 'Normal', emoji: '🟡', desc: 'Cooldown 10 วิ — โหมดมาตรฐาน' },
  { key: 'hard',   label: 'Hard',   emoji: '🔴', desc: 'Cooldown 7 วิ, ดาเมจ ×2 — สำหรับสายเดือด' },
]

const playerHP    = computed(() => battleStore.playerHP)
const currentStage = computed(() => STAGES[0])

function startBattle() {
  if (!selectedSet.value) return
  battleStore.startBattle(selectedSet.value, selectedDiff.value)
  step.value = 3
}

function reset() {
  battleStore.resetBattle()
  selectedSet.value = null
  selectedDiff.value = 'normal'
}

onMounted(() => {
  quizStore.fetchPublicSets()
  quizStore.fetchMySets()
})
</script>
