import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isMockMode } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

const MOCK_STORAGE_KEY = 'quizslayer:mock-quiz-sets'

const MOCK_QUESTIONS = Array.from({ length: 20 }, (_, index) => {
  const number = index + 1
  const left = number + 2
  const right = number + 3
  const answer = left + right
  return {
    id: `mock-question-${number}`,
    stage: Math.floor(index / 4) + 1,
    question_text: `ข้อ ${number}: ${left} + ${right} เท่ากับเท่าไร?`,
    options: [String(answer), String(answer + 1), String(answer - 1), String(answer + 2)],
    correct_index: 0,
    explanation: `${left} + ${right} = ${answer}`,
  }
})

const MOCK_BATTLE_QUESTIONS = [
  ['Vue ใช้แนวคิดหลักข้อใดในการแสดงผล UI แบบตอบสนองต่อข้อมูล?', ['Reactivity', 'Polling', 'Manual DOM only', 'SQL trigger'], 'Vue ใช้ระบบ reactivity เพื่ออัปเดต UI เมื่อ state เปลี่ยน'],
  ['Pinia ในโปรเจกต์นี้มีหน้าที่หลักอะไร?', ['จัดการ state ของแอป', 'สร้างฐานข้อมูล', 'แปลงรูปภาพ', 'รัน web server'], 'Pinia เป็น state management ของ Vue'],
  ['ไฟล์ใดมักใช้กำหนด route ของ Vue Router?', ['src/router/index.js', 'package-lock.json', 'favicon.svg', 'postcss.config.js'], 'โปรเจกต์นี้กำหนด routes ไว้ใน src/router/index.js'],
  ['Vite เด่นเรื่องใดในงาน frontend development?', ['dev server และ build ที่รวดเร็ว', 'เป็นฐานข้อมูล NoSQL', 'เป็นระบบ login', 'เป็น game engine'], 'Vite เป็น build tool และ dev server ที่เร็ว'],
  ['ด่านที่ 2 ของ QuizSlayer เพิ่มกลไกใดกับตัวเลือกคำตอบ?', ['สลับตำแหน่งตัวเลือก', 'ซ่อนคำถามทั้งหมด', 'ลบคะแนนทันที', 'หยุดเกมถาวร'], 'Stage 2 ใช้ mechanics shuffle_options'],
  ['คำว่า component ใน Vue หมายถึงอะไร?', ['ส่วน UI ที่นำกลับมาใช้ซ้ำได้', 'รหัสผ่านผู้ใช้', 'ตารางฐานข้อมูล', 'คำสั่ง build'], 'Component คือหน่วย UI ที่ประกอบกันเป็นหน้าเว็บ'],
  ['Tailwind class `w-full` หมายถึงค่า CSS ใด?', ['width: 100%;', 'width: auto;', 'width: 100vw;', 'width: fit-content;'], '`w-full` เท่ากับ width: 100%'],
  ['การใช้ computed ใน Vue เหมาะกับกรณีใด?', ['คำนวณค่าจาก state อื่น', 'โหลดไฟล์ภาพเท่านั้น', 'ลบ node_modules', 'เปิด port server'], 'computed ใช้สร้างค่าที่ derive จาก reactive state'],
  ['Phaser ในโปรเจกต์นี้ใช้ทำอะไร?', ['เรนเดอร์ฉากต่อสู้บน canvas', 'เชื่อมต่อ Supabase', 'จัด route', 'จัด format CSS'], 'Phaser เป็น game engine สำหรับฉาก battle'],
  ['ค่า correct_index ในชุดข้อสอบเริ่มนับจากเลขใด?', ['0', '1', '2', '4'], 'ระบบใช้ index แบบ 0-based'],
  ['ถ้าผู้เล่นตอบถูก ระบบ battle จะทำอะไรกับมอนสเตอร์?', ['ลด HP มอนสเตอร์', 'เพิ่ม HP มอนสเตอร์', 'รีเซ็ตข้อสอบ', 'ออกจากระบบ'], 'ตอบถูกจะคำนวณ damage แล้วลด HP ของมอนสเตอร์'],
  ['Supabase mock mode ถูกใช้เมื่อไม่มีค่า environment ใด?', ['VITE_SUPABASE_URL', 'NODE_ENV', 'PORT', 'BASE_URL'], 'isMockMode ตรวจจากการไม่มี VITE_SUPABASE_URL'],
  ['ด่านที่ 4 มีกลไก blind ส่งผลอย่างไร?', ['ซ่อนตัวเลือกหลังเวลาสั้น ๆ', 'เพิ่มจำนวนตัวเลือก', 'ลบคำถาม', 'เพิ่ม coin ทุกวินาที'], 'blind จะซ่อนตัวเลือกหลังผ่านไป 3 วินาที'],
  ['การ import ข้อสอบจาก AI ต้องส่งข้อมูลรูปแบบใด?', ['JSON array', 'ไฟล์ ZIP เท่านั้น', 'HTML table', 'รูปภาพ PNG'], 'หน้า generator รับ JSON array ของคำถาม'],
  ['ในระบบนี้ 20 ข้อถูกแบ่งเป็น 5 ด่าน ด่านละกี่ข้อ?', ['4 ข้อ', '2 ข้อ', '5 ข้อ', '10 ข้อ'], '20 หาร 5 ได้ด่านละ 4 ข้อ'],
  ['ปุ่ม Import & เล่นเลย หลัง import สำเร็จจะพาผู้ใช้ไปหน้าใด?', ['Battle', 'Login', 'History', 'Profile'], 'หลัง import สำเร็จ router จะ push ไปหน้า battle'],
  ['ด่านสุดท้ายมี mechanic ใดที่ทำให้ตัวเลือกผิดบางข้อหายไป?', ['vanishing_choices', 'shuffle_options', 'stun_bar', 'grassland'], 'vanishing_choices ค่อย ๆ ซ่อนตัวเลือกผิด'],
  ['คำสั่ง `npm run build` ใช้ตรวจอะไรได้เป็นหลัก?', ['ว่าโปรเจกต์ build ผ่านหรือไม่', 'ว่าผู้ใช้ตอบถูกหรือไม่', 'ว่าสกุลเงินเพิ่มไหม', 'ว่า Supabase มีเงินจริงไหม'], 'build ช่วยจับ error ระดับ compile/bundle'],
  ['เมื่อผู้เล่นเคลียร์ด่านที่ 5 สำเร็จ phase จะเป็นค่าใด?', ['victory', 'idle', 'stage_clear', 'monster_turn'], 'handleStageClear ตั้ง phase เป็น victory เมื่อผ่านด่าน 5'],
  ['ข้อใดเป็นเหตุผลที่ต้องมี mock quiz set?', ['ทดสอบ flow เกมได้โดยไม่ต้องพึ่งฐานข้อมูลจริง', 'แทนที่ source code ทั้งหมด', 'ปิดระบบ login ถาวร', 'ลบหน้า generator'], 'Mock data ช่วยทดสอบระบบได้ในเครื่องทันที'],
].map(([question_text, options, explanation], index) => ({
  id: `mock-battle-question-${index + 1}`,
  stage: Math.floor(index / 4) + 1,
  question_text,
  options,
  correct_index: 0,
  explanation,
}))

