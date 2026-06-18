<template>
  <div class="page-container">

    <!-- Header -->
    <div class="page-header">
      <div class="page-header-title">
        <GameIcon name="list-bullets" :size="24" class="text-qs-primary" />
        <h1 class="page-title">My Quizzes</h1>
      </div>
      <p class="page-description">จัดการชุดข้อสอบของคุณ และค้นหาชุดข้อสอบสาธารณะ</p>
      <div class="mt-4">
        <router-link to="/generator" class="btn-primary gap-2">
          <GameIcon name="artificial-intelligence" :size="16" />
          สร้างใหม่
        </router-link>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs-container">
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'my' }"
        @click="activeTab = 'my'"
      >
        <PhUser :size="16" weight="bold" aria-hidden="true" />
        <span>ชุดข้อสอบของฉัน</span>
        <span v-if="myQuizzes.length > 0" class="tab-badge">{{ myQuizzes.length }}</span>
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'public' }"
        @click="switchToPublicTab"
      >
        <PhGlobe :size="16" weight="bold" aria-hidden="true" />
        <span>ชุดข้อสอบสาธารณะ</span>
        <span v-if="publicQuizzes.length > 0" class="tab-badge">{{ publicQuizzes.length }}</span>
      </button>
    </div>

    <!-- Popular Tags Widget (show on public tab) -->
    <PopularTags
      v-if="activeTab === 'public'"
      :tags="popularTagsList"
      :selected-tags="filter.selectedTags.value"
      :loading="tagsLoading"
      @toggle-tag="handlePopularTagClick"
      @clear-all="filter.selectedTags.value = []"
    />

    <!-- Filter & Search Bar (show on public tab) -->
    <div v-if="activeTab === 'public'" class="filters-section">
      <!-- Search bar -->
      <div class="search-bar">
        <PhMagnifyingGlass :size="18" weight="bold" class="text-qs-muted" aria-hidden="true" />
        <input
          v-model="filter.searchText.value"
          type="text"
          placeholder="ค้นหาชุดข้อสอบ, แท็ก..."
          class="search-input"
        />
        <button
          v-if="filter.filterStats.value.hasActiveFilters"
          class="search-clear-btn"
          title="ล้างตัวกรอง"
          @click="filter.resetFilters()"
        >
          <PhX :size="16" weight="bold" aria-hidden="true" />
        </button>
      </div>

      <!-- Filter chips row -->
      <div class="filter-chips">
        <!-- Category dropdown -->
        <div class="filter-dropdown">
          <button class="filter-chip-btn" @click="toggleDropdown('category')">
            <GameIcon :name="getCategoryIcon(filter.selectedCategory.value)" :size="12" aria-hidden="true" />
            <span>{{ getCategoryLabel(filter.selectedCategory.value) }}</span>
            <PhCaretDown :size="12" weight="bold" aria-hidden="true" />
          </button>
          <div v-if="openDropdown === 'category'" class="filter-dropdown-menu">
            <button
              v-for="cat in filter.categoryOptions"
              :key="cat.value"
              class="filter-dropdown-item"
              :class="{ 'active': filter.selectedCategory.value === cat.value }"
              @click="selectCategory(cat.value)"
            >
              <GameIcon :name="cat.icon" :size="14" aria-hidden="true" />
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Difficulty dropdown -->
        <div class="filter-dropdown">
          <button class="filter-chip-btn" @click="toggleDropdown('difficulty')">
            <PhTarget :size="12" weight="bold" aria-hidden="true" />
            <span>{{ getDifficultyLabel(filter.selectedDifficulty.value) }}</span>
            <PhCaretDown :size="12" weight="bold" aria-hidden="true" />
          </button>
          <div v-if="openDropdown === 'difficulty'" class="filter-dropdown-menu">
            <button
              v-for="diff in filter.difficultyOptions"
              :key="diff.value"
              class="filter-dropdown-item"
              :class="{ 'active': filter.selectedDifficulty.value === diff.value }"
              @click="selectDifficulty(diff.value)"
            >
              {{ diff.label }}
            </button>
          </div>
        </div>

        <!-- Sort dropdown -->
        <div class="filter-dropdown ml-auto">
          <button class="filter-chip-btn" @click="toggleDropdown('sort')">
            <GameIcon :name="getSortIcon(filter.sortBy.value)" :size="12" aria-hidden="true" />
            <span>{{ getSortLabel(filter.sortBy.value) }}</span>
            <PhCaretDown :size="12" weight="bold" aria-hidden="true" />
          </button>
          <div v-if="openDropdown === 'sort'" class="filter-dropdown-menu filter-dropdown-menu-right">
            <button
              v-for="sort in filter.sortOptions"
              :key="sort.value"
              class="filter-dropdown-item"
              :class="{ 'active': filter.sortBy.value === sort.value }"
              @click="selectSort(sort.value)"
            >
              <GameIcon :name="sort.icon" :size="14" aria-hidden="true" />
              {{ sort.label }}
            </button>
          </div>
        </div>

        <!-- Show liked only toggle -->
        <button
          class="filter-chip-btn"
          :class="{ 'filter-chip-active': filter.showOnlyLiked.value }"
          @click="filter.showOnlyLiked.value = !filter.showOnlyLiked.value"
        >
          <PhHeart :size="12" :weight="filter.showOnlyLiked.value ? 'fill' : 'bold'" aria-hidden="true" />
          <span>ที่ถูกใจ</span>
        </button>
      </div>

      <!-- Selected tags -->
      <div v-if="filter.selectedTags.value.length > 0" class="selected-tags">
        <span class="text-xs text-qs-muted font-medium">แท็กที่เลือก:</span>
        <button
          v-for="tagId in filter.selectedTags.value"
          :key="tagId"
          class="selected-tag-chip"
          @click="filter.removeTag(tagId)"
        >
          {{ getTagName(tagId) }}
          <PhX :size="12" weight="bold" aria-hidden="true" />
        </button>
      </div>

      <!-- Filter stats -->
      <div v-if="activeTab === 'public'" class="filter-stats">
        <span class="text-xs text-qs-muted">
          แสดง {{ filter.filterStats.value.filtered }} จาก {{ filter.filterStats.value.total }} ชุดข้อสอบ
        </span>
      </div>
    </div>

    <!-- Content: My Quizzes Tab -->
    <div v-if="activeTab === 'my'">
      <!-- Loading -->
      <div v-if="quizStore.loading && myQuizzes.length === 0" class="loading-skeleton">
        <div v-for="n in 3" :key="n" class="skeleton-card"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="myQuizzes.length === 0" class="empty-state">
        <PhRobot :size="48" weight="duotone" class="text-qs-border mb-5" aria-hidden="true" />
        <p class="text-qs-text font-medium mb-2">ยังไม่มีชุดข้อสอบ</p>
        <p class="text-qs-muted text-sm mb-8">สร้างชุดข้อสอบแรกของคุณด้วย AI Generator</p>
        <router-link to="/generator" class="btn-primary gap-2 px-8">
          <PhSparkle :size="16" weight="duotone" aria-hidden="true" />
          สร้างชุดข้อสอบ
        </router-link>
      </div>

      <!-- Quiz cards -->
      <div v-else class="quiz-grid">
        <QuizCard
          v-for="quiz in myQuizzes"
          :key="quiz.id"
          :quiz="quiz"
          :is-owner="true"
          :show-author="false"
          :disabled="deletingId === quiz.id || togglingId === quiz.id"
          @play="playQuiz"
          @edit="editQuiz"
          @delete="confirmDelete"
          @share="shareQuiz"
          @toggle-like="toggleLike"
        />
      </div>
    </div>

    <!-- Content: Public Quizzes Tab -->
    <div v-if="activeTab === 'public'">
      <!-- Loading -->
      <div v-if="quizStore.loading && publicQuizzes.length === 0" class="loading-skeleton">
        <div v-for="n in 6" :key="n" class="skeleton-card"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filter.filteredQuizzes.value.length === 0 && !filter.filterStats.value.hasActiveFilters" class="empty-state">
        <PhGlobe :size="48" weight="duotone" class="text-qs-border mb-5" aria-hidden="true" />
        <p class="text-qs-text font-medium mb-2">ยังไม่มีชุดข้อสอบสาธารณะ</p>
        <p class="text-qs-muted text-sm">เมื่อมีการเผยแพร่ชุดข้อสอบสาธารณะ จะแสดงที่นี่</p>
      </div>

      <!-- No results after filtering -->
      <div v-else-if="filter.filteredQuizzes.value.length === 0" class="empty-state">
        <PhFunnel :size="48" weight="duotone" class="text-qs-border mb-5" aria-hidden="true" />
        <p class="text-qs-text font-medium mb-2">ไม่พบชุดข้อสอบ</p>
        <p class="text-qs-muted text-sm mb-6">ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
        <button class="btn-secondary gap-2" @click="filter.resetFilters()">
          <PhX :size="16" weight="bold" aria-hidden="true" />
          ล้างตัวกรอง
        </button>
      </div>

      <!-- Quiz cards -->
      <div v-else class="quiz-grid">
        <QuizCard
          v-for="quiz in filter.filteredQuizzes.value"
          :key="quiz.id"
          :quiz="quiz"
          :is-owner="quiz.author_id === authStore.user?.id"
          :show-author="true"
          @play="playQuiz"
          @edit="editQuiz"
          @delete="confirmDelete"
          @share="shareQuiz"
          @toggle-like="toggleLike"
          @tag-click="handleTagClick"
        />
      </div>
    </div>

    <!-- Dialogs -->
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

    <ShareDialog
      v-model="showShareDialog"
      :quiz="shareTarget"
      @close="showShareDialog = false"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quizStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import { useQuizFilter } from '@/composables/useQuizFilter'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ShareDialog from '@/components/quiz/ShareDialog.vue'
