import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useAuthStore } from '@/stores/authStore'
import { useQuizStore } from '@/stores/quizStore'

// ── Badge Definitions ──────────────────────────────────────────────────────
export const BADGES = [
  // Combat
  {
    id: 'first_blood',
    name: 'First Blood',
    desc: 'ชนะ Battle ครั้งแรก',
    category: 'Combat',
    check: ({ wins }) => wins >= 1,
    progress: ({ wins }) => ({ current: Math.min(wins, 1), target: 1 }),
  },
  {
    id: 'slayer',
    name: 'Slayer',
    desc: 'ชนะ 10 battles',
    category: 'Combat',
    check: ({ wins }) => wins >= 10,
    progress: ({ wins }) => ({ current: Math.min(wins, 10), target: 10 }),
  },
  {
    id: 'legend',
    name: 'Legend',
    desc: 'ชนะ 50 battles',
    category: 'Combat',
    check: ({ wins }) => wins >= 50,
    progress: ({ wins }) => ({ current: Math.min(wins, 50), target: 50 }),
  },
  {
    id: 'perfect_run',
    name: 'Perfect Run',
    desc: 'ชนะโดยที่ HP ไม่ลด',
    category: 'Combat',
    check: ({ sessions }) => sessions.some(s => s.result === 'win' && s.damage_taken === 0),
    progress: ({ sessions }) => ({
      current: sessions.some(s => s.result === 'win' && s.damage_taken === 0) ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'hard_boiled',
    name: 'Hard Boiled',
    desc: 'ชนะ Hard mode',
    category: 'Combat',
    check: ({ sessions }) => sessions.some(s => s.result === 'win' && s.difficulty === 'hard'),
    progress: ({ sessions }) => ({
      current: sessions.filter(s => s.result === 'win' && s.difficulty === 'hard').length,
      target: 1,
    }),
  },
  // Knowledge
  {
    id: 'scholar',
    name: 'Scholar',
    desc: 'ตอบถูกรวม 100 ข้อ',
    category: 'Knowledge',
    check: ({ totalCorrect }) => totalCorrect >= 100,
    progress: ({ totalCorrect }) => ({ current: Math.min(totalCorrect, 100), target: 100 }),
  },
  {
    id: 'full_marks',
    name: 'Full Marks',
    desc: 'ตอบถูกทุกข้อใน 1 game',
    category: 'Knowledge',
    check: ({ sessions }) => sessions.some(
      s => s.result === 'win' && s.total_correct > 0 && s.total_correct === s.total_answered,
    ),
    progress: ({ sessions }) => ({
      current: sessions.some(s => s.result === 'win' && s.total_correct === s.total_answered && s.total_correct > 0) ? 1 : 0,
      target: 1,
    }),
  },
  // PvP
  {
    id: 'challenger',
    name: 'Challenger',
    desc: 'เล่น PvP ครั้งแรก',
    category: 'PvP',
    check: ({ pvpGames }) => pvpGames >= 1,
    progress: ({ pvpGames }) => ({ current: Math.min(pvpGames, 1), target: 1 }),
  },
  {
    id: 'duelist',
    name: 'Duelist',
    desc: 'ชนะ PvP 5 ครั้ง',
    category: 'PvP',
    check: ({ pvpWins }) => pvpWins >= 5,
    progress: ({ pvpWins }) => ({ current: Math.min(pvpWins, 5), target: 5 }),
  },
  {
    id: 'champion',
    name: 'Champion',
    desc: 'ชนะ PvP 20 ครั้ง',
    category: 'PvP',
    check: ({ pvpWins }) => pvpWins >= 20,
    progress: ({ pvpWins }) => ({ current: Math.min(pvpWins, 20), target: 20 }),
  },
  // Creator
  {
    id: 'architect',
    name: 'Architect',
    desc: 'สร้าง quiz set แรก',
    category: 'Creator',
    check: ({ quizSets }) => quizSets >= 1,
    progress: ({ quizSets }) => ({ current: Math.min(quizSets, 1), target: 1 }),
  },
  {
    id: 'master_builder',
    name: 'Master Builder',
    desc: 'สร้าง 5 quiz sets',
    category: 'Creator',
    check: ({ quizSets }) => quizSets >= 5,
    progress: ({ quizSets }) => ({ current: Math.min(quizSets, 5), target: 5 }),
  },
]

export const useAchievementStore = defineStore('achievement', () => {
  const unlocked = ref([])
  const computed_at = ref(null)

  function getStats() {
    const playerStore = usePlayerStore()
    const authStore   = useAuthStore()
    const quizStore   = useQuizStore()

    const sessions     = playerStore.sessions ?? []
    const wins         = sessions.filter(s => s.result === 'win').length
    const pvpSessions  = sessions.filter(s => s.mode === 'pvp')
    const pvpGames     = pvpSessions.length
    const pvpWins      = pvpSessions.filter(s => s.result === 'win').length
    const totalCorrect = sessions.reduce((sum, s) => sum + (s.total_correct ?? 0), 0)
    const quizSets     = (quizStore.quizSets ?? []).filter(
      s => s.author_id === authStore.user?.id && !s.id?.startsWith('mock-'),
    ).length

    return { sessions, wins, pvpGames, pvpWins, totalCorrect, quizSets }
  }

  function compute() {
    const stats = getStats()
    unlocked.value = BADGES.filter(b => b.check(stats))
    computed_at.value = Date.now()
  }

  // Next badge a user is closest to unlocking
  const nextUnlockable = computed(() => {
    const stats = getStats()
    const locked = BADGES.filter(b => !b.check(stats))
    if (!locked.length) return null

    let best = null
    let bestPct = -1
    for (const b of locked) {
      const { current, target } = b.progress(stats)
      const pct = target > 0 ? (current / target) * 100 : 0
      if (pct > bestPct) { bestPct = pct; best = { ...b, current, target, progressPct: Math.round(pct) } }
    }
    return best
  })

  return { unlocked, nextUnlockable, compute, BADGES }
})
