<template>
  <div class="flex flex-col gap-1 items-end">
    <div class="flex items-center gap-2 h-4">
      <span v-if="streak > 0" class="streak-badge animate-bounce-in">{{ streak }} Combo!</span>
      <span v-if="streak >= 3" class="text-xs font-bold" :class="streak >= 5 ? 'text-qs-accent' : 'text-qs-mana'">
        {{ streak >= 5 ? 'Ultimate Ready' : 'Skill Ready' }}
      </span>
    </div>
    <div class="bar-container h-2 w-32 bg-qs-surface border-0 opacity-90">
      <div 
        class="bar-fill mana-bar"
        :style="{ width: gauge + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  streak: { type: Number, required: true },
  gauge: { type: Number, required: true } // 0 to 100
})
</script>