import QuizCard from '@/components/quiz/QuizCard.vue'
import PopularTags from '@/components/quiz/PopularTags.vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import {
  PhUser, PhGlobe, PhMagnifyingGlass, PhX, PhCaretDown,
  PhTarget, PhHeart, PhRobot, PhSparkle, PhFunnel
} from '@phosphor-icons/vue'

const router    = useRouter()
const quizStore = useQuizStore()
const authStore = useAuthStore()
const { toast } = useToast()

// Tab state
const activeTab = ref('my')

// Filter & search (for public tab)
const publicQuizzes = computed(() => quizStore.publicSets)
const filter = useQuizFilter(publicQuizzes)

// My quizzes
const myQuizzes = computed(() =>
  quizStore.quizSets
    .filter(s =>
      (s.author_id === authStore.user?.id || s.id?.startsWith('mock-')) &&
      s.id !== 'mock-1'
    )
)

// Dropdown state
const openDropdown = ref(null)

// Dialog state
const deleteTarget     = ref(null)
const showDeleteDialog = ref(false)
const deletingId       = ref(null)
const togglingId       = ref(null)
const shareTarget      = ref(null)
const showShareDialog  = ref(false)

// All tags for lookup
const allTags = computed(() => quizStore.allTags || [])
const popularTagsList = computed(() => quizStore.popularTags || [])
const tagsLoading = ref(false)

