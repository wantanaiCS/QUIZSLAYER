<template>
  <div class="flex flex-col gap-1.5 items-end">

    <!-- Streak badge -->
    <div class="flex items-center gap-2 h-5">
      <span v-if="streak > 0" class="streak-badge animate-bounce-in text-[10px]">
        🔥 {{ streak }}x Combo
      </span>
    </div>

    <!-- Skill charge pips + button row -->
    <div class="flex items-center gap-2">

      <!-- Charge pip dots: แสดง ULTIMATE_THRESHOLD (5) ช่อง -->
      <div class="flex gap-1 items-center">
        <div
          v-for="i in ULTIMATE_THRESHOLD"
          :key="i"
          class="w-3 h-3 rounded-full border transition-all duration-200"
          :class="pipClass(i)"
          :title="`${i} / ${ULTIMATE_THRESHOLD}`"
        ></div>
      </div>

      <!-- Skill icon / button -->
      <button
        class="relative transition-all duration-200 select-none"
        :class="[
          ready !== 'none'
            ? 'btn-gold !px-3 !py-1.5 text-xs shadow-gold-glow'
            : 'px-3 py-1.5 text-xs rounded-qs border border-qs-border bg-qs-surface text-qs-muted opacity-50 cursor-not-allowed',
          ready === 'ultimate' ? 'animate-glow-pulse' : ''
        ]"
        :disabled="ready === 'none'"
        @click="ready !== 'none' && $emit('use-skill')"
      >
        <!-- Icon changes by tier -->
        <span v-if="ready === 'ultimate'" class="mr-1">✦</span>
        <span v-else-if="ready === 'skill_lv1'" class="mr-1">⚡</span>
        <span v-else class="mr-1 opacity-40">⚡</span>
        <span>{{ skillLabel }}</span>

        <!-- Glow ring when ready -->
        <span
          v-if="ready !== 'none'"
          class="absolute inset-0 rounded-qs pointer-events-none"
          :class="ready === 'ultimate'
            ? 'ring-2 ring-qs-accent ring-offset-1 ring-offset-qs-bg'
            : 'ring-1 ring-qs-primary ring-offset-1 ring-offset-qs-bg'"
        ></span>
      </button>
    </div>

    <!-- Gauge bar (thin, shows progress to next threshold) -->
    <div class="bar-container h-1.5 w-32 bg-qs-surface border-0">
      <div
        class="bar-fill transition-all duration-300"
        :class="ready === 'ultimate' ? 'mana-bar shadow-[0_0_6px_rgba(244,200,66,0.6)] bg-qs-accent' : 'mana-bar'"
        :style="{ width: gaugePct + '%' }"
      ></div>
    </div>

    <!-- Hint text -->
    <p class="text-[10px] text-qs-muted leading-none">
      <template v-if="ready !== 'none'">กดเพื่อใช้สกิล!</template>
      <template v-else>ตอบถูก {{ chargeNeeded }} ครั้งเพื่อ{{ nextLabel }}</template>
    </p>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SKILL_LV1_THRESHOLD, ULTIMATE_THRESHOLD } from '@/utils/battleCalculator'

const props = defineProps({
  streak:    { type: Number, required: true },
  charge:    { type: Number, required: true },  // skillCharge from store
  gaugePct:  { type: Number, required: true },  // skillGaugePct from store
  ready:     { type: String, default: 'none' }, // 'none' | 'skill_lv1' | 'ultimate'
  skillUsed: { type: Boolean, default: false }, // true = waiting to recharge
})

defineEmits(['use-skill'])

const skillLabel = computed(() => {
  if (props.ready === 'ultimate') return 'Ultimate'
  if (props.ready === 'skill_lv1') return 'Skill'
  return 'Skill'
})

const chargeNeeded = computed(() => {
  if (props.skillUsed) {
    return Math.max(0, SKILL_LV1_THRESHOLD - props.charge)
  }
  if (props.charge >= SKILL_LV1_THRESHOLD) {
    return Math.max(0, ULTIMATE_THRESHOLD - props.charge)
  }
  return Math.max(0, SKILL_LV1_THRESHOLD - props.charge)
})

const nextLabel = computed(() => {
  if (props.charge >= SKILL_LV1_THRESHOLD && props.ready === 'skill_lv1') return 'Ultimate'
  return 'Skill'
})

function pipClass(i) {
  const charge = props.charge
  if (i <= charge) {
    // filled
    if (charge >= ULTIMATE_THRESHOLD) {
      return 'bg-qs-accent border-qs-accent shadow-[0_0_4px_rgba(244,200,66,0.8)]'
    }
    if (charge >= SKILL_LV1_THRESHOLD) {
      return 'bg-qs-primary border-qs-primary'
    }
    return 'bg-qs-mana border-qs-mana'
  }
  // empty
  return 'bg-transparent border-qs-border'
}
</script>
