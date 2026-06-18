<template>
  <div class="min-h-screen flex flex-col bg-qs-bg">

    <!-- Navigation -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 border-b border-qs-border px-4 py-0"
      style="backdrop-filter: blur(12px); background: rgba(13,15,26,0.85);"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between h-16 gap-2">

        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2 group flex-shrink-0" aria-label="QuizSlayer Home">
          <img src="/LogoNav.png" alt="QuizSlayer" class="h-16 w-auto object-contain flex-shrink-0" />
        </router-link>

        <!-- Nav links — desktop (lg+) -->
        <div class="hidden lg:flex items-center gap-0.5 flex-1 justify-center" role="navigation" aria-label="Main navigation">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-qs text-sm font-medium text-qs-muted
                   transition-all duration-150 hover:text-qs-text hover:bg-qs-card group"
            active-class="!text-qs-primary !bg-qs-card nav-active"
          >
            <GameIcon :name="link.iconName" :size="15" aria-hidden="true" />
            {{ link.label }}
            <!-- Active underline -->
            <span class="absolute bottom-0 left-2 right-2 h-0.5 rounded-full opacity-0 transition-opacity duration-200
                         group-[.nav-active]:opacity-100"
                  style="background: linear-gradient(90deg, #6c63ff, #8b5cf6);"
                  aria-hidden="true"></span>
          </router-link>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <template v-if="authStore.isLoggedIn">
            <!-- Coins -->
            <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-qs-card border border-qs-border">
              <PhCoins :size="14" weight="duotone" class="text-qs-gold" aria-hidden="true" />
              <AnimatedCounter :value="authStore.coins" class="text-qs-gold font-bold text-sm" />
            </div>
            <!-- Bell placeholder -->
            <button class="btn-icon hidden sm:flex" aria-label="การแจ้งเตือน">
              <PhBell :size="16" weight="duotone" aria-hidden="true" />
            </button>
            <!-- Avatar / profile link -->
            <router-link
              to="/profile"
              class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-qs hover:shadow-qs-glow transition-all flex-shrink-0"
              style="background: linear-gradient(135deg, #6c63ff, #9c27b0);"
              :aria-label="'Profile: ' + authStore.displayName"
            >
              {{ authStore.displayName.charAt(0).toUpperCase() }}
            </router-link>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-primary text-sm px-4 py-2">เข้าสู่ระบบ</router-link>
          </template>

          <!-- Hamburger — mobile / tablet -->
          <button
            class="lg:hidden btn-icon"
            :aria-label="menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <PhList v-if="!menuOpen" :size="18" weight="bold" aria-hidden="true" />
            <PhX    v-else           :size="18" weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile bottom-sheet overlay -->
    <Transition name="sheet-bg">
      <div
        v-if="menuOpen"
        class="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        @click="menuOpen = false"
        aria-hidden="true"
      ></div>
    </Transition>

    <!-- Mobile bottom-sheet menu -->
    <Transition name="sheet-slide">
      <nav
        v-if="menuOpen"
        class="lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-qs-lg border-t border-qs-border pt-4 pb-safe"
        style="background: rgba(20,22,38,0.98); backdrop-filter: blur(16px);"
        aria-label="Mobile navigation"
      >
        <!-- Handle bar -->
        <div class="flex justify-center mb-3">
          <div class="w-10 h-1 rounded-full bg-qs-border"></div>
        </div>

        <!-- Nav items grid -->
        <div class="grid grid-cols-3 gap-1 px-4 mb-3">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="flex flex-col items-center gap-1.5 py-3 rounded-qs text-xs font-medium text-qs-muted
                   hover:text-qs-text hover:bg-qs-card transition-all"
            active-class="!text-qs-primary !bg-qs-card"
            @click="menuOpen = false"
          >
            <GameIcon :name="link.iconName" :size="20" aria-hidden="true" />
            {{ link.label }}
          </router-link>
        </div>

        <!-- Bottom bar: coins + profile -->
        <div class="border-t border-qs-border px-4 py-3 flex items-center justify-between">
          <div v-if="authStore.isLoggedIn" class="flex items-center gap-2">
            <PhCoins :size="16" weight="duotone" class="text-qs-gold" aria-hidden="true" />
            <AnimatedCounter :value="authStore.coins" class="text-qs-gold font-bold text-sm" />
          </div>
          <div v-else></div>
          <router-link
            to="/profile"
            class="btn-ghost text-xs px-3 py-1.5 gap-1.5"
            @click="menuOpen = false"
          >
            <PhUser :size="14" weight="bold" aria-hidden="true" />
            {{ authStore.isLoggedIn ? authStore.displayName : 'เข้าสู่ระบบ' }}
          </router-link>
        </div>
      </nav>
    </Transition>

    <!-- Global Background Effect (changes per route) -->
    <BackgroundEffect 
      :bg-image="currentBg?.image || '/bg_01.png'" 
      :effect="currentBg?.effect || 'fireflies'" 
      :particle-count="currentBg?.particles || 12" 
    />

    <!-- Main content -->
    <main class="flex-1 pt-16 relative z-10">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Toast system -->
    <ToastProvider />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import BackgroundEffect from '@/components/ui/BackgroundEffect.vue'
