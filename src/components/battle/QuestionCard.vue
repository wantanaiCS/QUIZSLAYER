<template>
  <div class="card p-4 lg:p-5 relative overflow-hidden">
    <!-- Cooldown bar top edge -->
    <div 
      v-if="cooldownLeft > 0 && maxCooldown > 0"
      class="absolute top-0 left-0 h-1 bg-qs-accent transition-none"
      :style="{ width: (cooldownLeft / maxCooldown) * 100 + '%' }"
    ></div>

    <!-- Waiting for bar overlay -->
    <Transition name="fade-lock">
      <div
        v-if="waitingForBar"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-qs"
        style="background: rgba(13,15,26,0.65); backdrop-filter: blur(2px);"
      >
        <span class="text-2xl animate-pulse">⚔️</span>
        <p class="text-xs font-pixel text-qs-muted">รอ Hero Bar เต็ม...</p>
        <!-- mini hero bar indicator -->
        <div class="w-32 h-1.5 bg-qs-bg rounded-full overflow-hidden border border-qs-border">
          <div class="h-full bg-qs-success rounded-full transition-none" :style="{ width: heroBarPct + '%' }"></div>
        </div>
      </div>
    </Transition>

    <div class="flex justify-between items-start mb-4">
      <div class="font-bold text-base lg:text-lg text-qs-text leading-relaxed flex-1 pr-4">
        <div v-if="totalQuestions > 0" class="text-xs font-pixel text-qs-accent mb-2 flex items-center gap-2">
          <span>{{ questionNumber }}/{{ totalQuestions }}</span>
          <span v-if="question?.isReversed" class="text-orange-400 animate-pulse">🔄 สลับตำแหน่ง!</span>
          <!-- Blind warning -->
          <span v-if="isBlindActive" class="text-purple-400 animate-pulse">🙈 จำตำแหน่งคำตอบไว้!</span>
        </div>
        {{ question?.question_text || 'Loading question...' }}
      </div>
      <div v-if="cooldownLeft > 0" class="text-xl font-pixel text-qs-accent">
        {{ Math.ceil(cooldownLeft) }}
      </div>
    </div>

    <!-- Dynamic grid: 2 columns for 4 options, 1 column for 5 options -->
    <div 
      class="grid gap-2.5"
      :class="optionsToRender.length === 5 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'"
    >
      <button
        v-for="(opt, idx) in optionsToRender"
        :key="idx"
        class="answer-option flex gap-3 !px-4 !py-3"
        :class="{
          'correct':  showResult && idx === question.correct_index,
          'wrong':    showResult && selectedIndex === idx && idx !== question.correct_index,
          'disabled': disabled || showResult
        }"
        :disabled="disabled || showResult"
        @click="$emit('answer', idx)"
      >
        <span class="font-bold text-qs-muted opacity-50">{{ optionLabels[idx] }}</span>
        <!-- ซ่อนข้อความแต่ยังกดปุ่มได้ — ผู้เล่นต้องจำตำแหน่งจากความจำ -->
        <span class="transition-opacity duration-300" :class="hiddenOptions.includes(idx) ? 'opacity-0' : 'opacity-100'">
          {{ opt }}
        </span>
      </button>
    </div>
    
    <div v-if="showResult && question?.explanation" class="mt-4 p-3 bg-qs-surface rounded-qs text-sm text-qs-muted border border-qs-border animate-fade-in">
      <span class="font-bold text-qs-text mr-1">💡 เฉลย:</span> {{ question.explanation }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  question:       { type: Object,  default: null },
  questionNumber: { type: Number,  default: 0 },
  totalQuestions: { type: Number,  default: 0 },
  cooldownLeft:   { type: Number,  default: 0 },
  maxCooldown:    { type: Number,  default: 10 },
  disabled:       { type: Boolean, default: false },
  waitingForBar:  { type: Boolean, default: false }, // true = Hero bar ยังไม่เต็ม
  heroBarPct:     { type: Number,  default: 0 },     // 0-100 ให้แสดง mini bar
  showResult:     { type: Boolean, default: false },
  selectedIndex:  { type: Number,  default: null },
  hiddenOptions:  { type: Array,   default: () => [] },
})

defineEmits(['answer'])

// ซ่อนข้อความทุกตัวเลือกแล้ว = blind active
const isBlindActive = computed(() =>
  props.hiddenOptions.length > 0 &&
  props.hiddenOptions.length === (props.question?.options?.length ?? 4)
)

const optionsToRender = computed(() => {
  const opts = props.question?.options
  if (Array.isArray(opts) && opts.length >= 4) return opts
  if (typeof opts === 'string') {
    try { return JSON.parse(opts) } catch { /* ignore */ }
  }
  return ['A', 'B', 'C', 'D']
})

const optionLabels = computed(() =>
  optionsToRender.value.length === 5
    ? ['A', 'B', 'C', 'D', 'E']
    : ['A', 'B', 'C', 'D']
)
</script>

<style scoped>
.fade-lock-enter-active, .fade-lock-leave-active { transition: opacity 0.25s; }
.fade-lock-enter-from,  .fade-lock-leave-to      { opacity: 0; }
</style>
