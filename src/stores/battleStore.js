import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  calcPlayerMaxHP,
  calcMonsterHP,
  calcPlayerDamage,
  calcMonsterDamage,
  calcSkillDamage,
  getCooldownSeconds,
  getPlayerBarSpeed,
  getSkillState,
  getStageConfig,
  SKILL_LV1_THRESHOLD,
  ULTIMATE_THRESHOLD,
} from '@/utils/battleCalculator'

export const useBattleStore = defineStore('battle', () => {
  // ─── Config ─────────────────────────────────────────────────────────────
  const difficulty     = ref('normal')
  const quizSet        = ref(null)
  const currentStageId = ref(1)

  // ─── HP ──────────────────────────────────────────────────────────────────
  const playerMaxHP  = ref(0)
  const playerHP     = ref(0)
  const monsterMaxHP = ref(0)
  const monsterHP    = ref(0)

  const playerHPPct  = computed(() => playerMaxHP.value  ? (playerHP.value  / playerMaxHP.value)  * 100 : 0)
  const monsterHPPct = computed(() => monsterMaxHP.value ? (monsterHP.value / monsterMaxHP.value) * 100 : 0)
  const playerHPColor = computed(() => {
    const p = playerHPPct.value
    if (p > 50) return 'hp-high'
    if (p > 25) return 'hp-mid'
    return 'hp-low'
  })

  // ─── Bar Time ────────────────────────────────────────────────────────────
  const playerBar  = ref(0)   // 0–100
  const monsterBar = ref(0)   // 0–100

  // ─── Cooldown ────────────────────────────────────────────────────────────
  const cooldownActive = ref(false)
  const cooldownLeft   = ref(0)

  // ─── Streak (for bar speed boost display only) ───────────────────────────
  const streak = ref(0)
  const playerBarSpeed = computed(() => getPlayerBarSpeed(streak.value))

  // ─── Skill Charge System ─────────────────────────────────────────────────
  /**
   * skillCharge: สะสมจากการตอบถูก (ไม่ reset ตอนตอบผิด)
   * เมื่อถึง LV1_THRESHOLD (2) → skill_lv1 ready
   * เมื่อถึง ULTIMATE_THRESHOLD (5) → ultimate ready
   * ใช้สกิลแล้ว charge reset เป็น 0
   */
  const skillCharge    = ref(0)
  const skillUsed      = ref(false)   // true = ใช้แล้ว รอ charge ใหม่

  const skillReady = computed(() => {
    if (skillUsed.value) return 'none'
    return getSkillState(skillCharge.value)
  })

  // Progress toward next threshold (for gauge display)
  const skillGaugePct = computed(() => {
    if (skillUsed.value) return 0
    const charge = skillCharge.value
    if (charge >= ULTIMATE_THRESHOLD) return 100
    if (charge >= SKILL_LV1_THRESHOLD) {
      // Between lv1 and ultimate
      return Math.round(((charge - SKILL_LV1_THRESHOLD) / (ULTIMATE_THRESHOLD - SKILL_LV1_THRESHOLD)) * 100)
    }
    // Between 0 and lv1
    return Math.round((charge / SKILL_LV1_THRESHOLD) * 100)
  })

  // ─── Questions ──────────────────────────────────────────────────────────
  const stageQuestions     = ref([])
  const currentQIndex      = ref(0)
  const currentQuestionRaw = computed(() => stageQuestions.value[currentQIndex.value] ?? null)
  const currentQuestion    = ref(null)
  const questionsInStage   = computed(() => stageQuestions.value.length)
  // นับ unique questions ที่ตอบถูกแล้ว (ไม่นับข้อที่วนซ้ำ)
  const answeredInStage    = ref(0)
  // Set ของ index ที่ตอบถูกแล้ว (ใช้สำหรับ unique count)
  const correctInStage     = ref(new Set())

  // ─── Bar readiness (ใช้ block bars ก่อนเริ่มด่าน) ─────────────────────
  const barReady = ref(false)   // false = กำลัง countdown intro, true = bars เริ่มวิ่ง
  let _introBoost = 0           // internal: หน่วยที่ loop จะ boost player bar ครั้งเดียว

  // ─── Phase / Result ──────────────────────────────────────────────────────
  const phase            = ref('idle')
  const result           = ref(null)
  const lastAnswerResult = ref(null)
  const lastDamageTaken  = ref(0)
  const damageEventId    = ref(0)

  const stageConfig = computed(() => getStageConfig(currentStageId.value))

  // Shuffle options for Stage 2
  watch([currentQuestionRaw, () => stageConfig.value.mechanics], ([q, mechanics]) => {
    if (!q) { currentQuestion.value = null; return }
    if (mechanics?.includes('shuffle_options')) {
      const opts = q.options.map((opt, idx) => ({ text: opt, isCorrect: idx === q.correct_index }))
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]]
      }
      currentQuestion.value = {
        ...q,
        options: opts.map(o => o.text),
        correct_index: opts.findIndex(o => o.isCorrect),
      }
    } else {
      currentQuestion.value = { ...q }
    }
  }, { immediate: true })

  // ─── Stats ──────────────────────────────────────────────────────────────
  const score           = ref(0)
  const coinsEarned     = ref(0)
  const monstersCleared = ref(0)
  const totalCorrect    = ref(0)
  const totalAnswered   = ref(0)
  const answerLog       = ref([])
  const startedAt       = ref(null)
  const endedAt         = ref(null)
  const durationSeconds = computed(() => {
    if (!startedAt.value) return 0
    const end = endedAt.value ?? Date.now()
    return Math.max(0, Math.round((end - startedAt.value) / 1000))
  })

  // ─── Actions ────────────────────────────────────────────────────────────

  function startBattle(quizSetData, diff) {
    quizSet.value    = quizSetData
    difficulty.value = diff
    currentStageId.value = 1

    playerMaxHP.value = calcPlayerMaxHP()
    playerHP.value    = playerMaxHP.value

    score.value           = 0
    coinsEarned.value     = 0
    monstersCleared.value = 0
    totalCorrect.value    = 0
    totalAnswered.value   = 0
    answerLog.value       = []
    startedAt.value       = Date.now()
    endedAt.value         = null
    streak.value          = 0
    skillCharge.value     = 0
    skillUsed.value       = false

    loadStage(1)
    phase.value = 'player_turn'
  }

  function loadStage(stageId) {
    currentStageId.value = stageId
    // เริ่มที่ 0 ทั้งคู่ — loop จะ animate ขึ้นเอง
    // hero ได้ boost เร็วกว่าจาก getPlayerBarSpeed ทำให้ได้ turn แรกเสมอ
    playerBar.value  = 0
    monsterBar.value = 0
    barReady.value   = true  // พร้อมเลย ไม่มี delay

    const questions      = (quizSet.value?.questions ?? []).filter(q => Number(q.stage) === stageId)
    stageQuestions.value = questions
    currentQIndex.value  = 0
    answeredInStage.value = 0
    correctInStage.value  = new Set()

    const monHP        = questions.length > 0
      ? calcMonsterHP(questions.length, difficulty.value)
      : calcMonsterHP(4, difficulty.value)  // fallback ถ้าไม่มีข้อสอบใน stage นี้
    monsterMaxHP.value = monHP
    monsterHP.value    = monHP
    lastAnswerResult.value = null
    lastDamageTaken.value  = 0

    // Reset skill state per stage
    skillCharge.value = 0
    skillUsed.value   = false
  }

  function submitAnswer(chosenIndex) {
    if (phase.value !== 'player_turn' || !currentQuestion.value) return

    cooldownActive.value = false
    totalAnswered.value++

    const q         = currentQuestion.value
    const isCorrect = chosenIndex === q.correct_index

    lastAnswerResult.value = isCorrect ? 'correct' : 'wrong'
    answerLog.value.push({
      question_id:   q.id ?? null,
      stage:         currentStageId.value,
      question_text: q.question_text,
      chosen_index:  chosenIndex,
      correct_index: q.correct_index,
      is_correct:    isCorrect,
      chosen_answer: q.options?.[chosenIndex] ?? null,
      correct_answer: q.options?.[q.correct_index] ?? null,
    })

    if (isCorrect) {
      totalCorrect.value++
      streak.value++

      // Skill charge
      if (skillUsed.value) {
        skillCharge.value = Math.min(ULTIMATE_THRESHOLD, skillCharge.value + 1)
        if (skillCharge.value >= SKILL_LV1_THRESHOLD) skillUsed.value = false
      } else {
        skillCharge.value = Math.min(ULTIMATE_THRESHOLD, skillCharge.value + 1)
      }

      const dmg = calcPlayerDamage(monsterMaxHP.value, questionsInStage.value)
      monsterHP.value = Math.max(0, monsterHP.value - dmg)
      score.value += 10 + (streak.value > 1 ? streak.value * 2 : 0)

      // นับ unique correct สำหรับ summary แค่ข้อละครั้ง
      correctInStage.value.add(currentQIndex.value)
    } else {
      streak.value = 0

      const dmg = calcMonsterDamage(difficulty.value)
      lastDamageTaken.value = dmg
      damageEventId.value++
      playerHP.value = Math.max(0, playerHP.value - dmg)
    }

    // hero ใช้ turn ไปแล้ว → reset playerBar เป็น 0
    // monsterBar ไม่ reset — เก็บค่าที่วิ่งมาไว้แล้วนับต่อ

    // ── ตรวจผลลัพธ์ ──────────────────────────────────────────────────────
    playerBar.value  = 0
    if (monsterHP.value <= 0) {
      // monster ตายจริง → clear stage
      handleStageClear()
    } else if (playerHP.value <= 0) {
      phase.value       = 'game_over'
      result.value      = 'lose'
      coinsEarned.value = 0
      endedAt.value     = Date.now()
    } else if (isCorrect) {
      // ตอบถูก → ไปข้อถัดไป หรือวนกลับต้นถ้าครบรอบ
      const nextIdx = currentQIndex.value + 1
      if (nextIdx >= stageQuestions.value.length) {
        // ครบรอบแล้วแต่ monster ยัง HP เหลือ → วนกลับข้อ 0
        currentQIndex.value = 0
      } else {
        currentQIndex.value = nextIdx
      }
      answeredInStage.value++
      phase.value = 'player_turn'
    } else {
      // ตอบผิด → วนข้อเดิมซ้ำ (ไม่เปลี่ยน currentQIndex)
      phase.value = 'player_turn'
    }
  }

  function monsterAttack() {
    const dmg         = calcMonsterDamage(difficulty.value)
    lastDamageTaken.value = dmg
    damageEventId.value++
    playerHP.value    = Math.max(0, playerHP.value - dmg)
    streak.value      = 0   // streak reset ตอน monster โจมตี
    monsterBar.value  = 0

    if (playerHP.value <= 0) {
      phase.value       = 'game_over'
      result.value      = 'lose'
      coinsEarned.value = 0
      endedAt.value     = Date.now()
    } else {
      phase.value = 'player_turn'
    }
  }

  function handleStageClear() {
    monstersCleared.value++
    coinsEarned.value += 10 + (monstersCleared.value * 5)

    if (currentStageId.value >= 5) {
      phase.value  = 'victory'
      result.value = 'win'
      if (playerHP.value === playerMaxHP.value) coinsEarned.value += 50
      endedAt.value = Date.now()
    } else {
      phase.value = 'stage_clear'
    }
  }

  function nextStage() {
    const nextId = [2, 3, 4, 5]
      .filter(id => id > currentStageId.value)
      .find(id => quizSet.value?.questions.some(q => Number(q.stage) === id))

    if (nextId) {
      loadStage(nextId)
      // ตรวจสอบว่า stage ใหม่มีข้อสอบจริง ถ้าไม่มีให้ skip ไป victory
      if (stageQuestions.value.length === 0) {
        phase.value  = 'victory'
        result.value = 'win'
        endedAt.value = Date.now()
        return
      }
      phase.value = 'player_turn'
    } else {
      phase.value  = 'victory'
      result.value = 'win'
      endedAt.value = Date.now()
    }
  }

  /**
   * useSkill — ใช้ได้เฉพาะเมื่อ skillReady !== 'none'
   * หลังใช้: charge reset = 0, skillUsed = true (ต้องตอบถูกใหม่เพื่อ charge)
   */
  function useSkill() {
    if (skillReady.value === 'none' || phase.value !== 'player_turn') return null

    const skill      = skillReady.value
    const dmg        = calcSkillDamage(monsterMaxHP.value, skill)
    const previousHP = monsterHP.value

    monsterHP.value  = Math.max(0, monsterHP.value - dmg)
    skillCharge.value = 0
    skillUsed.value   = true    // lock ไว้จนกว่าจะตอบถูกอีก 2 ครั้ง

    if (monsterHP.value <= 0) handleStageClear()
    return { skill, damage: previousHP - monsterHP.value }
  }

  function resetBattle() {
    phase.value         = 'idle'
    result.value        = null
    quizSet.value       = null
    playerHP.value      = playerMaxHP.value = 0
    monsterHP.value     = monsterMaxHP.value = 0
    streak.value        = 0
    skillCharge.value   = 0
    skillUsed.value     = false
    barReady.value      = false
    score.value         = 0
    coinsEarned.value   = 0
    monstersCleared.value = 0
    totalCorrect.value  = 0
    totalAnswered.value = 0
    answerLog.value     = []
    startedAt.value     = null
    endedAt.value       = null
    correctInStage.value = new Set()
  }

  return {
    difficulty, quizSet, currentStageId,
    playerHP, playerMaxHP, monsterHP, monsterMaxHP,
    playerHPPct, monsterHPPct, playerHPColor,
    playerBar, monsterBar, barReady, _introBoost,
    cooldownActive, cooldownLeft,
    streak, playerBarSpeed,
    skillCharge, skillUsed, skillReady, skillGaugePct,
    stageQuestions, currentQIndex, answeredInStage, correctInStage, currentQuestion, questionsInStage,
    phase, result, lastAnswerResult, stageConfig,
    lastDamageTaken, damageEventId,
    score, coinsEarned, monstersCleared, totalCorrect, totalAnswered,
    answerLog, startedAt, endedAt, durationSeconds,
    startBattle, loadStage, submitAnswer, monsterAttack,
    handleStageClear, nextStage, useSkill, resetBattle,
  }
})
