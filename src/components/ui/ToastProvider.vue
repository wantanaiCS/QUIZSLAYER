<template>
  <Teleport to="body">
    <div
      class="fixed top-16 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="toast-slide">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto"
        >
          <ToastItem :toast="t" @remove="remove" />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
import ToastItem from './ToastItem.vue'

const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-leave-active {
  transition: all 0.25s ease-in;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(110%);
}
.toast-slide-move {
  transition: transform 0.3s ease;
}
</style>
