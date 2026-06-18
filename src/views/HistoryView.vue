<template>
  <div class="max-w-4xl mx-auto px-4 py-10 relative z-10">

    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <PhScroll :size="22" weight="duotone" class="text-qs-primary" aria-hidden="true" />
        <h1 class="text-2xl font-bold text-qs-text">ประวัติการต่อสู้</h1>
      </div>
      <p class="text-qs-muted text-sm">สถิติและบันทึกทุกสมรภูมิ</p>
    </div>

    <!-- Stats row (AnimatedCounter) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="card-stat">
        <component :is="stat.icon" :size="16" weight="duotone" :class="stat.color" aria-hidden="true" />
        <div class="text-2xl font-bold text-qs-text mt-1">
          <AnimatedCounter :value="stat.num" :suffix="stat.suffix ?? ''" />
        </div>
        <div class="text-[10px] text-qs-muted">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="flex flex-wrap gap-2 mb-6" role="group" aria-label="กรองประวัติ">
      <button
        v-for="f in filters"
        :key="f.key"
        class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
        :class="activeFilter === f.key
          ? 'bg-qs-primary text-white shadow-qs'
          : 'bg-qs-surface border border-qs-border text-qs-muted hover:border-qs-primary/50 hover:text-qs-text'"
        @click="activeFilter = f.key"
      >{{ f.label }}</button>
    </div>

    <!-- Loading -->
    <div v-if="playerStore.loading" class="space-y-3">
      <div v-for="n in 4" :key="n" class="card p-5 animate-pulse flex gap-4">
        <div class="w-12 h-12 rounded-full bg-qs-border flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-qs-border rounded w-2/3"></div>
          <div class="h-3 bg-qs-border rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="card p-16 text-center">
      <PhSword :size="40" weight="duotone" class="mx-auto mb-4 text-qs-border" aria-hidden="true" />
      <p class="text-qs-muted mb-6">
        {{ activeFilter === 'all' ? 'ยังไม่มีประวัติการต่อสู้ ลองเล่นดูเลย!' : 'ไม่พบประวัติในหมวดนี้' }}
      </p>
      <router-link v-if="activeFilter === 'all'" to="/battle" class="btn-primary gap-2">
        <PhSword :size="15" weight="bold" aria-hidden="true" />
        เริ่มต่อสู้
      </router-link>
    </div>

    <!-- Session cards -->
    <div v-else class="space-y-3">
      <div
        v-for="session in filtered"
        :key="session.id"
        class="card p-4 flex items-center gap-4 group"
      >
        <!-- Result icon -->
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          :class="session.result === 'win' ? 'bg-green-950 border border-qs-success/40' : 'bg-red-950 border border-qs-danger/40'"
        >
          <PhTrophy v-if="session.result === 'win'" :size="22" weight="duotone" class="text-qs-gold" aria-hidden="true" />
          <PhSkull  v-else                          :size="22" weight="duotone" class="text-qs-danger" aria-hidden="true" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-qs-text truncate mb-1">
            {{ session.quiz_sets?.title ?? 'Unknown Quiz' }}
          </p>
          <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-qs-muted">
            <span class="capitalize">{{ session.difficulty }}</span>
            <span>·</span>
            <span>Stage {{ session.stage_reached }}/5</span>
            <span>·</span>
            <PhCheckCircle :size="11" weight="fill" class="text-qs-success" aria-hidden="true" />
            <span>{{ session.total_correct ?? 0 }}/{{ session.total_answered ?? 0 }}</span>
            <span>·</span>
            <span>{{ formatDuration(session.duration_seconds ?? 0) }}</span>
            <span>·</span>
            <span>{{ formatDate(session.created_at) }}</span>
            <span v-if="session.mode === 'pvp'" class="badge bg-qs-secondary/10 text-qs-secondary border-qs-secondary/30 text-[9px]">PvP</span>
          </div>
        </div>

        <!-- Score + coins -->
        <div class="text-right flex-shrink-0">
          <p class="text-base font-bold" :class="session.result === 'win' ? 'text-qs-success' : 'text-qs-danger'">
            {{ session.score ?? 0 }}
          </p>
          <p class="text-[11px] text-qs-gold flex items-center justify-end gap-0.5">
            <PhCoins :size="11" weight="duotone" aria-hidden="true" />
            +{{ session.coins_earned ?? 0 }}
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import AnimatedCounter from '@/components/ui/AnimatedCounter.vue'
import {
  PhScroll, PhSword, PhTrophy, PhSkull, PhCoins, PhCheckCircle,
  PhLightning,
} from '@phosphor-icons/vue'

const playerStore = usePlayerStore()
const activeFilter = ref('all')

const filters = [
  { key: 'all',  label: 'ทั้งหมด' },
  { key: 'win',  label: 'ชนะ'     },
  { key: 'lose', label: 'แพ้'     },
  { key: 'solo', label: 'Solo'    },
  { key: 'pvp',  label: 'PvP'     },
]

const filtered = computed(() => {
  const s = playerStore.sessions
  switch (activeFilter.value) {
    case 'win':  return s.filter(x => x.result === 'win')
    case 'lose': return s.filter(x => x.result !== 'win')
    case 'pvp':  return s.filter(x => x.mode === 'pvp')
    case 'solo': return s.filter(x => x.mode !== 'pvp')
    default:     return s
  }
})

const stats = computed(() => [
  { label: 'เกมทั้งหมด', num: playerStore.totalGames,  icon: PhSword,    color: 'text-qs-muted',   suffix: '' },
  { label: 'ชนะ',        num: playerStore.totalWins,   icon: PhTrophy,   color: 'text-qs-gold',    suffix: '' },
  { label: 'Win Rate',   num: playerStore.winRate,     icon: PhLightning, color: 'text-qs-primary', suffix: '%' },
  { label: 'Best Score', num: playerStore.bestScore,   icon: PhCoins,    color: 'text-qs-accent',  suffix: '' },
])

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}
function formatDuration(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

onMounted(() => playerStore.fetchHistory())
</script>
