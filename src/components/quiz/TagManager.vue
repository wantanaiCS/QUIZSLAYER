<template>
  <div class="tag-manager">
    <!-- Header -->
    <div class="tag-manager-header">
      <label class="tag-manager-label">
        <PhTag :size="16" weight="bold" class="text-qs-primary" aria-hidden="true" />
        แท็ก
      </label>
      <span class="tag-manager-count">{{ selectedTags.length }}/10</span>
    </div>

    <!-- Selected tags -->
    <div v-if="selectedTags.length > 0" class="selected-tags-list">
      <TransitionGroup name="tag-fade">
        <button
          v-for="tag in selectedTags"
          :key="tag.id"
          class="selected-tag-item"
          :disabled="disabled"
          @click="removeTag(tag)"
        >
          <span class="selected-tag-name">{{ tag.name }}</span>
          <PhX :size="14" weight="bold" aria-hidden="true" />
        </button>
      </TransitionGroup>
    </div>

    <!-- Empty state for selected tags -->
    <div v-else class="selected-tags-empty">
      <PhTag :size="20" weight="duotone" class="text-qs-muted" aria-hidden="true" />
      <span class="text-xs text-qs-muted">ยังไม่มีแท็ก เพิ่มแท็กเพื่อช่วยให้ผู้เล่นค้นหาชุดข้อสอบได้ง่ายขึ้น</span>
    </div>

    <!-- Add tag input -->
    <div class="tag-input-section">
      <div class="tag-input-wrapper">
        <PhPlus :size="16" weight="bold" class="text-qs-muted" aria-hidden="true" />
        <input
          ref="tagInput"
          v-model="tagSearchText"
          type="text"
          placeholder="เพิ่มแท็ก... (พิมพ์และกด Enter)"
          class="tag-input"
          :disabled="disabled || selectedTags.length >= maxTags"
          @keydown.enter.prevent="addTag"
          @input="filterTags"
          @focus="showSuggestions = true"
          @blur="handleBlur"
        />
        <button
          v-if="tagSearchText.trim()"
          class="tag-input-clear"
          :disabled="disabled"
          @click="tagSearchText = ''"
        >
          <PhX :size="14" weight="bold" aria-hidden="true" />
        </button>
      </div>

      <!-- Tag suggestions dropdown -->
      <Transition name="dropdown">
        <div
          v-if="showSuggestions && filteredSuggestions.length > 0"
          class="tag-suggestions-dropdown"
        >
          <div class="tag-suggestions-header">
            <span class="text-xs font-medium text-qs-muted">แท็กที่แนะนำ</span>
            <span class="text-[10px] text-qs-muted">{{ filteredSuggestions.length }}</span>
          </div>
          <div class="tag-suggestions-list">
            <button
              v-for="tag in filteredSuggestions.slice(0, 8)"
              :key="tag.id"
              class="tag-suggestion-item"
              :disabled="disabled"
              @mousedown.prevent="selectSuggestion(tag)"
            >
              <span class="tag-suggestion-name">{{ tag.name }}</span>
              <span v-if="tag.usage_count > 0" class="tag-suggestion-count">
                {{ formatCount(tag.usage_count) }}
              </span>
            </button>
          </div>
          
          <!-- Create new tag hint -->
          <div v-if="canCreateNewTag" class="tag-create-hint">
            <PhPlus :size="12" weight="bold" aria-hidden="true" />
            <span>กด Enter เพื่อสร้างแท็ก "{{ tagSearchText.trim() }}"</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Popular tags (quick add) -->
    <div v-if="!disabled && popularTags.length > 0 && selectedTags.length < maxTags" class="popular-tags-section">
      <div class="popular-tags-header">
        <PhTrendUp :size="14" weight="bold" class="text-qs-muted" aria-hidden="true" />
        <span class="text-xs font-medium text-qs-muted">แท็กยอดนิยม</span>
      </div>
      <div class="popular-tags-grid">
        <button
          v-for="tag in availablePopularTags.slice(0, 6)"
          :key="tag.id"
          class="popular-tag-btn"
          :disabled="disabled"
          @click="selectSuggestion(tag)"
        >
          <span>{{ tag.name }}</span>
          <PhPlus :size="12" weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Help text -->
    <p class="tag-help-text">
      <PhInfo :size="12" weight="bold" aria-hidden="true" />
      แท็กช่วยให้ผู้เล่นค้นหาชุดข้อสอบได้ง่ายขึ้น สามารถเพิ่มได้สูงสุด {{ maxTags }} แท็ก
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useToast } from '@/composables/useToast'
import { PhTag, PhX, PhPlus, PhTrendUp, PhInfo } from '@phosphor-icons/vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxTags: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:modelValue'])

