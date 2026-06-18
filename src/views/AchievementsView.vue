<template>
  <div class="max-w-5xl mx-auto px-4 py-10">

    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <PhMedal :size="22" weight="duotone" class="text-qs-gold" aria-hidden="true" />
        <h1 class="text-2xl font-bold text-qs-text">Achievements</h1>
      </div>
      <p class="text-qs-muted text-sm">
        ปลดล็อกแล้ว
        <span class="text-qs-success font-bold">{{ unlocked.length }}</span>
        / {{ BADGES.length }} badges
      </p>
    </div>

    <!-- Progress overview -->
    <div class="card p-4 mb-8 flex items-center gap-4">
      <div class="flex-1">
        <div class="bar-container h-2 mb-1">
          <div
            class="h-full rounded-full transition-all duration-700"
            style="background: linear-gradient(90deg, #6c63ff, #f4c842);"
            :style="{ width: overallPct + '%' }"
          ></div>
        </div>
        <p class="text-xs text-qs-muted">{{ overallPct }}% completed</p>
      </div>
      <div class="text-right flex-shrink-0">
        <p class="text-xl font-bold text-qs-gold">{{ unlocked.length }}/{{ BADGES.length }}</p>
        <p class="text-[10px] text-qs-muted">badges</p>
      </div>
    </div>

    <!-- Category filter -->
    <div class="flex flex-wrap gap-2 mb-6" role="group" aria-label="กรองหมวด">
      <button
        v-for="cat in categories"
        :key="cat"
        class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
        :class="activeCategory === cat
          ? 'bg-qs-primary text-white shadow-qs'
          : 'bg-qs-surface border border-qs-border text-qs-muted hover:border-qs-primary/50 hover:text-qs-text'"
        @click="activeCategory = cat"
      >{{ cat }}</button>
    </div>

    <!-- Badge grid -->
    <div
      v-for="cat in visibleCategories"
      :key="cat"
      class="mb-8"
    >
      <h2 class="text-xs font-medium text-qs-muted uppercase tracking-wide mb-3">{{ cat }}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <AchievementBadge
          v-for="badge in badgesByCategory[cat]"
          :key="badge.id"
          :badge="badge"
          :unlocked="isUnlocked(badge.id)"
          :progress="getProgress(badge)"
        />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore, BADGES } from '@/stores/achievementStore'
import { usePlayerStore } from '@/stores/playerStore'
import AchievementBadge from '@/components/achievements/AchievementBadge.vue'
import { PhMedal } from '@phosphor-icons/vue'

const achievementStore = useAchievementStore()
const playerStore      = usePlayerStore()

const activeCategory = ref('ทั้งหมด')

const categories = ['ทั้งหมด', 'Combat', 'Knowledge', 'PvP', 'Creator']

const unlocked = computed(() => achievementStore.unlocked)
const unlockedIds = computed(() => new Set(unlocked.value.map(b => b.id)))

const overallPct = computed(() =>
  BADGES.length ? Math.round((unlocked.value.length / BADGES.length) * 100) : 0,
)

const badgesByCategory = computed(() => {
  const map = {}
  const badgesInView = activeCategory.value === 'ทั้งหมด'
    ? BADGES
    : BADGES.filter(b => b.category === activeCategory.value)

  for (const b of badgesInView) {
    const cat = b.category
    if (!map[cat]) map[cat] = []
    map[cat].push(b)
  }
  return map
})

const visibleCategories = computed(() =>
  activeCategory.value === 'ทั้งหมด'
    ? ['Combat', 'Knowledge', 'PvP', 'Creator']
    : [activeCategory.value],
)

function isUnlocked(id) { return unlockedIds.value.has(id) }

function getProgress(badge) {
  if (isUnlocked(badge.id)) return null
  return badge.progress(achievementStore.compute ? getStats() : {})
}

function getStats() {
  // Replicate stat computation inline for progress display
  const sessions     = playerStore.sessions ?? []
  const wins         = sessions.filter(s => s.result === 'win').length
  const pvpSessions  = sessions.filter(s => s.mode === 'pvp')
  const pvpGames     = pvpSessions.length
  const pvpWins      = pvpSessions.filter(s => s.result === 'win').length
  const totalCorrect = sessions.reduce((sum, s) => sum + (s.total_correct ?? 0), 0)
  return { sessions, wins, pvpGames, pvpWins, totalCorrect, quizSets: 0 }
}

onMounted(async () => {
  await playerStore.fetchHistory()
  achievementStore.compute()
})
</script>