// Switch to public tab and load data
async function switchToPublicTab() {
  activeTab.value = 'public'
  if (publicQuizzes.value.length === 0) {
    await quizStore.fetchPublicSets()
  }
}

// Toggle dropdown menus
function toggleDropdown(name) {
  openDropdown.value = openDropdown.value === name ? null : name
}

// Category helpers
function selectCategory(value) {
  filter.selectedCategory.value = value
  openDropdown.value = null
}

function getCategoryLabel(value) {
  const cat = filter.categoryOptions.find(c => c.value === value)
  return cat?.label || 'ทุกหมวดหมู่'
}

function getCategoryIcon(value) {
  const cat = filter.categoryOptions.find(c => c.value === value)
  return cat?.icon || 'grid'
}

// Difficulty helpers
function selectDifficulty(value) {
  filter.selectedDifficulty.value = value
  openDropdown.value = null
}

function getDifficultyLabel(value) {
  const diff = filter.difficultyOptions.find(d => d.value === value)
  return diff?.label || 'ทุกระดับ'
}

// Sort helpers
function selectSort(value) {
  filter.sortBy.value = value
  openDropdown.value = null
}

function getSortLabel(value) {
  const sort = filter.sortOptions.find(s => s.value === value)
  return sort?.label || 'ยอดนิยม'
}

function getSortIcon(value) {
  const sort = filter.sortOptions.find(s => s.value === value)
  return sort?.icon || 'star'
}

// Tag helpers
function getTagName(tagId) {
  const tag = allTags.value.find(t => t.id === tagId)
  return tag?.name || tagId
}

function handleTagClick(tag) {
  filter.toggleTag(tag.id)
}

// Quiz actions
async function playQuiz(quiz) {
  // Record view and play
  await quizStore.recordView(quiz.id)
  await quizStore.recordPlay(quiz.id)
  
  const loaded = await quizStore.loadQuizSet(quiz.id)
  if (loaded) router.push({ name: 'battle' })
  else toast.error('โหลดชุดข้อสอบไม่ได้')
}

function editQuiz(quiz) {
  router.push({ name: 'quiz-edit', params: { id: quiz.id } })
}

