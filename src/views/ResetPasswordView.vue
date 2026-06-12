<template>
  <div class="max-w-md mx-auto px-4 py-20">
    <div class="text-center mb-10">
      <div class="font-pixel text-2xl text-gradient mb-3">QUIZSLAYER</div>
      <h1 class="text-2xl font-bold text-qs-text mb-2">ตั้ง Password ใหม่</h1>
      <p class="text-qs-muted text-sm">กรอก Password ใหม่ที่ต้องการใช้งาน</p>
    </div>

    <div class="card p-8 animate-slide-up">
      <div v-if="authStore.error" class="mb-4 p-3 rounded-qs bg-red-900/20 border border-qs-danger text-qs-danger text-sm">
        {{ authStore.error }}
      </div>
      <div v-if="authStore.notice" class="mb-4 p-3 rounded-qs bg-green-900/20 border border-qs-success text-qs-success text-sm">
        {{ authStore.notice }}
      </div>

      <form v-if="!done" class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-qs-muted mb-1.5" for="new-password">Password ใหม่</label>
          <input
            id="new-password"
            v-model="password"
            type="password"
            required
            minlength="10"
            autocomplete="new-password"
            placeholder="••••••••••"
            class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text placeholder-qs-muted focus:outline-none focus:border-qs-primary transition-colors"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-qs-muted mb-1.5" for="confirm-new-password">ยืนยัน Password</label>
          <input
            id="confirm-new-password"
            v-model="confirmPassword"
            type="password"
            required
            minlength="10"
            autocomplete="new-password"
            placeholder="••••••••••"
            class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text placeholder-qs-muted focus:outline-none focus:border-qs-primary transition-colors"
          />
          <p class="text-xs text-qs-muted mt-2">ใช้ 10 ตัวอักษรขึ้นไป พร้อมตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ ตัวเลข และสัญลักษณ์</p>
        </div>

        <button type="submit" class="btn-primary w-full py-3" :disabled="authStore.loading">
          {{ authStore.loading ? 'กำลังดำเนินการ...' : 'บันทึก Password ใหม่' }}
        </button>
      </form>

      <div v-else class="text-center py-4">
        <p class="text-qs-success mb-6">✓ เปลี่ยน Password สำเร็จแล้ว</p>
        <router-link to="/login" class="btn-primary px-6 py-2.5">
          เข้าสู่ระบบ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const done = ref(false)

// Supabase sends the recovery token via URL hash — detect it here
onMounted(() => {
  // If no session after OAuth redirect, redirect to login
  if (!window.location.hash.includes('type=recovery') && !authStore.isLoggedIn) {
    router.replace('/login')
  }
})

async function submit() {
  authStore.error = null
  authStore.notice = null

  if (password.value !== confirmPassword.value) {
    authStore.error = 'Password และ Confirm Password ไม่ตรงกัน'
    return
  }

  const validationError = validatePassword(password.value)
  if (validationError) {
    authStore.error = validationError
    return
  }

  authStore.loading = true
  const { error } = await supabase.auth.updateUser({ password: password.value })
  authStore.loading = false

  if (error) {
    authStore.error = 'เปลี่ยน Password ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือขอลิงก์ใหม่'
  } else {
    done.value = true
  }
}

function validatePassword(pw) {
  if (pw.length < 10) return 'Password ต้องมีอย่างน้อย 10 ตัวอักษร'
  if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) {
    return 'Password ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ ตัวเลข และสัญลักษณ์'
  }
  return null
}
</script>
