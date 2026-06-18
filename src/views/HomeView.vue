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

        <!-- Logged-in: welcome message (stats hidden) -->
        <template v-if="authStore.isLoggedIn">
          <p class="text-qs-muted text-base md:text-lg mb-10 leading-relaxed">
            ยินดีต้อนรับกลับ, <span class="text-gradient-primary font-bold text-neon">{{ authStore.displayName }}</span>
            — พร้อมลงสนามแล้วหรือยัง?
          </p>
        </template>

        <!-- Logged-out: tagline -->
        <template v-else>
          <p class="text-qs-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            เกม RPG เพื่อการศึกษา — สู้ Solo กับมอนสเตอร์ ท้าเพื่อนใน PvP<br class="hidden sm:block"/>
            อ่านฟรีโหมด หรือสร้างข้อสอบด้วย AI ได้ทันที
          </p>
        </template>

        <!-- CTA Buttons with Liquid Glass style -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          <router-link to="/battle" class="glass-button glass-button-danger text-base px-8 py-4">
            <span class="glass-button-content font-pixel text-sm">
              <GameIcon name="sword" :size="18" />
              PLAY
            </span>
          </router-link>
          <router-link v-if="!authStore.isLoggedIn" to="/login"
                       class="glass-button glass-button-primary text-base px-8 py-4">
            <span class="glass-button-content font-pixel text-sm">
              <GameIcon name="player" :size="18" />
              LOGIN
            </span>
          </router-link>
        </div>
      </section>

      <!-- ── Game Modes ── -->
      <section class="mb-24">
        <h2 class="section-title">GAME MODES</h2>
        <p class="section-description">4 โหมดเกม รองรับทุกสไตล์การเล่น</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <router-link
            v-for="mode in gameModes"
            :key="mode.to"
            :to="mode.to"
            class="glass-card group relative p-6 flex flex-col gap-4"
          >
            <!-- Icon - Pixel Art Style with Gradient Effect -->
            <div class="relative flex justify-center">
              <div class="icon-gradient transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                   :style="{ '--icon-gradient': mode.iconGradient }">
                <GameIcon :name="mode.iconName" :size="52" class="drop-shadow-lg" />
              </div>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-center gap-2 mb-2">
                <span class="font-pixel text-qs-text text-sm uppercase tracking-wider text-center">{{ mode.name }}</span>
                <span v-if="mode.tag" class="text-[10px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm"
                      :class="mode.tagClass">{{ mode.tag }}</span>
              </div>
              <p class="text-qs-muted text-xs leading-relaxed font-thai text-center">{{ mode.desc }}</p>
            </div>

            <div class="mt-auto flex items-center justify-center gap-1 font-pixel text-xs font-semibold transition-all duration-200 relative z-10 group-hover:translate-x-1 uppercase tracking-wider"
                 :style="{ color: mode.linkColor }">
              PLAY
              <GameIcon name="arrow-right" :size="13" />
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
        <h2 class="section-title">GAME SYSTEMS</h2>
        <p class="section-description">กลไกที่ทำให้ทุกเกมต่างกัน</p>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="feat in features" :key="feat.title" class="glass-card group p-6">
            <div class="flex justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <GameIcon :name="feat.iconName" :size="36" class="text-qs-primary drop-shadow-lg" />
            </div>
            <h3 class="font-pixel text-xs text-qs-text text-center mb-2 uppercase tracking-wider">{{ feat.title }}</h3>
            <p class="text-qs-muted text-sm leading-relaxed text-center font-thai">{{ feat.desc }}</p>
          </div>
        </div>
      </section>

      <!-- ── CTA ── -->
      <section class="pb-20">
        <div class="glass-card p-12 text-center relative overflow-hidden">
          <h2 class="text-3xl font-bold text-qs-text mb-4 relative z-10">พร้อมเป็น QuizSlayer?</h2>
          <p class="text-qs-muted mb-8 relative z-10">สร้างชุดข้อสอบจากหัวข้อที่คุณชอบ แล้วลงสนามรบเลย!</p>
          <div class="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <router-link to="/generator" class="glass-button glass-button-gold text-base px-8 py-4">
              <span class="glass-button-content">
                <GameIcon name="lightning-bolt" :size="18" />
                สร้างข้อสอบด้วย AI
              </span>
            </router-link>
            <router-link v-if="!authStore.isLoggedIn" to="/login" class="glass-button glass-button-ghost text-base px-8 py-4">
              <span class="glass-button-content">
                <GameIcon name="player" :size="18" />
                เข้าสู่ระบบ
              </span>
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
  PhTrophy, PhSkull, PhMedal,
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

const gameModes = [
  {
    to: '/battle',
    iconName: 'sword',
    name: 'BATTLE',
    tag: 'Solo',
    tagClass: 'bg-qs-primary/20 text-qs-primary',
    desc: 'ท้า 5 ด่าน — ตอบผิดเสียเลือด ตอบถูกปล่อยสกิล',
    linkColor: '#ff6b6b',
    iconGradient: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
  },
  {
    to: '/pvp',
    iconName: 'player-thunder-struck',
    name: 'PvP',
    tag: 'Online',
    tagClass: 'bg-red-500/20 text-red-400',
    desc: 'เป่ายิ้งฉุบ → ใครตอบเร็วใครได้เทิร์น — มีกล่องสุ่มไอเทม',
    linkColor: '#ff8e53',
    iconGradient: 'linear-gradient(135deg, #ff8e53, #ffa726)',
  },
  {
    to: '/free',
    iconName: 'book',
    name: 'FREE',
    tag: 'ไม่มี Pressure',
    tagClass: 'bg-emerald-500/20 text-emerald-400',
    desc: 'อ่านข้อสอบไม่มีเวลา ไม่มี HP — เหมาะสำหรับทบทวน',
    linkColor: '#43d98f',
    iconGradient: 'linear-gradient(135deg, #43d98f, #5eead4)',
  },
  {
    to: '/generator',
    iconName: 'lightning-bolt',
    name: 'AI GENERATOR',
    tag: 'AI',
    tagClass: 'bg-amber-500/20 text-amber-400',
    desc: 'พิมพ์หัวข้อหรืออัปโหลดไฟล์ → AI สร้างข้อสอบให้ในพริบตา',
    linkColor: '#f4c842',
    iconGradient: 'linear-gradient(135deg, #f4c842, #ffd93d)',
  },
]

const features = [
  { iconName: 'hourglass', title: 'Bar Time', desc: 'ใครเต็มก่อนได้ turn ก่อน — ตอบถูกติดเร่ง Bar เร็วขึ้น' },
  { iconName: 'burning-embers', title: 'Streak & Skill', desc: 'ตอบถูก 3 ติด → Skill | ตอบถูก 5 ติด → Ultimate' },
  { iconName: 'lightning-bolt', title: 'AI Generator', desc: 'พิมพ์หัวข้อ → AI สร้างข้อสอบให้ทันที' },
  { iconName: 'hearts', title: 'HP System', desc: 'HP ผูกกับจำนวนข้อสอบ ปรับตาม Easy / Normal / Hard' },
  { iconName: 'gem', title: 'Lucky Box', desc: 'ทุก 5 ข้อใน PvP ได้ไอเทม — ดูดHP ล็อกหน้าจอ สลับคำตอบ' },
  { iconName: 'gold-bar', title: 'Coins & Rewards', desc: 'รับเหรียญจากชนะ ใช้ปลดล็อก Achievement และตกแต่งตัวละคร' },
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}
</script>
