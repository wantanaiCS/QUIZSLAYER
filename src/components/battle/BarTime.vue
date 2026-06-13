<template>
  <div class="px-3 py-1.5 flex flex-col gap-1">
    <!-- Hero bar -->
    <div class="flex items-center gap-2">
      <span class="text-[9px] font-pixel text-qs-primary w-10 flex-shrink-0 text-right leading-none">HERO</span>
      <div class="flex-1 bar-container h-2.5 bg-qs-bg border-0 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full relative overflow-hidden transition-none"
          :class="playerBarClass"
          :style="{ width: clamp(playerProgress) + '%' }"
        >
          <span class="absolute inset-0 bg-white/15 animate-[barShimmer_1.2s_linear_infinite]"></span>
        </div>
      </div>
      <span
        class="text-[9px] font-pixel w-6 flex-shrink-0 text-center transition-colors"
        :class="streak >= 5 ? 'text-qs-accent' : streak >= 3 ? 'text-qs-primary' : 'text-qs-muted'"
      >
        {{ speedLabel }}
      </span>
    </div>

    <!-- Monster bar -->
    <div class="flex items-center gap-2">
      <span class="text-[9px] font-pixel text-qs-danger w-10 flex-shrink-0 text-right leading-none">MOB</span>
      <div class="flex-1 bar-container h-2.5 bg-qs-bg border-0 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-none"
          :class="monsterBarClass"
          :style="{ width: clamp(monsterProgress) + '%' }"
        ></div>
      </div>
      <span class="text-[9px] font-pixel w-6 flex-shrink-0"></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  playerProgress:  { type: Number, required: true },
  monsterProgress: { type: Number, required: true },
  streak:          { type: Number, default: 0 },
})

function clamp(v) { return Math.max(0, Math.min(100, v)) }

const playerBarClass = computed(() => {
  if (props.playerProgress >= 100) return 'bg-qs-accent shadow-[0_0_8px_rgba(244,200,66,0.7)]'
  if (props.streak >= 5)           return 'bg-qs-accent'
  if (props.streak >= 3)           return 'bg-qs-primary'
  return 'bg-qs-success'
})

const monsterBarClass = computed(() => {
  if (props.monsterProgress >= 90) return 'bg-qs-danger shadow-[0_0_8px_rgba(255,71,87,0.6)]'
  if (props.monsterProgress >= 60) return 'bg-qs-warning'
  return 'bg-qs-danger/70'
})

const speedLabel = computed(() => {
  if (props.streak >= 5) return '↑↑'
  if (props.streak >= 3) return '↑'
  return ''
})
</script>

<style scoped>
@keyframes barShimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
</style>
