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
    <button v-if="ready !== 'none'" class="btn-gold !px-3 !py-1.5 text-xs" @click="$emit('use-skill')">
      {{ ready === 'ultimate' ? 'ใช้ Ultimate' : 'ใช้ Skill' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  streak: { type: Number, required: true },
  gauge: { type: Number, required: true },
  ready: { type: String, default: 'none' }
})

defineEmits(['use-skill'])
</script>
