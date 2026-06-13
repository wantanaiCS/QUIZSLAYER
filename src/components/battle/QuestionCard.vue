<template>
  <div class="card p-4 lg:p-5 relative overflow-hidden">
    <!-- Cooldown bar top edge -->
    <div 
      v-if="cooldownLeft > 0 && maxCooldown > 0"
      class="absolute top-0 left-0 h-1 bg-qs-accent transition-none"
      :style="{ width: (cooldownLeft / maxCooldown) * 100 + '%' }"
    ></div>

    <div class="flex justify-between items-start mb-4">
      <div class="font-bold text-base lg:text-lg text-qs-text leading-relaxed flex-1 pr-4">
        <div v-if="totalQuestions > 0" class="text-xs font-pixel text-qs-accent mb-2">
          {{ questionNumber }}/{{ totalQuestions }}
        </div>
        {{ question?.question_text || 'Loading question...' }}
      </div>
      <div v-if="cooldownLeft > 0" class="text-xl font-pixel text-qs-accent">
        {{ Math.ceil(cooldownLeft) }}
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <button
        v-for="(opt, idx) in optionsToRender"
        :key="idx"
        class="answer-option flex gap-3 !px-4 !py-3"
        :class="{
          'correct': showResult && idx === question.correct_index,
          'wrong': showResult && selectedIndex === idx && idx !== question.correct_index,
          'disabled': disabled || showResult || hiddenOptions.includes(idx)
        }"
        :disabled="disabled || showResult || hiddenOptions.includes(idx)"
        @click="$emit('answer', idx)"
      >
        <span class="font-bold text-qs-muted opacity-50">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
        <span :class="{'opacity-0': hiddenOptions.includes(idx)}">{{ opt }}</span>
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
  question: { type: Object, default: null },
  questionNumber: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  cooldownLeft: { type: Number, default: 0 },
  maxCooldown: { type: Number, default: 10 },
  disabled: { type: Boolean, default: false },
  showResult: { type: Boolean, default: false },
  selectedIndex: { type: Number, default: null },
  hiddenOptions: { type: Array, default: () => [] } // For Stage 4/5 mechanics (Blind, Vanishing)
})

defineEmits(['answer'])

const optionsToRender = computed(() => {
  const opts = props.question?.options
  if (Array.isArray(opts) && opts.length === 4) return opts
  // ป้องกันกรณี options เป็น JSON string (JSONB edge case)
  if (typeof opts === 'string') {
    try { return JSON.parse(opts) } catch { /* ignore */ }
  }
  return ['A', 'B', 'C', 'D']  // fallback ที่ไม่ให้ช่องว่าง
})
</script>
