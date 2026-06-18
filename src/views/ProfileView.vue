<template>
  <div class="max-w-5xl mx-auto px-4 py-10 relative z-10">

    <!-- 2-col desktop, 1-col mobile -->
    <div class="grid lg:grid-cols-3 gap-6">

      <!-- ═══ LEFT COLUMN: Avatar + Actions ═══ -->
      <div class="space-y-4">

        <!-- Profile card -->
        <div class="card p-6 text-center">
          <!-- AvatarFrame XL -->
          <div class="flex justify-center mb-4">
            <AvatarFrame
              :name="authStore.displayName"
              :color="authStore.profile?.avatar_gradient ?? 'purple'"
              size="xl"
              :online="true"
            />
          </div>

          <!-- Name + edit -->
          <div v-if="!editingName" class="flex items-center justify-center gap-2 mb-1">
            <h1 class="text-lg font-bold text-qs-text">{{ authStore.displayName }}</h1>
            <button
              class="btn-icon w-7 h-7 flex-shrink-0"
              aria-label="แก้ไขชื่อ"
              @click="startEdit"
            >
              <PhPencilSimple :size="14" weight="bold" aria-hidden="true" />
            </button>
          </div>
          <div v-else class="mb-2">
            <div class="flex gap-2">
              <input
                ref="nameInput"
                v-model="newUsername"
                type="text"
                maxlength="20"
                placeholder="ชื่อผู้เล่น"
                class="input flex-1 text-sm py-2"
                :class="nameError ? 'input-error' : ''"
                @keydown.enter="saveUsername"
                @keydown.escape="cancelEdit"
              />
              <button class="btn-primary text-xs px-3 py-2 flex-shrink-0" :disabled="savingName" @click="saveUsername">
                <span v-if="savingName" class="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin inline-block" aria-hidden="true"></span>
                <span v-else>บันทึก</span>
              </button>
              <button class="btn-ghost text-xs px-2 flex-shrink-0" @click="cancelEdit" aria-label="ยกเลิก">
                <PhX :size="14" weight="bold" aria-hidden="true" />
              </button>
            </div>
            <p v-if="nameError" class="text-xs text-qs-danger mt-1 text-left">{{ nameError }}</p>
            <p class="text-[10px] text-qs-muted mt-1 text-left">ก-ฮ, a-z, 0-9, _ · ยาว 2-20 ตัวอักษร</p>
          </div>

          <!-- Title badge -->
          <div v-if="authStore.profile?.title_badge" class="mb-2">
            <span class="badge bg-qs-primary/10 text-qs-primary border-qs-primary/30 text-xs">
              {{ authStore.profile.title_badge }}
            </span>
          </div>

          <p class="text-xs text-qs-muted mb-1">{{ authStore.user?.email }}</p>
          <p v-if="authStore.profile?.created_at" class="text-[10px] text-qs-muted mb-4">
            สมาชิกตั้งแต่ {{ formatDate(authStore.profile.created_at) }}
          </p>

          <!-- Logout -->
          <button
            class="w-full py-2.5 rounded-qs font-semibold text-sm bg-transparent border border-qs-danger/50 text-qs-danger
                   hover:bg-qs-danger hover:text-white hover:border-qs-danger transition-all"
            @click="logout"
          >
            <span class="inline-flex items-center justify-center gap-2">
              <PhSignOut :size="15" weight="bold" aria-hidden="true" />
              ออกจากระบบ
            </span>
          </button>
        </div>

        <!-- Achievement preview -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-xs font-medium text-qs-muted uppercase tracking-wide">Achievements</h2>
            <router-link to="/achievements" class="text-xs text-qs-primary hover:underline">ดูทั้งหมด</router-link>
          </div>
          <div v-if="recentBadges.length === 0" class="text-center py-4 text-qs-muted text-xs">
            <PhMedal :size="28" weight="duotone" class="mx-auto mb-2 text-qs-border" aria-hidden="true" />
            ยังไม่มี Badge
          </div>
          <div v-else class="grid grid-cols-3 gap-2">
            <div
              v-for="badge in recentBadges"
              :key="badge.id"
              class="flex flex-col items-center gap-1 p-2 rounded-qs bg-qs-surface border border-qs-primary/20"
              :title="badge.name"
            >
              <PhMedal :size="20" weight="duotone" class="text-qs-gold" aria-hidden="true" />
              <span class="text-[9px] text-qs-muted text-center leading-tight line-clamp-2">{{ badge.name }}</span>
            </div>
          </div>
        </div>

        <!-- Customization panel -->
        <div class="card p-5">
          <h2 class="text-xs font-medium text-qs-muted uppercase tracking-wide mb-4">ปรับแต่งตัวละคร</h2>
          <AvatarCustomizer />
        </div>
      </div>

      <!-- ═══ RIGHT COLUMN: Stats + History ═══ -->
      <div class="lg:col-span-2 space-y-4">

        <!-- Stats row -->
        <div>
          <h2 class="text-xs font-medium text-qs-muted uppercase tracking-wide mb-3">สถิติ</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div v-for="stat in stats" :key="stat.label" class="card-stat">
              <component :is="stat.icon" :size="16" weight="duotone" :class="stat.color" aria-hidden="true" />
              <div class="text-xl font-bold text-qs-text mt-1">
                <AnimatedCounter :value="stat.value" :suffix="stat.suffix ?? ''" />
              </div>
              <div class="text-[10px] text-qs-muted">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- Game History (timeline) -->
        <div class="card p-5">
          <h2 class="text-sm font-bold text-qs-text mb-4">ประวัติการเล่น</h2>

          <div v-if="playerStore.loading" class="space-y-3">
            <div v-for="n in 4" :key="n" class="flex gap-3">
              <div class="w-8 h-8 rounded-full bg-qs-border animate-pulse flex-shrink-0"></div>
              <div class="flex-1 space-y-1.5">
                <div class="h-3 bg-qs-border rounded w-3/4 animate-pulse"></div>
                <div class="h-2.5 bg-qs-border rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div v-else-if="playerStore.sessions.length === 0"
               class="text-center py-8 text-qs-muted text-sm">
            <PhSword :size="28" weight="duotone" class="mx-auto mb-2 text-qs-border" aria-hidden="true" />
            ยังไม่มีประวัติการเล่น
          </div>

          <!-- Timeline list -->
          <div v-else class="relative max-h-96 overflow-y-auto pr-1 space-y-0">
            <!-- Timeline line -->
            <div class="absolute left-3.5 top-2 bottom-2 w-px bg-qs-border" aria-hidden="true"></div>

            <div
              v-for="(session, idx) in playerStore.sessions"
              :key="session.id"
              class="relative flex gap-4 pb-4"
            >
              <!-- Timeline dot -->
              <div
                class="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                :class="session.result === 'win'
                  ? 'bg-green-950 border-qs-success'
                  : 'bg-red-950 border-qs-danger'"
              >
                <PhTrophy v-if="session.result === 'win'" :size="13" weight="fill" class="text-qs-gold" aria-hidden="true" />
                <PhSkull  v-else                          :size="13" weight="fill" class="text-qs-danger" aria-hidden="true" />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0 pt-0.5">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-sm text-qs-text font-medium truncate">
                      {{ session.quiz_sets?.title ?? 'Unknown' }}
                    </p>
                    <p class="text-[11px] text-qs-muted mt-0.5 space-x-1.5">
                      <span>{{ session.difficulty }}</span>
                      <span>·</span>
                      <span>Stage {{ session.stage_reached }}/5</span>
                      <span>·</span>
                      <span>{{ formatDate(session.created_at) }}</span>
                    </p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="text-sm font-bold" :class="session.result === 'win' ? 'text-qs-success' : 'text-qs-danger'">
                      {{ session.score ?? 0 }}
                    </p>
                    <p class="text-[10px] text-qs-gold flex items-center justify-end gap-0.5">
                      <PhCoins :size="10" weight="duotone" aria-hidden="true" />
                      +{{ session.coins_earned ?? 0 }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useAchievementStore } from '@/stores/achievementStore'
