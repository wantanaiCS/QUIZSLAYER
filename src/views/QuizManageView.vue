<template>
  <div class="page-container">

    <!-- Header -->
    <div class="page-header">
      <div class="page-header-title">
        <GameIcon name="list-bullets" :size="24" class="text-qs-primary" />
        <h1 class="page-title">MY QUIZZES</h1>
      </div>
      <p class="page-description">จัดการ แก้ไข และลบชุดข้อสอบที่สร้างไว้</p>
      <div class="mt-4">
        <router-link to="/generator" class="btn-primary gap-2">
          <GameIcon name="artificial-intelligence" :size="16" />
          สร้างใหม่
        </router-link>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="quizStore.loading && quizSets.length === 0" class="space-y-3">
      <div v-for="n in 3" :key="n" class="card p-5 animate-pulse flex gap-4">
        <div class="w-12 h-12 rounded-qs bg-qs-border flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-qs-border rounded w-2/3"></div>
          <div class="h-3 bg-qs-border rounded w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="quizSets.length === 0" class="card p-16 text-center">
      <PhRobot :size="48" weight="duotone" class="mx-auto mb-5 text-qs-border" aria-hidden="true" />
      <p class="text-qs-text font-medium mb-2">ยังไม่มีชุดข้อสอบ</p>
      <p class="text-qs-muted text-sm mb-8">สร้างชุดข้อสอบแรกของคุณด้วย AI Generator</p>
      <router-link to="/generator" class="btn-primary gap-2 px-8">
        <PhSparkle :size="16" weight="duotone" aria-hidden="true" />
        สร้างชุดข้อสอบ
      </router-link>
    </div>

    <!-- Quiz cards grid -->
    <div v-else class="grid md:grid-cols-2 gap-4">
      <div
        v-for="set in quizSets"
        :key="set.id"
        class="card-quiz flex flex-col gap-3"
        :class="{ 'opacity-60 pointer-events-none': deletingId === set.id }"
      >
        <!-- Top row: title + badge -->
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-semibold text-qs-text leading-snug flex-1">{{ set.title }}</h3>
          <span v-if="set.is_public" class="badge-public flex-shrink-0">สาธารณะ</span>
          <span v-else class="badge-private flex-shrink-0">ส่วนตัว</span>
        </div>

        <!-- Meta row -->
        <div class="flex items-center gap-3 text-xs text-qs-muted">
          <span class="flex items-center gap-1">
            <PhListBullets :size="12" weight="bold" aria-hidden="true" />
            {{ getQuestionCount(set) }} ข้อ
          </span>
          <span v-if="set.created_at">· {{ formatDate(set.created_at) }}</span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 pt-1 border-t border-qs-border mt-auto">
          <!-- Play -->
          <button
            class="btn-primary text-xs px-3 py-1.5 gap-1 flex-1"
            title="เล่น"
            @click="playSet(set)"
          >
            <PhSword :size="13" weight="bold" aria-hidden="true" />
            เล่น
          </button>
          <!-- Edit -->
          <button
            class="btn-icon"
            title="แก้ไข"
            aria-label="แก้ไขชุดข้อสอบ"
            @click="$router.push({ name: 'quiz-edit', params: { id: set.id } })"
          >
            <PhPencil :size="15" weight="bold" aria-hidden="true" />
          </button>
          <!-- Toggle public -->
          <button
            class="btn-icon"
            :title="set.is_public ? 'ทำให้เป็นส่วนตัว' : 'เผยแพร่สาธารณะ'"
            :aria-label="set.is_public ? 'ทำให้เป็นส่วนตัว' : 'เผยแพร่สาธารณะ'"
            :disabled="togglingId === set.id"
            @click="togglePublic(set)"
          >
            <PhGlobe   v-if="!set.is_public" :size="15" weight="bold" aria-hidden="true" />
            <PhLockKey v-else                :size="15" weight="bold" aria-hidden="true" />
          </button>
          <!-- Delete -->
          <button
            class="btn-icon hover:border-qs-danger hover:text-qs-danger"
            title="ลบ"
            aria-label="ลบชุดข้อสอบ"
            :disabled="deletingId === set.id"
            @click="confirmDelete(set)"
          >
            <PhTrash :size="15" weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <!-- ConfirmDialog for delete -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="ลบชุดข้อสอบ?"
      :message="`ชุดข้อสอบ &quot;${deleteTarget?.title ?? ''}&quot; จะถูกลบถาวร ไม่สามารถกู้คืนได้`"
      confirm="ลบเลย"
      cancel="ยกเลิก"
      :danger="true"
      @confirm="executeDelete"
      @cancel="showDeleteDialog = false"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quizStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import {
  PhListBullets, PhSparkle, PhRobot, PhSword,
  PhPencil, PhTrash, PhGlobe, PhLockKey,
} from '@phosphor-icons/vue'

const router    = useRouter()
const quizStore = useQuizStore()
const authStore = useAuthStore()
const { toast } = useToast()

const deleteTarget     = ref(null)
const showDeleteDialog = ref(false)
const deletingId       = ref(null)
const togglingId       = ref(null)

const quizSets = computed(() =>
  quizStore.quizSets
    .filter(s =>
      (s.author_id === authStore.user?.id || s.id?.startsWith('mock-')) &&
      s.id !== 'mock-1'
    )
)

function getQuestionCount(set) {
  if (Array.isArray(set.questions)) {
    if (set.questions[0]?.count !== undefined) return set.questions[0].count
    return set.questions.length
  }
  return '?'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: '2-digit',
  })
}

async function playSet(set) {
  const loaded = await quizStore.loadQuizSet(set.id)
  if (loaded) router.push({ name: 'battle' })
  else toast.error('โหลดชุดข้อสอบไม่ได้')
}

async function togglePublic(set) {
  togglingId.value = set.id
  const ok = await quizStore.updateQuizSet(set.id, { is_public: !set.is_public })
  togglingId.value = null
  if (ok) toast.success(set.is_public ? 'เปลี่ยนเป็นส่วนตัวแล้ว' : 'เผยแพร่สาธารณะแล้ว')
  else    toast.error(quizStore.error ?? 'เกิดข้อผิดพลาด')
}

function confirmDelete(set) {
  deleteTarget.value     = set
  showDeleteDialog.value = true
}

async function executeDelete() {
  showDeleteDialog.value = false
  if (!deleteTarget.value) return
  deletingId.value = deleteTarget.value.id
  const ok = await quizStore.deleteQuizSet(deleteTarget.value.id)
  deletingId.value = null
  if (ok) toast.success('ลบชุดข้อสอบแล้ว')
  else    toast.error(quizStore.error ?? 'ลบไม่สำเร็จ')
  deleteTarget.value = null
}

onMounted(async () => {
  if (quizStore.quizSets.length === 0) {
    await quizStore.fetchPublicSets()
    await quizStore.fetchMySets()
  }
})
</script>