const quizStore = useQuizStore()
const { toast } = useToast()

const tagInput = ref(null)
const tagSearchText = ref('')
const showSuggestions = ref(false)
const selectedTags = ref([...props.modelValue])

// Available tags for suggestions
const allTags = computed(() => quizStore.allTags || [])
const popularTags = computed(() => quizStore.popularTags || [])

// Filter suggestions based on search text and exclude already selected
const filteredSuggestions = computed(() => {
  const search = tagSearchText.value.toLowerCase().trim()
  if (!search) return []
  
  const selectedIds = selectedTags.value.map(t => t.id)
  return allTags.value.filter(tag => 
    !selectedIds.includes(tag.id) &&
    tag.name.toLowerCase().includes(search)
  )
})

// Popular tags that aren't already selected
const availablePopularTags = computed(() => {
  const selectedIds = selectedTags.value.map(t => t.id)
  return popularTags.value.filter(tag => !selectedIds.includes(tag.id))
})

// Check if user can create a new tag
const canCreateNewTag = computed(() => {
  const text = tagSearchText.value.trim()
  if (!text || text.length < 2 || text.length > 30) return false
  
  // Check if exact match exists
  const exactMatch = allTags.value.find(
    t => t.name.toLowerCase() === text.toLowerCase()
  )
  return !exactMatch
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newVal) => {
  selectedTags.value = [...newVal]
}, { deep: true })