import AvatarFrame from '@/components/ui/AvatarFrame.vue'
import AnimatedCounter from '@/components/ui/AnimatedCounter.vue'
import AvatarCustomizer from '@/components/profile/AvatarCustomizer.vue'
import {
  PhPencilSimple, PhX, PhSignOut, PhMedal,
  PhTrophy, PhSkull, PhCoins, PhSword, PhLightning,
} from '@phosphor-icons/vue'

const router           = useRouter()
const authStore        = useAuthStore()
const playerStore      = usePlayerStore()
const achievementStore = useAchievementStore()

// ── Username edit ──────────────────────────────────────
const editingName  = ref(false)
const newUsername  = ref('')
const nameError    = ref('')
const savingName   = ref(false)
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
  if (!result.ok) { nameError.value = result.message; return }
  editingName.value = false
}

// ── Stats ──────────────────────────────────────────────
const stats = computed(() => [
  { label: 'Coins',     value: authStore.coins,          icon: PhCoins,    color: 'text-qs-gold',    suffix: '' },
  { label: 'เกมทั้งหมด', value: playerStore.totalGames,  icon: PhSword,    color: 'text-qs-muted',  suffix: '' },
  { label: 'ชนะ',       value: playerStore.totalWins,    icon: PhTrophy,   color: 'text-qs-success', suffix: '' },
  { label: 'Win Rate',  value: playerStore.winRate,      icon: PhLightning, color: 'text-qs-primary', suffix: '%' },
])

// ── Achievement preview (3 recent) ────────────────────
const recentBadges = computed(() => achievementStore.unlocked.slice(0, 3))

// ── Helpers ────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: '2-digit',
  })
}
async function logout() {
  await authStore.signOut()
  router.push('/')
}

onMounted(() => {
  playerStore.fetchHistory()
  achievementStore.compute()
})
</script>
