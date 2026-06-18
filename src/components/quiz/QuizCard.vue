<template>
  <div 
    class="quiz-card group"
    :class="{ 'opacity-60 pointer-events-none': disabled }"
  >
    <!-- Icon/Cover Section -->
    <div class="quiz-card-visual" :class="`bg-gradient-${quiz.icon_color || 'blue'}`">
      <div v-if="quiz.cover_image_url" class="quiz-card-cover">
        <img :src="quiz.cover_image_url" :alt="quiz.title" class="w-full h-full object-cover" />
      </div>
      <div v-else class="quiz-card-icon">
        <GameIcon 
          :name="quiz.icon_name || 'book'" 
          :size="32" 
          class="text-white drop-shadow-sm"
          aria-hidden="true"
        />
      </div>
      
      <!-- Quick stats overlay (hover) -->
      <div class="quiz-card-stats-overlay">
        <div class="flex items-center justify-around text-white text-xs font-medium">
          <div class="flex items-center gap-1" title="เล่น">
            <PhGameController :size="14" weight="bold" aria-hidden="true" />
            <span>{{ formatCount(quiz.plays_count) }}</span>
          </div>
          <div class="flex items-center gap-1" title="ดู">
            <PhEye :size="14" weight="bold" aria-hidden="true" />
            <span>{{ formatCount(quiz.views_count) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="quiz-card-content">
      <!-- Header: Title + Badges -->
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3 class="quiz-card-title flex-1">{{ quiz.title }}</h3>
        <div class="flex items-center gap-1 flex-shrink-0">
          <span v-if="quiz.is_public" class="badge-public-sm">
            <PhGlobe :size="10" weight="bold" aria-hidden="true" />
          </span>
          <span v-else class="badge-private-sm">
            <PhLockKey :size="10" weight="bold" aria-hidden="true" />
          </span>
        </div>
      </div>

      <!-- Description (if available) -->
      <p v-if="quiz.description" class="quiz-card-description">
        {{ truncate(quiz.description, 80) }}
      </p>

      <!-- Tags -->
      <div v-if="quiz.tags && quiz.tags.length > 0" class="quiz-card-tags">
        <button
          v-for="tag in quiz.tags.slice(0, 3)"
          :key="tag.id"
          class="quiz-tag"
          :title="tag.name"
          @click.stop="$emit('tag-click', tag)"
        >
          <PhTag :size="10" weight="bold" aria-hidden="true" />
          {{ tag.name }}
        </button>
        <span v-if="quiz.tags.length > 3" class="quiz-tag-more" :title="`+${quiz.tags.length - 3} tags`">
          +{{ quiz.tags.length - 3 }}
        </span>
      </div>

      <!-- Meta row: Category + Difficulty + Question count -->
      <div class="quiz-card-meta">
        <span class="quiz-meta-item" :title="getCategoryLabel(quiz.category)">
          <GameIcon :name="getCategoryIcon(quiz.category)" :size="11" aria-hidden="true" />
          {{ getCategoryLabel(quiz.category) }}
        </span>
        <span class="quiz-meta-separator">•</span>
        <span 
          class="quiz-meta-item" 
          :class="`text-qs-${getDifficultyColor(quiz.difficulty)}`"
          :title="`ความยาก: ${getDifficultyLabel(quiz.difficulty)}`"
        >
          {{ getDifficultyLabel(quiz.difficulty) }}
        </span>
        <span class="quiz-meta-separator">•</span>
        <span class="quiz-meta-item" title="จำนวนข้อสอบ">
          <PhListBullets :size="11" weight="bold" aria-hidden="true" />
          {{ questionCount }} ข้อ
        </span>
      </div>

      <!-- Stats row: Likes + Author + Date -->
      <div class="quiz-card-footer">
        <div class="flex items-center gap-3 text-xs text-qs-muted flex-1">
          <!-- Likes -->
          <button 
            class="quiz-stat-btn"
            :class="{ 'text-qs-danger': quiz.is_liked }"
            :title="quiz.is_liked ? 'ถูกใจแล้ว' : 'ถูกใจ'"
            @click.stop="$emit('toggle-like', quiz)"
          >
            <PhHeart 
              :size="13" 
              :weight="quiz.is_liked ? 'fill' : 'bold'" 
              aria-hidden="true"
            />
            <span>{{ formatCount(quiz.likes_count) }}</span>
          </button>

          <!-- Author (only show for public quizzes from others) -->
          <span v-if="showAuthor && quiz.author_name" class="flex items-center gap-1" :title="`โดย ${quiz.author_name}`">
            <PhUser :size="11" weight="bold" aria-hidden="true" />
            {{ truncate(quiz.author_name, 15) }}
          </span>

          <!-- Date -->
          <span v-if="quiz.created_at" class="ml-auto">{{ formatDate(quiz.created_at) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="quiz-card-actions">
        <!-- Play button (primary) -->
        <button
          class="btn-primary text-sm px-4 py-2 gap-1.5 flex-1"
          :disabled="disabled"
          @click.stop="$emit('play', quiz)"
        >
          <PhSword :size="15" weight="bold" aria-hidden="true" />
          เล่น
        </button>

        <!-- Secondary actions -->
        <button
          v-if="isOwner"
          class="btn-icon-secondary"
          title="แก้ไข"
          :disabled="disabled"
          @click.stop="$emit('edit', quiz)"
        >
          <PhPencil :size="15" weight="bold" aria-hidden="true" />
        </button>

        <button
          class="btn-icon-secondary"
          title="แชร์"
          :disabled="disabled"
          @click.stop="$emit('share', quiz)"
        >
          <PhShareNetwork :size="15" weight="bold" aria-hidden="true" />
        </button>

        <button
          v-if="isOwner"
          class="btn-icon-secondary hover:border-qs-danger hover:text-qs-danger"
          title="ลบ"
          :disabled="disabled"
          @click.stop="$emit('delete', quiz)"
        >
          <PhTrash :size="15" weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import {
  PhGameController, PhEye, PhGlobe, PhLockKey, PhTag,
  PhListBullets, PhHeart, PhUser, PhSword, PhPencil,
  PhShareNetwork, PhTrash
} from '@phosphor-icons/vue'

const props = defineProps({
  quiz: {
    type: Object,
    required: true
  },
  isOwner: {
    type: Boolean,
    default: false
  },
  showAuthor: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['play', 'edit', 'delete', 'share', 'toggle-like', 'tag-click'])

const questionCount = computed(() => {
  if (Array.isArray(props.quiz.questions)) {
    if (props.quiz.questions[0]?.count !== undefined) {
      return props.quiz.questions[0].count
    }
    return props.quiz.questions.length
  }
  return '?'
})

// Category helpers (using RPG Awesome icons)
const categoryMap = {
  general: { label: 'ทั่วไป', icon: 'book' },
  science: { label: 'วิทยาศาสตร์', icon: 'flask' },
  math: { label: 'คณิตศาสตร์', icon: 'light-bulb' },
  history: { label: 'ประวัติศาสตร์', icon: 'scroll-unfurled' },
  language: { label: 'ภาษา', icon: 'speech-bubble' },
  technology: { label: 'เทคโนโลยี', icon: 'gears' },
  art: { label: 'ศิลปะ', icon: 'flower' },
  sports: { label: 'กีฬา', icon: 'soccer-ball' },
  other: { label: 'อื่นๆ', icon: 'help' }
}

function getCategoryLabel(category) {
  return categoryMap[category]?.label || 'ทั่วไป'
}

function getCategoryIcon(category) {
  return categoryMap[category]?.icon || 'book'
}

// Difficulty helpers
const difficultyMap = {
  easy: { label: 'ง่าย', color: 'success' },
  normal: { label: 'ปานกลาง', color: 'info' },
  hard: { label: 'ยาก', color: 'warning' },
  expert: { label: 'ผู้เชี่ยวชาญ', color: 'danger' }
}

function getDifficultyLabel(difficulty) {
  return difficultyMap[difficulty]?.label || 'ปานกลาง'
}

function getDifficultyColor(difficulty) {
  return difficultyMap[difficulty]?.color || 'info'
}

// Formatting helpers
function formatCount(count) {
  if (!count || count === 0) return '0'
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return String(count)
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'วันนี้'
  if (diffDays === 1) return 'เมื่อวาน'
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} เดือนที่แล้ว`
  
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit'
  })
}

function truncate(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
</script>

<style scoped>
.quiz-card {
  @apply bg-qs-bg-secondary border border-qs-border rounded-qs overflow-hidden;
  @apply transition-all duration-200;
  @apply hover:border-qs-primary/30 hover:shadow-md;
}

.quiz-card-visual {
  @apply relative h-32 flex items-center justify-center overflow-hidden;
  @apply transition-transform duration-300;
}

.quiz-card:hover .quiz-card-visual {
  @apply scale-105;
}

.bg-gradient-red { @apply bg-gradient-to-br from-red-500 to-red-600; }
.bg-gradient-blue { @apply bg-gradient-to-br from-blue-500 to-blue-600; }
.bg-gradient-green { @apply bg-gradient-to-br from-green-500 to-green-600; }
.bg-gradient-yellow { @apply bg-gradient-to-br from-yellow-500 to-yellow-600; }
.bg-gradient-purple { @apply bg-gradient-to-br from-purple-500 to-purple-600; }
.bg-gradient-pink { @apply bg-gradient-to-br from-pink-500 to-pink-600; }
.bg-gradient-orange { @apply bg-gradient-to-br from-orange-500 to-orange-600; }
.bg-gradient-teal { @apply bg-gradient-to-br from-teal-500 to-teal-600; }

.quiz-card-cover {
  @apply absolute inset-0;
}

.quiz-card-icon {
  @apply relative z-10;
}

.quiz-card-stats-overlay {
  @apply absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent;
  @apply p-2 opacity-0 transition-opacity duration-200;
}

.quiz-card:hover .quiz-card-stats-overlay {
  @apply opacity-100;
}

.quiz-card-content {
  @apply p-4 space-y-3;
}

.quiz-card-title {
  @apply font-semibold text-qs-text leading-snug line-clamp-2;
  @apply text-base;
}

.quiz-card-description {
  @apply text-xs text-qs-muted leading-relaxed line-clamp-2;
}

.quiz-card-tags {
  @apply flex flex-wrap gap-1.5;
}

.quiz-tag {
  @apply inline-flex items-center gap-1 px-2 py-0.5;
  @apply bg-qs-primary/10 text-qs-primary rounded-full;
  @apply text-xs font-medium;
  @apply transition-colors duration-150;
  @apply hover:bg-qs-primary/20;
}

.quiz-tag-more {
  @apply inline-flex items-center px-2 py-0.5;
  @apply bg-qs-border text-qs-muted rounded-full;
  @apply text-xs font-medium;
}

.quiz-card-meta {
  @apply flex items-center gap-2 text-xs text-qs-muted;
}

.quiz-meta-item {
  @apply flex items-center gap-1;
}

.quiz-meta-separator {
  @apply text-qs-border;
}

.quiz-card-footer {
  @apply flex items-center justify-between pt-2 border-t border-qs-border;
}

.quiz-stat-btn {
  @apply flex items-center gap-1 transition-colors duration-150;
  @apply hover:text-qs-danger;
}

.quiz-card-actions {
  @apply flex items-center gap-2 pt-3 border-t border-qs-border;
}

.badge-public-sm {
  @apply inline-flex items-center justify-center;
  @apply w-5 h-5 rounded-full;
  @apply bg-qs-success/10 text-qs-success;
}

.badge-private-sm {
  @apply inline-flex items-center justify-center;
  @apply w-5 h-5 rounded-full;
  @apply bg-qs-muted/20 text-qs-muted;
}

.btn-icon-secondary {
  @apply flex items-center justify-center;
  @apply w-9 h-9 rounded-qs;
  @apply border border-qs-border bg-qs-bg text-qs-text;
  @apply transition-all duration-150;
  @apply hover:border-qs-primary hover:text-qs-primary hover:bg-qs-primary/5;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
