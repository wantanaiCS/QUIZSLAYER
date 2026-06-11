<template>
  <div class="bar-container h-2 w-full mt-1 opacity-80 border-0 bg-qs-surface">
    <div 
      class="bar-fill time-bar transition-none"
      :style="{ width: progress + '%' }"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  progress: { type: Number, required: true } // 0 to 100
})
</script>
