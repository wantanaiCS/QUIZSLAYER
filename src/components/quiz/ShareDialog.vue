<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="modelValue" class="dialog-overlay" @click.self="close">
        <div class="dialog-container">
          <!-- Header -->
          <div class="dialog-header">
            <div class="flex items-center gap-2">
              <PhShareNetwork :size="20" weight="bold" class="text-qs-primary" aria-hidden="true" />
              <h3 class="dialog-title">แชร์ชุดข้อสอบ</h3>
            </div>
            <button class="dialog-close-btn" @click="close" aria-label="ปิด">
              <PhX :size="20" weight="bold" aria-hidden="true" />
            </button>
          </div>

          <!-- Content -->
          <div class="dialog-content">
            <!-- Quiz preview -->
            <div v-if="quiz" class="share-preview">
              <div class="share-preview-icon" :class="`bg-gradient-${quiz.icon_color || 'blue'}`">
                <GameIcon :name="quiz.icon_name || 'book-open'" :size="24" class="text-white" aria-hidden="true" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="share-preview-title">{{ quiz.title }}</h4>
                <p class="share-preview-meta">
                  {{ getQuestionCount(quiz) }} ข้อ · {{ getCategoryLabel(quiz.category) }}
                </p>
              </div>
            </div>

            <!-- Share link -->
            <div class="share-link-section">
              <label class="share-label">ลิงก์สำหรับแชร์</label>
              <div class="share-link-input-group">
                <input
                  ref="linkInput"
                  :value="shareUrl"
                  readonly
                  class="share-link-input"
                  @focus="$event.target.select()"
                />
                <button
                  class="share-copy-btn"
                  :class="{ 'share-copy-success': copied }"
                  @click="copyLink"
                >
                  <PhCheck v-if="copied" :size="16" weight="bold" aria-hidden="true" />
                  <PhCopy v-else :size="16" weight="bold" aria-hidden="true" />
                  {{ copied ? 'คัดลอกแล้ว!' : 'คัดลอก' }}
                </button>
              </div>
            </div>

            <!-- Share options -->
            <div class="share-options">
              <button class="share-option-btn share-option-line" @click="shareToLine">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                <span>LINE</span>
              </button>

              <button class="share-option-btn share-option-facebook" @click="shareToFacebook">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>

              <button class="share-option-btn share-option-twitter" @click="shareToTwitter">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Twitter</span>
              </button>
            </div>

            <!-- Note -->
            <p class="share-note">
              <PhInfo :size="14" weight="bold" aria-hidden="true" />
              ผู้ที่ได้รับลิงก์จะสามารถดูและเล่นชุดข้อสอบนี้ได้เมื่อชุดข้อสอบถูกตั้งเป็น "สาธารณะ"
            </p>
          </div>

          <!-- Footer -->
          <div class="dialog-footer">
            <button class="btn-secondary flex-1" @click="close">
              ปิด
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { useQuizStore } from '@/stores/quizStore'
import GameIcon from '@/components/ui/GameIcon.vue'
import { PhShareNetwork, PhX, PhCopy, PhCheck, PhInfo } from '@phosphor-icons/vue'

const props = defineProps({
  modelValue: Boolean,
  quiz: Object
})

const emit = defineEmits(['update:modelValue', 'close'])

const { toast } = useToast()
const quizStore = useQuizStore()

const linkInput = ref(null)
const copied = ref(false)