function readStoredMockSets() {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY)
    const sets = raw ? JSON.parse(raw) : []
    return Array.isArray(sets) ? sets : []
  } catch {
    return []
  }
}

function writeStoredMockSets(sets) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(sets))
  } catch {
    // Ignore storage failures in mock mode so quiz import still works in-memory.
  }
}

function toQuizSetSummary(set) {
  return {
    ...set,
    questions: [{ count: set.questions?.length ?? 0 }],
  }
}

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
      const memoryMockSets = quizSets.value.filter(set => set.id !== 'mock-1')
      const storedMockSets = readStoredMockSets().map(toQuizSetSummary)
      const importedMockSets = [...memoryMockSets, ...storedMockSets]
        .filter((set, index, sets) => sets.findIndex(s => s.id === set.id) === index)
      quizSets.value = [{
        id: 'mock-1',
        title: 'Mock Battle Test: 20 Questions',
        is_public: true,
        questions: [{ count: 20 }]
      }, ...importedMockSets]
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
    if (isMockMode) return
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
        title: 'Mock Battle Test: 20 Questions',
        questions: [
          { stage: 1, question_text: 'Vue ย่อมาจากอะไร?', options: ['View', 'Vite', 'Vendor', 'Value'], correct_index: 0, explanation: 'Vue อ่านพ้องเสียงกับคำว่า View' },
          { stage: 2, question_text: 'Vite คืออะไร?', options: ['Build tool ที่เร็วมาก', 'Framework แบบ Next.js', 'Database ฐานข้อมูล', 'Browser ใหม่ของ Google'], correct_index: 0, explanation: 'Vite เป็น frontend build tool รุ่นใหม่' },
          { stage: 3, question_text: 'Pinia ใช้ทำอะไรในโปรเจกต์นี้?', options: ['State Management', 'ทำ Routing', 'จัด Styling หน้าเว็บ', 'ทำ Unit Test'], correct_index: 0, explanation: 'Pinia คือ State Management อย่างเป็นทางการของ Vue (แทน Vuex)' },
          { stage: 4, question_text: 'ใน Tailwind CSS คำสั่ง `w-full` มีค่าเท่ากับอะไร?', options: ['width: 100%;', 'width: auto;', 'width: 100vw;', 'width: max-content;'], correct_index: 0, explanation: '`w-full` จะตั้งค่า CSS เป็น `width: 100%;`' },
          { stage: 5, question_text: 'Phaser 3 ใน QuizSlayer ใช้ทำอะไร?', options: ['สร้าง Canvas แสดงฉากต่อสู้', 'จัดการ Database', 'ทำ API Server', 'ทำระบบ Login'], correct_index: 0, explanation: 'Phaser 3 เป็น Game Engine ที่เราใช้เรนเดอร์ภาพฉากต่อสู้' }
        ]
      }
      mockData.questions = MOCK_BATTLE_QUESTIONS
      activeSet.value = mockData
      loading.value = false
      return mockData
    }

    if (isMockMode) {
      const mockSet = activeSet.value?.id === quizSetId
        ? activeSet.value
        : quizSets.value.find(set => set.id === quizSetId)
      if (mockSet?.questions?.[0]?.count && activeSet.value?.id !== quizSetId) {
        const storedSet = readStoredMockSets().find(set => set.id === quizSetId)
        activeSet.value = storedSet ?? null
        loading.value = false
        return activeSet.value
      }
      activeSet.value = mockSet ?? null
      loading.value = false
      return activeSet.value
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
    if (!Array.isArray(questions) || questions.length === 0) throw new Error('JSON must be a non-empty array')
    questions.forEach((q, index) => {
      // รองรับทั้ง "question" (จาก AI) และ "question_text" (internal format)
      const questionText = q.question ?? q.question_text
      if (typeof questionText !== 'string' || !questionText.trim()) {
        throw new Error(`Invalid question at index ${index}: missing "question" field`)
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question at index ${index}: options must be array of 4`)
      }
      if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index > 3) {
        throw new Error(`Invalid question at index ${index}: correct_index must be 0-3`)
      }
    })
    loading.value = true

    // Assign stages evenly (5 stages)
    const perStage = Math.max(1, Math.ceil(questions.length / 5))
    const formattedQuestions = questions.map((q, i) => ({
      stage:         Math.min(5, Math.floor(i / perStage) + 1),
      question_text: q.question ?? q.question_text,
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
      const storedSets = readStoredMockSets().filter(set => set.id !== mockId)
      writeStoredMockSets([newMockSet, ...storedSets])
      quizSets.value.push(toQuizSetSummary(newMockSet))
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

  // ─── Delete quiz set ──────────────────────────────────
  async function deleteQuizSet(quizSetId) {
    const authStore = useAuthStore()
    if (!authStore.user) return false
    loading.value = true

    if (isMockMode) {
      const stored = readStoredMockSets().filter(s => s.id !== quizSetId)
      writeStoredMockSets(stored)
      quizSets.value = quizSets.value.filter(s => s.id !== quizSetId)
      if (activeSet.value?.id === quizSetId) activeSet.value = null
      loading.value = false
      return true
    }

    // Questions cascade-delete via FK ON DELETE CASCADE in schema
    const { error: err } = await supabase
      .from('quiz_sets')
      .delete()
      .eq('id', quizSetId)
      .eq('author_id', authStore.user.id)   // RLS double-check
    if (err) { error.value = err.message; loading.value = false; return false }

    quizSets.value = quizSets.value.filter(s => s.id !== quizSetId)
    if (activeSet.value?.id === quizSetId) activeSet.value = null
    loading.value = false
    return true
  }

  // ─── Update quiz set title / visibility ──────────────
  async function updateQuizSet(quizSetId, patch) {
    const authStore = useAuthStore()
    if (!authStore.user) return false
    loading.value = true

    if (isMockMode) {
      const stored = readStoredMockSets().map(s =>
        s.id === quizSetId ? { ...s, ...patch } : s
      )
      writeStoredMockSets(stored)
      quizSets.value = quizSets.value.map(s =>
        s.id === quizSetId ? { ...s, ...patch } : s
      )
      if (activeSet.value?.id === quizSetId) {
        activeSet.value = { ...activeSet.value, ...patch }
      }
      loading.value = false
      return true
    }

    const { error: err } = await supabase
      .from('quiz_sets')
      .update(patch)
      .eq('id', quizSetId)
      .eq('author_id', authStore.user.id)
    if (err) { error.value = err.message; loading.value = false; return false }

    quizSets.value = quizSets.value.map(s =>
      s.id === quizSetId ? { ...s, ...patch } : s
    )
    if (activeSet.value?.id === quizSetId) {
      activeSet.value = { ...activeSet.value, ...patch }
    }
    loading.value = false
    return true
  }

  // ─── Update a single question ─────────────────────────
  async function updateQuestion(quizSetId, questionIndex, patch) {
    const authStore = useAuthStore()
    if (!authStore.user) return false
    loading.value = true

    if (isMockMode) {
      const stored = readStoredMockSets()
      const setIdx = stored.findIndex(s => s.id === quizSetId)
      if (setIdx === -1) { loading.value = false; return false }
      stored[setIdx].questions[questionIndex] = { ...stored[setIdx].questions[questionIndex], ...patch }
      writeStoredMockSets(stored)
      if (activeSet.value?.id === quizSetId) {
        const qs = [...activeSet.value.questions]
        qs[questionIndex] = { ...qs[questionIndex], ...patch }
        activeSet.value = { ...activeSet.value, questions: qs }
      }
      loading.value = false
      return true
    }

    // Need question id — load full set first
    const set = await loadQuizSet(quizSetId)
    if (!set) { loading.value = false; return false }
    const question = set.questions[questionIndex]
    if (!question?.id) { loading.value = false; return false }

    const { error: err } = await supabase
      .from('questions')
      .update(patch)
      .eq('id', question.id)
    if (err) { error.value = err.message; loading.value = false; return false }

    const qs = [...activeSet.value.questions]
    qs[questionIndex] = { ...qs[questionIndex], ...patch }
    activeSet.value = { ...activeSet.value, questions: qs }
    loading.value = false
    return true
  }

  // ─── Delete a single question ─────────────────────────
  async function deleteQuestion(quizSetId, questionIndex) {
    const authStore = useAuthStore()
    if (!authStore.user) return false
    loading.value = true

    if (isMockMode) {
      const stored = readStoredMockSets()
      const setIdx = stored.findIndex(s => s.id === quizSetId)
      if (setIdx === -1) { loading.value = false; return false }
      stored[setIdx].questions.splice(questionIndex, 1)
      writeStoredMockSets(stored)
      if (activeSet.value?.id === quizSetId) {
        const qs = [...activeSet.value.questions]
        qs.splice(questionIndex, 1)
        activeSet.value = { ...activeSet.value, questions: qs }
        // Update summary in quizSets
        quizSets.value = quizSets.value.map(s =>
          s.id === quizSetId
            ? { ...s, questions: [{ count: qs.length }] }
            : s
        )
      }
      loading.value = false
      return true
    }

    const set = await loadQuizSet(quizSetId)
    if (!set) { loading.value = false; return false }
    const question = set.questions[questionIndex]
    if (!question?.id) { loading.value = false; return false }

    const { error: err } = await supabase
      .from('questions')
      .delete()
      .eq('id', question.id)
    if (err) { error.value = err.message; loading.value = false; return false }

    const qs = [...activeSet.value.questions]
    qs.splice(questionIndex, 1)
    activeSet.value = { ...activeSet.value, questions: qs }
    quizSets.value = quizSets.value.map(s =>
      s.id === quizSetId
        ? { ...s, questions: [{ count: qs.length }] }
        : s
    )
    loading.value = false
    return true
  }

  return {
    quizSets, activeSet, loading, error,
    publicSets, mySets,
    fetchPublicSets, fetchMySets, loadQuizSet, importFromJSON, setActiveSet,
    deleteQuizSet, updateQuizSet, updateQuestion, deleteQuestion,
  }
})
