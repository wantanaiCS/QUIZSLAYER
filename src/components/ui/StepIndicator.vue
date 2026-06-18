<template>
  <div class="flex items-center justify-center gap-0" role="list" :aria-label="'Steps: ' + steps.join(', ')">
    <template v-for="(step, i) in steps" :key="i">
      <!-- Step -->
      <div class="flex items-center gap-2" role="listitem">
        <!-- Circle -->
        <div
          class="relative w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 flex-shrink-0"
          :class="[
            i < current  ? 'bg-qs-success text-white shadow-[0_0_10px_rgba(67,217,143,0.4)]' : '',
            i === current ? 'bg-qs-primary text-white shadow-qs-glow ring-2 ring-qs-primary/30' : '',
            i > current  ? 'bg-qs-surface border border-qs-border text-qs-muted' : '',
          ]"
          :aria-current="i === current ? 'step' : undefined"
        >
          <PhCheckCircle v-if="i < current" :size="16" weight="fill" aria-hidden="true" />
          <span v-else>{{ i + 1 }}</span>
        </div>

        <!-- Label -->
        <span
          class="text-xs font-medium transition-colors duration-200 hidden sm:block"
          :class="i === current ? 'text-qs-text' : i < current ? 'text-qs-success' : 'text-qs-muted'"
        >
          {{ step }}
        </span>
      </div>

      <!-- Connector line -->
      <div
        v-if="i < steps.length - 1"
        class="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-qs-border max-w-16 min-w-6"
        aria-hidden="true"
      >
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="i < current ? 'bg-qs-success w-full' : 'w-0'"
        ></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { PhCheckCircle } from '@phosphor-icons/vue'

defineProps({
  steps:   { type: Array,  required: true },
  current: { type: Number, default: 0 },
})
</script>
