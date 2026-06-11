<template>
  <div class="flex items-center gap-2">
    <div class="font-bold text-sm min-w-[30px] text-right" :class="colorClass">
      {{ hp }}
    </div>
    <div class="bar-container h-4 w-48">
      <div 
        class="bar-fill" 
        :class="barClass" 
        :style="{ width: pct + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  hp: { type: Number, required: true },
  maxHp: { type: Number, required: true },
  isPlayer: { type: Boolean, default: false }
})

const pct = computed(() => props.maxHp > 0 ? (props.hp / props.maxHp) * 100 : 0)

const colorClass = computed(() => {
  if (!props.isPlayer) return 'text-qs-danger'
  if (pct.value > 50) return 'text-hp-high'
  if (pct.value > 25) return 'text-hp-mid'
  return 'text-hp-low'
})

const barClass = computed(() => {
  if (!props.isPlayer) return 'bg-qs-danger'
  if (pct.value > 50) return 'hp-bar-high'
  if (pct.value > 25) return 'hp-bar-mid'
  return 'hp-bar-low'
})
</script>
