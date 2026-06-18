<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[999] flex items-center justify-center p-4"
        role="dialog"
        :aria-label="title"
        aria-modal="true"
        @click.self="$emit('cancel')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('cancel')"></div>

        <!-- Dialog -->
        <div class="relative card p-8 max-w-md w-full animate-bounce-in">
          <!-- Icon -->
          <div class="flex justify-center mb-4">
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center"
              :class="danger ? 'bg-qs-danger/15 text-qs-danger' : 'bg-qs-primary/15 text-qs-primary'"
            >
              <PhWarning v-if="danger" :size="28" weight="duotone" aria-hidden="true" />
              <PhQuestion v-else :size="28" weight="duotone" aria-hidden="true" />
            </div>
          </div>

          <!-- Content -->
          <h2 class="text-xl font-bold text-qs-text text-center mb-2">{{ title }}</h2>
          <p class="text-qs-muted text-sm text-center mb-8 leading-relaxed">{{ message }}</p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button class="btn-ghost flex-1" @click="$emit('cancel')">
              {{ cancel }}
            </button>
            <button
              class="flex-1"
              :class="danger ? 'btn-danger' : 'btn-primary'"
              @click="$emit('confirm')"
            >
              {{ confirm }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { PhWarning, PhQuestion } from '@phosphor-icons/vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title:      { type: String,  default: 'ยืนยัน' },
  message:    { type: String,  default: 'คุณต้องการดำเนินการต่อหรือไม่?' },
  confirm:    { type: String,  default: 'ยืนยัน' },
  cancel:     { type: String,  default: 'ยกเลิก' },
  danger:     { type: Boolean, default: false },
})

defineEmits(['confirm', 'cancel', 'update:modelValue'])
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to     { opacity: 0; }
</style>
