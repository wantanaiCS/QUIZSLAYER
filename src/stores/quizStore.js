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
  
  // Tags data
  const allTags      = ref([])
  const popularTags  = ref([])

  const publicSets = computed(() => quizSets.value.filter(q => q.is_public))
  const mySets     = computed(() => {
    const authStore = useAuthStore()
    return quizSets.value.filter(q => q.author_id === authStore.user?.id)
  })

  async function fetchPublicSets() {
    loading.value = true
    if (isMockMode) {
      const memoryMockSets = quizSets.value.filter(set => set.id !== 'mock-1')
      const storedMockSets = readStoredMockSets().map(set => ({
        ...toQuizSetSummary(set),
        // Add mock stats and metadata
        category: set.category || 'general',
        difficulty: set.difficulty || 'normal',
        icon_name: set.icon_name || 'book',
        icon_color: set.icon_color || 'blue',
        likes_count: set.likes_count || 0,
        views_count: set.views_count || 0,
        plays_count: set.plays_count || 0,
        shares_count: set.shares_count || 0,
        tags: set.tags || [],
        is_liked: false,
        author_name: 'Mock User'
      }))
      const importedMockSets = [...memoryMockSets, ...storedMockSets]
        .filter((set, index, sets) => sets.findIndex(s => s.id === set.id) === index)
      quizSets.value = [{
        id: 'mock-1',
        title: 'Mock Battle Test: 20 Questions',
        is_public: true,
        questions: [{ count: 20 }],
        category: 'technology',
        difficulty: 'normal',
        icon_name: 'computer',
        icon_color: 'blue',
        likes_count: 42,
        views_count: 150,
        plays_count: 38,
        shares_count: 5,
        tags: [
          { id: 'mock-tag-1', name: 'Vue.js' },
          { id: 'mock-tag-2', name: 'Frontend' }
        ],
        is_liked: false,
        author_name: 'QuizSlayer Bot'
      }, ...importedMockSets]
      loading.value = false
      return
    }

    const { data, error: err } = await supabase
      .from('quiz_sets_with_details')
      .select('*, questions(count)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50)
    if (!err) {
      // merge — อย่า overwrite private sets ที่โหลดมาแล้วจาก fetchMySets
      const publicIds = (data ?? []).map(q => q.id)
      quizSets.value = [
        ...(data ?? []),
        ...quizSets.value.filter(q => !publicIds.includes(q.id)),
      ]
    } else {
      error.value = err.message
    }
    loading.value = false
  }

  async function fetchMySets() {
    const authStore = useAuthStore()
    if (!authStore.user) return
    if (isMockMode) return
    loading.value = true
    const { data, error: err } = await supabase
      .from('quiz_sets_with_details')
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
    // Cache hit: activeSet มีข้อมูลเต็ม (questions เป็น array ที่มี options จริง ไม่ใช่ count object)
    if (
      activeSet.value?.id === quizSetId &&
      Array.isArray(activeSet.value?.questions) &&
      activeSet.value.questions.length > 0 &&
      Array.isArray(activeSet.value.questions[0]?.options)
    ) {
      return activeSet.value
    }

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
    if (!err && data) {
      // Normalize questions: options อาจมาเป็น JSON string จาก JSONB, stage อาจมาเป็น string
      data.questions = (data.questions ?? []).map(q => ({
        ...q,
        stage: Number(q.stage),
        options: Array.isArray(q.options)
          ? q.options
          : (typeof q.options === 'string' ? JSON.parse(q.options) : ['', '', '', '']),
        correct_index: Number(q.correct_index),
      }))
      activeSet.value = data
    } else if (err) {
      error.value = err.message
    }
    loading.value = false
    return activeSet.value
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

  // Shuffle options to distribute correct_index evenly (prevents all-A answers)
  function shuffleOptions(q) {
    const opts = [...q.options]
    const correctAnswer = opts[q.correct_index]
    // Fisher-Yates shuffle
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]]
    }
    const newCorrectIndex = opts.indexOf(correctAnswer)
    return { options: opts, correct_index: newCorrectIndex }
  }

  const formattedQuestions = questions.map((q, i) => {
    const { options, correct_index } = shuffleOptions(q)
    return {
      stage:         Math.min(5, Math.floor(i / perStage) + 1),
      question_text: q.question ?? q.question_text,
      options,
      correct_index,
      explanation:   q.explanation ?? null,
    }
  })

  if (isMockMode) {
    const mockId = 'mock-' + Date.now()
    const newMockSet = {
      id: mockId,
      title,
      is_public: false,
      author_id: authStore.user.id,
      questions: formattedQuestions,
      category: 'general',
      difficulty: 'normal',
      icon_name: 'book',
      icon_color: 'blue',
      likes_count: 0,
      views_count: 0,
      plays_count: 0,
      shares_count: 0,
      tags: []
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

  // ═══════════════════════════════════════════════════════════════════════════
  // Tags Management
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Fetch all tags (for autocomplete/selection)
   */
  async function fetchTags() {
    if (isMockMode) {
      allTags.value = [
        { id: 'mock-tag-1', name: 'Vue.js', slug: 'vuejs', usage_count: 15 },
        { id: 'mock-tag-2', name: 'Frontend', slug: 'frontend', usage_count: 12 },
        { id: 'mock-tag-3', name: 'JavaScript', slug: 'javascript', usage_count: 20 },
        { id: 'mock-tag-4', name: 'TypeScript', slug: 'typescript', usage_count: 8 },
        { id: 'mock-tag-5', name: 'React', slug: 'react', usage_count: 10 },
        { id: 'mock-tag-6', name: 'CSS', slug: 'css', usage_count: 7 },
        { id: 'mock-tag-7', name: 'Tailwind', slug: 'tailwind', usage_count: 9 },
        { id: 'mock-tag-8', name: 'API', slug: 'api', usage_count: 6 }
      ]
      popularTags.value = allTags.value.slice(0, 12)
      return
    }

    const { data, error: err } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })
    
    if (!err) {
      allTags.value = data ?? []
    } else {
      error.value = err.message
    }
  }

  /**
   * Fetch popular tags (most used, for quick filter widget)
   */
  async function fetchPopularTags(limit = 20) {
    if (isMockMode) {
      popularTags.value = allTags.value.slice(0, limit)
      return
    }

    const { data, error: err } = await supabase
      .rpc('get_popular_tags', { p_limit: limit })
    
    if (!err) {
      popularTags.value = data ?? []
    } else {
      error.value = err.message
    }
  }

  /**
   * Add or get tag (creates if doesn't exist)
   */
  async function addOrGetTag(tagName) {
    const authStore = useAuthStore()
    if (!authStore.user) {
      error.value = 'ต้องเข้าสู่ระบบก่อน'
      return null
    }
    
    if (isMockMode) {
      // Check if tag exists
      let tag = allTags.value.find(t => t.name.toLowerCase() === tagName.toLowerCase())
      if (!tag) {
        tag = {
          id: 'mock-tag-' + Date.now(),
          name: tagName,
          slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          usage_count: 0
        }
        allTags.value.push(tag)
      }
      return tag
    }

    try {
      console.log('[quizStore] Calling add_or_get_tag with:', tagName)
      const { data, error: err } = await supabase
        .rpc('add_or_get_tag', { p_name: tagName })
      
      if (err) {
        console.error('[quizStore] Error from add_or_get_tag:', err)
        error.value = `Database error: ${err.message || err.details || 'Unknown error'}`
        return null
      }
      
      console.log('[quizStore] Tag created/found, id:', data)
      
      // Refresh tags to get the new/updated one
      await fetchTags()
      const foundTag = allTags.value.find(t => t.id === data)
      
      if (!foundTag) {
        console.error('[quizStore] Tag not found after creation, id:', data)
        error.value = 'ไม่พบแท็กหลังสร้าง'
        return null
      }
      
      return foundTag
    } catch (err) {
      console.error('[quizStore] Exception in addOrGetTag:', err)
      error.value = err.message || 'เกิดข้อผิดพลาดในการสร้างแท็ก'
      return null
    }
  }

  /**
   * Add tag to quiz
   */
  async function addTagToQuiz(quizSetId, tagId) {
    const authStore = useAuthStore()
    if (!authStore.user) return false

    if (isMockMode) {
      const stored = readStoredMockSets()
      const setIdx = stored.findIndex(s => s.id === quizSetId)
      if (setIdx === -1) return false
      
      const tag = allTags.value.find(t => t.id === tagId)
      if (!tag) return false
      
      if (!stored[setIdx].tags) stored[setIdx].tags = []
      if (!stored[setIdx].tags.find(t => t.id === tagId)) {
        stored[setIdx].tags.push(tag)
      }
      writeStoredMockSets(stored)
      
      // Update in quizSets
      quizSets.value = quizSets.value.map(s =>
        s.id === quizSetId ? { ...s, tags: stored[setIdx].tags } : s
      )
      return true
    }

    const { error: err } = await supabase
      .from('quiz_tags')
      .insert({ quiz_set_id: quizSetId, tag_id: tagId })
    
    if (!err) {
      // Refresh the quiz to get updated tags
      await fetchMySets()
      return true
    } else {
      error.value = err.message
      return false
    }
  }

  /**
   * Remove tag from quiz
   */
  async function removeTagFromQuiz(quizSetId, tagId) {
    const authStore = useAuthStore()
    if (!authStore.user) return false

    if (isMockMode) {
      const stored = readStoredMockSets()
      const setIdx = stored.findIndex(s => s.id === quizSetId)
      if (setIdx === -1) return false
      
      if (stored[setIdx].tags) {
        stored[setIdx].tags = stored[setIdx].tags.filter(t => t.id !== tagId)
      }
      writeStoredMockSets(stored)
      
      // Update in quizSets
      quizSets.value = quizSets.value.map(s =>
        s.id === quizSetId ? { ...s, tags: stored[setIdx].tags } : s
      )
      return true
    }

    const { error: err } = await supabase
      .from('quiz_tags')
      .delete()
      .eq('quiz_set_id', quizSetId)
      .eq('tag_id', tagId)
    
    if (!err) {
      // Refresh the quiz to get updated tags
      await fetchMySets()
      return true
    } else {
      error.value = err.message
      return false
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Likes, Views, Shares, Plays
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Toggle like on a quiz
   */
  async function toggleLike(quizSetId) {
    const authStore = useAuthStore()
    if (!authStore.user) return false

    if (isMockMode) {
      // Toggle is_liked in memory
      quizSets.value = quizSets.value.map(s => {
        if (s.id === quizSetId) {
          const newLiked = !s.is_liked
          const newCount = newLiked 
            ? (s.likes_count || 0) + 1 
            : Math.max(0, (s.likes_count || 0) - 1)
          return { ...s, is_liked: newLiked, likes_count: newCount }
        }
        return s
      })
      return true
    }

    const { data, error: err } = await supabase
      .rpc('toggle_quiz_like', { p_quiz_set_id: quizSetId })
    
    if (!err && data) {
      // Update local state
      quizSets.value = quizSets.value.map(s =>
        s.id === quizSetId 
          ? { ...s, is_liked: data.is_liked, likes_count: data.likes_count }
          : s
      )
      return true
    } else {
      error.value = err?.message
      return false
    }
  }

  /**
   * Record a view (when user opens/views quiz details)
   */
  async function recordView(quizSetId) {
    if (isMockMode) {
      // Increment view count in memory
      quizSets.value = quizSets.value.map(s =>
        s.id === quizSetId 
          ? { ...s, views_count: (s.views_count || 0) + 1 }
          : s
      )
      return true
    }

    const { error: err } = await supabase
      .rpc('record_quiz_view', { p_quiz_set_id: quizSetId })
    
    if (!err) {
      // Update local state
      quizSets.value = quizSets.value.map(s =>
        s.id === quizSetId 
          ? { ...s, views_count: (s.views_count || 0) + 1 }
          : s
      )
      return true
    } else {
      error.value = err.message
      return false
    }
  }

  /**
   * Record a share (when user shares quiz via link/social)
   */
  async function recordShare(quizSetId) {
    const authStore = useAuthStore()
    if (!authStore.user) return false

    if (isMockMode) {
      // Increment share count in memory
      quizSets.value = quizSets.value.map(s =>
        s.id === quizSetId 
          ? { ...s, shares_count: (s.shares_count || 0) + 1 }
          : s
      )
      return true
    }

    const { error: err } = await supabase
      .rpc('record_quiz_share', { p_quiz_set_id: quizSetId })
    
    if (!err) {
      // Update local state
      quizSets.value = quizSets.value.map(s =>
        s.id === quizSetId 
          ? { ...s, shares_count: (s.shares_count || 0) + 1 }
          : s
      )
      return true
    } else {
      error.value = err.message
      return false
    }
  }

  /**
   * Record a play (when user starts playing the quiz)
   */
  async function recordPlay(quizSetId) {
    if (isMockMode) {
      // Increment play count in memory
      quizSets.value = quizSets.value.map(s =>
        s.id === quizSetId 
          ? { ...s, plays_count: (s.plays_count || 0) + 1 }
          : s
      )
      return true
    }

    const { error: err } = await supabase
      .rpc('record_quiz_play', { p_quiz_set_id: quizSetId })
    
    if (!err) {
      // Update local state
      quizSets.value = quizSets.value.map(s =>
        s.id === quizSetId 
          ? { ...s, plays_count: (s.plays_count || 0) + 1 }
          : s
      )
      return true
    } else {
      error.value = err.message
      return false
    }
  }

  return {
    quizSets, activeSet, loading, error,
    publicSets, mySets,
    allTags, popularTags,
    fetchPublicSets, fetchMySets, loadQuizSet, importFromJSON, setActiveSet,
    deleteQuizSet, updateQuizSet, updateQuestion, deleteQuestion,
    // Tags
    fetchTags, fetchPopularTags, addOrGetTag, addTagToQuiz, removeTagFromQuiz,
    // Stats
    toggleLike, recordView, recordShare, recordPlay,
  }
})
