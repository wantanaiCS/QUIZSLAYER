<template>
  <div class="text-center">
    <div class="text-2xl font-pixel text-qs-accent mb-1">🎁 Lucky Box!</div>
    <p class="text-xs text-qs-muted mb-5">เลือก 1 การ์ด — ระวัง! บางใบอาจเป็นกับดัก</p>

    <div class="flex justify-center gap-3 mb-4">
      <button
        v-for="(card, i) in cards"
        :key="i"
        class="lucky-card"
        :class="{
          'flipped':            revealed[i],
          'trap-card':          revealed[i] && card.type === 'trap',
          'good-card':          revealed[i] && card.type === 'good',
          'cursor-not-allowed opacity-50': pickedIndex !== null && pickedIndex !== i,
          'ring-2 ring-qs-accent scale-105': pickedIndex === i && !confirmed,
        }"
        :disabled="pickedIndex !== null"
        @click="previewCard(i)"
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

    <!-- Description panel (after preview) -->
    <Transition name="fade-desc">
      <div v-if="pickedIndex !== null && !confirmed"
           class="card p-3 mb-4 text-left animate-slide-up"
           :class="cards[pickedIndex]?.type === 'trap'
             ? 'border-qs-danger bg-red-900/10'
             : 'border-qs-success bg-green-900/10'">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xl">{{ cards[pickedIndex]?.emoji }}</span>
          <span class="font-bold text-qs-text text-sm">{{ cards[pickedIndex]?.name }}</span>
          <span class="ml-auto text-xs px-2 py-0.5 rounded-full"
                :class="cards[pickedIndex]?.type === 'trap'
                  ? 'bg-red-900/40 text-qs-danger'
                  : 'bg-green-900/40 text-qs-success'">
            {{ cards[pickedIndex]?.type === 'trap' ? '💀 Trap' : '✅ Good' }}
          </span>
        </div>
        <p class="text-xs text-qs-muted leading-relaxed">{{ cards[pickedIndex]?.desc }}</p>
        <div class="flex gap-2 mt-3">
          <button class="btn-secondary text-xs flex-1 py-1.5" @click="cancelPreview">
            ← เลือกใหม่
          </button>
          <button
            class="text-xs flex-1 py-1.5 rounded-qs font-bold transition-all"
            :class="cards[pickedIndex]?.type === 'trap'
              ? 'bg-qs-danger/20 border border-qs-danger text-qs-danger hover:bg-qs-danger/30'
              : 'btn-primary'"
            @click="confirmCard"
          >
            {{ cards[pickedIndex]?.type === 'trap' ? '😬 รับ Trap!' : '✅ รับไอเทม!' }}
          </button>
        </div>
      </div>
    </Transition>

    <p v-if="confirmed || picked" class="text-xs text-qs-muted animate-pulse">กำลังดำเนินการ...</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  cards:  { type: Array,   default: () => [] },
  picked: { type: Boolean, default: false },
})
const emit = defineEmits(['pick'])

const revealed    = ref([false, false, false])
const pickedIndex = ref(null)   // index that was tapped — shows description
const confirmed   = ref(false)  // true after confirm button pressed

function previewCard(i) {
  if (props.picked || pickedIndex.value !== null) return
  revealed.value[i] = true
  pickedIndex.value = i
}

function cancelPreview() {
  if (confirmed.value) return
  // hide the card back again
  revealed.value[pickedIndex.value] = false
  pickedIndex.value = null
}

function confirmCard() {
  if (confirmed.value || pickedIndex.value === null) return
  confirmed.value = true
  emit('pick', pickedIndex.value)
}
</script>

<style scoped>
.lucky-card {
  width: 90px;
  height: 120px;
  perspective: 600px;
  position: relative;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
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

@media (hover: hover) and (pointer: fine) {
  .lucky-card:hover:not(:disabled) .card-front {
    border-color: #6c63ff;
    box-shadow: 0 0 12px rgba(108,99,255,0.4);
  }
}

.good-card .card-back { border-color: #43d98f; }
.trap-card .card-back { border-color: #ff4757; background: #1a0a0a; }

.fade-desc-enter-active, .fade-desc-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-desc-enter-from, .fade-desc-leave-to { opacity: 0; transform: translateY(4px); }
</style>
