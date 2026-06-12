import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isMockMode } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

const MOCK_SESSIONS_KEY = 'quizslayer:mock-sessions'

function readMockSessions() {
  try {
    const sessions = JSON.parse(localStorage.getItem(MOCK_SESSIONS_KEY) || '[]')
    return Array.isArray(sessions) ? sessions : []
  } catch {
    return []
  }
}

function writeMockSessions(sessions) {
  try {
    localStorage.setItem(MOCK_SESSIONS_KEY, JSON.stringify(sessions))
  } catch {
    // Ignore mock storage failures.
  }
}

export const usePlayerStore = defineStore('player', () => {
  const sessions = ref([])
  const loading = ref(false)
  const error = ref(null)

  const totalWins = computed(() => sessions.value.filter(s => s.result === 'win').length)
  const totalGames = computed(() => sessions.value.length)
  const winRate = computed(() => totalGames.value ? Math.round((totalWins.value / totalGames.value) * 100) : 0)
  const bestScore = computed(() => sessions.value.reduce((max, s) => Math.max(max, s.score ?? 0), 0))

  async function fetchHistory() {
    const authStore = useAuthStore()
    if (!authStore.user) return
    loading.value = true
    error.value = null

    if (isMockMode) {
      sessions.value = readMockSessions()
      loading.value = false
      return
    }

    const { data, error: err } = await supabase
      .from('game_sessions')
      .select('*, quiz_sets(title)')
      .eq('player_id', authStore.user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    if (!err) sessions.value = data ?? []
    else error.value = err.message
    loading.value = false
  }

  async function saveSession(payload) {
    const authStore = useAuthStore()
    if (!authStore.user) return null
    error.value = null

    const sessionPayload = {
      ...payload,
      coins_earned: payload.result === 'win' ? payload.coins_earned : 0,
      answer_summary: payload.answer_summary ?? [],
    }

    if (isMockMode) {
      const session = {
        id: `mock-session-${Date.now()}`,
        player_id: authStore.user.id,
        created_at: new Date().toISOString(),
        quiz_sets: { title: payload.quiz_title ?? 'Mock Quiz' },
        ...sessionPayload,
      }
      const nextSessions = [session, ...readMockSessions()].slice(0, 50)
      sessions.value = nextSessions
      writeMockSessions(nextSessions)
      const nextProfile = {
        ...authStore.profile,
        coins: (authStore.profile?.coins ?? 0) + session.coins_earned,
      }
      authStore.writeMockProfile(nextProfile)
      return session
    }

    const { data, error: err } = await supabase.rpc('record_game_session', {
      p_quiz_set_id: sessionPayload.quiz_set_id,
      p_difficulty: sessionPayload.difficulty,
      p_stage_reached: sessionPayload.stage_reached,
      p_result: sessionPayload.result,
      p_score: sessionPayload.score,
      p_monsters_killed: sessionPayload.monsters_killed,
      p_total_answered: sessionPayload.total_answered,
      p_total_correct: sessionPayload.total_correct,
      p_duration_seconds: sessionPayload.duration_seconds,
      p_coins_earned: sessionPayload.coins_earned,
      p_answer_summary: sessionPayload.answer_summary,
    })

    if (err) {
      error.value = err.message
      return null
    }

    if (data) sessions.value.unshift(data)
    await authStore.fetchProfile(authStore.user.id)
    return data
  }

  return {
    sessions, loading, error,
    totalWins, totalGames, winRate, bestScore,
    fetchHistory, saveSession,
  }
})
