<template>
  <i
    :class="['ra', iconClass]"
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
  className: { type: String, default: '' },
})

const iconClass = computed(() => `ra-${props.name}`)

const style = computed(() => ({
  color: props.color !== 'currentColor' ? props.color : undefined,
  fontSize: `${props.size}px`,
  display: 'inline-block',
  lineHeight: 1,
}))
</script>

<style scoped>
i {
  display: inline-block;
  line-height: 1;
}
</style>
