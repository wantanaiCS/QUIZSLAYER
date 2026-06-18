<template>
  <div
    class="card-achievement"
    :class="unlocked ? 'unlocked' : 'locked'"
    :title="badge.desc"
  >
    <!-- Icon -->
    <div
      class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
      :class="unlocked ? 'bg-qs-primary/20 text-qs-gold' : 'bg-qs-surface text-qs-border'"
      :style="unlocked ? 'filter: drop-shadow(0 0 8px rgba(244,200,66,0.4))' : ''"
    >
      <PhMedal :size="24" weight="duotone" :aria-hidden="true" />
    </div>

    <!-- Name -->
    <p class="text-xs font-bold text-qs-text leading-snug text-center">{{ badge.name }}</p>
    <p class="text-[10px] text-qs-muted text-center leading-tight">{{ badge.desc }}</p>

    <!-- Progress bar (locked) -->
    <template v-if="!unlocked && progress">
      <div class="w-full mt-1">
        <div class="bar-container h-1">
          <div
            class="h-full rounded-full bg-qs-primary transition-all duration-500"
            :style="{ width: progressPct + '%' }"
          ></div>
        </div>
        <p class="text-[9px] text-qs-muted text-center mt-0.5">{{ progress.current }}/{{ progress.target }}</p>
      </div>
    </template>

    <!-- Unlocked badge -->
    <PhCheckCircle v-if="unlocked" :size="14" weight="fill" class="text-qs-success absolute top-2 right-2" aria-hidden="true" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PhMedal, PhCheckCircle } from '@phosphor-icons/vue'

const props = defineProps({
  badge:    { type: Object,  required: true },
  unlocked: { type: Boolean, default: false },
  progress: { type: Object,  default: null  },  // { current, target }
})

const progressPct = computed(() => {
  if (!props.progress) return 0
  const { current, target } = props.progress
  return target > 0 ? Math.round((current / target) * 100) : 0
})
</script>