import ToastProvider from '@/components/ui/ToastProvider.vue'
import AnimatedCounter from '@/components/ui/AnimatedCounter.vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import {
  PhCoins,
  PhBell,
  PhUser,
  PhList,
  PhX,
} from '@phosphor-icons/vue'

const route     = useRoute()
const authStore = useAuthStore()
const menuOpen  = ref(false)

const navLinks = [
  { to: '/battle',     iconName: 'sword',              label: 'Battle'     },
  { to: '/pvp',        iconName: 'player-thunder-struck', label: 'PvP'        },
  { to: '/free',       iconName: 'book',               label: 'Free Mode'  },
  { to: '/generator',  iconName: 'lightning-bolt',     label: 'Generator'  },
  { to: '/my-quizzes', iconName: 'scroll-unfurled',    label: 'My Quizzes' },
  { to: '/history',    iconName: 'scroll',             label: 'History'    },
]

// Background configuration per route
const bgConfig = {
  '/': { image: '/bg_01.png', effect: 'fireflies', particles: 12 },
  '/battle': { image: '/bg_04.png', effect: 'ash-sparks', particles: 12 },
  '/pvp': { image: '/bg_05.png', effect: 'snow-ash', particles: 18 }, // เพิ่มหิมะ: 18 (เดิม 12)
  '/pvp/battle': { image: '/bg_05.png', effect: 'snow-ash', particles: 20 }, // เพิ่มหิมะ: 20 (เดิม 15)
  '/free': { image: '/bg_02.png', effect: 'fireflies-blue', particles: 10 },
  '/generator': { image: '/bg_03.png', effect: 'snow', particles: 16 }, // เพิ่มหิมะ: 16 (เดิม 12)
  '/my-quizzes': { image: '/bg_01.png', effect: 'fireflies', particles: 10 },
  '/history': { image: '/bg_01.png', effect: 'fireflies', particles: 10 },
  '/profile': { image: '/bg_01.png', effect: 'fireflies', particles: 10 },
  '/achievements': { image: '/bg_01.png', effect: 'fireflies', particles: 10 },
  '/login': { image: '/bg_01.png', effect: 'fireflies', particles: 10 },
  '/reset-password': { image: '/bg_01.png', effect: 'fireflies', particles: 10 },
}

const currentBg = computed(() => {
  const path = route.path
  const config = bgConfig[path] || bgConfig['/']
  
  // Debug log
  console.log('🎨 Background Config:', { 
    path, 
    config,
    bgImage: config?.image,
    effect: config?.effect 
  })
  
  return config
})
</script>

<style>
/* Page transition - Slower for smooth background change */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-fade-enter-from { opacity: 0; transform: translateY(8px); }
.page-fade-leave-to   { opacity: 0; transform: translateY(-8px); }

/* Bottom sheet backdrop */
.sheet-bg-enter-active,
.sheet-bg-leave-active { transition: opacity 0.25s ease; }
.sheet-bg-enter-from,
.sheet-bg-leave-to     { opacity: 0; }

/* Bottom sheet slide */
.sheet-slide-enter-active { transition: transform 0.25s ease-out; }
.sheet-slide-leave-active { transition: transform 0.2s ease-in; }
.sheet-slide-enter-from   { transform: translateY(100%); }
.sheet-slide-leave-to     { transform: translateY(100%); }

/* safe bottom padding for notched phones */
.pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }

/* active nav underline */
a.nav-active .nav-underline { opacity: 1; }
</style>
