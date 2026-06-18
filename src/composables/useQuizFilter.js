/**
 * useQuizFilter - Composable for filtering, searching, and sorting quiz sets
 * Supports: search text, tags, category, difficulty, sort options
 */

import { ref, computed } from 'vue'

export function useQuizFilter(quizSets) {
  const searchText = ref('')
  const selectedTags = ref([])
  const selectedCategory = ref('all')
  const selectedDifficulty = ref('all')
  const sortBy = ref('popular') // 'popular', 'newest', 'oldest', 'most_liked', 'most_played', 'alphabetical'
  const showOnlyLiked = ref(false)

  /**
   * Filter quizzes by search text (matches title, description, tags)
   */
  const searchFiltered = computed(() => {
    if (!searchText.value.trim()) return quizSets.value

    const query = searchText.value.toLowerCase().trim()
    return quizSets.value.filter(quiz => {
      // Search in title
      if (quiz.title?.toLowerCase().includes(query)) return true
      
      // Search in description
      if (quiz.description?.toLowerCase().includes(query)) return true
      
      // Search in tags
      if (quiz.tags?.some(tag => tag.name?.toLowerCase().includes(query))) return true
      
      return false
    })
  })

  /**
   * Filter by selected tags (AND logic: quiz must have ALL selected tags)
   */
  const tagFiltered = computed(() => {
    if (selectedTags.value.length === 0) return searchFiltered.value

    return searchFiltered.value.filter(quiz => {
      if (!quiz.tags || quiz.tags.length === 0) return false
      const quizTagIds = quiz.tags.map(t => t.id)
      return selectedTags.value.every(tagId => quizTagIds.includes(tagId))
    })
  })

  /**
   * Filter by category
   */
  const categoryFiltered = computed(() => {
    if (selectedCategory.value === 'all') return tagFiltered.value
    return tagFiltered.value.filter(quiz => quiz.category === selectedCategory.value)
  })

  /**
   * Filter by difficulty
   */
  const difficultyFiltered = computed(() => {
    if (selectedDifficulty.value === 'all') return categoryFiltered.value
    return categoryFiltered.value.filter(quiz => quiz.difficulty === selectedDifficulty.value)
  })

  /**
   * Filter by liked status
   */
  const likedFiltered = computed(() => {
    if (!showOnlyLiked.value) return difficultyFiltered.value
    return difficultyFiltered.value.filter(quiz => quiz.is_liked === true)
  })

  /**
   * Sort filtered results
   */
  const sortedQuizzes = computed(() => {
    const quizzes = [...likedFiltered.value]

    switch (sortBy.value) {
      case 'newest':
        return quizzes.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )
      
      case 'oldest':
        return quizzes.sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        )
      
      case 'most_liked':
        return quizzes.sort((a, b) => 
          (b.likes_count || 0) - (a.likes_count || 0)
        )
      
      case 'most_played':
        return quizzes.sort((a, b) => 
          (b.plays_count || 0) - (a.plays_count || 0)
        )
      
      case 'alphabetical':
        return quizzes.sort((a, b) => 
          (a.title || '').localeCompare(b.title || '', 'th')
        )
      
      case 'popular':
      default:
        // Popular = combination of likes and plays with recency boost
        return quizzes.sort((a, b) => {
          const scoreA = (a.likes_count || 0) * 3 + (a.plays_count || 0) + (a.views_count || 0) * 0.1
          const scoreB = (b.likes_count || 0) * 3 + (b.plays_count || 0) + (b.views_count || 0) * 0.1
          
          // Add recency boost (newer quizzes get slight advantage)
          const daysAgoA = (Date.now() - new Date(a.created_at)) / (1000 * 60 * 60 * 24)
          const daysAgoB = (Date.now() - new Date(b.created_at)) / (1000 * 60 * 60 * 24)
          const recencyBoostA = Math.max(0, 10 - daysAgoA * 0.5)
          const recencyBoostB = Math.max(0, 10 - daysAgoB * 0.5)
          
          return (scoreB + recencyBoostB) - (scoreA + recencyBoostA)
        })
    }
  })

  /**
   * Final filtered and sorted results
   */
  const filteredQuizzes = computed(() => sortedQuizzes.value)

  /**
   * Filter statistics
   */
  const filterStats = computed(() => ({
    total: quizSets.value.length,
    filtered: filteredQuizzes.value.length,
    hasActiveFilters: 
      searchText.value.trim() !== '' ||
      selectedTags.value.length > 0 ||
      selectedCategory.value !== 'all' ||
      selectedDifficulty.value !== 'all' ||
      showOnlyLiked.value
  }))

  /**
   * Reset all filters
   */
  function resetFilters() {
    searchText.value = ''
    selectedTags.value = []
    selectedCategory.value = 'all'
    selectedDifficulty.value = 'all'
    sortBy.value = 'popular'
    showOnlyLiked.value = false
  }

  /**
   * Toggle tag selection
   */
  function toggleTag(tagId) {
    const index = selectedTags.value.indexOf(tagId)
    if (index > -1) {
      selectedTags.value.splice(index, 1)
    } else {
      selectedTags.value.push(tagId)
    }
  }

  /**
   * Check if tag is selected
   */
  function isTagSelected(tagId) {
    return selectedTags.value.includes(tagId)
  }

  /**
   * Remove specific tag
   */
  function removeTag(tagId) {
    const index = selectedTags.value.indexOf(tagId)
    if (index > -1) {
      selectedTags.value.splice(index, 1)
    }
  }

  /**
   * Category options (using RPG Awesome icons)
   */
  const categoryOptions = [
    { value: 'all', label: 'ทุกหมวดหมู่', icon: 'cubes' },
    { value: 'general', label: 'ทั่วไป', icon: 'book' },
    { value: 'science', label: 'วิทยาศาสตร์', icon: 'flask' },
    { value: 'math', label: 'คณิตศาสตร์', icon: 'light-bulb' },
    { value: 'history', label: 'ประวัติศาสตร์', icon: 'scroll-unfurled' },
    { value: 'language', label: 'ภาษา', icon: 'speech-bubble' },
    { value: 'technology', label: 'เทคโนโลยี', icon: 'gears' },
    { value: 'art', label: 'ศิลปะ', icon: 'flower' },
    { value: 'sports', label: 'กีฬา', icon: 'soccer-ball' },
    { value: 'other', label: 'อื่นๆ', icon: 'help' }
  ]

  /**
   * Difficulty options
   */
  const difficultyOptions = [
    { value: 'all', label: 'ทุกระดับ' },
    { value: 'easy', label: 'ง่าย', color: 'green' },
    { value: 'normal', label: 'ปานกลาง', color: 'blue' },
    { value: 'hard', label: 'ยาก', color: 'orange' },
    { value: 'expert', label: 'ผู้เชี่ยวชาญ', color: 'red' }
  ]

  /**
   * Sort options (using RPG Awesome icons)
   */
  const sortOptions = [
    { value: 'popular', label: 'ยอดนิยม', icon: 'star' },
    { value: 'newest', label: 'ใหม่ล่าสุด', icon: 'clock' },
    { value: 'oldest', label: 'เก่าสุด', icon: 'hourglass' },
    { value: 'most_liked', label: 'ถูกใจมากสุด', icon: 'broken-heart' },
    { value: 'most_played', label: 'เล่นมากสุด', icon: 'gamepad-cross' },
    { value: 'alphabetical', label: 'ชื่อ ก-ฮ', icon: 'arrow-cluster' }
  ]

  return {
    // State
    searchText,
    selectedTags,
    selectedCategory,
    selectedDifficulty,
    sortBy,
    showOnlyLiked,
    
    // Computed
    filteredQuizzes,
    filterStats,
    
    // Methods
    resetFilters,
    toggleTag,
    isTagSelected,
    removeTag,
    
    // Options
    categoryOptions,
    difficultyOptions,
    sortOptions
  }
}
