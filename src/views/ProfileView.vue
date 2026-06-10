<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <div class="card p-8 text-center">
      <!-- Avatar -->
      <div class="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-4xl font-bold mx-auto mb-6 shadow-qs-glow">
        {{ authStore.displayName.charAt(0).toUpperCase() }}
      </div>
      <h1 class="text-2xl font-bold text-qs-text mb-1">{{ authStore.displayName }}</h1>
      <p class="text-qs-muted text-sm mb-8">{{ authStore.user?.email }}</p>

      <!-- Coin balance -->
      <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-qs-surface border border-qs-border mb-10">
        <span class="text-2xl">🪙</span>
        <span class="text-qs-gold font-bold text-xl">{{ authStore.coins }}</span>
        <span class="text-qs-muted text-sm">coins</span>
      </div>

      <!-- Quick stats -->
      <div class="grid grid-cols-3 gap-4 mb-10">
        <div class="card p-4">
          <div class="text-xl font-bold text-gradient">{{ playerStore.totalGames }}</div>
          <div class="text-xs text-qs-muted mt-1">เกมทั้งหมด</div>
        </div>
        <div class="card p-4">
          <div class="text-xl font-bold text-qs-success">{{ playerStore.totalWins }}</div>
          <div class="text-xs text-qs-muted mt-1">ชนะ</div>
        </div>
        <div class="card p-4">
          <div class="text-xl font-bold text-qs-accent">{{ playerStore.winRate }}%</div>
          <div class="text-xs text-qs-muted mt-1">Win Rate</div>
        </div>
      </div>

      <button class="btn-danger px-8" @click="logout">ออกจากระบบ</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePlayerStore } from '@/stores/playerStore'

const router      = useRouter()
const authStore   = useAuthStore()
const playerStore = usePlayerStore()

async function logout() {
  await authStore.signOut()
  router.push('/')
}

onMounted(() => playerStore.fetchHistory())
</script>
