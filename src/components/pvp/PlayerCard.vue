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
    <div v-if="items.length" class="relative">
      <div class="flex gap-1 flex-wrap">
        <button
          v-for="item in itemObjects"
          :key="item.id"
          class="item-chip"
          :class="{ 'ring-2 ring-qs-accent': previewItem?.id === item.id }"
          :disabled="!canUseItems && previewItem?.id !== item.id"
          @click="handleItemClick(item)"
        >
          {{ item.emoji }}
        </button>
      </div>

      <!-- Item info popover — appears above the chips -->
      <Transition name="pop">
        <div
          v-if="previewItem"
          class="item-popover"
          :class="previewItem.type === 'trap' ? 'border-qs-danger' : 'border-qs-success'"
        >
          <!-- close on outside click capture -->
          <div class="flex items-center gap-2 mb-1">
            <span class="text-base">{{ previewItem.emoji }}</span>
            <span class="font-bold text-qs-text text-xs flex-1">{{ previewItem.name }}</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full"
              :class="previewItem.type === 'trap'
                ? 'bg-red-900/40 text-qs-danger'
                : 'bg-green-900/40 text-qs-success'"
            >
              {{ previewItem.type === 'trap' ? '💀 Trap' : '✅ Good' }}
            </span>
            <button class="text-qs-muted text-xs ml-1 hover:text-qs-text" @click.stop="previewItem = null">✕</button>
          </div>
          <p class="text-[10px] text-qs-muted leading-relaxed mb-2">{{ previewItem.desc }}</p>
          <div v-if="canUseItems" class="flex gap-1.5">
            <button
              class="flex-1 text-[10px] py-1 rounded-lg font-bold transition-all
                     bg-qs-primary/20 border border-qs-primary text-qs-primary
                     hover:bg-qs-primary/40 active:scale-95"
              @click.stop="useItem(previewItem)"
            >
              ✅ ใช้เลย
            </button>
            <button
              class="text-[10px] py-1 px-2 rounded-lg font-bold transition-all
                     bg-qs-surface border border-qs-border text-qs-muted
                     hover:border-qs-primary"
              @click.stop="previewItem = null"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </Transition>
    </div>
    <div v-else class="text-[10px] text-qs-muted/40 italic">ไม่มีไอเทม</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PVP_ITEMS, PLAYER_COLORS } from '@/stores/pvpStore'

const props = defineProps({
  name:         { type: String,  default: 'Player' },
  color:        { type: String,  default: 'red' },
  hp:           { type: Number,  default: 20 },
  maxHp:        { type: Number,  default: 20 },
  items:        { type: Array,   default: () => [] },
  isActive:     { type: Boolean, default: false },
  canUseItems:  { type: Boolean, default: false },
  isFrozen:     { type: Boolean, default: false },
  freezeSeconds:{ type: Number,  default: 0 },
})
const emit = defineEmits(['use-item'])

const previewItem = ref(null)   // item object currently previewed in popover

const colorClass  = computed(() => PLAYER_COLORS[props.color]?.tailwind ?? '')
const nameInitial = computed(() => props.name.charAt(0).toUpperCase())
const hpPct       = computed(() => props.maxHp ? (props.hp / props.maxHp) * 100 : 0)
const hpColor     = computed(() => {
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

function handleItemClick(item) {
  // First tap → show popover. Second tap on same item → toggle off.
  if (previewItem.value?.id === item.id) {
    previewItem.value = null
  } else {
    previewItem.value = item
  }
}

function useItem(item) {
  previewItem.value = null
  emit('use-item', item.id)
}
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
         transition-all cursor-pointer
         disabled:opacity-40 disabled:cursor-not-allowed;
}
@media (hover: hover) and (pointer: fine) {
  .item-chip:not(:disabled):hover {
    @apply border-qs-primary bg-qs-card;
  }
}
.freeze-overlay {
  @apply absolute inset-0 z-10 flex items-center justify-center
         bg-blue-900/70 backdrop-blur-sm rounded-xl text-blue-200 font-pixel text-sm;
}
.is-frozen {
  @apply ring-2 ring-blue-400;
}

/* Item info popover */
.item-popover {
  @apply absolute bottom-full left-0 right-0 mb-1 z-20
         bg-qs-card border rounded-xl p-2 shadow-card;
  /* prevent overflow outside card on small screens */
  min-width: 0;
}

/* Popover transition */
.pop-enter-active, .pop-leave-active { transition: opacity 0.15s, transform 0.15s; }
.pop-enter-from, .pop-leave-to       { opacity: 0; transform: translateY(4px); }
</style>
