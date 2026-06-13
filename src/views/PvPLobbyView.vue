<template>
  <div class="max-w-lg mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-qs-text mb-1">⚔️ PvP Battle</h1>
      <p class="text-qs-muted text-sm">แข่งตอบคำถามกับเพื่อน คนละเครื่อง</p>
    </div>

    <!-- Mode select -->
    <div v-if="mode === 'select'" class="space-y-3 animate-slide-up">
      <button class="card-hover p-5 w-full text-left flex items-center gap-4" @click="mode = 'create'">
        <span class="text-3xl">🏠</span>
        <div>
          <div class="font-bold text-qs-text">สร้างห้อง</div>
          <div class="text-qs-muted text-sm">เป็น Host เลือกชุดข้อสอบแล้วแชร์โค้ด</div>
        </div>
      </button>
      <button class="card-hover p-5 w-full text-left flex items-center gap-4" @click="mode = 'join'">
        <span class="text-3xl">🚪</span>
        <div>
          <div class="font-bold text-qs-text">เข้าห้อง</div>
          <div class="text-qs-muted text-sm">กรอกโค้ด 6 หลักจากเพื่อน</div>
        </div>
      </button>
    </div>

    <!-- Create room -->
    <div v-else-if="mode === 'create'" class="animate-slide-up">
      <button class="btn-secondary text-xs mb-6" @click="mode = 'select'">← กลับ</button>

      <!-- Step 1: เลือก quiz -->
      <div v-if="createStep === 1">
        <h2 class="font-bold text-qs-text mb-4">1. เลือกชุดข้อสอบ</h2>
        <div v-if="isLoadingSets" class="space-y-2">
          <div v-for="n in 3" :key="n" class="card p-4 animate-pulse h-14"></div>
        </div>
        <div v-else class="space-y-2 mb-4">
          <div
            v-for="set in availableSets"
            :key="set.id"
            class="card-hover p-4 cursor-pointer flex justify-between items-center"
            :class="{ 'border-qs-primary': selectedSet?.id === set.id }"
            @click="selectedSet = set"
          >
            <div>
              <div class="font-bold text-qs-text text-sm">{{ set.title }}</div>
              <div class="text-qs-muted text-xs">{{ set.questions?.[0]?.count ?? 0 }} ข้อ</div>
            </div>
            <span v-if="selectedSet?.id === set.id" class="text-qs-primary">✓</span>
          </div>
        </div>
        <button class="btn-primary w-full" :disabled="!selectedSet" @click="createStep = 2">
          ถัดไป →
        </button>
      </div>

      <!-- Step 2: เลือกสี + พื้นหลัง -->
      <div v-else-if="createStep === 2">
        <h2 class="font-bold text-qs-text mb-3">2. เลือกสีตัวละคร</h2>
        <div class="grid grid-cols-2 gap-2 mb-4">
          <button
            v-for="(cfg, key) in PLAYER_COLORS"
            :key="key"
            class="p-3 rounded-xl border-2 transition-all font-bold text-sm"
            :class="[cfg.tailwind, selectedColor === key ? 'scale-95 ring-2 ring-white/30' : 'opacity-70']"
            @click="selectedColor = key"
          >
            {{ cfg.label }}
          </button>
        </div>

        <h2 class="font-bold text-qs-text mb-3">🌄 พื้นหลัง</h2>
        <div class="grid grid-cols-3 gap-2 mb-4">
          <button
            v-for="bg in bgOptions"
            :key="bg.id"
            class="p-2 rounded-xl border-2 transition-all text-center"
            :class="selectedBg === bg.id
              ? 'border-qs-primary bg-qs-primary/10 scale-95'
              : 'border-qs-border bg-qs-surface opacity-70 hover:opacity-100'"
            @click="selectedBg = bg.id"
          >
            <div class="text-xl">{{ bg.label.split(' ')[0] }}</div>
            <div class="text-[10px] text-qs-muted mt-0.5">{{ bg.desc }}</div>
          </button>
        </div>

        <button class="btn-primary w-full" @click="handleCreate">
          <span v-if="pvp.loadingRoom" class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            กำลังสร้างห้อง...
          </span>
          <span v-else>🏠 สร้างห้อง</span>
        </button>
      </div>

      <!-- Waiting room (after created) -->
      <div v-else-if="createStep === 3" class="text-center">
        <div class="card p-6 mb-4">
          <p class="text-qs-muted text-sm mb-2">โค้ดห้อง</p>
          <div class="font-pixel text-4xl text-qs-accent tracking-widest mb-3">{{ pvp.roomCode }}</div>
          <button class="btn-secondary text-xs" @click="copyCode">
            {{ copied ? '✅ คัดลอกแล้ว' : '📋 คัดลอก' }}
          </button>
        </div>

        <div class="card p-4 mb-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-qs-success"></div>
              <span class="text-sm text-qs-text">{{ pvp.hostName }}</span>
              <span class="text-xs text-qs-muted">(คุณ)</span>
            </div>
            <span class="text-xs" :class="PLAYER_COLORS[pvp.hostColor]?.tailwind">{{ pvp.hostColor }}</span>
          </div>
          <div class="flex justify-between items-center mt-2">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" :class="pvp.guestId ? 'bg-qs-success' : 'bg-qs-border animate-pulse'"></div>
              <span class="text-sm text-qs-muted">{{ pvp.guestId ? pvp.guestName : 'รอเพื่อนเข้าห้อง...' }}</span>
            </div>
          </div>
        </div>

        <button
          class="btn-primary w-full"
          :disabled="!pvp.guestId"
          @click="handleStartGame"
        >
          {{ pvp.guestId ? '⚔️ เริ่มเกม!' : 'รอเพื่อนเข้าร่วม...' }}
        </button>
      </div>
    </div>

    <!-- Join room -->
    <div v-else-if="mode === 'join'" class="animate-slide-up">
      <button class="btn-secondary text-xs mb-6" @click="mode = 'select'">← กลับ</button>

      <div v-if="!pvp.roomCode">
        <h2 class="font-bold text-qs-text mb-4">กรอกโค้ดห้อง</h2>
        <input
          v-model="joinCode"
          maxlength="6"
          placeholder="ABC123"
          class="w-full bg-qs-surface border border-qs-border rounded-qs px-4 py-3 text-center font-pixel text-2xl text-qs-accent tracking-widest mb-4 uppercase focus:outline-none focus:border-qs-primary"
          @input="joinCode = joinCode.toUpperCase()"
        />

        <h2 class="font-bold text-qs-text mb-3">เลือกสีตัวละคร</h2>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <button
            v-for="(cfg, key) in PLAYER_COLORS"
            :key="key"
            class="p-4 rounded-xl border-2 transition-all font-bold text-sm"
            :class="[cfg.tailwind, selectedColor === key ? 'scale-95 ring-2 ring-white/30' : 'opacity-70']"
            @click="selectedColor = key"
          >
            {{ cfg.label }}
          </button>
        </div>

        <p v-if="pvp.error" class="text-qs-danger text-sm mb-3 text-center">{{ pvp.error }}</p>

        <button
          class="btn-primary w-full"
          :disabled="joinCode.length < 6 || pvp.loadingRoom"
          @click="handleJoin"
        >
          <span v-if="pvp.loadingRoom" class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            กำลังเข้าห้อง...
          </span>
          <span v-else>🚪 เข้าห้อง</span>
        </button>
      </div>

      <!-- Guest waiting room -->
      <div v-else class="text-center">
        <div class="card p-6 mb-4">
          <p class="text-qs-muted text-sm mb-1">ห้อง</p>
          <div class="font-pixel text-3xl text-qs-accent tracking-widest">{{ pvp.roomCode }}</div>
        </div>
        <div class="card p-4 mb-4">
          <div class="flex justify-between">
            <span class="text-sm text-qs-muted">Host: {{ pvp.hostName }}</span>
            <span class="text-sm text-qs-muted">คุณ: {{ pvp.guestName }}</span>
          </div>
        </div>
        <p class="text-qs-muted text-sm animate-pulse">รอ Host เริ่มเกม...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePvpStore, PLAYER_COLORS } from '@/stores/pvpStore'
