<template>
  <div class="text-center">
    <div class="text-2xl font-pixel text-qs-accent mb-1">🎁 Lucky Box!</div>
    <p class="text-xs text-qs-muted mb-5">เลือก 1 การ์ด — ระวัง! บางใบอาจเป็นกับดัก</p>

    <div class="flex justify-center gap-3">
      <button
        v-for="(card, i) in cards"
        :key="i"
        class="lucky-card"
        :class="{
          'flipped':   revealed[i],
          'trap-card': revealed[i] && card.type === 'trap',
          'good-card': revealed[i] && card.type === 'good',
          'cursor-not-allowed opacity-50': picked && !revealed[i],
        }"
        :disabled="picked"
        @click="selectCard(i)"
      >
        <!-- Front (hidden) -->
        <div class="card-front">
          <span class="text-3xl">🎴</span>
          <span class="text-xs text-qs-muted mt-1">{{ i + 1 }}</span>
        </div>
        <!-- Back (revealed) -->
        <div class="card-back">
          <span class="text-3xl">{{ card.emoji }}</span>
          <span class="text-xs font-bold mt-1 leading-tight text-center px-1">{{ card.name }}</span>
          <span class="text-[10px] mt-0.5 px-1 leading-tight text-center"
                :class="card.type === 'trap' ? 'text-qs-danger' : 'text-qs-success'">
            {{ card.type === 'trap' ? '💀 Trap!' : '✅ Good' }}
          </span>
        </div>
      </button>
    </div>

    <p v-if="picked" class="text-xs text-qs-muted mt-4 animate-pulse">กำลังดำเนินการ...</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  cards:  { type: Array,   default: () => [] },
  picked: { type: Boolean, default: false },
})
const emit = defineEmits(['pick'])

const revealed = ref([false, false, false])

function selectCard(i) {
  if (props.picked) return
  revealed.value[i] = true
  emit('pick', i)
}
</script>

<style scoped>
.lucky-card {
  width: 90px;
  height: 120px;
  perspective: 600px;
  position: relative;
  cursor: pointer;
}
.lucky-card .card-front,
.lucky-card .card-back {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  transition: transform 0.5s;
  border: 2px solid;
}
.lucky-card .card-front {
  background: linear-gradient(135deg, #1e1e3a, #2d2b55);
  border-color: rgba(108,99,255,0.4);
  transform: rotateY(0deg);
}
.lucky-card .card-back {
  background: #0d0f1a;
  transform: rotateY(180deg);
}
.lucky-card.flipped .card-front { transform: rotateY(-180deg); }
.lucky-card.flipped .card-back  { transform: rotateY(0deg);   }

.lucky-card:hover:not(:disabled) .card-front {
  border-color: #6c63ff;
  box-shadow: 0 0 12px rgba(108,99,255,0.4);
}
.good-card .card-back { border-color: #43d98f; }
.trap-card .card-back { border-color: #ff4757; background: #1a0a0a; }
</style>
