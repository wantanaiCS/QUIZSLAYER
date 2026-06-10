import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export const useQuizStore = defineStore('quiz', () => {
  const quizSets   = ref([])
  const activeSet  = ref(null)
  const loading    = ref(false)
  const error      = ref(null)

  const publicSets = computed(() => quizSets.value.filter(q => q.is_public))
  const mySets     = computed(() => {
    const authStore = useAuthStore()
    return quizSets.value.filter(q => q.owner_id === authStore.user?.id)
  })

  async function fetchPublicSets() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('quiz_sets')
      .select('*, questions(count)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20)
    if (!err) quizSets.value = data ?? []
    else error.value = err.message
    loading.value = false
  }

  async function fetchMySets() {
    const authStore = useAuthStore()
    if (!authStore.user) return
    loading.value = true
    const { data, error: err } = await supabase
      .from('quiz_sets')
      .select('*, questions(count)')
      .eq('owner_id', authStore.user.id)
      .order('created_at', { ascending: false })
    if (!err) {
      // Merge with existing, replace owned sets
      const myIds = (data ?? []).map(q => q.id)
      quizSets.value = [
        ...quizSets.value.filter(q => !myIds.includes(q.id)),
        ...(data ?? [])
      ]
    } else {
      error.value = err.message
    }
    loading.value = false
  }

  async function loadQuizSet(quizSetId) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('quiz_sets')
      .select('*, questions(*)')
      .eq('id', quizSetId)
      .single()
    if (!err) activeSet.value = data
    else error.value = err.message
    loading.value = false
    return data
  }

  /**
   * Import a JSON array of questions (from AI generator) as a new quiz set
   * @param {string} title
   * @param {Array} questions  - raw AI output array
   * @param {string} source   - 'topic_input' | 'document_upload'
   */
  async function importFromJSON(title, questions, source = 'topic_input') {
    const authStore = useAuthStore()
    if (!authStore.user) return null
    loading.value = true

    // Create quiz_set first
    const { data: setData, error: setErr } = await supabase
      .from('quiz_sets')
      .insert({ title, source, owner_id: authStore.user.id, is_public: false })
      .select()
      .single()
    if (setErr) { error.value = setErr.message; loading.value = false; return null }

    // Assign stages evenly (5 stages)
    const perStage = Math.max(1, Math.ceil(questions.length / 5))
    const monsterNames = ['Slime', 'Goblin', 'Orc', 'Dark Mage', 'Boss']

    const rows = questions.map((q, i) => ({
      quiz_set_id:   setData.id,
      stage:         Math.min(5, Math.floor(i / perStage) + 1),
      monster_name:  monsterNames[Math.min(4, Math.floor(i / perStage))],
      question_text: q.question,
      options:       q.options,
      correct_index: q.correct_index,
      difficulty:    q.difficulty ?? 'normal',
      explanation:   q.explanation ?? null,
    }))

    const { error: qErr } = await supabase.from('questions').insert(rows)
    if (qErr) { error.value = qErr.message; loading.value = false; return null }

    loading.value = false
    return setData
  }

  function setActiveSet(set) {
    activeSet.value = set
  }

  return {
    quizSets, activeSet, loading, error,
    publicSets, mySets,
    fetchPublicSets, fetchMySets, loadQuizSet, importFromJSON, setActiveSet,
  }
})
