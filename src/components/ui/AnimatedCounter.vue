<template>
  <span>{{ prefix }}{{ displayValue }}{{ suffix }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  value:    { type: Number, required: true },
  duration: { type: Number, default: 600 },
  prefix:   { type: String, default: '' },
  suffix:   { type: String, default: '' },
  decimals: { type: Number, default: 0 },
})

const displayValue = ref(0)
let animFrame = null

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function animateTo(target) {
  if (animFrame) cancelAnimationFrame(animFrame)
  const start = displayValue.value
  const diff = target - start
  if (diff === 0) return

  const startTime = performance.now()

  function step(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    const eased = easeOutCubic(progress)
    const raw = start + diff * eased
    displayValue.value = props.decimals > 0
      ? parseFloat(raw.toFixed(props.decimals))
      : Math.round(raw)
    if (progress < 1) {
      animFrame = requestAnimationFrame(step)
    } else {
      displayValue.value = target
    }
  }

  animFrame = requestAnimationFrame(step)
}

onMounted(() => animateTo(props.value))
watch(() => props.value, (val) => animateTo(val))
</script>
