<template>
  <div class="pvp-page px-3 py-2 max-w-5xl mx-auto">

    <!-- ── RPS Phase ─────────────────────────────────────────────────────── -->
    <Transition name="fade-lock" mode="out-in">
      <div v-if="pvp.status === 'rps'"
           class="fixed inset-0 z-40 flex items-center justify-center bg-qs-bg/90 backdrop-blur-sm"
           key="rps">
        <div class="card p-8 w-full max-w-sm mx-4 text-center animate-slide-up">
          <RPSPicker
            :myPick="pvp.myRpsPick"
            :hostChoice="pvp.rpsHost"
            :guestChoice="pvp.rpsGuest"
            :result="pvp.rpsResult"
            :isHost="pvp.isHost"
            :hostName="pvp.hostName"
            :guestName="pvp.guestName"
            @pick="pvp.pickRps"
          />
        </div>
      </div>
    </Transition>

    <!-- ── Lucky Box Phase ───────────────────────────────────────────────── -->
    <Transition name="fade-lock">
      <div v-if="pvp.status === 'lucky_box'"
           class="fixed inset-0 z-40 flex items-center justify-center bg-qs-bg/90 backdrop-blur-sm">
        <div class="card p-8 w-full max-w-sm mx-4 animate-slide-up">
          <LuckyBox
            :cards="pvp.luckyCards"
            :picked="pvp.luckyPicked"
            @pick="pvp.pickLuckyCard"
          />
        </div>
      </div>
    </Transition>

    <!-- ── Finished Overlay ──────────────────────────────────────────────── -->
    <Transition name="fade-lock">
      <RematchOverlay
        v-if="pvp.isFinished"
        :iWon="iWon"
        @host-rematch="handleHostRematch"
        @guest-rematch="handleGuestRematch"
        @leave="exitGame"
      />
    </Transition>

    <!-- ── Main Battle Layout ────────────────────────────────────────────── -->
    <div class="pvp-layout">

      <!-- Left col: Player cards + Phaser -->
      <div class="left-col">

        <!-- HP bars row: Me (left) vs Opponent (right) -->
        <div class="flex gap-2 mb-2">
          <!-- ตัวเอง (ซ้าย) -->
          <PlayerCard
            class="flex-1"
            :name="pvp.myName"
            :color="pvp.myColor"
            :hp="pvp.myHp"
            :items="pvp.myItems"
            :isActive="pvp.isMyTurn && pvp.status === 'playing'"
            :canUseItems="pvp.isMyTurn && pvp.status === 'playing'"
            :isFrozen="pvp.isFrozen"
            :freezeSeconds="pvp.freezeSeconds"
            @use-item="pvp.useItem"
          />
          <div class="flex items-center px-1">
            <span class="text-xs font-pixel text-qs-muted">VS</span>
          </div>
          <!-- คู่แข่ง (ขวา) -->
          <PlayerCard
            class="flex-1"
            :name="pvp.oppName"
            :color="pvp.oppColor"
            :hp="pvp.oppHp"
            :items="[]"
            :isActive="!pvp.isMyTurn && pvp.status === 'playing'"
            :canUseItems="false"
            :isFrozen="false"
            :freezeSeconds="0"
            @use-item="pvp.useItem"
          />
        </div>

        <!-- Phaser canvas -->
        <div class="pvp-canvas card p-0 overflow-hidden relative border-2 border-qs-border mb-2">
          <div id="pvp-phaser" class="w-full h-full"></div>

          <!-- Turn indicator overlay -->
          <div class="absolute top-2 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <div class="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                 :class="pvp.isMyTurn
                   ? 'bg-qs-success/20 border border-qs-success text-qs-success'
                   : 'bg-qs-muted/10 border border-qs-border text-qs-muted'">
              {{ pvp.isMyTurn ? '⚔️ ตาของคุณ!' : `⏳ รอ ${pvp.oppName}...` }}
            </div>
          </div>

          <!-- Lucky box countdown -->
          <div class="absolute bottom-1 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <div class="px-2 py-0.5 bg-qs-bg/70 rounded-full text-[10px] text-qs-muted">
              🎁 Lucky Box ใน {{ luckyBoxCountdown }} ข้อ
            </div>
          </div>
        </div>

        <!-- Leave button -->
        <button class="btn-secondary text-xs px-3 py-1.5 w-full" @click="confirmLeave">
          🚪 ออกจากห้อง
        </button>
      </div>

      <!-- Right col: Question -->
      <div class="right-col">
        <div class="card p-4 h-full flex flex-col">

          <!-- Q number -->
          <div class="text-xs font-pixel text-qs-accent mb-3">
            ข้อที่ {{ (pvp.currentQIndex ?? 0) + 1 }}
          </div>

          <!-- Question text -->
          <p class="font-bold text-qs-text text-base leading-relaxed mb-4 flex-1">
            {{ pvp.currentQ?.question_text ?? 'รอคำถาม...' }}
          </p>

          <!-- Reveal hint -->
          <div v-if="pvp.revealActive && pvp.isMyTurn" class="mb-3 px-3 py-2 bg-yellow-900/20 border border-yellow-500/40 rounded-qs text-xs text-yellow-300">
            💡 เฉลย: {{ pvp.currentQ?.options?.[pvp.currentQ?.correct_index] }}
          </div>

          <!-- Frozen overlay on answers -->
          <div v-if="pvp.isFrozen && pvp.isMyTurn"
               class="mb-3 px-3 py-2 bg-blue-900/30 border border-blue-400/50 rounded-qs text-xs text-blue-300 text-center animate-pulse">
            🧊 ถูก Freeze! รอ {{ pvp.freezeSeconds }} วินาที...
          </div>

          <!-- Options -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              v-for="(opt, idx) in options"
              :key="idx"
              class="answer-option flex gap-3 !px-4 !py-3 text-left"
              :class="optionClass(idx)"
              :disabled="!canAnswer"
              @click="handleAnswer(idx)"
            >
              <span class="font-bold text-qs-muted/50 flex-shrink-0">{{ labels[idx] }}</span>
              <span class="text-sm leading-snug">{{ opt }}</span>
            </button>
          </div>

          <!-- Not your turn hint -->
          <p v-if="!pvp.isMyTurn && pvp.status === 'playing'"
             class="text-center text-xs text-qs-muted mt-4 animate-pulse">
            ⏳ รอ {{ pvp.oppName }} ตอบ...
          </p>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import Phaser from 'phaser'
