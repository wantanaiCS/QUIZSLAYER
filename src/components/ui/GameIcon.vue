<template>
  <i
    :class="['ra', iconClass, sizeClass]"
    :style="style"
    :aria-label="alt || name"
    role="img"
  ></i>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 24 },
  color: { type: String, default: 'currentColor' },
  alt: { type: String, default: '' },
})

const iconClass = computed(() => `ra-${props.name}`)

const sizeClass = computed(() => {
  if (props.size <= 16) return 'text-base'
  if (props.size <= 20) return 'text-lg'
  if (props.size <= 24) return 'text-xl'
  if (props.size <= 28) return 'text-2xl'
  if (props.size <= 32) return 'text-3xl'
  if (props.size <= 40) return 'text-4xl'
  return 'text-5xl'
})

const style = computed(() => ({
  color: props.color !== 'currentColor' ? props.color : undefined,
}))
</script>

<style scoped>
i {
  display: inline-block;
  line-height: 1;
}
</style>
