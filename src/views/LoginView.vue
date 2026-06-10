<template>
  <div class="max-w-md mx-auto px-4 py-20">
    <div class="text-center mb-10">
      <div class="font-pixel text-2xl text-gradient mb-3">QUIZSLAYER</div>
      <h1 class="text-2xl font-bold text-qs-text mb-2">{{ isSignUp ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ' }}</h1>
      <p class="text-qs-muted text-sm">{{ isSignUp ? 'มาเป็น Slayer คนใหม่กัน!' : 'ยินดีต้อนรับกลับมา Slayer!' }}</p>
    </div>

    <div class="card p-8 animate-slide-up">
      <!-- Google OAuth -->
      <button class="btn-secondary w-full mb-6 gap-3" @click="authStore.signInWithGoogle()">
        <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        เข้าสู่ระบบด้วย Google
      </button>

      <div class="flex items-center gap-3 mb-6">
        <div class="flex-1 h-px bg-qs-border"></div>
        <span class="text-qs-muted text-xs">หรือ</span>
        <div class="flex-1 h-px bg-qs-border"></div>
      </div>

      <!-- Error -->
      <div v-if="authStore.error" class="mb-4 p-3 rounded-qs bg-red-900/20 border border-qs-danger text-qs-danger text-sm">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div v-if="isSignUp">
          <label class="block text-sm font-medium text-qs-muted mb-1.5">ชื่อผู้ใช้</label>
          <input v-model="username" type="text" required placeholder="slayer123"
            class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text placeholder-qs-muted focus:outline-none focus:border-qs-primary transition-colors" />
        </div>
        <div>
          <label class="block text-sm font-medium text-qs-muted mb-1.5">Email</label>
          <input v-model="email" type="email" required placeholder="you@example.com"
            class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text placeholder-qs-muted focus:outline-none focus:border-qs-primary transition-colors" />
        </div>
        <div>
          <label class="block text-sm font-medium text-qs-muted mb-1.5">Password</label>
          <input v-model="password" type="password" required placeholder="••••••••"
            class="w-full px-4 py-3 bg-qs-surface border border-qs-border rounded-qs text-qs-text placeholder-qs-muted focus:outline-none focus:border-qs-primary transition-colors" />
        </div>
        <button type="submit" class="btn-primary w-full py-3" :disabled="authStore.loading">
          {{ authStore.loading ? 'กำลังดำเนินการ...' : (isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ') }}
        </button>
      </form>

      <p class="text-center text-sm text-qs-muted mt-6">
        {{ isSignUp ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?' }}
        <button class="text-qs-primary hover:underline ml-1" @click="isSignUp = !isSignUp; authStore.error = null">
          {{ isSignUp ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก' }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const isSignUp  = ref(false)
const email     = ref('')
const password  = ref('')
const username  = ref('')

async function submit() {
  let ok
  if (isSignUp.value) {
    ok = await authStore.signUp(email.value, password.value, username.value)
  } else {
    ok = await authStore.signInWithEmail(email.value, password.value)
  }
  if (ok) {
    const redirect = route.query.redirect ?? '/'
    router.push(redirect)
  }
}
</script>