const shareUrl = computed(() => {
  if (!props.quiz) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/quiz/${props.quiz.id}`
})

function getQuestionCount(quiz) {
  if (Array.isArray(quiz.questions)) {
    if (quiz.questions[0]?.count !== undefined) return quiz.questions[0].count
    return quiz.questions.length
  }
  return '?'
}

const categoryMap = {
  general: 'ทั่วไป',
  science: 'วิทยาศาสตร์',
  math: 'คณิตศาสตร์',
  history: 'ประวัติศาสตร์',
  language: 'ภาษา',
  technology: 'เทคโนโลยี',
  art: 'ศิลปะ',
  sports: 'กีฬา',
  other: 'อื่นๆ'
}

function getCategoryLabel(category) {
  return categoryMap[category] || 'ทั่วไป'
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    
    // Record share
    await quizStore.recordShare(props.quiz.id)
    
    toast.success('คัดลอกลิงก์แล้ว')
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    toast.error('คัดลอกลิงก์ไม่สำเร็จ')
  }
}

async function shareToLine() {
  const text = `มาทำข้อสอบ "${props.quiz?.title}" กันเถอะ!`
  const url = `https://line.me/R/msg/text/?${encodeURIComponent(text + ' ' + shareUrl.value)}`
  window.open(url, '_blank')
  await quizStore.recordShare(props.quiz.id)
}

async function shareToFacebook() {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank', 'width=600,height=400')
  await quizStore.recordShare(props.quiz.id)
}

async function shareToTwitter() {
  const text = `มาทำข้อสอบ "${props.quiz?.title}" กันเถอะ!`
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank', 'width=600,height=400')
  await quizStore.recordShare(props.quiz.id)
}

function close() {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.dialog-overlay {
  @apply fixed inset-0 z-50;
  @apply bg-black/60 backdrop-blur-sm;
  @apply flex items-center justify-center p-4;
}

.dialog-container {
  @apply bg-qs-bg border border-qs-border rounded-qs;
  @apply shadow-2xl;
  @apply w-full max-w-md;
  @apply max-h-[90vh] overflow-hidden;
  @apply flex flex-col;
}

.dialog-header {
  @apply flex items-center justify-between;
  @apply px-6 py-4 border-b border-qs-border;
}

.dialog-title {
  @apply text-lg font-semibold text-qs-text;
}

.dialog-close-btn {
  @apply flex items-center justify-center;
  @apply w-8 h-8 rounded-qs;
  @apply text-qs-muted hover:text-qs-text hover:bg-qs-border/50;
  @apply transition-colors;
}

.dialog-content {
  @apply flex-1 overflow-y-auto;
  @apply px-6 py-5 space-y-5;
}

.share-preview {
  @apply flex items-center gap-3 p-4;
  @apply bg-qs-bg-secondary rounded-qs border border-qs-border;
}

.share-preview-icon {
  @apply w-14 h-14 rounded-qs flex-shrink-0;
  @apply flex items-center justify-center;
}

.share-preview-title {
  @apply font-semibold text-qs-text line-clamp-2;
}

.share-preview-meta {
  @apply text-sm text-qs-muted mt-1;
}

.share-link-section {
  @apply space-y-2;
}

.share-label {
  @apply block text-sm font-medium text-qs-text;
}

.share-link-input-group {
  @apply flex items-center gap-2;
}

.share-link-input {
  @apply flex-1 px-3 py-2.5;
  @apply bg-qs-bg-secondary border border-qs-border rounded-qs;
  @apply text-sm text-qs-text;
  @apply focus:outline-none focus:ring-2 focus:ring-qs-primary/50;
}

.share-copy-btn {
  @apply flex items-center gap-2 px-4 py-2.5;
  @apply bg-qs-primary text-white rounded-qs;
  @apply text-sm font-medium;
  @apply transition-all duration-150;
  @apply hover:brightness-110;
  @apply whitespace-nowrap;
}

.share-copy-success {
  @apply bg-qs-success hover:bg-qs-success;
}

.share-options {
  @apply grid grid-cols-3 gap-3;
}

.share-option-btn {
  @apply flex flex-col items-center justify-center gap-2 p-4;
  @apply bg-qs-bg-secondary border border-qs-border rounded-qs;
  @apply text-sm font-medium;
  @apply transition-all duration-150;
  @apply hover:scale-105;
}

.share-option-line {
  @apply text-[#06C755] border-[#06C755]/20 hover:bg-[#06C755]/10;
}

.share-option-facebook {
  @apply text-[#1877F2] border-[#1877F2]/20 hover:bg-[#1877F2]/10;
}

.share-option-twitter {
  @apply text-[#1DA1F2] border-[#1DA1F2]/20 hover:bg-[#1DA1F2]/10;
}

.share-note {
  @apply flex items-start gap-2 p-3;
  @apply bg-qs-info/10 border border-qs-info/20 rounded-qs;
  @apply text-xs text-qs-info leading-relaxed;
}

.dialog-footer {
  @apply flex items-center justify-end gap-3;
  @apply px-6 py-4 border-t border-qs-border;
}

.dialog-enter-active,
.dialog-leave-active {
  @apply transition-opacity duration-200;
}

.dialog-enter-from,
.dialog-leave-to {
  @apply opacity-0;
}

.dialog-enter-active .dialog-container,
.dialog-leave-active .dialog-container {
  @apply transition-transform duration-200;
}

.dialog-enter-from .dialog-container,
.dialog-leave-to .dialog-container {
  @apply scale-95;
}
</style>
