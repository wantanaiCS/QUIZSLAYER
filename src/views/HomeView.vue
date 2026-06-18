<template>
  <div class="relative overflow-hidden min-h-screen">
    <div class="max-w-6xl mx-auto px-4 relative z-10">

      <!-- ── Hero ── -->
      <section class="text-center pt-14 pb-16 animate-fade-in">

        <!-- Badge with glow -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-qs-card/80 backdrop-blur-sm border border-qs-primary/40 text-qs-primary text-xs font-semibold mb-8 animate-pulse-slow shadow-[0_0_20px_rgba(108,99,255,0.3)]">
          <span class="w-2 h-2 rounded-full bg-qs-success animate-pulse" aria-hidden="true"></span>
          Educational RPG Game · หลายโหมด · ระบบ AI
        </div>

        <!-- Logo with particle effect -->
        <div class="flex justify-center mb-6 relative">
          <div class="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent blur-3xl" aria-hidden="true"></div>
          <img
            src="/QUIZSLAYER_logo.png"
            alt="QUIZSLAYER"
            class="h-[320px] md:h-[320px] w-auto object-contain drop-shadow-[0_0_40px_rgba(108,99,255,0.6)] animate-float relative z-10"
          />
        </div>

        <!-- Logged-in: welcome + stats strip -->
        <template v-if="authStore.isLoggedIn">
          <p class="text-qs-muted text-base md:text-lg mb-6 leading-relaxed">
            ยินดีต้อนรับกลับ, <span class="text-gradient-primary font-bold text-neon">{{ authStore.displayName }}</span>
            — พร้อมลงสนามแล้วหรือยัง?
          </p>

          <!-- Mini stats strip with glow -->
          <div class="inline-flex flex-wrap items-center justify-center gap-3 mb-8">
            <div v-for="stat in stats" :key="stat.label"
                 class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-qs-card/80 backdrop-blur-sm border border-qs-border hover:border-qs-primary/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(108,99,255,0.3)]">
              <component :is="stat.icon" :size="13" weight="duotone" :class="stat.color" class="icon-glow" aria-hidden="true" />
              <span class="text-xs font-bold text-qs-text">
                <AnimatedCounter :value="stat.value" :suffix="stat.suffix ?? ''" />
              </span>
              <span class="text-[10px] text-qs-muted">{{ stat.label }}</span>
            </div>
          </div>
        </template>

        <!-- Logged-out: tagline -->
        <template v-else>
          <p class="text-qs-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            เกม RPG เพื่อการศึกษา — สู้ Solo กับมอนสเตอร์ ท้าเพื่อนใน PvP<br class="hidden sm:block"/>
            อ่านฟรีโหมด หรือสร้างข้อสอบด้วย AI ได้ทันที
          </p>
        </template>

        <!-- CTA Buttons with enhanced style -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          <router-link to="/battle" class="group relative btn-primary text-base px-8 py-4 overflow-hidden">
            <span class="absolute inset-0 bg-gradient-to-r from-primary-light to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></span>
            <span class="relative flex items-center gap-2">
              <GameIcon name="sword" :size="18" />
              {{ authStore.isLoggedIn ? 'เริ่มเล่น' : 'เริ่มเล่นเลย' }}
            </span>
          </router-link>
          <router-link to="/pvp" class="group relative btn-ghost text-base px-8 py-4 overflow-hidden"
                       style="border-color: rgba(255,71,87,0.5); color: #ff6b6b;">
            <span class="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></span>
            <span class="relative flex items-center gap-2">
              <GameIcon name="crossed-swords" :size="18" />
              ท้าเพื่อน PvP
            </span>
          </router-link>
          <router-link v-if="!authStore.isLoggedIn" to="/login"
                       class="btn-ghost text-base px-8 py-4 gap-2">
            <PhUser :size="18" weight="duotone" aria-hidden="true" />
            เข้าสู่ระบบ
          </router-link>
        </div>
      </section>

      <!-- ── Game Modes ── -->
      <section class="mb-24">
        <h2 class="text-2xl font-bold text-center text-qs-text mb-2">เลือกโหมดที่ใช่</h2>
        <p class="text-qs-muted text-center text-sm mb-10">4 โหมดเกม รองรับทุกสไตล์การเล่น</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <router-link
            v-for="mode in gameModes"
            :key="mode.to"
            :to="mode.to"
            class="group card-glow-border card-tilt p-6 flex flex-col gap-4 relative"
          >
            <!-- Animated gradient background on hover -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-qs"
                 :style="{ background: mode.glow }" aria-hidden="true"></div>

            <!-- Icon with hex shape -->
            <div class="relative">
              <div class="w-16 h-16 rounded-qs flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                   :style="{ background: mode.bg }">
                <GameIcon :name="mode.iconName" :size="32" class="text-white drop-shadow-lg" />
              </div>
              <!-- Corner accent -->
              <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   :style="{ background: mode.accentColor }" aria-hidden="true"></div>
            </div>

            <div class="relative z-10">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-qs-text text-base">{{ mode.name }}</span>
                <span v-if="mode.tag" class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                      :class="mode.tagClass">{{ mode.tag }}</span>
              </div>
              <p class="text-qs-muted text-xs leading-relaxed">{{ mode.desc }}</p>
            </div>

            <div class="mt-auto flex items-center gap-1 text-xs font-semibold transition-all duration-200 relative z-10 group-hover:translate-x-1"
                 :style="{ color: mode.linkColor }">
              เล่นเลย
              <PhArrowRight :size="13" weight="bold" aria-hidden="true" />
            </div>
          </router-link>
        </div>
      </section>

      <!-- ── Logged-in: Recent Activity ── -->
      <section v-if="authStore.isLoggedIn" class="mb-24">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Recent battles -->
          <div class="card-glow-border p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-qs-text uppercase tracking-wide flex items-center gap-2">
                <GameIcon name="scroll-unfurled" :size="16" />
                การต่อสู้ล่าสุด
              </h2>
              <router-link to="/history" class="text-xs text-qs-primary hover:underline">ดูทั้งหมด</router-link>
            </div>
            <div v-if="playerStore.loading" class="space-y-2">
              <div v-for="n in 3" :key="n" class="h-14 bg-qs-surface rounded-qs animate-pulse"></div>
            </div>
            <div v-else-if="recentSessions.length === 0" class="card p-6 text-center text-qs-muted text-sm">
              <GameIcon name="sword" :size="28" class="mx-auto mb-2 opacity-30" />
              ยังไม่มีประวัติ — ลองต่อสู้ดูเลย!
            </div>
            <div v-else class="space-y-2">
              <div v-for="s in recentSessions" :key="s.id" class="card p-3 flex items-center gap-3 hover:border-qs-primary/30 transition-colors">
                <GameIcon
                  :name="s.result === 'win' ? 'trophy' : 'skull'"
                  :size="20"
                  :class="s.result === 'win' ? 'text-qs-gold' : 'text-qs-danger'"
                  class="flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-qs-text font-medium truncate">{{ s.quiz_sets?.title ?? 'Unknown' }}</p>
                  <p class="text-xs text-qs-muted">{{ formatDate(s.created_at) }}</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-sm font-bold" :class="s.result === 'win' ? 'text-qs-success' : 'text-qs-danger'">
                    {{ s.result === 'win' ? 'WIN' : 'LOSE' }}
                  </p>
                  <p class="text-xs text-qs-muted">{{ s.score ?? 0 }} pts</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Next Achievement -->
          <div class="card-glow-border p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-qs-text uppercase tracking-wide flex items-center gap-2">
                <GameIcon name="trophy" :size="16" />
                Achievement ถัดไป
              </h2>
              <router-link to="/achievements" class="text-xs text-qs-primary hover:underline">ดูทั้งหมด</router-link>
            </div>
            <div v-if="nextAchievement" class="card p-4 flex items-center gap-4">
              <div class="w-12 h-12 rounded-qs flex items-center justify-center bg-qs-primary/10 flex-shrink-0">
                <PhMedal :size="24" weight="duotone" class="text-qs-primary" aria-hidden="true" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-qs-text">{{ nextAchievement.name }}</p>
                <p class="text-xs text-qs-muted mb-2">{{ nextAchievement.desc }}</p>
                <div class="bar-container h-1.5 energy-bar">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    style="background: linear-gradient(90deg, #6c63ff, #8b5cf6);"
                    :style="{ width: nextAchievement.progressPct + '%' }"
                  ></div>
                </div>
                <p class="text-[10px] text-qs-muted mt-1">{{ nextAchievement.current }}/{{ nextAchievement.target }}</p>
              </div>
            </div>
            <div v-else class="card p-6 text-center text-qs-muted text-sm">
              <PhMedal :size="28" weight="duotone" class="mx-auto mb-2 text-qs-border" aria-hidden="true" />
              ยังไม่มี Achievement — ลองเล่นดูก่อน!
            </div>
          </div>

        </div>
      </section>

      <!-- ── Core Systems ── -->
      <section class="mb-24">
        <h2 class="text-2xl font-bold text-center text-qs-text mb-2">ระบบเกม</h2>
        <p class="text-qs-muted text-center text-sm mb-10">กลไกที่ทำให้ทุกเกมต่างกัน</p>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="feat in features" :key="feat.title" class="card-glow-border p-6 card-tilt group">
            <div class="flex items-center justify-center w-14 h-14 rounded-qs mb-4 mx-auto transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                 :style="{ background: feat.bg }">
              <GameIcon :name="feat.iconName" :size="28" class="text-white drop-shadow-lg" />
            </div>
            <h3 class="font-bold text-qs-text text-center mb-2">{{ feat.title }}</h3>
            <p class="text-qs-muted text-sm leading-relaxed text-center">{{ feat.desc }}</p>
          </div>
        </div>
      </section>

      <!-- ── CTA ── -->
      <section class="pb-20">
        <div class="card-glow-border p-12 text-center relative overflow-hidden">
          <div class="absolute inset-0 pointer-events-none" aria-hidden="true"
               style="background: linear-gradient(135deg, rgba(108,99,255,0.1), transparent 60%)"></div>
          <h2 class="text-3xl font-bold text-qs-text mb-4 relative z-10">พร้อมเป็น QuizSlayer?</h2>
          <p class="text-qs-muted mb-8 relative z-10">สร้างชุดข้อสอบจากหัวข้อที่คุณชอบ แล้วลงสนามรบเลย!</p>
          <div class="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <router-link to="/generator" class="btn-gold text-base px-8 py-4 gap-2">
              <GameIcon name="artificial-intelligence" :size="18" />
              สร้างข้อสอบด้วย AI
            </router-link>
            <router-link v-if="!authStore.isLoggedIn" to="/login" class="btn-ghost text-base px-8 py-4 gap-2">
              <PhUser :size="18" weight="duotone" aria-hidden="true" />
              เข้าสู่ระบบ
            </router-link>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useAchievementStore } from '@/stores/achievementStore'
