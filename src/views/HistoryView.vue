<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-qs-text mb-2">📜 ประวัติการต่อสู้</h1>
    <p class="text-qs-muted mb-10">สถิติและบันทึกทุกสมรภูมิ</p>

    <!-- Stats summary -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div v-for="stat in stats" :key="stat.label" class="card p-5 text-center">
        <div class="text-2xl font-bold text-gradient mb-1">{{ stat.value }}</div>
        <div class="text-qs-muted text-xs">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Session list -->
    <div v-if="playerStore.loading" class="text-center py-16 text-qs-muted">กำลังโหลด...</div>
    <div v-else-if="playerStore.sessions.length === 0" class="card p-12 text-center">
      <div class="text-4xl mb-4">⚔️</div>
      <p class="text-qs-muted mb-6">ยังไม่มีประวัติการต่อสู้ ลองเล่นดูเลย!</p>
      <router-link to="/battle" class="btn-primary">เริ่มต่อสู้</router-link>
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="session in playerStore.sessions"
        :key="session.id"
        class="card p-5 flex items-center gap-4"
      >
        <div class="text-2xl">{{ session.result === 'win' ? '🏆' : '💀' }}</div>
        <div class="flex-1">
          <div class="font-medium text-qs-text">{{ session.quiz_sets?.title ?? 'Unknown Quiz' }}</div>
          <div class="text-xs text-qs-muted mt-1">
            {{ session.difficulty }} · Stage {{ session.stage_reached }}/5 ·
            ถูก {{ session.total_correct ?? 0 }}/{{ session.total_answered ?? 0 }} ·
            {{ formatDuration(session.duration_seconds ?? 0) }} ·
            {{ new Date(session.created_at).toLocaleDateString('th-TH') }}
          </div>
        </div>
        <div class="text-right">
          <div class="font-bold text-qs-accent">{{ session.score }} pts</div>
          <div class="text-xs text-qs-gold">+{{ session.coins_earned }} 🪙</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'

const playerStore = usePlayerStore()

const stats = computed(() => [
  { label: 'เกมทั้งหมด',   value: playerStore.totalGames },
  { label: 'ชนะ',          value: playerStore.totalWins },
  { label: 'Win Rate',     value: `${playerStore.winRate}%` },
  { label: 'คะแนนสูงสุด', value: playerStore.bestScore },
])

onMounted(() => playerStore.fetchHistory())

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  const rest = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${rest}`
}
</script>
