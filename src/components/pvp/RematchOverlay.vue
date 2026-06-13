<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-qs-bg/90 backdrop-blur-sm">
    <div class="card p-6 w-full max-w-md mx-4 animate-slide-up space-y-4">

      <!-- Result Banner -->
      <div class="text-center">
        <div class="text-5xl mb-2">{{ iWon ? '🏆' : '💀' }}</div>
        <h2 class="text-xl font-bold mb-1" :class="iWon ? 'text-qs-success' : 'text-qs-danger'">
          {{ iWon ? 'ชนะแล้ว!' : 'แพ้แล้ว...' }}
        </h2>
        <p class="text-xs text-qs-muted">{{ pvp.myName }} {{ pvp.myHp }} HP เหลือ</p>
      </div>

      <!-- ─── Host controls ──────────────────────────────────────────────── -->
      <template v-if="pvp.isHost && !pvp.rematchVoteHost">

        <!-- Quiz Set picker -->
        <div>
          <p class="text-xs text-qs-muted mb-2 font-bold">📚 ชุดข้อสอบ</p>
          <div class="space-y-1 max-h-36 overflow-y-auto pr-1">
            <button
              v-for="set in availableSets"
              :key="set.id"
              class="w-full text-left px-3 py-2 rounded-qs border text-sm transition-all"
              :class="pickedQuizId === set.id
                ? 'border-qs-primary bg-qs-primary/10 text-qs-text'
                : 'border-qs-border bg-qs-surface text-qs-muted hover:border-qs-primary/50'"
              @click="pickedQuizId = set.id"
            >
              <span class="font-bold">{{ set.title }}</span>
              <span class="text-qs-muted text-xs ml-2">{{ set.questions?.[0]?.count ?? 0 }} ข้อ</span>
            </button>
          </div>
        </div>

        <!-- Bg Theme picker -->
        <div>
          <p class="text-xs text-qs-muted mb-2 font-bold">🌄 พื้นหลัง</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="bg in bgOptions"
              :key="bg.id"
              class="px-2 py-2 rounded-qs border text-xs font-bold transition-all text-center"
              :class="pickedBg === bg.id
                ? 'border-qs-primary bg-qs-primary/10 text-qs-text'
                : 'border-qs-border bg-qs-surface text-qs-muted hover:border-qs-primary/50'"
              @click="pickedBg = bg.id"
            >
              <div class="text-base">{{ bg.label.split(' ')[0] }}</div>
              <div class="text-[10px] text-qs-muted">{{ bg.desc }}</div>
            </button>
          </div>
        </div>

        <div class="flex gap-2">
          <button class="btn-secondary flex-1 text-sm" @click="$emit('leave')">🚪 ออก</button>
          <button
            class="btn-primary flex-1 text-sm"
            :disabled="!pickedQuizId"
            @click="handleHostRematch"
          >🔄 รีแมท!</button>
        </div>
      </template>

      <!-- ─── Host waiting ───────────────────────────────────────────────── -->
      <template v-else-if="pvp.isHost && pvp.rematchVoteHost">
        <p class="text-center text-sm text-qs-muted animate-pulse py-4">
          ⏳ รอ {{ pvp.oppName }} ยืนยัน...
        </p>
        <button class="btn-secondary w-full text-sm" @click="$emit('leave')">🚪 ออก</button>
      </template>

      <!-- ─── Guest controls ────────────────────────────────────────────── -->
      <template v-else-if="!pvp.isHost">
        <div class="text-center py-2">
          <template v-if="!pvp.rematchVoteHost">
            <p class="text-xs text-qs-muted animate-pulse mb-4">⏳ รอ Host เลือกตัวเลือก...</p>
          </template>
          <template v-else>
            <div class="mb-3 p-3 bg-qs-surface border border-qs-border rounded-qs text-left space-y-1">
              <p class="text-xs text-qs-muted">Host เลือกแล้ว:</p>
              <p class="text-sm font-bold text-qs-text">📚 {{ pendingQuizTitle }}</p>
              <p class="text-sm font-bold text-qs-text">🌄 {{ pendingBgLabel }}</p>
            </div>
            <p class="text-xs text-qs-muted mb-3">ยืนยันรีแมทไหม?</p>
          </template>
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary flex-1 text-sm" @click="$emit('leave')">🚪 ออก</button>
          <button
            class="btn-primary flex-1 text-sm"
            :disabled="!pvp.rematchVoteHost || pvp.rematchVoteGuest"
            @click="$emit('guest-rematch')"
          >
            <span v-if="pvp.rematchVoteGuest" class="animate-pulse">⏳ รอ Host...</span>
            <span v-else>✅ ยืนยัน!</span>
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePvpStore }   from '@/stores/pvpStore'
import { useQuizStore }  from '@/stores/quizStore'
import { useAuthStore }  from '@/stores/authStore'
import { PVP_BG_OPTIONS } from '@/lib/phaser/PvPScene'

const props = defineProps({
  iWon: { type: Boolean, default: false },
})
const emit = defineEmits(['host-rematch', 'guest-rematch', 'leave'])

const pvp       = usePvpStore()
const quizStore = useQuizStore()
const authStore = useAuthStore()

const pickedQuizId = ref(quizStore.activeSet?.id ?? null)
const pickedBg     = ref(pvp.bgTheme ?? 'arena')

const bgOptions = PVP_BG_OPTIONS

const availableSets = computed(() => {
  const userId = authStore.user?.id
  const seen = new Set()
  return quizStore.quizSets.filter(s => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return s.is_public || s.author_id === userId
  })
})

const pendingQuizTitle = computed(() => {
  // Guest sees what host already broadcast via state_sync
  return quizStore.quizSets.find(s => s.id === pickedQuizId.value)?.title ?? 'ชุดเดิม'
})

const pendingBgLabel = computed(() =>
  bgOptions.find(b => b.id === pickedBg.value)?.label ?? pickedBg.value
)

async function handleHostRematch() {
  if (!pickedQuizId.value) return
  const fullSet = await quizStore.loadQuizSet(pickedQuizId.value)
  emit('host-rematch', {
    questions: fullSet?.questions ?? pvp.allQuestions,
    bgTheme:   pickedBg.value,
  })
}
</script>
