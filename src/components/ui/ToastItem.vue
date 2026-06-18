<template>
  <div
    class="toast-item flex items-start gap-3 px-4 py-3 rounded-qs border shadow-card min-w-[280px] max-w-sm"
    :class="typeClasses"
    role="alert"
  >
    <!-- Icon -->
    <component :is="iconComponent" :size="18" weight="fill" class="flex-shrink-0 mt-0.5" aria-hidden="true" />

    <!-- Message -->
    <p class="flex-1 text-sm leading-snug">{{ toast.message }}</p>

    <!-- Dismiss -->
    <button
      class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      aria-label="ปิด"
      @click="$emit('remove', toast.id)"
    >
      <PhX :size="14" weight="bold" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  PhCheckCircle,
  PhWarning,
  PhXCircle,
  PhInfo,
  PhX,
} from '@phosphor-icons/vue'

const props = defineProps({
  toast: { type: Object, required: true },
})
defineEmits(['remove'])

const typeClasses = computed(() => {
  const map = {
    success: 'bg-green-950/80  border-qs-success/40  text-qs-success',
    error:   'bg-red-950/80    border-qs-danger/40   text-qs-danger',
    warning: 'bg-amber-950/80  border-qs-warning/40  text-qs-warning',
    info:    'bg-qs-depth-4    border-qs-primary/40  text-qs-indigo',
  }
  return map[props.toast.type] ?? map.info
})

const iconComponent = computed(() => {
  const map = {
    success: PhCheckCircle,
    error:   PhXCircle,
    warning: PhWarning,
    info:    PhInfo,
  }
  return map[props.toast.type] ?? PhInfo
})
</script>