import { usePvpStore, PLAYER_COLORS } from '@/stores/pvpStore'
import { useQuizStore } from '@/stores/quizStore'
import RPSPicker      from '@/components/pvp/RPSPicker.vue'
import LuckyBox       from '@/components/pvp/LuckyBox.vue'
import PlayerCard     from '@/components/pvp/PlayerCard.vue'
import RematchOverlay from '@/components/pvp/RematchOverlay.vue'
import { PvPScene, PVP_BG_OPTIONS } from '@/lib/phaser/PvPScene'

const router    = useRouter()
const pvp       = usePvpStore()
const quizStore = useQuizStore()

const showResult  = ref(false)
const selectedIdx = ref(null)
let gameInstance  = null

const labels  = ['A', 'B', 'C', 'D']
const options = computed(() => pvp.currentQ?.options ?? [])

const canAnswer = computed(() =>
  pvp.isMyTurn &&
  pvp.status === 'playing' &&
  !showResult.value &&
  !pvp.isFrozen
)

const iWon = computed(() => {
  if (!pvp.winner) return false
  return (pvp.winner === 'host' && pvp.isHost) ||
         (pvp.winner === 'guest' && !pvp.isHost)
})

const luckyBoxCountdown = computed(() => {
  const next = Math.ceil((pvp.questionsAnswered + 1) / 5) * 5
  return Math.max(0, next - pvp.questionsAnswered)
})

function optionClass(idx) {
  if (!showResult.value) return ''
  if (idx === pvp.currentQ?.correct_index) return 'correct'
  if (idx === selectedIdx.value) return 'wrong'
  return 'opacity-40'
}

async function handleAnswer(idx) {
  if (!canAnswer.value) return
  selectedIdx.value = idx
  showResult.value  = true

  // Show result flash then submit
  setTimeout(() => {
    pvp.submitAnswer(idx)
    showResult.value  = false
    selectedIdx.value = null

    // Phaser animation - p1 = me (left), p2 = opponent (right)
    const scene = gameInstance?.scene.getScene('PvPScene')
    if (!scene) return
    const isCorrect = idx === pvp.currentQ?.correct_index
    if (isCorrect) {
      // My attack
      scene.events.emit('p1Attack')
    } else {
      // I get hurt
      scene.events.emit('p1Hurt')
    }
  }, 1000)
}

// Watch status changes (RPS → Playing transition)
watch(() => pvp.status, (newStatus) => {
  if (newStatus === 'rps') {
    // Reset per-round UI state on rematch
    showResult.value  = false
    selectedIdx.value = null
  }
  if (newStatus === 'playing' && gameInstance) {
    const scene = gameInstance?.scene.getScene('PvPScene')
    if (scene) {
      scene.events.emit('updatePlayerRole', pvp.isHost)
      if (pvp.bgTheme) scene.events.emit('bgChanged', pvp.bgTheme)
    }
  }
})