function confirmDelete(quiz) {
  deleteTarget.value     = quiz
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

function shareQuiz(quiz) {
  shareTarget.value     = quiz
  showShareDialog.value = true
}

async function toggleLike(quiz) {
  const success = await quizStore.toggleLike(quiz.id)
  if (success) {
    toast.success(quiz.is_liked ? 'ยกเลิกถูกใจแล้ว' : 'ถูกใจแล้ว')
  } else {
    toast.error('เกิดข้อผิดพลาด')
  }
}

// Close dropdowns when clicking outside
function handleClickOutside(event) {
  if (!event.target.closest('.filter-dropdown')) {
    openDropdown.value = null
  }
}

onMounted(async () => {
  // Load initial data
  if (quizStore.quizSets.length === 0) {
    await quizStore.fetchMySets()
  }
  
  // Load tags
  await quizStore.fetchTags()
  
  // Click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.tabs-container {
  @apply flex items-center gap-2 mb-6 p-1 bg-qs-bg-secondary rounded-qs border border-qs-border;
}

.tab {
  @apply flex items-center gap-2 px-4 py-2.5 rounded-qs;
  @apply text-sm font-medium text-qs-muted;
  @apply transition-all duration-150;
  @apply hover:text-qs-text hover:bg-qs-bg/50;
  @apply flex-1 justify-center;
}

.tab-active {
  @apply bg-qs-primary text-white;
  @apply hover:bg-qs-primary hover:text-white;
}

.tab-badge {
  @apply ml-1 px-1.5 py-0.5 rounded-full;
  @apply bg-qs-muted/20 text-xs font-semibold;
}

.tab-active .tab-badge {
  @apply bg-white/20;
}

.filters-section {
  @apply space-y-4 mb-6;
}

.search-bar {
  @apply relative flex items-center gap-3;
  @apply bg-qs-bg-secondary border border-qs-border rounded-qs;
  @apply px-4 py-3;
  @apply focus-within:border-qs-primary transition-colors;
}

.search-input {
  @apply flex-1 bg-transparent text-qs-text text-sm;
  @apply outline-none placeholder:text-qs-muted;
}

.search-clear-btn {
  @apply flex items-center justify-center w-6 h-6 rounded-full;
  @apply text-qs-muted hover:text-qs-text hover:bg-qs-border/50;
  @apply transition-colors;
}

.filter-chips {
  @apply flex flex-wrap items-center gap-2;
}

.filter-chip-btn {
  @apply inline-flex items-center gap-2 px-3 py-2;
  @apply bg-qs-bg-secondary border border-qs-border rounded-qs;
  @apply text-xs font-medium text-qs-text;
  @apply transition-all duration-150;
  @apply hover:border-qs-primary/50 hover:bg-qs-primary/5;
}

.filter-chip-active {
  @apply border-qs-primary bg-qs-primary/10 text-qs-primary;
}

.filter-dropdown {
  @apply relative;
}

.filter-dropdown-menu {
  @apply absolute top-full left-0 mt-1 z-20;
  @apply min-w-[180px] max-h-[300px] overflow-y-auto;
  @apply bg-qs-bg-secondary border border-qs-border rounded-qs shadow-lg;
  @apply py-1;
}

.filter-dropdown-menu-right {
  @apply left-auto right-0;
}

.filter-dropdown-item {
  @apply w-full flex items-center gap-2 px-3 py-2;
  @apply text-sm text-qs-text text-left;
  @apply transition-colors;
  @apply hover:bg-qs-primary/10;
}

.filter-dropdown-item.active {
  @apply bg-qs-primary/10 text-qs-primary font-medium;
}

.selected-tags {
  @apply flex flex-wrap items-center gap-2;
}

.selected-tag-chip {
  @apply inline-flex items-center gap-1.5 px-3 py-1.5;
  @apply bg-qs-primary/10 text-qs-primary rounded-full;
  @apply text-xs font-medium;
  @apply transition-all duration-150;
  @apply hover:bg-qs-primary/20;
}

.filter-stats {
  @apply pt-2 border-t border-qs-border;
}

.quiz-grid {
  @apply grid gap-5;
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

.loading-skeleton {
  @apply grid gap-5;
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

.skeleton-card {
  @apply bg-qs-bg-secondary border border-qs-border rounded-qs overflow-hidden;
  @apply animate-pulse h-[420px];
}

.empty-state {
  @apply card p-16 text-center;
}
</style>
