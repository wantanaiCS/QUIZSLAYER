<template>
  <div class="text-center">
    <p class="text-xs font-pixel text-qs-accent mb-4 animate-pulse">✊ เป่ายิ้งฉุบ — ใครชนะได้ตอบก่อน!</p>

    <!-- My pick area -->
    <div v-if="!myPick" class="flex justify-center gap-4 mb-4">
      <button
        v-for="opt in options"
        :key="opt.id"
        class="rps-btn text-4xl"
        :class="{ 'ring-2 ring-qs-primary': myPick === opt.id }"
        @click="$emit('pick', opt.id)"
      >
        {{ opt.emoji }}
        <span class="block text-[10px] text-qs-muted mt-1">{{ opt.label }}</span>
      </button>
    </div>

    <!-- Waiting -->
    <div v-else-if="!result" class="py-6">
      <div class="text-5xl mb-3 animate-bounce">{{ pickedEmoji }}</div>
      <p class="text-sm text-qs-muted animate-pulse">รอคู่แข่ง...</p>
    </div>

    <!-- Result reveal -->
    <div v-else class="py-4">
      <div class="flex justify-center items-center gap-8 mb-4">
        <div class="text-center">
          <div class="text-4xl mb-1">{{ emojiOf(hostChoice) }}</div>
          <p class="text-xs text-qs-muted">{{ hostName }}</p>
        </div>
        <div class="text-2xl font-pixel text-qs-accent">VS</div>
        <div class="text-center">
          <div class="text-4xl mb-1">{{ emojiOf(guestChoice) }}</div>
          <p class="text-xs text-qs-muted">{{ guestName }}</p>
        </div>
      </div>
      <p class="font-pixel text-base" :class="resultColor">{{ resultText }}</p>
      <p v-if="result === 'draw'" class="text-xs text-qs-muted mt-2 animate-pulse">กำลังรีเซ็ต...</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  myPick:     { type: String,  default: null },
  hostChoice: { type: String,  default: null },
  guestChoice:{ type: String,  default: null },
  result:     { type: String,  default: null }, // 'host_win'|'guest_win'|'draw'
  isHost:     { type: Boolean, default: true },
  hostName:   { type: String,  default: 'Host' },
  guestName:  { type: String,  default: 'Guest' },
})
defineEmits(['pick'])

const options = [
  { id: 'rock',     emoji: '✊', label: 'ค้อน' },
  { id: 'scissors', emoji: '✌️', label: 'กรรไกร' },
  { id: 'paper',    emoji: '🖐️', label: 'กระดาษ' },
]

const emojiMap = { rock: '✊', scissors: '✌️', paper: '🖐️' }

const pickedEmoji = computed(() => emojiMap[props.myPick] ?? '❓')

function emojiOf(c) { return emojiMap[c] ?? '❓' }

const resultText = computed(() => {
  if (props.result === 'draw') return '🤝 เสมอ! เป่าใหม่อีกครั้ง...'
  const winnerName = props.result === 'host_win' ? props.hostName : props.guestName
  const isMe = (props.isHost && props.result === 'host_win') ||
               (!props.isHost && props.result === 'guest_win')
  return isMe ? `🎉 คุณชนะ! ได้ตอบก่อน` : `${winnerName} ชนะ → ได้ตอบก่อน`
})

const resultColor = computed(() => {
  if (props.result === 'draw') return 'text-qs-accent'
  const isMe = (props.isHost && props.result === 'host_win') ||
               (!props.isHost && props.result === 'guest_win')
  return isMe ? 'text-qs-success' : 'text-qs-danger'
})
</script>

<style scoped>
.rps-btn {
  @apply flex flex-col items-center justify-center w-20 h-20 rounded-xl
         bg-qs-surface border-2 border-qs-border cursor-pointer
         hover:border-qs-primary hover:bg-qs-card transition-all duration-150
         active:scale-95;
}
</style>
