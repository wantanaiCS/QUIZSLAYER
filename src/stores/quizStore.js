import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isMockMode } from '@/lib/supabase'
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
    if (isMockMode) {
      quizSets.value = [{
        id: 'mock-1',
        title: 'Mock: Vue & Vite 101',
        is_public: true,
        questions: [{ count: 5 }]
      }]
      loading.value = false
      return
    }

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
      .eq('author_id', authStore.user.id)
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
    if (isMockMode && quizSetId === 'mock-1') {
      const mockData = {
        id: 'mock-1',
        title: 'Mock: Vue & Vite 101',
        questions: [
          { stage: 1, question_text: 'Vue ย่อมาจากอะไร?', options: ['View', 'Vite', 'Vendor', 'Value'], correct_index: 0, explanation: 'Vue อ่านพ้องเสียงกับคำว่า View' },
          { stage: 2, question_text: 'Vite คืออะไร?', options: ['Build tool ที่เร็วมาก', 'Framework แบบ Next.js', 'Database ฐานข้อมูล', 'Browser ใหม่ของ Google'], correct_index: 0, explanation: 'Vite เป็น frontend build tool รุ่นใหม่' },
          { stage: 3, question_text: 'Pinia ใช้ทำอะไรในโปรเจกต์นี้?', options: ['State Management', 'ทำ Routing', 'จัด Styling หน้าเว็บ', 'ทำ Unit Test'], correct_index: 0, explanation: 'Pinia คือ State Management อย่างเป็นทางการของ Vue (แทน Vuex)' },
          { stage: 4, question_text: 'ใน Tailwind CSS คำสั่ง `w-full` มีค่าเท่ากับอะไร?', options: ['width: 100%;', 'width: auto;', 'width: 100vw;', 'width: max-content;'], correct_index: 0, explanation: '`w-full` จะตั้งค่า CSS เป็น `width: 100%;`' },
          { stage: 5, question_text: 'Phaser 3 ใน QuizSlayer ใช้ทำอะไร?', options: ['สร้าง Canvas แสดงฉากต่อสู้', 'จัดการ Database', 'ทำ API Server', 'ทำระบบ Login'], correct_index: 0, explanation: 'Phaser 3 เป็น Game Engine ที่เราใช้เรนเดอร์ภาพฉากต่อสู้' }
        ]
      }
      activeSet.value = mockData
      loading.value = false
      return mockData
    }

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
   */
  async function importFromJSON(title, questions) {
    const authStore = useAuthStore()
    if (!authStore.user) return null
    loading.value = true

    // Assign stages evenly (5 stages)
    const perStage = Math.max(1, Math.ceil(questions.length / 5))
    const formattedQuestions = questions.map((q, i) => ({
      stage:         Math.min(5, Math.floor(i / perStage) + 1),
      question_text: q.question,
      options:       q.options,
      correct_index: q.correct_index,
      explanation:   q.explanation ?? null,
    }))

    if (isMockMode) {
      const mockId = 'mock-' + Date.now()
      const newMockSet = {
        id: mockId,
        title,
        is_public: false,
        author_id: authStore.user.id,
        questions: formattedQuestions
      }
      quizSets.value.push({ ...newMockSet, questions: [{ count: questions.length }] })
      activeSet.value = newMockSet
      loading.value = false
      return newMockSet
    }

    // Create quiz_set first
    const { data: setData, error: setErr } = await supabase
      .from('quiz_sets')
      .insert({ title, author_id: authStore.user.id, is_public: false })
      .select()
      .single()
    if (setErr) { error.value = setErr.message; loading.value = false; return null }

    const rows = formattedQuestions.map(q => ({
      quiz_set_id: setData.id,
      ...q
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
