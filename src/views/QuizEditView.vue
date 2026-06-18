<template>
  <div class="max-w-4xl mx-auto px-4 py-10">

    <!-- Header -->
    <div class="mb-8">
      <button class="btn-ghost px-3 py-2 text-sm gap-1 mb-4" @click="$router.push({ name: 'quiz-manage' })">
        <PhArrowLeft :size="14" weight="bold" aria-hidden="true" />
        กลับ
      </button>
      <div class="page-header">
        <div class="page-header-title">
          <GameIcon name="pencil" :size="24" class="text-qs-primary" />
          <h1 class="page-title">EDIT QUIZ</h1>
        </div>
        <p class="page-description">แก้ไขชื่อและรายการข้อสอบ</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="card p-5 animate-pulse flex gap-4">
        <div class="w-12 h-12 rounded-qs bg-qs-border flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-qs-border rounded w-2/3"></div>
          <div class="h-3 bg-qs-border rounded w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!currentSet" class="card p-12 text-center">
      <p class="text-qs-muted mb-4">ไม่พบชุดข้อสอบนี้</p>
      <router-link to="/my-quizzes" class="btn-primary">กลับไปรายการ</router-link>
    </div>

    <template v-else>

      <!-- ─── Set Info Card ─── -->
      <div class="card p-6 mb-6">
        <h2 class="font-bold text-qs-text mb-4">ข้อมูลชุดข้อสอบ</h2>
        <div class="flex gap-3 flex-wrap">
          <div class="flex-1 min-w-48">
            <label class="input-label" for="edit-title">ชื่อชุดข้อสอบ</label>
            <input
              id="edit-title"
              v-model="editTitle"
              type="text"
              maxlength="60"
              class="input text-sm"
              :class="titleDirty ? 'border-qs-primary' : ''"
            />
          </div>
          <div class="flex flex-col justify-end">
            <button
              class="btn-primary px-5 py-2.5 text-sm gap-1"
              :disabled="!titleDirty || quizStore.loading"
              @click="saveTitle"
            >
              <PhFloppyDisk :size="14" weight="bold" aria-hidden="true" />
              {{ quizStore.loading ? '...' : 'บันทึก' }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4 mt-4 pt-4 border-t border-qs-border text-sm text-qs-muted">
          <span class="flex items-center gap-1">
            <PhListBullets :size="14" weight="bold" aria-hidden="true" />
            {{ currentSet.questions?.length ?? 0 }} ข้อ
          </span>
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <div
              class="w-10 h-5 rounded-full relative transition-colors duration-200"
              :class="currentSet.is_public ? 'bg-qs-primary' : 'bg-qs-border'"
              @click="togglePublic"
            >
              <div
                class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                :class="currentSet.is_public ? 'translate-x-5' : 'translate-x-0.5'"
              ></div>
            </div>
            <span :class="currentSet.is_public ? 'text-qs-primary' : ''">
              {{ currentSet.is_public ? 'สาธารณะ' : 'ส่วนตัว' }}
            </span>
          </label>
        </div>
      </div>

      <!-- ─── Question List ─── -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-bold text-qs-text">รายการข้อสอบ</h2>
          <div class="flex gap-2">
            <select
              v-model="filterStage"
              class="input text-xs py-1.5 px-3 w-auto"
            >
              <option value="all">ทุกด่าน</option>
              <option v-for="s in 5" :key="s" :value="s">ด่าน {{ s }}</option>
            </select>
            <div class="input-group">
              <PhMagnifyingGlass :size="14" class="input-icon" aria-hidden="true" />
              <input
                v-model="searchQ"
                type="text"
                placeholder="ค้นหา..."
                class="input text-xs py-1.5 w-36"
              />
            </div>
          </div>
        </div>

        <!-- Question items -->
        <div class="space-y-2">
          <div
            v-for="(q, realIdx) in filteredQuestions"
            :key="realIdx"
            class="rounded-qs border border-qs-border overflow-hidden"
          >
            <!-- Collapsed row -->
            <div
              class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-qs-surface transition-colors"
              :class="{ 'bg-qs-surface': expandedIdx === realIdx.original }"
              @click="toggleExpand(realIdx.original)"
            >
              <span class="text-xs font-pixel text-qs-muted w-6 flex-shrink-0">{{ realIdx.original + 1 }}</span>
              <span
                class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                :class="stageBadgeClass(q.stage)"
              >
                {{ stageLabel[q.stage] ?? 'S?' }}
              </span>
              <span
                class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                :class="diffBadgeClass(q.difficulty)"
              >
                {{ q.difficulty ?? 'normal' }}
              </span>
              <p class="text-sm text-qs-text flex-1 truncate">{{ q.question_text }}</p>
              <span class="text-qs-muted text-xs flex-shrink-0">
                <PhCaretUp   v-if="expandedIdx === realIdx.original" :size="12" weight="bold" aria-hidden="true" />
                <PhCaretDown v-else                                  :size="12" weight="bold" aria-hidden="true" />
              </span>
            </div>

            <!-- Expanded editor -->
            <Transition name="expand">
              <div v-if="expandedIdx === realIdx.original" class="border-t border-qs-border bg-qs-surface px-4 py-4">

                <div v-if="editingIdx !== realIdx.original" class="space-y-3">
                  <!-- View mode -->
                  <p class="text-sm text-qs-text font-medium">{{ q.question_text }}</p>
                  <div class="grid grid-cols-2 gap-2">
                    <div
                      v-for="(opt, oi) in q.options"
                      :key="oi"
                      class="text-xs px-3 py-2 rounded-[8px] border"
                      :class="oi === q.correct_index
                        ? 'bg-green-900/20 border-qs-success text-qs-success'
                        : 'bg-qs-bg border-qs-border text-qs-muted'"
                    >
                      <span class="font-bold mr-1">{{ ['A','B','C','D'][oi] }}.</span>{{ opt }}
                    </div>
                  </div>
                  <p v-if="q.explanation" class="text-xs text-qs-muted flex items-start gap-1">
                    <PhLightbulb :size="12" weight="duotone" class="text-qs-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {{ q.explanation }}
                  </p>
                  <div class="flex gap-2 pt-1">
                    <button class="btn-ghost text-xs px-4 py-1.5 gap-1" @click="startEdit(realIdx.original, q)">
                      <PhPencilSimple :size="12" weight="bold" aria-hidden="true" />
                      แก้ไข
                    </button>
                    <button
                      class="btn-ghost text-xs px-4 py-1.5 gap-1 text-qs-danger hover:border-qs-danger"
                      :disabled="deletingQIdx === realIdx.original"
                      @click="confirmDeleteQ(realIdx.original)"
                    >
                      <PhTrash :size="12" weight="bold" aria-hidden="true" />
                      {{ deletingQIdx === realIdx.original ? '...' : 'ลบข้อนี้' }}
                    </button>
                  </div>
                </div>

                  <div v-else class="space-y-3">
                  <!-- Edit mode -->
                  <div>
                    <label class="input-label" :for="'edit-q-' + realIdx.original">คำถาม</label>
                    <textarea
                      :id="'edit-q-' + realIdx.original"
                      v-model="editForm.question_text"
                      rows="2"
                      class="input text-sm resize-none"
                    ></textarea>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div v-for="(_, oi) in 4" :key="oi">
                      <label class="flex items-center gap-1.5 text-xs text-qs-muted mb-1">
                        <input
                          type="radio"
                          :value="oi"
                          v-model="editForm.correct_index"
                          class="accent-qs-success"
                        />
                        {{ ['A','B','C','D'][oi] }}
                        <span v-if="oi === editForm.correct_index" class="text-qs-success">(ถูก)</span>
                      </label>
                      <input
                        v-model="editForm.options[oi]"
                        type="text"
                        class="input text-xs py-1.5"
                        :class="oi === editForm.correct_index ? 'border-qs-success' : ''"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="input-label">ด่าน</label>
                      <select v-model="editForm.stage" class="input text-xs py-1.5">
                        <option v-for="s in 5" :key="s" :value="s">ด่าน {{ s }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="input-label">ความยาก</label>
                      <select v-model="editForm.difficulty" class="input text-xs py-1.5">
                        <option value="easy">Easy</option>
                        <option value="normal">Normal</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="input-label">คำอธิบายเฉลย <span class="text-qs-muted font-normal normal-case">(optional)</span></label>
                    <input
                      v-model="editForm.explanation"
                      type="text"
                      class="input text-xs py-1.5"
                      placeholder="อธิบายว่าเหตุใดคำตอบนี้ถึงถูก"
                    />
                  </div>

                  <div class="flex gap-2 pt-1">
                    <button class="btn-ghost text-xs px-4 py-1.5" @click="cancelEdit">ยกเลิก</button>
                    <button
                      class="btn-primary text-xs px-4 py-1.5 gap-1"
                      :disabled="quizStore.loading"
                      @click="saveQuestion(realIdx.original)"
                    >
                      <PhFloppyDisk :size="12" weight="bold" aria-hidden="true" />
                      {{ quizStore.loading ? '...' : 'บันทึก' }}
                    </button>
                  </div>
                </div>

              </div>
            </Transition>
          </div>
        </div>

        <p v-if="filteredQuestions.length === 0" class="text-center text-qs-muted py-8 text-sm">
          ไม่พบข้อสอบ
        </p>
      </div>

    </template>

    <!-- ConfirmDialog for delete question -->
    <ConfirmDialog
      v-model="showDeleteQDialog"
      title="ลบข้อสอบข้อนี้?"
      message="ไม่สามารถกู้คืนได้"
      confirm="ลบ"
      cancel="ยกเลิก"
      :danger="true"
      @confirm="executeDeleteQ"
      @cancel="showDeleteQDialog = false"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuizStore } from '@/stores/quizStore'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import {
  PhArrowLeft, PhPencilSimple, PhFloppyDisk, PhListBullets,
  PhMagnifyingGlass, PhTrash, PhCaretUp, PhCaretDown, PhLightbulb,
} from '@phosphor-icons/vue'

const route     = useRoute()
const quizStore = useQuizStore()
const { toast } = useToast()

const loading         = ref(true)
const currentSet      = ref(null)
const editTitle       = ref('')
const titleDirty      = computed(() => editTitle.value !== currentSet.value?.title)
const expandedIdx     = ref(null)
const editingIdx      = ref(null)
const deletingQIdx    = ref(null)
const deleteQTarget   = ref(null)
const showDeleteQDialog = ref(false)
const filterStage     = ref('all')
const searchQ         = ref('')

const editForm = ref({
  question_text: '',
  options: ['', '', '', ''],
  correct_index: 0,
  difficulty: 'normal',
  stage: 1,
  explanation: '',
})

// Stage number badge label (no emoji)
const stageLabel = { 1: 'S1', 2: 'S2', 3: 'S3', 4: 'S4', 5: 'S5' }

// Filtered questions — keep original index for store operations
const filteredQuestions = computed(() => {
  const qs = currentSet.value?.questions ?? []
  return qs
    .map((q, i) => ({ ...q, original: i }))
    .filter(q => {
      const stageOk = filterStage.value === 'all' || q.stage === filterStage.value
      const searchOk = !searchQ.value || q.question_text?.toLowerCase().includes(searchQ.value.toLowerCase())
      return stageOk && searchOk
    })
})

function stageBadgeClass(stage) {
  const map = {
    1: 'bg-green-900/20 border border-green-500/30 text-green-400',
    2: 'bg-lime-900/20 border border-lime-500/30 text-lime-400',
    3: 'bg-slate-700/40 border border-slate-400/30 text-slate-300',
    4: 'bg-purple-900/20 border border-purple-500/30 text-purple-300',
    5: 'bg-red-900/20 border border-red-500/30 text-red-400',
  }
  return map[stage] ?? 'bg-qs-surface border border-qs-border text-qs-muted'
}

function diffBadgeClass(diff) {
  const map = {
    easy:   'bg-green-900/20 text-qs-success',
    normal: 'bg-yellow-900/20 text-qs-warning',
    hard:   'bg-red-900/20 text-qs-danger',
  }
  return map[diff] ?? 'bg-qs-surface text-qs-muted'
}

function showToast(msg, type = 'success') {
  if (type === 'error') toast.error(msg)
  else toast.success(msg)
}

function toggleExpand(idx) {
  if (expandedIdx.value === idx) {
    expandedIdx.value = null
    cancelEdit()
  } else {
    expandedIdx.value = idx
    editingIdx.value = null
  }
}

function startEdit(idx, q) {
  editingIdx.value = idx
  editForm.value = {
    question_text: q.question_text,
    options: [...q.options],
    correct_index: q.correct_index,
    difficulty: q.difficulty ?? 'normal',
    stage: q.stage ?? 1,
    explanation: q.explanation ?? '',
  }
}

function cancelEdit() {
  editingIdx.value = null
}

async function saveTitle() {
  const ok = await quizStore.updateQuizSet(route.params.id, { title: editTitle.value.trim() })
  if (ok) {
    currentSet.value = { ...currentSet.value, title: editTitle.value.trim() }
    showToast('บันทึกชื่อแล้ว')
  } else {
    showToast(quizStore.error ?? 'บันทึกไม่สำเร็จ', 'error')
  }
}

async function togglePublic() {
  const next = !currentSet.value.is_public
  const ok = await quizStore.updateQuizSet(route.params.id, { is_public: next })
  if (ok) {
    currentSet.value = { ...currentSet.value, is_public: next }
    showToast(next ? 'เผยแพร่สาธารณะแล้ว' : 'เปลี่ยนเป็นส่วนตัวแล้ว')
  } else {
    showToast(quizStore.error ?? 'เกิดข้อผิดพลาด', 'error')
  }
}

async function saveQuestion(idx) {
  // Validate
  if (!editForm.value.question_text.trim()) {
    showToast('กรุณากรอกคำถาม', 'error')
    return
  }
  if (editForm.value.options.some(o => !o.trim())) {
    showToast('กรุณากรอกตัวเลือกให้ครบ 4 ข้อ', 'error')
    return
  }

  const patch = {
    question_text: editForm.value.question_text.trim(),
    options:       editForm.value.options.map(o => o.trim()),
    correct_index: editForm.value.correct_index,
    difficulty:    editForm.value.difficulty,
    stage:         editForm.value.stage,
    explanation:   editForm.value.explanation.trim() || null,
  }

  const ok = await quizStore.updateQuestion(route.params.id, idx, patch)
  if (ok) {
    // Sync local view
    const qs = [...currentSet.value.questions]
    qs[idx] = { ...qs[idx], ...patch }
    currentSet.value = { ...currentSet.value, questions: qs }
    editingIdx.value = null
    showToast('บันทึกข้อสอบแล้ว')
  } else {
    showToast(quizStore.error ?? 'บันทึกไม่สำเร็จ', 'error')
  }
}

function confirmDeleteQ(idx) {
  deleteQTarget.value     = idx
  showDeleteQDialog.value = true
}

async function executeDeleteQ() {
  showDeleteQDialog.value = false
  const idx = deleteQTarget.value
  if (idx === null || idx === undefined) return
  deletingQIdx.value = idx
  const ok = await quizStore.deleteQuestion(route.params.id, idx)
  deletingQIdx.value = null
  deleteQTarget.value = null
  if (ok) {
    // Sync local
    const qs = [...currentSet.value.questions]
    qs.splice(idx, 1)
    currentSet.value = { ...currentSet.value, questions: qs }
    expandedIdx.value = null
    showToast('ลบข้อสอบแล้ว')
  } else {
    showToast(quizStore.error ?? 'ลบไม่สำเร็จ', 'error')
  }
}

onMounted(async () => {
  const id = route.params.id
  const loaded = await quizStore.loadQuizSet(id)
  if (loaded) {
    currentSet.value = loaded
    editTitle.value  = loaded.title
  }
  loading.value = false
})
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active { transition: all 0.2s ease; }
.expand-enter-from,
.expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to,
.expand-leave-from { max-height: 600px; }

.modal-enter-active,
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }

.toast-enter-active,
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateY(12px); }
</style>
