import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isMockMode } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user        = ref(null)
  const profile     = ref(null)
  const initialized = ref(false)
  const loading     = ref(false)
  const error       = ref(null)

  const isLoggedIn = computed(() => !!user.value)
  const displayName = computed(() => profile.value?.username ?? user.value?.email ?? 'Slayer')
  const coins = computed(() => profile.value?.coins ?? 0)

  /** Initialize auth state from Supabase session */
  async function init() {
    initialized.value = false
    
    if (isMockMode) {
      user.value = { id: 'mock-user-123', email: 'tester@mock.com' }
      profile.value = { id: 'mock-user-123', username: 'Tester', coins: 9999 }
      initialized.value = true
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = session.user
      await fetchProfile(session.user.id)
    }
    initialized.value = true

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null
      if (user.value) {
        await fetchProfile(user.value.id)
      } else {
        profile.value = null
      }
    })
  }

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    profile.value = data
  }

  async function signInWithEmail(email, password) {
    loading.value = true
    error.value   = null
    if (isMockMode) {
      user.value = { id: 'mock-user-123', email }
      profile.value = { id: 'mock-user-123', username: 'Mock Slayer', coins: 9999 }
      loading.value = false
      return true
    }
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) error.value = err.message
    loading.value = false
    return !err
  }

  async function signInWithGoogle() {
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (err) error.value = err.message
  }

  async function signUp(email, password, username) {
    loading.value = true
    error.value   = null
    if (isMockMode) {
      user.value = { id: 'mock-user-123', email }
      profile.value = { id: 'mock-user-123', username, coins: 9999 }
      loading.value = false
      return true
    }
    const { data, error: err } = await supabase.auth.signUp({ email, password })
    if (err) {
      error.value = err.message
      loading.value = false
      return false
    }
    if (data.user) {
      await supabase.from('users').insert({ id: data.user.id, email, username })
    }
    loading.value = false
    return true
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  return {
    user, profile, initialized, loading, error,
    isLoggedIn, displayName, coins,
    init, fetchProfile, signInWithEmail, signInWithGoogle, signUp, signOut,
  }
})
