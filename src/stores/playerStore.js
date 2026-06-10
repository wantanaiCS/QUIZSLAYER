import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export const usePlayerStore = defineStore('player', () => {
  const sessions    = ref([])
  const loading     = ref(false)
  const error       = ref(null)

  const totalWins   = computed(() => sessions.value.filter(s => s.result === 'win').length)
  const totalGames  = computed(() => sessions.value.length)
  const winRate     = computed(() => totalGames.value ? Math.round((totalWins.value / totalGames.value) * 100) : 0)
  const bestScore   = computed(() => sessions.value.reduce((max, s) => Math.max(max, s.score ?? 0), 0))

  async function fetchHistory() {
    const authStore = useAuthStore()
    if (!authStore.user) return
    loading.value = true
    const { data, error: err } = await supabase
      .from('game_sessions')
      .select('*, quiz_sets(title)')
      .eq('player_id', authStore.user.id)
      .order('played_at', { ascending: false })
      .limit(50)
    if (!err) sessions.value = data ?? []
    else error.value = err.message
    loading.value = false
  }

  /**
   * Save a completed game session to Supabase
   */
  async function saveSession(payload) {
    const authStore = useAuthStore()
    if (!authStore.user) return
    const { data, error: err } = await supabase
      .from('game_sessions')
      .insert({ player_id: authStore.user.id, ...payload })
      .select()
      .single()
    if (!err) {
      sessions.value.unshift(data)
      // Update coin balance in profile
      if (payload.coins_earned > 0) {
        await supabase.rpc('increment_coins', {
          user_id: authStore.user.id,
          amount:  payload.coins_earned,
        })
      }
    } else {
      error.value = err.message
    }
    return data
  }

  return {
    sessions, loading, error,
    totalWins, totalGames, winRate, bestScore,
    fetchHistory, saveSession,
  }
})
