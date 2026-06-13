<template>
  <div class="max-w-4xl mx-auto px-4 py-12">

    <!-- Header -->
    <div class="flex items-center justify-between mb-10">
      <div>
        <h1 class="text-3xl font-bold text-qs-text mb-1">📚 ชุดข้อสอบของฉัน</h1>
        <p class="text-qs-muted text-sm">จัดการ แก้ไข และลบชุดข้อสอบที่สร้างไว้</p>
      </div>
      <router-link to="/generator" class="btn-primary gap-2">
        ✨ สร้างใหม่
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="quizStore.loading && quizSets.length === 0" class="text-center py-24 text-qs-muted">
      <div class="text-4xl mb-4 animate-pulse">📚</div>
      กำลังโหลด...
    </div>

    <!-- Empty -->
    <div v-else-if="quizSets.length === 0" class="card p-16 text-center">
      <div class="text-5xl mb-5">🤖</div>
      <p class="text-qs-text font-medium mb-2">ยังไม่มีชุดข้อสอบ</p>
      <p class="text-qs-muted text-sm mb-8">สร้างชุดข้อสอบแรกของคุณด้วย AI Generator</p>
      <router-link to="/generator" class="btn-primary px-8">✨ สร้างชุดข้อสอบ</router-link>
    </div>

    <!-- Quiz set list -->
    <div v-else class="space-y-3">
      <div
        v-for="set in quizSets"
        :key="set.id"
        class="card p-5 flex items-center gap-4 transition-all"
        :class="{ 'opacity-60': deletingId === set.id }"
      >
        <!-- Icon -->
        <div class="w-12 h-12 rounded-qs flex items-center justify-center text-xl flex-shrink-0"
          :class="set.is_public ? 'bg-qs-primary/15 border border-qs-primary/30' : 'bg-qs-surface border border-qs-border'">
          {{ set.is_public ? '🌐' : '🔒' }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-qs-text truncate">{{ set.title }}</div>
          <div class="flex items-center gap-3 mt-1 text-xs text-qs-muted flex-wrap">
            <span>📝 {{ getQuestionCount(set) }} ข้อ</span>
            <span
              class="px-2 py-0.5 rounded-full text-xs border"
              :class="set.is_public
                ? 'border-qs-primary/40 text-qs-primary bg-qs-primary/10'
                : 'border-qs-border text-qs-muted'"
            >
              {{ set.is_public ? 'สาธารณะ' : 'ส่วนตัว' }}
            </span>
            <span v-if="set.created_at">{{ formatDate(set.created_at) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Play -->
          <button
            class="btn-secondary text-xs px-3 py-2 gap-1"
            title="เล่น"
            @click="playSet(set)"
          >
            ⚔️ เล่น
          </button>
          <!-- Edit -->
          <button
            class="btn-secondary text-xs px-3 py-2 gap-1"
            title="แก้ไข"
            @click="$router.push({ name: 'quiz-edit', params: { id: set.id } })"
          >
            ✏️
          </button>
          <!-- Toggle public -->
          <button
            class="btn-secondary text-xs px-3 py-2"
            :title="set.is_public ? 'ทำให้เป็นส่วนตัว' : 'เผยแพร่สาธารณะ'"
            :disabled="togglingId === set.id"
            @click="togglePublic(set)"
          >
            {{ set.is_public ? '🔒' : '🌐' }}
          </button>
          <!-- Delete -->
          <button
            class="btn-secondary text-xs px-3 py-2 text-qs-danger hover:border-qs-danger"
            title="ลบ"
            :disabled="deletingId === set.id"
            @click="confirmDelete(set)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Delete confirm modal ─── -->
    <Transition name="modal">
      <div
        v-if="deleteTarget"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="deleteTarget = null"
      >
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="relative card p-8 max-w-md w-full animate-bounce-in">
          <div class="text-4xl text-center mb-4">🗑️</div>
          <h2 class="text-xl font-bold text-qs-text text-center mb-2">ลบชุดข้อสอบ?</h2>
          <p class="text-qs-muted text-sm text-center mb-1">
            ชุดข้อสอบ <span class="text-qs-text font-medium">"{{ deleteTarget.title }}"</span>
          </p>
          <p class="text-qs-danger text-xs text-center mb-8">
            ⚠️ ข้อมูลจะถูกลบถาวร ไม่สามารถกู้คืนได้
          </p>
          <div class="flex gap-3">
            <button class="btn-secondary flex-1" @click="deleteTarget = null">ยกเลิก</button>
            <button
              class="btn-danger flex-1"
              :disabled="quizStore.loading"
              @click="executeDelete"
            >
              {{ quizStore.loading ? 'กำลังลบ...' : 'ลบเลย' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Error toast -->
    <Transition name="toast">
      <div
        v-if="toastMsg"
        class="fixed bottom-6 right-6 z-50 card px-5 py-3 text-sm flex items-center gap-3 shadow-lg"
        :class="toastType === 'error' ? 'border-qs-danger text-qs-danger' : 'border-qs-success text-qs-success'"
      >
        {{ toastType === 'error' ? '❌' : '✅' }} {{ toastMsg }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quizStore'
import { useAuthStore } from '@/stores/authStore'

const router    = useRouter()
const quizStore = useQuizStore()
const authStore = useAuthStore()

const deleteTarget = ref(null)
const deletingId   = ref(null)
const togglingId   = ref(null)
const toastMsg     = ref('')
const toastType    = ref('success')
let toastTimer     = null

// Only show logged-in user's sets
const quizSets = computed(() => {
  return quizStore.quizSets.filter(s =>
    s.author_id === authStore.user?.id || s.id?.startsWith('mock-')
  ).filter(s => s.id !== 'mock-1') // exclude built-in demo set
})

function getQuestionCount(set) {
  if (Array.isArray(set.questions)) {
    // full load
    if (set.questions[0]?.count !== undefined) return set.questions[0].count
    return set.questions.length
  }
  return '?'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toastMsg.value = msg
  toastType.value = type
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 3000)
}

async function playSet(set) {
  const loaded = await quizStore.loadQuizSet(set.id)
  if (loaded) router.push({ name: 'battle' })
  else showToast('โหลดชุดข้อสอบไม่ได้', 'error')
}

async function togglePublic(set) {
  togglingId.value = set.id
  const ok = await quizStore.updateQuizSet(set.id, { is_public: !set.is_public })
  togglingId.value = null
  if (ok) showToast(set.is_public ? 'เปลี่ยนเป็นส่วนตัวแล้ว' : 'เผยแพร่สาธารณะแล้ว')
  else showToast(quizStore.error ?? 'เกิดข้อผิดพลาด', 'error')
}

function confirmDelete(set) {
  deleteTarget.value = set
}

async function executeDelete() {
  if (!deleteTarget.value) return
  deletingId.value = deleteTarget.value.id
  const ok = await quizStore.deleteQuizSet(deleteTarget.value.id)
  deletingId.value = null
  deleteTarget.value = null
  if (ok) showToast('ลบชุดข้อสอบแล้ว')
  else showToast(quizStore.error ?? 'ลบไม่สำเร็จ', 'error')
}

onMounted(async () => {
  if (quizStore.quizSets.length === 0) {
    await quizStore.fetchPublicSets()
    await quizStore.fetchMySets()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }

.toast-enter-active,
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateY(12px); }
</style>