// Emit changes to parent
watch(selectedTags, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

/**
 * Add a tag (either existing or create new)
 */
async function addTag() {
  const text = tagSearchText.value.trim()
  
  // Validation
  if (!text) return
  
  if (selectedTags.value.length >= props.maxTags) {
    toast.error(`เพิ่มได้สูงสุด ${props.maxTags} แท็ก`)
    return
  }
  
  if (text.length < 2) {
    toast.error('แท็กต้องมีอย่างน้อย 2 ตัวอักษร')
    return
  }
  
  if (text.length > 30) {
    toast.error('แท็กต้องไม่เกิน 30 ตัวอักษร')
    return
  }
  
  // Check if already selected
  if (selectedTags.value.some(t => t.name.toLowerCase() === text.toLowerCase())) {
    toast.error('แท็กนี้ถูกเพิ่มแล้ว')
    tagSearchText.value = ''
    return
  }
  
  // Find existing tag or create new
  let tag = allTags.value.find(t => t.name.toLowerCase() === text.toLowerCase())
  
  if (!tag) {
    // Create new tag via store
    try {
      tag = await quizStore.addOrGetTag(text)
      if (!tag) {
        const errorMsg = quizStore.error || 'สร้างแท็กไม่สำเร็จ'
        console.error('[TagManager] Failed to create tag:', errorMsg)
        toast.error(`สร้างแท็กไม่สำเร็จ: ${errorMsg}`)
        return
      }
    } catch (err) {
      console.error('[TagManager] Error creating tag:', err)
      toast.error(`เกิดข้อผิดพลาด: ${err.message || 'ไม่สามารถสร้างแท็กได้'}`)
      return
    }
  }
  
  // Add to selected
  selectedTags.value.push(tag)
  tagSearchText.value = ''
  showSuggestions.value = false
  
  toast.success(`เพิ่มแท็ก "${tag.name}" แล้ว`)
}

/**
 * Select a tag from suggestions
 */
function selectSuggestion(tag) {
  if (selectedTags.value.length >= props.maxTags) {
    toast.error(`เพิ่มได้สูงสุด ${props.maxTags} แท็ก`)
    return
  }
  
  if (selectedTags.value.some(t => t.id === tag.id)) {
    return
  }
  
  selectedTags.value.push(tag)
  tagSearchText.value = ''
  showSuggestions.value = false
  tagInput.value?.focus()
}

/**
 * Remove a tag
 */
function removeTag(tag) {
  selectedTags.value = selectedTags.value.filter(t => t.id !== tag.id)
}

/**
 * Filter tags as user types
 */
function filterTags() {
  showSuggestions.value = tagSearchText.value.trim().length > 0
}

/**
 * Handle input blur (hide suggestions after delay)
 */
function handleBlur() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

/**
 * Format count display
 */
function formatCount(count) {
  if (!count || count === 0) return '0'
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}

/**
 * Focus input programmatically
 */
function focus() {
  tagInput.value?.focus()
}

// Load tags on mount
onMounted(async () => {
  if (allTags.value.length === 0) {
    await quizStore.fetchTags()
  }
  if (popularTags.value.length === 0) {
    await quizStore.fetchPopularTags()
  }
})

// Expose focus method
defineExpose({ focus })
</script>

<style scoped>
.tag-manager {
  @apply space-y-3;
}

.tag-manager-header {
  @apply flex items-center justify-between;
}

.tag-manager-label {
  @apply flex items-center gap-2 text-sm font-medium text-qs-text;
}

.tag-manager-count {
  @apply text-xs font-semibold text-qs-muted;
  @apply px-2 py-0.5 rounded-full bg-qs-border;
}

/* Selected tags */
.selected-tags-list {
  @apply flex flex-wrap gap-2;
}

.selected-tag-item {
  @apply inline-flex items-center gap-1.5 px-3 py-1.5;
  @apply bg-qs-primary/10 text-qs-primary border border-qs-primary/20 rounded-full;
  @apply text-sm font-medium;
  @apply transition-all duration-150;
  @apply hover:bg-qs-primary/20 hover:border-qs-primary/30;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.selected-tag-name {
  @apply truncate max-w-[150px];
}

.selected-tags-empty {
  @apply flex items-center gap-2 p-4;
  @apply bg-qs-bg-secondary border border-dashed border-qs-border rounded-qs;
}

/* Tag input */
.tag-input-section {
  @apply relative;
}

.tag-input-wrapper {
  @apply relative flex items-center gap-2;
  @apply px-3 py-2.5;
  @apply bg-qs-bg-secondary border border-qs-border rounded-qs;
  @apply transition-colors;
  @apply focus-within:border-qs-primary;
}

.tag-input {
  @apply flex-1 bg-transparent text-sm text-qs-text;
  @apply outline-none placeholder:text-qs-muted;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.tag-input-clear {
  @apply flex items-center justify-center w-5 h-5;
  @apply text-qs-muted hover:text-qs-text;
  @apply transition-colors;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Suggestions dropdown */
.tag-suggestions-dropdown {
  @apply absolute top-full left-0 right-0 mt-1 z-20;
  @apply bg-qs-bg-secondary border border-qs-border rounded-qs shadow-lg;
  @apply overflow-hidden;
}

.tag-suggestions-header {
  @apply flex items-center justify-between;
  @apply px-3 py-2 border-b border-qs-border;
  @apply bg-qs-bg/50;
}

.tag-suggestions-list {
  @apply max-h-[200px] overflow-y-auto;
}

.tag-suggestion-item {
  @apply w-full flex items-center justify-between gap-2;
  @apply px-3 py-2 text-left;
  @apply text-sm text-qs-text;
  @apply transition-colors;
  @apply hover:bg-qs-primary/10;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.tag-suggestion-name {
  @apply flex-1 truncate;
}

.tag-suggestion-count {
  @apply text-[10px] font-semibold text-qs-muted;
  @apply px-1.5 py-0.5 rounded-full bg-qs-border;
}

.tag-create-hint {
  @apply flex items-center gap-2 px-3 py-2;
  @apply text-xs text-qs-primary;
  @apply border-t border-qs-border;
  @apply bg-qs-primary/5;
}

/* Popular tags quick add */
.popular-tags-section {
  @apply space-y-2;
}

.popular-tags-header {
  @apply flex items-center gap-2;
}

.popular-tags-grid {
  @apply flex flex-wrap gap-2;
}

.popular-tag-btn {
  @apply inline-flex items-center gap-1.5 px-2.5 py-1.5;
  @apply bg-qs-bg-secondary border border-qs-border rounded-qs;
  @apply text-xs font-medium text-qs-text;
  @apply transition-all duration-150;
  @apply hover:border-qs-primary hover:bg-qs-primary/5 hover:text-qs-primary;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Help text */
.tag-help-text {
  @apply flex items-start gap-2;
  @apply text-xs text-qs-muted leading-relaxed;
  @apply pt-2 border-t border-qs-border;
}

/* Transitions */
.tag-fade-move,
.tag-fade-enter-active,
.tag-fade-leave-active {
  @apply transition-all duration-200;
}

.tag-fade-enter-from {
  @apply opacity-0 scale-90;
}

.tag-fade-leave-to {
  @apply opacity-0 scale-90;
}

.tag-fade-leave-active {
  @apply absolute;
}

.dropdown-enter-active,
.dropdown-leave-active {
  @apply transition-all duration-150;
}

.dropdown-enter-from,
.dropdown-leave-to {
  @apply opacity-0 -translate-y-1;
}
</style>
