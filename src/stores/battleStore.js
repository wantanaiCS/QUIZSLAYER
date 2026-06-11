import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  calcPlayerMaxHP,
  calcMonsterHP,
  calcPlayerDamage,
  calcMonsterDamage,
  getCooldownSeconds,
  getPlayerBarSpeed,
  getSkillFromStreak,
  getStageConfig,
} from '@/utils/battleCalculator'

export const useBattleStore = defineStore('battle', () => {
  // ─── Config ─────────────────────────────────────────────────────────────
  const difficulty     = ref('normal')   // 'easy' | 'normal' | 'hard'
  const quizSet        = ref(null)       // full quiz set object
  const currentStageId = ref(1)          // 1–5

  // ─── HP ──────────────────────────────────────────────────────────────────
  const playerMaxHP    = ref(0)
  const playerHP       = ref(0)
  const monsterMaxHP   = ref(0)
  const monsterHP      = ref(0)

  const playerHPPct  = computed(() => playerMaxHP.value   ? (playerHP.value  / playerMaxHP.value)  * 100 : 0)
  const monsterHPPct = computed(() => monsterMaxHP.value  ? (monsterHP.value / monsterMaxHP.value)  * 100 : 0)
  const playerHPColor = computed(() => {
    const pct = playerHPPct.value
    if (pct > 50) return 'hp-high'
    if (pct > 25) return 'hp-mid'
    return 'hp-low'
  })

  // ─── Bar Time ────────────────────────────────────────────────────────────
  const playerBar  = ref(0)   // 0–100
  const monsterBar = ref(0)   // 0–100

  // ─── Cooldown ────────────────────────────────────────────────────────────
  const cooldownActive = ref(false)
  const cooldownLeft   = ref(0)

  // ─── Streak & Skill ─────────────────────────────────────────────────────
  const streak         = ref(0)
  const skillGauge     = ref(0)    // 0–100

  const skillReady     = computed(() => getSkillFromStreak(streak.value))
  const playerBarSpeed = computed(() => getPlayerBarSpeed(streak.value))

  // ─── Questions ──────────────────────────────────────────────────────────
  const stageQuestions   = ref([])
  const currentQIndex    = ref(0)
  const currentQuestionRaw = computed(() => stageQuestions.value[currentQIndex.value] ?? null)
  const currentQuestion  = ref(null)
  const questionsInStage = computed(() => stageQuestions.value.length)

  // ─── State ───────────────────────────────────────────────────────────────
  const phase   = ref('idle')    // 'idle' | 'player_turn' | 'monster_turn' | 'stage_clear' | 'game_over' | 'victory'
  const result  = ref(null)      // 'win' | 'lose' | null
  const lastAnswerResult = ref(null) // 'correct' | 'wrong' | null

  const stageConfig = computed(() => getStageConfig(currentStageId.value))

  // Handle stage mechanics like Shuffle Options
  watch([currentQuestionRaw, () => stageConfig.value.mechanics], ([q, mechanics]) => {
    if (!q) {
      currentQuestion.value = null
      return
    }

    if (mechanics?.includes('shuffle_options')) {
      const opts = q.options.map((opt, idx) => ({ text: opt, isCorrect: idx === q.correct_index }))
      // Simple shuffle
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]]
      }
      currentQuestion.value = {
        ...q,
        options: opts.map(o => o.text),
        correct_index: opts.findIndex(o => o.isCorrect)
      }
    } else {
      currentQuestion.value = { ...q }
    }
  }, { immediate: true })

  // ─── Stats ──────────────────────────────────────────────────────────────
  const score          = ref(0)
  const coinsEarned    = ref(0)
  const monstersCleared = ref(0)
  const totalCorrect   = ref(0)
  const totalAnswered  = ref(0)

  // ─── Actions ────────────────────────────────────────────────────────────

  /**
   * Initialize battle with a quiz set and difficulty
   */
  function startBattle(quizSetData, diff) {
    quizSet.value     = quizSetData
    difficulty.value  = diff
    currentStageId.value = 1

    const totalQ = quizSetData.questions.length
    playerMaxHP.value = calcPlayerMaxHP(totalQ, diff)
    playerHP.value    = playerMaxHP.value

    score.value          = 0
    coinsEarned.value    = 0
    monstersCleared.value = 0
    totalCorrect.value   = 0
    totalAnswered.value  = 0
    streak.value         = 0
    skillGauge.value     = 0

    loadStage(1)
    phase.value = 'player_turn'
  }

  /**
   * Load a stage's questions and calculate monster HP
   */
  function loadStage(stageId) {
    currentStageId.value = stageId
    playerBar.value  = 95   // Player starts nearly full → gets first turn
    monsterBar.value = 0

    const questions = quizSet.value?.questions.filter(q => q.stage === stageId) ?? []
    stageQuestions.value = questions
    currentQIndex.value  = 0

    const monHP = calcMonsterHP(questions.length, difficulty.value)
    monsterMaxHP.value = monHP
    monsterHP.value    = monHP
    lastAnswerResult.value = null
  }

  /**
   * Player submits an answer
   */
  function submitAnswer(chosenIndex) {
    if (phase.value !== 'player_turn' || !currentQuestion.value) return

    cooldownActive.value = false
    totalAnswered.value++

    const q = currentQuestion.value
    const isCorrect = chosenIndex === q.correct_index

    lastAnswerResult.value = isCorrect ? 'correct' : 'wrong'

    if (isCorrect) {
      totalCorrect.value++
      streak.value++
      skillGauge.value = Math.min(100, skillGauge.value + 20)

      const dmg = calcPlayerDamage(monsterMaxHP.value, questionsInStage.value)
      monsterHP.value = Math.max(0, monsterHP.value - dmg)
      score.value += 10 + (streak.value > 1 ? streak.value * 2 : 0)
    } else {
      streak.value = 0
      const dmg = calcMonsterDamage(difficulty.value)
      playerHP.value = Math.max(0, playerHP.value - dmg)
    }

    currentQIndex.value++
    playerBar.value  = 0
    monsterBar.value = 0

    // Check outcomes
    if (monsterHP.value <= 0) {
      handleStageClear()
    } else if (playerHP.value <= 0) {
      phase.value  = 'game_over'
      result.value = 'lose'
    } else {
      phase.value = 'player_turn'
    }
  }

  /**
   * Monster attacks player (bar time expired without player action)
   */
  function monsterAttack() {
    const dmg = calcMonsterDamage(difficulty.value)
    playerHP.value = Math.max(0, playerHP.value - dmg)
    streak.value = 0
    monsterBar.value = 0

    if (playerHP.value <= 0) {
      phase.value  = 'game_over'
      result.value = 'lose'
    } else {
      phase.value = 'player_turn'
    }
  }

  /**
   * Handle stage clear and advance to next stage or victory
   */
  function handleStageClear() {
    monstersCleared.value++
    coinsEarned.value += 10 + (monstersCleared.value * 5)

    if (currentStageId.value >= 5) {
      phase.value  = 'victory'
      result.value = 'win'
      // Perfect run bonus
      if (playerHP.value === playerMaxHP.value) coinsEarned.value += 50
    } else {
      phase.value = 'stage_clear'
      // Delay handled by component, then call nextStage()
    }
  }

  function nextStage() {
    if (currentStageId.value < 5) {
      loadStage(currentStageId.value + 1)
      phase.value = 'player_turn'
    }
  }

  function useSkill() {
    const skill = skillReady.value
    if (skill === 'none' || phase.value !== 'player_turn') return null
    const previousHP = monsterHP.value
    if (skill === 'ultimate') {
      monsterHP.value  = Math.max(0, monsterHP.value - Math.ceil(monsterMaxHP.value * 0.4))
      skillGauge.value = 0
      streak.value     = 0
    } else {
      monsterHP.value  = Math.max(0, monsterHP.value - Math.ceil(monsterMaxHP.value * 0.15))
      skillGauge.value = Math.max(0, skillGauge.value - 40)
    }
    if (monsterHP.value <= 0) handleStageClear()
    return { skill, damage: previousHP - monsterHP.value }
  }

  function resetBattle() {
    phase.value  = 'idle'
    result.value = null
    quizSet.value = null
    playerHP.value = playerMaxHP.value = 0
    monsterHP.value = monsterMaxHP.value = 0
    streak.value = 0
    skillGauge.value = 0
    score.value = 0
    coinsEarned.value = 0
    monstersCleared.value = 0
  }

  return {
    // State
    difficulty, quizSet, currentStageId,
    playerHP, playerMaxHP, monsterHP, monsterMaxHP,
    playerHPPct, monsterHPPct, playerHPColor,
    playerBar, monsterBar,
    cooldownActive, cooldownLeft,
    streak, skillGauge, skillReady, playerBarSpeed,
    stageQuestions, currentQIndex, currentQuestion, questionsInStage,
    phase, result, lastAnswerResult, stageConfig,
    score, coinsEarned, monstersCleared, totalCorrect, totalAnswered,
    // Actions
    startBattle, loadStage, submitAnswer, monsterAttack,
    handleStageClear, nextStage, useSkill, resetBattle,
  }
})