import { useQuizStore } from '@/stores/quizStore'
import { useAuthStore } from '@/stores/authStore'
import { watch } from 'vue'
import { PVP_BG_OPTIONS } from '@/lib/phaser/PvPScene'

const router    = useRouter()
const pvp       = usePvpStore()
const quizStore = useQuizStore()
const authStore = useAuthStore()

const mode          = ref('select')
const createStep    = ref(1)
const selectedSet   = ref(null)
const selectedColor = ref('red')
const selectedBg    = ref('arena')
const joinCode      = ref('')
const copied        = ref(false)
const isLoadingSets = ref(false)

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

// Navigate to battle when game starts
watch(() => pvp.status, (s) => {
  if (s === 'rps' || s === 'playing') {
    router.push('/pvp/battle')
  }
})

async function handleCreate() {
  const code = await pvp.createRoom()
  if (code) {
    pvp.setColor(selectedColor.value)
    pvp.setBgTheme(selectedBg.value)
    // โหลด quiz set แล้ว cache ไว้ใน store (จะ sync ไป guest เมื่อเกมเริ่ม)
    const fullSet = await quizStore.loadQuizSet(selectedSet.value.id)
    if (fullSet?.questions?.length) {
      pvp.setQuizSet(fullSet.questions, fullSet.id)
    }
    createStep.value = 3
  }
}

async function handleJoin() {
  const ok = await pvp.joinRoom(joinCode.value)
  if (ok) {
    pvp.setColor(selectedColor.value)
    pvp.setReady()
  }
}

function handleStartGame() {
  pvp.setReady()
}

async function copyCode() {
  await navigator.clipboard.writeText(pvp.roomCode)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

onMounted(async () => {
  pvp.$reset()
  isLoadingSets.value = true
  await quizStore.fetchPublicSets()
  await quizStore.fetchMySets()
  isLoadingSets.value = false
})
</script>
