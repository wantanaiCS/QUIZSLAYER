<template>
  <div class="min-h-screen flex flex-col bg-qs-bg">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 card-glass border-b border-qs-border px-4 py-3">
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2 group flex-shrink-0">
          <div class="w-8 h-8 rounded-qs bg-gradient-primary flex items-center justify-center shadow-qs-glow group-hover:shadow-qs-glow transition-all">
            <span class="text-base">⚔️</span>
          </div>
          <span class="font-pixel text-xs text-gradient hidden sm:block">QUIZSLAYER</span>
        </router-link>

        <!-- Nav links — desktop -->
        <div class="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-3 py-1.5 rounded-qs text-sm font-medium text-qs-muted transition-all hover:text-qs-text hover:bg-qs-card"
            active-class="!text-qs-primary !bg-qs-card"
          >
            {{ link.label }}
          </router-link>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-2">
          <template v-if="authStore.isLoggedIn">
            <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-qs-card border border-qs-border">
              <span>🪙</span>
              <span class="text-qs-gold font-bold text-sm">{{ authStore.coins }}</span>
            </div>
            <router-link to="/profile" class="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-qs hover:shadow-qs-glow transition-all flex-shrink-0">
              {{ authStore.displayName.charAt(0).toUpperCase() }}
            </router-link>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-primary text-sm px-4 py-2">เข้าสู่ระบบ</router-link>
          </template>

          <!-- Hamburger — mobile/tablet -->
          <button
            class="lg:hidden p-2 rounded-qs bg-qs-card border border-qs-border text-qs-muted hover:text-qs-text transition-all"
            @click="menuOpen = !menuOpen"
          >
            <svg v-if="!menuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile dropdown menu -->
      <Transition name="menu-drop">
        <div v-if="menuOpen" class="lg:hidden mt-2 pt-2 border-t border-qs-border space-y-0.5">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center px-4 py-2.5 rounded-qs text-sm font-medium text-qs-muted hover:text-qs-text hover:bg-qs-card transition-all"
            active-class="!text-qs-primary !bg-qs-card"
            @click="menuOpen = false"
          >
            {{ link.label }}
          </router-link>
          <div v-if="authStore.isLoggedIn" class="flex items-center px-4 py-2.5 gap-2">
            <span>🪙</span>
            <span class="text-qs-gold font-bold text-sm">{{ authStore.coins }}</span>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Main content -->
    <main class="flex-1 pt-[52px]">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const menuOpen  = ref(false)

const navLinks = [
  { to: '/',           label: 'หน้าหลัก' },
  { to: '/battle',     label: '⚔️ Battle' },
  { to: '/pvp',        label: '🆚 PvP' },
  { to: '/free',       label: '📖 Free Mode' },
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
.fade-enter-from { opacity: 0; transform: translateY(8px); }
.fade-leave-to   { opacity: 0; transform: translateY(-8px); }

.menu-drop-enter-active { transition: all 0.2s ease; }
.menu-drop-enter-from   { opacity: 0; transform: translateY(-6px); }
.menu-drop-leave-active { transition: all 0.15s ease; }
.menu-drop-leave-to     { opacity: 0; transform: translateY(-6px); }
</style>
