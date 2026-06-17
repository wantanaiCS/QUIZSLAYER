<template>
  <div class="max-w-xl mx-auto px-4 py-10 space-y-4">

    <!-- ── Profile card ── -->
    <div class="card p-6">
      <!-- Avatar + name -->
      <div class="flex items-center gap-5 mb-6">
        <div class="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-qs-glow select-none">
          {{ authStore.displayName.charAt(0).toUpperCase() }}
        </div>
        <div class="min-w-0 flex-1">
          <!-- Display name + edit button -->
          <div v-if="!editingName" class="flex items-center gap-2 flex-wrap">
            <h1 class="text-lg font-bold text-qs-text truncate">{{ authStore.displayName }}</h1>
            <button
              class="flex-shrink-0 text-xs text-qs-muted hover:text-qs-primary transition-colors px-2 py-0.5 rounded border border-qs-border hover:border-qs-primary"
              @click="startEdit"
            >✏️ แก้ไข</button>
          </div>

          <!-- Inline edit form -->
          <div v-else class="space-y-2">
            <div class="flex gap-2">
              <input
                ref="nameInput"
                v-model="newUsername"
                type="text"
                maxlength="20"
                placeholder="ชื่อผู้เล่น"
                class="flex-1 min-w-0 px-3 py-1.5 bg-qs-bg border rounded-qs text-qs-text text-sm focus:outline-none transition-colors"
                :class="nameError ? 'border-qs-danger' : 'border-qs-border focus:border-qs-primary'"
                @keydown.enter="saveUsername"
                @keydown.escape="cancelEdit"
              />
              <button class="btn-primary text-xs px-3 py-1.5 flex-shrink-0" :disabled="savingName" @click="saveUsername">
                <span v-if="savingName" class="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
                <span v-else>บันทึก</span>
              </button>
              <button class="btn-secondary text-xs px-2.5 py-1.5 flex-shrink-0" @click="cancelEdit">✕</button>
            </div>
            <p v-if="nameError" class="text-xs text-qs-danger">{{ nameError }}</p>
            <p class="text-[10px] text-qs-muted">ใช้ได้เฉพาะ ก-ฮ, a-z, 0-9, _ · ยาว 2-20 ตัวอักษร</p>
          </div>

          <p class="text-xs text-qs-muted mt-0.5 truncate">{{ authStore.user?.email }}</p>
        </div>
      </div>

      <!-- Coin + stats row -->
      <div class="grid grid-cols-4 gap-3 mb-6">
        <div class="col-span-1 bg-qs-surface border border-qs-border rounded-qs p-3 text-center">
          <div class="text-lg font-bold text-qs-gold">{{ authStore.coins }}</div>
          <div class="text-[10px] text-qs-muted mt-0.5">🪙 Coins</div>
        </div>
        <div class="bg-qs-surface border border-qs-border rounded-qs p-3 text-center">
          <div class="text-lg font-bold text-qs-primary">{{ playerStore.totalGames }}</div>
          <div class="text-[10px] text-qs-muted mt-0.5">เกม</div>
        </div>
        <div class="bg-qs-surface border border-qs-border rounded-qs p-3 text-center">
          <div class="text-lg font-bold text-qs-success">{{ playerStore.totalWins }}</div>
          <div class="text-[10px] text-qs-muted mt-0.5">ชนะ</div>
        </div>
        <div class="bg-qs-surface border border-qs-border rounded-qs p-3 text-center">
          <div class="text-lg font-bold text-qs-accent">{{ playerStore.winRate }}%</div>
          <div class="text-[10px] text-qs-muted mt-0.5">Win Rate</div>
        </div>
      </div>

      <!-- Success toast -->
      <Transition name="slide-down">
        <div v-if="saveSuccess" class="mb-4 px-3 py-2 rounded-qs bg-green-900/20 border border-qs-success/40 text-qs-success text-xs">
          ✅ บันทึกชื่อผู้เล่นเรียบร้อย
        </div>
      </Transition>

      <!-- Logout -->
      <button class="w-full py-2.5 rounded-qs font-semibold text-sm bg-qs-danger/15 border border-qs-danger/50 text-qs-danger hover:bg-qs-danger hover:text-white transition-all" @click="logout">
        ออกจากระบบ
      </button>
    </div>

    <!-- ── Game history ── -->
    <div class="card p-5">
      <h2 class="font-bold text-qs-text mb-4 text-sm">📜 ประวัติการเล่น</h2>

      <div v-if="playerStore.loading" class="space-y-2">
        <div v-for="n in 3" :key="n" class="h-12 bg-qs-surface rounded-qs animate-pulse"></div>
      </div>

      <div v-else-if="playerStore.sessions.length === 0" class="text-center py-8 text-qs-muted text-sm">
        ยังไม่มีประวัติการเล่น
      </div>

      <div v-else class="space-y-2 max-h-80 overflow-y-auto pr-1">
        <div
          v-for="session in playerStore.sessions"
          :key="session.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded-qs bg-qs-surface border border-qs-border text-sm"
        >
          <span class="text-base flex-shrink-0">{{ session.result === 'win' ? '🏆' : '💀' }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-qs-text text-xs font-medium truncate">{{ session.quiz_sets?.title ?? 'Unknown' }}</p>
            <p class="text-qs-muted text-[10px]">{{ formatDate(session.created_at) }}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-xs font-bold" :class="session.result === 'win' ? 'text-qs-success' : 'text-qs-danger'">
              {{ session.result === 'win' ? 'WIN' : 'LOSE' }}
            </p>
            <p class="text-[10px] text-qs-muted">{{ session.score ?? 0 }} pts</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePlayerStore } from '@/stores/playerStore'

const router      = useRouter()
const authStore   = useAuthStore()
const playerStore = usePlayerStore()

// ── Username edit state ───────────────────────────────
const editingName  = ref(false)
const newUsername  = ref('')
const nameError    = ref('')
const savingName   = ref(false)
const saveSuccess  = ref(false)
const nameInput    = ref(null)

function startEdit() {
  newUsername.value = authStore.displayName
  nameError.value   = ''
  editingName.value = true
  nextTick(() => nameInput.value?.focus())
}

function cancelEdit() {
  editingName.value = false
  nameError.value   = ''
}

async function saveUsername() {
  nameError.value  = ''
  savingName.value = true
  const result = await authStore.updateUsername(newUsername.value)
  savingName.value = false

  if (!result.ok) {
    nameError.value = result.message
    return
  }

  editingName.value = false
  saveSuccess.value = true
  setTimeout(() => { saveSuccess.value = false }, 3000)
}

// ── Helpers ───────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

async function logout() {
  await authStore.signOut()
  router.push('/')
}

onMounted(() => playerStore.fetchHistory())
</script>

<style scoped>
.slide-down-enter-active { transition: all 0.3s ease; }
.slide-down-enter-from   { opacity: 0; transform: translateY(-6px); }
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-leave-to     { opacity: 0; }
</style>
