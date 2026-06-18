<template>
  <div class="max-w-lg mx-auto px-4 py-8 relative z-10">
    <div class="page-header">
      <div class="page-header-title">
        <GameIcon name="crossed-swords" :size="24" class="text-qs-danger" />
        <h1 class="page-title" style="color: #ff6b6b;">PVP LOBBY</h1>
      </div>
      <p class="page-description">สร้างห้องหรือเข้าห้องเพื่อแข่งกับเพื่อน</p>
    </div>

    <!-- Mode select -->
    <div v-if="mode === 'select'" class="space-y-3 animate-slide-up">
      <button class="card-hover p-5 w-full text-left flex items-center gap-4 group" @click="mode = 'create'">
        <div class="w-14 h-14 rounded-qs flex items-center justify-center flex-shrink-0 bg-qs-primary/10 text-qs-primary group-hover:bg-qs-primary/20 group-hover:scale-110 transition-all duration-300">
          <PhHouse :size="28" weight="duotone" aria-hidden="true" />
        </div>
        <div class="flex-1">
          <div class="font-bold text-qs-text text-base mb-0.5">สร้างห้อง</div>
          <div class="text-qs-muted text-sm">เป็น Host เลือกชุดข้อสอบแล้วแชร์โค้ด</div>
        </div>
        <PhArrowRight :size="18" weight="bold" class="text-qs-muted group-hover:text-qs-primary transition-colors" aria-hidden="true" />
      </button>
      <button class="card-hover p-5 w-full text-left flex items-center gap-4 group" @click="mode = 'join'">
        <div class="w-14 h-14 rounded-qs flex items-center justify-center flex-shrink-0 bg-qs-success/10 text-qs-success group-hover:bg-qs-success/20 group-hover:scale-110 transition-all duration-300">
          <PhDoorOpen :size="28" weight="duotone" aria-hidden="true" />
        </div>
        <div class="flex-1">
          <div class="font-bold text-qs-text text-base mb-0.5">เข้าห้อง</div>
          <div class="text-qs-muted text-sm">กรอกโค้ด 6 หลักจากเพื่อน</div>
        </div>
        <PhArrowRight :size="18" weight="bold" class="text-qs-muted group-hover:text-qs-success transition-colors" aria-hidden="true" />
      </button>
    </div>

    <!-- Create room -->
    <div v-else-if="mode === 'create'" class="animate-slide-up">
      <button class="btn-ghost text-xs mb-6 gap-1" @click="mode = 'select'">
        <PhArrowLeft :size="13" weight="bold" aria-hidden="true" />
        กลับ
      </button>

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
            <span v-if="selectedSet?.id === set.id">
              <PhCheckCircle :size="18" weight="fill" class="text-qs-primary" aria-hidden="true" />
            </span>
          </div>
        </div>
        <button class="btn-primary w-full gap-2" :disabled="!selectedSet" @click="createStep = 2">
          ถัดไป
          <PhArrowRight :size="15" weight="bold" aria-hidden="true" />
        </button>
      </div>

      <!-- Step 2: เลือกสี + พื้นหลัง + เวลา -->
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

        <h2 class="font-bold text-qs-text mb-3">พื้นหลัง</h2>
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
            <div class="flex items-center justify-center mb-1">
              <component :is="bgIcons[bg.id]" :size="20" weight="duotone"
                :class="selectedBg === bg.id ? 'text-qs-primary' : 'text-qs-muted'"
                aria-hidden="true"
              />
            </div>
            <div class="text-[10px] font-semibold" :class="selectedBg === bg.id ? 'text-qs-text' : 'text-qs-muted'">{{ bg.label }}</div>
            <div class="text-[9px] text-qs-muted mt-0.5">{{ bg.desc }}</div>
          </button>
        </div>

        <!-- ⏱️ เวลาตอบต่อข้อ -->
        <h2 class="font-bold text-qs-text mb-2">⏱️ เวลาตอบต่อข้อ</h2>
        <p class="text-[11px] text-qs-muted mb-3">ถ้าหมดเวลาจะนับว่าตอบผิดทันที (0 = ไม่จำกัดเวลา)</p>
        <div class="grid grid-cols-4 gap-2 mb-2">
          <button
            v-for="t in timePresets"
            :key="t.value"
            class="py-2 rounded-xl border-2 text-center text-xs font-bold transition-all"
            :class="selectedTimeLimit === t.value && !customTimeActive
              ? 'border-qs-primary bg-qs-primary/10 text-qs-primary'
              : 'border-qs-border bg-qs-surface text-qs-muted hover:border-qs-primary/50'"
            @click="selectedTimeLimit = t.value; customTimeActive = false"
          >
            {{ t.label }}
          </button>
        </div>
        <div class="flex items-center gap-2 mb-5">
          <button
            class="py-2 px-3 rounded-xl border-2 text-sm font-bold transition-all whitespace-nowrap"
            :class="customTimeActive
              ? 'border-qs-accent bg-qs-accent/10 text-qs-accent'
              : 'border-qs-border bg-qs-surface text-qs-muted hover:border-qs-accent/50'"
            @click="customTimeActive = true"
          >
            กำหนดเอง
          </button>
          <input
            v-if="customTimeActive"
            v-model.number="customTimeValue"
            type="number"
            min="3"
            max="600"
            placeholder="วินาที"
            class="flex-1 px-3 py-2 bg-qs-surface border border-qs-border rounded-xl text-qs-text text-sm focus:outline-none focus:border-qs-accent"
          />
          <span v-if="customTimeActive" class="text-xs text-qs-muted">วินาที</span>
        </div>

        <button class="btn-primary w-full gap-2" @click="handleCreate">
          <span v-if="pvp.loadingRoom" class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></span>
            กำลังสร้างห้อง...
          </span>
          <template v-else>
            <PhHouse :size="16" weight="duotone" aria-hidden="true" />
            สร้างห้อง
          </template>
        </button>
      </div>

      <!-- Waiting room (after created) -->
      <div v-else-if="createStep === 3" class="text-center">
        <div class="card p-6 mb-4">
          <p class="text-qs-muted text-sm mb-3">โค้ดห้อง</p>
          <!-- 6-box code display -->
          <div class="flex justify-center gap-2 mb-4" aria-label="Room code">
            <div
              v-for="(char, i) in pvp.roomCode.split('')"
              :key="i"
              class="w-10 h-12 rounded-qs bg-qs-depth-4 border border-qs-primary/30 flex items-center justify-center font-pixel text-lg text-qs-accent"
              :class="i === 2 ? 'mr-2' : ''"
            >{{ char }}</div>
          </div>
          <button class="btn-icon mx-auto flex gap-1.5 w-auto px-4" :aria-label="copied ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'" @click="copyCode">
            <PhCheckCircle v-if="copied"  :size="15" weight="fill" class="text-qs-success" aria-hidden="true" />
            <PhCopy        v-else         :size="15" weight="bold" aria-hidden="true" />
            <span class="text-xs">{{ copied ? 'คัดลอกแล้ว' : 'คัดลอก' }}</span>
          </button>
        </div>

        <!-- Player list -->
        <div class="card p-4 mb-4 space-y-3">
          <div class="flex items-center gap-3">
            <AvatarFrame :name="pvp.hostName" color="purple" size="md" :online="true" />
            <div class="flex-1 text-left">
              <span class="text-sm text-qs-text font-medium">{{ pvp.hostName }}</span>
              <span class="ml-2 badge-public text-[10px]">คุณ</span>
            </div>
            <PhWifiHigh :size="16" weight="duotone" class="text-qs-success" aria-hidden="true" />
          </div>
          <div class="flex items-center gap-3">
            <AvatarFrame
              :name="pvp.guestId ? pvp.guestName : '?'"
              color="fire" size="md"
              :online="!!pvp.guestId"
              :class="pvp.guestId ? '' : 'opacity-50'"
            />
            <div class="flex-1 text-left">
              <span class="text-sm" :class="pvp.guestId ? 'text-qs-text font-medium' : 'text-qs-muted'">
                {{ pvp.guestId ? pvp.guestName : 'รอเพื่อนเข้าห้อง...' }}
              </span>
            </div>
            <component :is="pvp.guestId ? PhWifiHigh : PhWifiX"
              :size="16" weight="duotone"
              :class="pvp.guestId ? 'text-qs-success' : 'text-qs-muted animate-pulse'"
              aria-hidden="true"
            />
          </div>
        </div>

        <button
          class="btn-primary w-full gap-2"
          :disabled="!pvp.guestId"
          @click="handleStartGame"
        >
          <PhSword v-if="pvp.guestId" :size="16" weight="bold" aria-hidden="true" />
          {{ pvp.guestId ? 'เริ่มเกม!' : 'รอเพื่อนเข้าร่วม...' }}
        </button>
      </div>
    </div>

    <!-- Join room -->
    <div v-else-if="mode === 'join'" class="animate-slide-up">
      <button class="btn-ghost text-xs mb-6 gap-1" @click="mode = 'select'">
        <PhArrowLeft :size="13" weight="bold" aria-hidden="true" />
        กลับ
      </button>

      <div v-if="!pvp.roomCode">
        <h2 class="font-bold text-qs-text mb-4">กรอกโค้ดห้อง</h2>
        <input
          v-model="joinCode"
          maxlength="6"
          placeholder="ABC123"
          class="w-full bg-qs-surface border border-qs-border rounded-qs px-4 py-3 text-center font-pixel text-2xl text-qs-accent tracking-widest mb-4 uppercase focus:outline-none focus:border-qs-primary transition-colors"
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

        <div v-if="pvp.error" class="text-qs-danger text-sm mb-3 text-center flex items-center justify-center gap-2">
          <PhWarningCircle :size="16" weight="fill" aria-hidden="true" />
          {{ pvp.error }}
        </div>

        <button
          class="btn-primary w-full gap-2"
          :disabled="joinCode.length < 6 || pvp.loadingRoom"
          @click="handleJoin"
        >
          <span v-if="pvp.loadingRoom" class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></span>
            กำลังเข้าห้อง...
          </span>
          <template v-else>
            <PhDoorOpen :size="16" weight="duotone" aria-hidden="true" />
            เข้าห้อง
          </template>
        </button>
      </div>

      <!-- Guest waiting room -->
      <div v-else class="text-center">
        <div class="card p-6 mb-4">
          <p class="text-qs-muted text-sm mb-3">ห้อง</p>
          <div class="flex justify-center gap-2 mb-2" aria-label="Room code">
            <div
              v-for="(char, i) in pvp.roomCode.split('')"
              :key="i"
              class="w-10 h-12 rounded-qs bg-qs-depth-4 border border-qs-primary/30 flex items-center justify-center font-pixel text-lg text-qs-accent"
              :class="i === 2 ? 'mr-2' : ''"
            >{{ char }}</div>
          </div>
        </div>
        <div class="card p-4 mb-4 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <AvatarFrame :name="pvp.hostName" color="purple" size="sm" />
            <span class="text-sm text-qs-muted">{{ pvp.hostName }}</span>
          </div>
          <div class="flex items-center gap-2">
            <AvatarFrame :name="pvp.guestName" color="fire" size="sm" />
            <span class="text-sm text-qs-text font-medium">{{ pvp.guestName }}</span>
            <span class="badge-public text-[10px]">คุณ</span>
          </div>
        </div>
        <p class="text-qs-muted text-sm animate-pulse">รอ Host เริ่มเกม...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePvpStore, PLAYER_COLORS } from '@/stores/pvpStore'
