import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isMockMode } from '@/lib/supabase'

const MOCK_PROFILE_KEY = 'quizslayer:mock-profile'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const notice = ref(null)
  let authSubscription = null

  const isLoggedIn = computed(() => !!user.value)
  const displayName = computed(() => profile.value?.username ?? user.value?.email ?? 'Slayer')
  const coins = computed(() => profile.value?.coins ?? 0)

  function validateCredentials(email, password, username = null) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Email ไม่ถูกต้อง'
    if (password.length < 10) return 'Password ต้องมีอย่างน้อย 10 ตัวอักษร'
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return 'Password ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ ตัวเลข และสัญลักษณ์'
    }
    if (username !== null && !/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      return 'Username ใช้ได้เฉพาะ a-z, 0-9, _ และยาว 3-20 ตัวอักษร'
    }
    return null
  }

  function readMockProfile(email = 'tester@mock.com', username = 'Tester') {
    try {
      const stored = JSON.parse(localStorage.getItem(MOCK_PROFILE_KEY) || 'null')
      if (stored?.id) return stored
    } catch {
      // Local mock mode should keep working even if storage is unavailable.
    }
    const nextProfile = { id: 'mock-user-123', email, username, coins: 120, level: 1, exp: 0 }
    writeMockProfile(nextProfile)
    return nextProfile
  }

  function writeMockProfile(nextProfile) {
    profile.value = nextProfile
    try {
      localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(nextProfile))
    } catch {
      // Ignore local storage failures in mock mode.
    }
  }

  async function init() {
    initialized.value = false

    if (isMockMode) {
      user.value = { id: 'mock-user-123', email: 'tester@mock.com' }
      profile.value = readMockProfile()
      initialized.value = true
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    if (user.value) await ensureProfile(user.value)
    initialized.value = true

    if (!authSubscription) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        user.value = session?.user ?? null
        if (user.value) await ensureProfile(user.value)
        else profile.value = null
      })
      authSubscription = data.subscription
    }
  }

  async function fetchProfile(userId) {
    if (isMockMode) {
      profile.value = readMockProfile()
      return profile.value
    }

    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (err) throw err
    profile.value = data
    return data
  }

  async function ensureProfile(authUser, username = null) {
    const fallbackName = username?.trim()
      || authUser.user_metadata?.username
      || authUser.email?.split('@')[0]
      || 'Slayer'
    const baseUsername = fallbackName.replace(/[^a-zA-Z0-9_]/g, '_') || 'Slayer'
    const safeUsername = `${baseUsername.slice(0, 11)}_${authUser.id.slice(0, 8)}`

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (data) {
      profile.value = data
      return data
    }
    if (fetchError) throw fetchError

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: authUser.id, username: safeUsername, coins: 0 })
      .select()
      .single()
    if (insertError) throw insertError
    profile.value = inserted
    return inserted
  }

  async function signInWithEmail(email, password) {
    loading.value = true
    error.value = null
    notice.value = null
    const validationError = validateCredentials(email, password)
    if (validationError) {
      error.value = validationError
      loading.value = false
      return false
    }

    if (isMockMode) {
      user.value = { id: 'mock-user-123', email: email.trim() }
      profile.value = readMockProfile(email.trim(), 'Mock_Slayer')
      loading.value = false
      return true
    }

    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (err) error.value = 'Email หรือ Password ไม่ถูกต้อง'
    else await ensureProfile(data.user)
    loading.value = false
    return !err
  }

  async function signInWithGoogle() {
    error.value = null
    notice.value = null
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (err) error.value = 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้ในตอนนี้'
  }

  async function signUp(email, password, username) {
    loading.value = true
    error.value = null
    notice.value = null
    const validationError = validateCredentials(email, password, username)
    if (validationError) {
      error.value = validationError
      loading.value = false
      return false
    }

    if (isMockMode) {
      user.value = { id: 'mock-user-123', email: email.trim() }
      writeMockProfile({ id: 'mock-user-123', email: email.trim(), username: username.trim(), coins: 120, level: 1, exp: 0 })
      loading.value = false
      return true
    }

    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { username: username.trim() },
        emailRedirectTo: window.location.origin,
      },
    })
    if (err) {
      error.value = err.message?.toLowerCase().includes('already')
        ? 'Email นี้ถูกใช้งานแล้ว'
        : 'สมัครสมาชิกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง'
      loading.value = false
      return false
    }

    if (data.user && data.session) {
      try {
        await ensureProfile(data.user, username)
      } catch (profileError) {
        error.value = profileError.message
        loading.value = false
        return false
      }
    } else if (data.user) {
      user.value = null
      profile.value = null
      notice.value = 'สมัครสำเร็จแล้ว กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ'
    }
    loading.value = false
    return true
  }

  async function signOut() {
    if (!isMockMode) await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  return {
    user, profile, initialized, loading, error, notice,
    isLoggedIn, displayName, coins,
    init, fetchProfile, signInWithEmail, signInWithGoogle, signUp, signOut, writeMockProfile,
  }
})
