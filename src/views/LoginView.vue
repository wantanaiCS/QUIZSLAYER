<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12"
       style="background: radial-gradient(ellipse at 30% 40%, rgba(108,99,255,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(156,39,176,0.08) 0%, transparent 60%), #0d0f1a;">

    <div class="w-full max-w-md">
      <!-- Logo float -->
      <div class="text-center mb-8">
        <img
          src="/QUIZSLAYER_logo.png"
          alt="QUIZSLAYER"
          class="h-[160px] w-auto object-contain mx-auto mb-4 animate-float drop-shadow-[0_0_24px_rgba(108,99,255,0.5)]"
        />
      </div>

      <!-- Card with shake on error -->
      <div class="card p-8 animate-slide-up" :class="{ 'animate-card-shake': shaking }">

        <!-- Tab switcher -->
        <div class="flex rounded-qs bg-qs-surface border border-qs-border p-1 mb-8 relative" role="tablist">
          <!-- Slide indicator -->
          <div
            class="absolute top-1 bottom-1 rounded-[10px] transition-all duration-300 ease-out"
            style="background: linear-gradient(135deg, #6c63ff, #8b5cf6);"
            :style="{ left: isSignUp ? '50%' : '4px', width: 'calc(50% - 4px)' }"
            aria-hidden="true"
          ></div>
          <button
            class="relative flex-1 py-2 text-sm font-semibold rounded-[10px] transition-colors duration-200 z-10"
            :class="!isSignUp ? 'text-white' : 'text-qs-muted hover:text-qs-text'"
            role="tab"
            :aria-selected="!isSignUp"
            @click="setMode(false)"
          >เข้าสู่ระบบ</button>
          <button
            class="relative flex-1 py-2 text-sm font-semibold rounded-[10px] transition-colors duration-200 z-10"
            :class="isSignUp ? 'text-white' : 'text-qs-muted hover:text-qs-text'"
            role="tab"
            :aria-selected="isSignUp"
            @click="setMode(true)"
          >สมัครสมาชิก</button>
        </div>

        <!-- Google OAuth -->
        <button
          class="w-full flex items-center justify-center gap-3 py-3 rounded-qs border font-semibold text-sm
                 bg-transparent text-qs-text transition-all duration-200 mb-6
                 hover:bg-qs-surface hover:border-qs-primary/50"
          style="border-image: linear-gradient(135deg, #6c63ff, #9c27b0) 1; border-width: 1px; border-style: solid;"
          :disabled="authStore.loading"
          type="button"
          @click="authStore.signInWithGoogle()"
        >
          <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          เข้าสู่ระบบด้วย Google
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3 mb-6">
          <div class="flex-1 h-px bg-qs-border"></div>
          <span class="text-qs-muted text-xs">หรือ</span>
          <div class="flex-1 h-px bg-qs-border"></div>
        </div>

        <!-- Notice -->
        <Transition name="form-msg">
          <div v-if="authStore.notice" class="mb-4 p-3 rounded-qs bg-green-900/20 border border-qs-success/40 text-qs-success text-sm flex items-start gap-2">
            <PhCheckCircle :size="16" weight="fill" class="flex-shrink-0 mt-0.5" aria-hidden="true" />
            {{ authStore.notice }}
          </div>
        </Transition>

        <!-- Form -->
        <Transition name="tab-fade" mode="out-in">
          <form :key="isSignUp ? 'signup' : 'login'" class="space-y-4" @submit.prevent="submit">

            <!-- Username (sign up only) -->
            <div v-if="isSignUp">
              <label class="input-label" for="username">ชื่อผู้ใช้</label>
              <div class="input-group">
                <PhUser :size="16" class="input-icon" aria-hidden="true" />
                <input
                  id="username"
                  v-model.trim="username"
                  type="text"
                  required
                  minlength="3"
                  maxlength="20"
                  autocomplete="username"
                  placeholder="slayer123"
                  class="input"
                />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="input-label" for="email">Email</label>
              <div class="input-group">
                <PhEnvelope :size="16" class="input-icon" aria-hidden="true" />
                <input
                  id="email"
                  v-model.trim="email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="you@example.com"
                  class="input"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="input-label" for="password">Password</label>
              <div class="input-group">
                <PhLock :size="16" class="input-icon" aria-hidden="true" />
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  minlength="10"
                  :autocomplete="isSignUp ? 'new-password' : 'current-password'"
                  placeholder="••••••••••"
                  class="input"
                />
              </div>
            </div>

            <!-- Confirm password -->
            <div v-if="isSignUp">
              <label class="input-label" for="confirm-password">Confirm Password</label>
              <div class="input-group">
                <PhLock :size="16" class="input-icon" aria-hidden="true" />
                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  type="password"
                  required
                  minlength="10"
                  autocomplete="new-password"
                  placeholder="••••••••••"
                  class="input"
                />
              </div>
              <p class="text-xs text-qs-muted mt-1.5">ใช้ 10 ตัวอักษรขึ้นไป รวมตัวพิมพ์เล็ก ใหญ่ ตัวเลข สัญลักษณ์</p>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="btn-primary w-full py-3 mt-2"
              :disabled="authStore.loading"
            >
              <span v-if="authStore.loading" class="inline-flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></span>
                กำลังดำเนินการ...
              </span>
              <span v-else>{{ isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ' }}</span>
            </button>

          </form>
        </Transition>

        <!-- Forgot password -->
        <div v-if="!isSignUp" class="text-center mt-4">
          <button class="text-xs text-qs-muted hover:text-qs-primary transition-colors" type="button" @click="forgotPassword">
            ลืม Password?
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import { PhUser, PhEnvelope, PhLock, PhCheckCircle } from '@phosphor-icons/vue'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()
const { toast } = useToast()

const isSignUp        = ref(false)
const email           = ref('')
const password        = ref('')
const confirmPassword = ref('')
const username        = ref('')
const shaking         = ref(false)

function triggerShake() {
  shaking.value = true
  setTimeout(() => { shaking.value = false }, 500)
}

function setMode(signUp) {
  isSignUp.value = signUp
  authStore.error  = null
  authStore.notice = null
  password.value = ''
  confirmPassword.value = ''
}

async function submit() {
  authStore.error  = null
  authStore.notice = null

  let ok
  if (isSignUp.value) {
    if (password.value !== confirmPassword.value) {
      toast.error('Password และ Confirm Password ไม่ตรงกัน')
      triggerShake()
      return
    }
    ok = await authStore.signUp(email.value, password.value, username.value)
  } else {
    ok = await authStore.signInWithEmail(email.value, password.value)
  }

  if (authStore.error) {
    toast.error(authStore.error)
    triggerShake()
    return
  }
  if (authStore.notice) {
    toast.info(authStore.notice)
  }

  if (ok && authStore.isLoggedIn) {
    toast.success('เข้าสู่ระบบสำเร็จ')
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/'
    router.push(redirect)
  }
}

async function forgotPassword() {
  authStore.error  = null
  authStore.notice = null
  if (!email.value) {
    toast.error('กรุณากรอก Email ก่อนแล้วกด "ลืม Password?"')
    triggerShake()
    return
  }
  const ok = await authStore.sendPasswordReset(email.value)
  if (ok) toast.success('ส่งลิงก์รีเซ็ต Password ไปที่อีเมลแล้ว')
  else    toast.error(authStore.error ?? 'ส่งอีเมลไม่สำเร็จ')
}
</script>

<style scoped>
.animate-card-shake {
  animation: cardShake 0.4s ease-in-out;
}

.tab-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.tab-fade-enter-from   { opacity: 0; transform: translateY(4px); }
.tab-fade-leave-active { transition: opacity 0.15s ease; }
.tab-fade-leave-to     { opacity: 0; }

.form-msg-enter-active { transition: all 0.25s ease; }
.form-msg-enter-from   { opacity: 0; transform: translateY(-6px); }
.form-msg-leave-active { transition: all 0.2s ease; }
.form-msg-leave-to     { opacity: 0; }
</style>