import { useQuizStore } from '@/stores/quizStore'
import { useAuthStore } from '@/stores/authStore'
import { PVP_BG_OPTIONS } from '@/lib/phaser/PvPScene'
import AvatarFrame from '@/components/ui/AvatarFrame.vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import {
  PhUsersThree, PhHouse, PhDoorOpen, PhArrowRight, PhArrowLeft,
  PhCheckCircle, PhCopy, PhWifiHigh, PhWifiX, PhSword, PhWarningCircle,
  PhLeaf, PhTree, PhMountains, PhCastleTurret, PhCrown,
} from '@phosphor-icons/vue'

const bgIcons = {
  arena:     PhSword,
  grassland: PhLeaf,
  forest:    PhTree,
  cave:      PhMountains,
  tower:     PhCastleTurret,
  throne:    PhCrown,
}

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

// Timer presets
const timePresets = [
  { label: '∞ ไม่จำกัด', value: 0   },
  { label: '5 วิ',        value: 5   },
  { label: '10 วิ',       value: 10  },
  { label: '20 วิ',       value: 20  },
  { label: '30 วิ',       value: 30  },
  { label: '60 วิ',       value: 60  },
  { label: '3 นาที',      value: 180 },
]
const selectedTimeLimit = ref(10)   // default 10s
const customTimeActive  = ref(false)
const customTimeValue   = ref(30)

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
    // Apply timer setting
    const limit = customTimeActive.value
      ? Math.max(3, customTimeValue.value || 10)
      : selectedTimeLimit.value
    pvp.setTurnTimeLimit(limit)
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
    joinCode.value = ''   // clear input so it doesn't persist
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
