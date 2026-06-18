<template>
  <div class="popular-tags-widget">
    <!-- Header -->
    <div class="popular-tags-header">
      <div class="flex items-center gap-2">
        <PhTrendUp :size="18" weight="bold" class="text-qs-primary" aria-hidden="true" />
        <h3 class="popular-tags-title">แท็กยอดนิยม</h3>
      </div>
      <button
        v-if="selectedTags.length > 0"
        class="clear-tags-btn"
        @click="clearAll"
      >
        <PhX :size="14" weight="bold" aria-hidden="true" />
        ล้างทั้งหมด
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="popular-tags-loading">
      <div v-for="n in 8" :key="n" class="tag-skeleton"></div>
    </div>

    <!-- Tags grid -->
    <div v-else-if="tags.length > 0" class="popular-tags-grid">
      <button
        v-for="(tag, index) in visibleTags"
        :key="tag.id"
        class="popular-tag-item"
        :class="{
          'popular-tag-selected': isSelected(tag.id),
          'popular-tag-rank-1': index === 0,
          'popular-tag-rank-2': index === 1,
          'popular-tag-rank-3': index === 2
        }"
        @click="toggleTag(tag)"
      >
        <!-- Rank badge for top 3 -->
        <span v-if="index < 3 && !compact" class="tag-rank-badge">
          <PhMedal v-if="index === 0" :size="14" weight="fill" aria-hidden="true" />
          <PhMedal v-else-if="index === 1" :size="14" weight="fill" aria-hidden="true" />
          <PhMedal v-else :size="14" weight="fill" aria-hidden="true" />
        </span>

        <span class="tag-name">{{ tag.name }}</span>
        
        <span class="tag-stats">
          <span class="tag-usage-count">{{ formatCount(tag.usage_count || 0) }}</span>
          <PhCheck v-if="isSelected(tag.id)" :size="14" weight="bold" aria-hidden="true" class="tag-check-icon" />
        </span>
      </button>

      <!-- Show more/less button -->
      <button
        v-if="tags.length > defaultLimit"
        class="show-more-btn"
        @click="expanded = !expanded"
      >
        <PhCaretDown
          :size="14"
          weight="bold"
          aria-hidden="true"
          class="transition-transform"
          :class="{ 'rotate-180': expanded }"
        />
        {{ expanded ? 'แสดงน้อยลง' : `แสดงเพิ่มเติม (${tags.length - defaultLimit})` }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-else class="popular-tags-empty">
      <PhTag :size="32" weight="duotone" class="text-qs-border mb-2" aria-hidden="true" />
      <p class="text-sm text-qs-muted">ยังไม่มีแท็กยอดนิยม</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PhTrendUp, PhX, PhMedal, PhCheck, PhTag, PhCaretDown } from '@phosphor-icons/vue'

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  selectedTags: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  },
  defaultLimit: {
    type: Number,
    default: 12
  }
})

const emit = defineEmits(['toggle-tag', 'clear-all'])

const expanded = ref(false)

const visibleTags = computed(() => {
  if (expanded.value || props.tags.length <= props.defaultLimit) {
    return props.tags
  }
  return props.tags.slice(0, props.defaultLimit)
})

function isSelected(tagId) {
  return props.selectedTags.includes(tagId)
}

function toggleTag(tag) {
  emit('toggle-tag', tag)
}

function clearAll() {
  emit('clear-all')
}

function formatCount(count) {
  if (!count || count === 0) return '0'
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return String(count)
}
</script>

<style scoped>
.popular-tags-widget {
  @apply bg-qs-bg-secondary border border-qs-border rounded-qs p-4;
  @apply space-y-4;
}

.popular-tags-header {
  @apply flex items-center justify-between;
}

.popular-tags-title {
  @apply text-sm font-semibold text-qs-text;
}

.clear-tags-btn {
  @apply flex items-center gap-1 px-2 py-1;
  @apply text-xs font-medium text-qs-muted;
  @apply rounded-qs transition-colors;
  @apply hover:text-qs-text hover:bg-qs-border/50;
}

.popular-tags-loading {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2;
}

.tag-skeleton {
  @apply h-9 bg-qs-border rounded-qs animate-pulse;
}

.popular-tags-grid {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2;
}

.popular-tag-item {
  @apply relative flex items-center gap-2 px-3 py-2;
  @apply bg-qs-bg border border-qs-border rounded-qs;
  @apply text-xs font-medium text-qs-text;
  @apply transition-all duration-150;
  @apply hover:border-qs-primary hover:bg-qs-primary/5;
}

.popular-tag-selected {
  @apply border-qs-primary bg-qs-primary/10 text-qs-primary;
}

.popular-tag-rank-1 {
  @apply border-yellow-500/30 bg-yellow-500/5;
}

.popular-tag-rank-2 {
  @apply border-gray-400/30 bg-gray-400/5;
}

.popular-tag-rank-3 {
  @apply border-orange-600/30 bg-orange-600/5;
}

.tag-rank-badge {
  @apply flex items-center justify-center flex-shrink-0;
}

.popular-tag-rank-1 .tag-rank-badge {
  @apply text-yellow-500;
}

.popular-tag-rank-2 .tag-rank-badge {
  @apply text-gray-400;
}

.popular-tag-rank-3 .tag-rank-badge {
  @apply text-orange-600;
}

.tag-name {
  @apply flex-1 truncate text-left;
}

.tag-stats {
  @apply flex items-center gap-1.5 flex-shrink-0;
}

.tag-usage-count {
  @apply text-[10px] text-qs-muted font-semibold;
  @apply px-1.5 py-0.5 rounded-full bg-qs-border;
}

.popular-tag-selected .tag-usage-count {
  @apply bg-qs-primary/20 text-qs-primary;
}

.tag-check-icon {
  @apply text-qs-primary;
}

.show-more-btn {
  @apply col-span-full flex items-center justify-center gap-2;
  @apply px-4 py-2 rounded-qs;
  @apply text-xs font-medium text-qs-primary;
  @apply border border-qs-primary/20 bg-qs-primary/5;
  @apply transition-all duration-150;
  @apply hover:bg-qs-primary/10;
}

.popular-tags-empty {
  @apply flex flex-col items-center justify-center py-8;
}
</style>