import AnimatedCounter from '@/components/ui/AnimatedCounter.vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import {
  PhTrophy, PhSkull, PhMedal, PhArrowRight, PhUser,
  PhLightning, PhCoins,
} from '@phosphor-icons/vue'

const authStore        = useAuthStore()
const playerStore      = usePlayerStore()
const achievementStore = useAchievementStore()

onMounted(() => {
  if (authStore.isLoggedIn) {
    playerStore.fetchHistory()
  }
})

const recentSessions   = computed(() => playerStore.sessions.slice(0, 3))
const nextAchievement  = computed(() => achievementStore.nextUnlockable)

const stats = computed(() => [
  { label: 'ชนะ',        value: playerStore.totalWins, icon: PhTrophy,    color: 'text-qs-gold',    suffix: '' },
  { label: 'Win Rate',   value: playerStore.winRate,   icon: PhLightning, color: 'text-qs-primary', suffix: '%' },
  { label: 'Best Score', value: playerStore.bestScore, icon: PhTrophy,    color: 'text-qs-accent',  suffix: '' },
  { label: 'Coins',      value: authStore.coins,       icon: PhCoins,     color: 'text-qs-gold',    suffix: '' },
])

const gameModes = [
  {
    to: '/battle',
    iconName: 'sword',
    name: 'Battle Mode',
    tag: 'Solo',
    tagClass: 'bg-qs-primary/20 text-qs-primary',
    desc: 'ต่อสู้กับมอนสเตอร์ 5 ด่านด้วยการตอบคำถาม HP-based combat พร้อม Skill & Ultimate',
    bg: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
    glow: 'radial-gradient(ellipse at top left, rgba(108,99,255,0.15), transparent)',
    linkColor: '#8b5cf6',
    accentColor: '#8b5cf6',
  },
  {
    to: '/pvp',
    iconName: 'crossed-swords',
    name: 'PvP Mode',
    tag: 'Online',
    tagClass: 'bg-red-500/20 text-red-400',
    desc: 'ท้าเพื่อนแบบ Real-time เป่ายิงฉุบก่อน แล้วแข่งตอบคำถาม — มี Lucky Box ทุก 5 ข้อ',
    bg: 'linear-gradient(135deg, #ff4757, #ff6b6b)',
    glow: 'radial-gradient(ellipse at top left, rgba(255,71,87,0.15), transparent)',
    linkColor: '#ff6b6b',
    accentColor: '#ff6b6b',
  },
  {
    to: '/free',
    iconName: 'book',
    name: 'Free Mode',
    tag: 'ไม่มี Pressure',
    tagClass: 'bg-emerald-500/20 text-emerald-400',
    desc: 'ทบทวนข้อสอบแบบสบายๆ ไม่มี HP ไม่มีเวลา เหมาะสำหรับอ่านก่อนสอบ',
    bg: 'linear-gradient(135deg, #43d98f, #059669)',
    glow: 'radial-gradient(ellipse at top left, rgba(67,217,143,0.15), transparent)',
    linkColor: '#43d98f',
    accentColor: '#43d98f',
  },
  {
    to: '/generator',
    iconName: 'lightning-bolt',
    name: 'AI Generator',
    tag: 'AI',
    tagClass: 'bg-amber-500/20 text-amber-400',
    desc: 'ระบุหัวข้อหรืออัปโหลดเอกสาร — AI สร้างข้อสอบ 4 ตัวเลือกให้ทันที พร้อมนำไปเล่นได้เลย',
    bg: 'linear-gradient(135deg, #f4c842, #f97316)',
    glow: 'radial-gradient(ellipse at top left, rgba(244,200,66,0.15), transparent)',
    linkColor: '#f4c842',
    accentColor: '#f4c842',
  },
]

