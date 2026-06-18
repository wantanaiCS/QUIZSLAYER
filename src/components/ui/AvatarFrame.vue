<template>
  <div class="relative inline-flex flex-shrink-0" :class="sizeClass">
    <!-- Avatar circle -->
    <div
      class="rounded-full flex items-center justify-center font-bold select-none w-full h-full"
      :class="[fontSizeClass, rank ? 'ring-2 ring-offset-1 ring-offset-qs-bg' : '']"
      :style="{ background: gradientStyle }"
      :class_rank="rankRingClass"
      style_extra=""
      :aria-label="name"
    >
      <span class="text-white">{{ initial }}</span>
    </div>

    <!-- Online indicator -->
    <span
      v-if="online"
      class="absolute bottom-0 right-0 rounded-full bg-qs-success border-2 border-qs-bg"
      :class="onlineDotSize"
      aria-label="Online"
    ></span>

    <!-- Rank ring badge -->
    <span
      v-if="rank"
      class="absolute -top-1 -right-1 rounded-full text-[8px] font-pixel flex items-center justify-center border border-qs-bg"
      :class="rankBadgeClass"
      style="min-width:16px; min-height:16px;"
    >{{ rank }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { AVATAR_GRADIENTS } from '@/lib/avatarGradients'

const props = defineProps({
  name:   { type: String,  default: '?' },
  color:  { type: String,  default: 'purple' },
  size:   { type: String,  default: 'md' },
  rank:   { type: String,  default: null },
  online: { type: Boolean, default: false },
})

const initial = computed(() => (props.name || '?').charAt(0).toUpperCase())

const gradientStyle = computed(() => {
  const colors = AVATAR_GRADIENTS[props.color] ?? AVATAR_GRADIENTS.purple
  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
})

const sizeClass = computed(() => ({
  sm: 'w-8  h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
}[props.size] ?? 'w-10 h-10'))

const fontSizeClass = computed(() => ({
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-xl',
  xl: 'text-3xl',
}[props.size] ?? 'text-sm'))

const onlineDotSize = computed(() => ({
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
}[props.size] ?? 'w-2.5 h-2.5'))

const rankRingClass = computed(() => {
  const map = {
    S: 'ring-qs-rank-s',
    A: 'ring-qs-rank-a',
    B: 'ring-qs-rank-b',
    C: 'ring-qs-rank-c',
  }
  return map[props.rank] ?? 'ring-qs-primary'
})

const rankBadgeClass = computed(() => {
  const map = {
    S: 'bg-qs-rank-s text-gray-900',
    A: 'bg-qs-rank-a text-white',
    B: 'bg-qs-rank-b text-white',
    C: 'bg-qs-rank-c text-white',
  }
  return map[props.rank] ?? 'bg-qs-primary text-white'
})
</script>
