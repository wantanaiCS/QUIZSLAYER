<template>
  <div class="min-h-screen flex flex-col bg-qs-bg">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 card-glass border-b border-qs-border px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-9 h-9 rounded-qs bg-gradient-primary flex items-center justify-center shadow-qs-glow group-hover:shadow-qs-glow transition-all">
            <span class="text-lg">⚔️</span>
          </div>
          <span class="font-pixel text-sm text-gradient">QUIZSLAYER</span>
        </router-link>

        <!-- Nav links -->
        <div class="hidden md:flex items-center gap-1">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-4 py-2 rounded-qs text-sm font-medium text-qs-muted transition-all hover:text-qs-text hover:bg-qs-card"
            active-class="!text-qs-primary !bg-qs-card"
          >
            {{ link.label }}
          </router-link>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <template v-if="authStore.isLoggedIn">
            <!-- Coin display -->
            <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-qs-card border border-qs-border">
              <span class="text-base animate-spin-slow" style="animation: none">🪙</span>
              <span class="text-qs-gold font-bold text-sm">{{ authStore.coins }}</span>
            </div>
            <!-- Avatar -->
            <router-link to="/profile" class="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-qs hover:shadow-qs-glow transition-all">
              {{ authStore.displayName.charAt(0).toUpperCase() }}
            </router-link>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-primary text-sm px-4 py-2">
              เข้าสู่ระบบ
            </router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="flex-1 pt-20">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const navLinks = [
  { to: '/',           label: 'หน้าหลัก' },
  { to: '/generator',  label: 'สร้างข้อสอบ' },
  { to: '/my-quizzes', label: 'ชุดข้อสอบ' },
  { to: '/history',    label: 'ประวัติ' },
]
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