const features = [
  { iconName: 'clock', title: 'Bar Time System', bg: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', desc: 'Turn-based แบบไดนามิก — ใครเต็มก่อนได้ turn ก่อน ตอบถูกติดกันเพิ่มความเร็ว Bar' },
  { iconName: 'lightning-bolt', title: 'Streak & Skill', bg: 'linear-gradient(135deg, #f59e0b, #f97316)', desc: 'ตอบถูก 3 ติดกัน → ปลด Skill | ตอบถูก 5 ติดกัน → Ultimate ดาเมจหนัก' },
  { iconName: 'gem', title: 'AI Quiz Generator', bg: 'linear-gradient(135deg, #43d98f, #059669)', desc: 'ระบุหัวข้อหรืออัปโหลดเอกสาร → AI สร้างข้อสอบ 4 ตัวเลือกให้ทันที' },
  { iconName: 'health', title: 'HP System', bg: 'linear-gradient(135deg, #ef4444, #dc2626)', desc: 'HP ผูกกับจำนวนข้อสอบ ปรับตามโหมด Easy / Normal / Hard' },
  { iconName: 'crystal-ball', title: 'Lucky Box (PvP)', bg: 'linear-gradient(135deg, #a855f7, #9333ea)', desc: 'ทุก 5 ข้อใน PvP ได้รับไอเทม — ดูดHP ล็อกหน้าจอ สลับคำตอบ และอีกมาก' },
  { iconName: 'multiple-targets', title: 'Coins & Rewards', bg: 'linear-gradient(135deg, #f4c842, #d97706)', desc: 'รับเหรียญจากชนะ Perfect Run ใช้ปลดล็อก Achievement และตกแต่งตัวละคร' },
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}
</script>