// Watch lastEvent for opponent animations
watch(() => pvp.lastEvent, (evt) => {
  if (!evt || !gameInstance) return
  const scene = gameInstance.scene.getScene('PvPScene')
  if (!scene) return

  if (evt.type === 'answer') {
    // Map attacker role to p1/p2:
    // p1 = me (ซ้าย), p2 = opponent (ขวา)
    const isAttackerMe = evt.role === pvp.myRole
    if (evt.isCorrect) {
      // Attacker does damage → play attack animation
      scene.events.emit(isAttackerMe ? 'p1Attack' : 'p2Attack')
    } else {
      // Attacker takes damage → play hurt animation
      scene.events.emit(isAttackerMe ? 'p1Hurt' : 'p2Hurt')
    }
  }
  if (evt.type === 'trap' && evt.itemId === 'bomb') {
    // bomb: emit explosion at correct side
    // ถ้า role = me → p1 (ซ้าย), ถ้า role = opponent → p2 (ขวา)
    const isMe = evt.role === pvp.myRole
    scene.events.emit(isMe ? 'p1Hurt' : 'p2Hurt')
    scene.events.emit('explosion', evt.role)
  }
})

// Watch color changes → update Phaser tints
watch([() => pvp.hostColor, () => pvp.guestColor], ([hc, gc]) => {
  const scene = gameInstance?.scene.getScene('PvPScene')
  if (!scene) return
  // p1 = me, p2 = opponent
  // ถ้าฉันเป็น host: me = host color, opponent = guest color
  // ถ้าฉันเป็น guest: me = guest color, opponent = host color
  const myColor = pvp.isHost ? hc : gc
  const oppColor = pvp.isHost ? gc : hc
  scene.events.emit('colorsChanged', {
    p1Tint: PLAYER_COLORS[myColor]?.tint ?? 0xffffff,
    p2Tint: PLAYER_COLORS[oppColor]?.tint ?? 0xffffff,
  })
})

// Watch bgTheme → update Phaser background instantly
watch(() => pvp.bgTheme, (theme) => {
  if (!theme || !gameInstance) return
  const scene = gameInstance.scene.getScene('PvPScene')
  if (scene) scene.events.emit('bgChanged', theme)
})

function initPhaser() {
  if (gameInstance) { gameInstance.destroy(true); gameInstance = null }
  gameInstance = new Phaser.Game({
    type:   Phaser.AUTO,
    width:  480,
    height: 270,
    pixelArt: true,
    antialias: false,
    backgroundColor: '#0d0f1a',
    parent: 'pvp-phaser',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [PvPScene],
  })

  // ส่ง initial state หลัง Phaser scene สร้างเสร็จ
  // ใช้ 'create' event ของ scene แทน READY ของ game (ตรงกว่า)
  gameInstance.events.once(Phaser.Core.Events.READY, () => {
    // รอ 1 frame เพื่อให้ scene.create() ทำงานเสร็จก่อน
    setTimeout(() => {
      const scene = gameInstance?.scene.getScene('PvPScene')
      if (!scene) return
      // ส่ง player role
      scene.events.emit('updatePlayerRole', pvp.isHost)
      // ส่งสีตัวละคร
      const myColor  = pvp.isHost ? pvp.hostColor  : pvp.guestColor
      const oppColor = pvp.isHost ? pvp.guestColor : pvp.hostColor
      scene.events.emit('colorsChanged', {
        p1Tint: PLAYER_COLORS[myColor]?.tint  ?? 0xffffff,
        p2Tint: PLAYER_COLORS[oppColor]?.tint ?? 0xffffff,
      })
      // ส่ง bgTheme (นี่คือสิ่งสำคัญ!)
      if (pvp.bgTheme && pvp.bgTheme !== 'arena') {
        scene.events.emit('bgChanged', pvp.bgTheme)
      }
    }, 100)
  })
}

async function exitGame() {
  pvp.leaveRoom()
  router.push('/pvp')
}

async function handleHostRematch({ questions, bgTheme }) {
  pvp.voteRematch(questions, bgTheme)
}

function handleGuestRematch() {
  pvp.voteRematch()
}

function confirmLeave() {
  if (confirm('ออกจากห้องจะนับว่าแพ้ ยืนยันไหม?')) exitGame()
}

// Redirect back if no room
onMounted(async () => {
  if (!pvp.roomCode) {
    router.push('/pvp')
    return
  }

  // Host: questions ถูก load ใน PvPLobbyView แล้ว
  // ถ้ายังไม่มี (กรณี refresh/edge) ให้ sync จาก store
  if (pvp.isHost && pvp.allQuestions.length > 0) {
    // Broadcast full state ให้ guest รับ questions + bgTheme
    pvp.broadcast('state_sync', pvp.fullState())
  }

  nextTick(() => initPhaser())
})

onUnmounted(() => {
  if (gameInstance) { gameInstance.destroy(true); gameInstance = null }
})
</script>

<style scoped>
.pvp-page {
  min-height: calc(100vh - 3.5rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.pvp-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  align-items: start;
}

.pvp-canvas {
  height: clamp(160px, 28vw, 280px);
}

/* Tablet/mobile: stack */
@media (max-width: 767px) {
  .pvp-layout {
    grid-template-columns: 1fr;
  }
  .pvp-canvas {
    height: clamp(150px, 42vw, 220px);
  }
}
</style>
