<template>
  <div class="player-card" :class="[colorClass, { 'is-active': isActive, 'is-frozen': isFrozen }]">
    <!-- Freeze overlay -->
    <div v-if="isFrozen" class="freeze-overlay">
      🧊 {{ freezeSeconds }}s
    </div>

    <!-- Header -->
    <div class="flex items-center gap-2 mb-2">
      <div class="avatar" :class="colorClass">{{ nameInitial }}</div>
      <div class="flex-1 min-w-0">
        <div class="text-xs font-bold text-qs-text truncate">{{ name }}</div>
        <div class="text-[10px] text-qs-muted">{{ isActive ? '⚔️ ตาของคุณ' : '⏳ รอ...' }}</div>
      </div>
      <!-- Active turn glow badge -->
      <div v-if="isActive" class="w-2 h-2 rounded-full bg-qs-success animate-pulse flex-shrink-0"></div>
    </div>

    <!-- HP Bar -->
    <div class="flex items-center gap-2 mb-2">
      <span class="text-[10px] text-qs-muted w-5">❤️</span>
      <div class="flex-1 h-2 bg-qs-bg rounded-full overflow-hidden border border-qs-border">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="hpColor"
          :style="{ width: hpPct + '%' }"
        ></div>
      </div>
      <span class="text-[10px] font-bold w-8 text-right" :class="hpTextColor">{{ hp }}/{{ maxHp }}</span>
    </div>

    <!-- Items -->
    <div v-if="items.length" class="flex gap-1 flex-wrap">
      <button
        v-for="item in itemObjects"
        :key="item.id"
        class="item-chip"
        :title="item.name + ': ' + item.desc"
        :disabled="!canUseItems"
        @click="canUseItems && $emit('use-item', item.id)"
      >
        {{ item.emoji }}
      </button>
    </div>
    <div v-else class="text-[10px] text-qs-muted/40 italic">ไม่มีไอเทม</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PVP_ITEMS, PLAYER_COLORS } from '@/stores/pvpStore'

const props = defineProps({
  name:        { type: String,  default: 'Player' },
  color:       { type: String,  default: 'red' },
  hp:          { type: Number,  default: 20 },
  maxHp:       { type: Number,  default: 20 },
  items:       { type: Array,   default: () => [] },
  isActive:    { type: Boolean, default: false },
  canUseItems: { type: Boolean, default: false },
  isFrozen:    { type: Boolean, default: false },
  freezeSeconds:{ type: Number, default: 0 },
})
defineEmits(['use-item'])

const colorClass = computed(() => PLAYER_COLORS[props.color]?.tailwind ?? '')
const nameInitial = computed(() => props.name.charAt(0).toUpperCase())
const hpPct = computed(() => props.maxHp ? (props.hp / props.maxHp) * 100 : 0)
const hpColor = computed(() => {
  if (hpPct.value > 50) return 'bg-qs-success'
  if (hpPct.value > 25) return 'bg-yellow-400'
  return 'bg-qs-danger'
})
const hpTextColor = computed(() => {
  if (hpPct.value > 50) return 'text-qs-success'
  if (hpPct.value > 25) return 'text-yellow-400'
  return 'text-qs-danger'
})
const itemObjects = computed(() =>
  props.items.map(id => PVP_ITEMS.find(i => i.id === id)).filter(Boolean)
)
</script>

<style scoped>
.player-card {
  @apply relative card p-3 rounded-xl transition-all duration-300;
}
.player-card.is-active {
  box-shadow: 0 0 0 2px currentColor, 0 0 16px rgba(255,255,255,0.1);
}
.avatar {
  @apply w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0;
}
.item-chip {
  @apply text-lg w-8 h-8 rounded-lg bg-qs-surface border border-qs-border
         hover:border-qs-primary hover:bg-qs-card transition-all cursor-pointer
         disabled:opacity-40 disabled:cursor-not-allowed;
}
.freeze-overlay {
  @apply absolute inset-0 z-10 flex items-center justify-center
         bg-blue-900/70 backdrop-blur-sm rounded-xl text-blue-200 font-pixel text-sm;
}
.is-frozen {
  @apply ring-2 ring-blue-400;
}
</style>
