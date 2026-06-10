/**
 * battleCalculator.js
 * Pure utility functions for QuizSlayer battle mechanics
 * Reference: QUIZSLAYER_SKILL.md section 2.3
 */

// ─── HP System ──────────────────────────────────────────────────────────────

const HP_RATIO = {
  easy:   0.60,
  normal: 0.35,
  hard:   0.15,
}

const DIFFICULTY_MULTIPLIER = {
  easy:   2.0,
  normal: 3.0,
  hard:   4.5,
}

const MONSTER_HP_MIN = 20

/**
 * Calculate player max HP from total questions and difficulty
 * @param {number} totalQuestions
 * @param {'easy'|'normal'|'hard'} difficulty
 * @returns {number}
 */
export function calcPlayerMaxHP(totalQuestions, difficulty) {
  const ratio = HP_RATIO[difficulty] ?? HP_RATIO.normal
  return Math.max(1, Math.floor(totalQuestions * ratio))
}

/**
 * Calculate monster HP for a stage
 * @param {number} questionsInStage  - number of questions in this stage
 * @param {'easy'|'normal'|'hard'} difficulty
 * @returns {number}
 */
export function calcMonsterHP(questionsInStage, difficulty) {
  const mult = DIFFICULTY_MULTIPLIER[difficulty] ?? DIFFICULTY_MULTIPLIER.normal
  return Math.max(MONSTER_HP_MIN, Math.ceil(questionsInStage * mult))
}

/**
 * Calculate damage dealt to monster per correct answer
 * → Guarantees exact kill if all questions in stage answered correctly
 * @param {number} monsterHP
 * @param {number} questionsInStage
 * @returns {number}
 */
export function calcPlayerDamage(monsterHP, questionsInStage) {
  return Math.ceil(monsterHP / questionsInStage)
}

/**
 * Calculate damage dealt to player when wrong or cooldown expired
 * @param {'easy'|'normal'|'hard'} difficulty
 * @returns {number}
 */
export function calcMonsterDamage(difficulty) {
  return difficulty === 'hard' ? 2 : 1
}

// ─── Cooldown Times ──────────────────────────────────────────────────────────

const COOLDOWN_SECONDS = {
  easy:   null,  // no cooldown
  normal: 10,
  hard:   7,
}

/**
 * @param {'easy'|'normal'|'hard'} difficulty
 * @returns {number|null} seconds, or null if no cooldown
 */
export function getCooldownSeconds(difficulty) {
  return COOLDOWN_SECONDS[difficulty] ?? null
}

// ─── Bar Time Speed ──────────────────────────────────────────────────────────

/**
 * Bar time fill rate (px/sec or units/sec)
 * Player starts slightly faster → always gets first turn
 */
export const BAR_SPEED = {
  player:  {
    base:       1.05,   // slightly faster than monster base
    streak3:    1.40,   // 3+ streak bonus
    streak5:    1.70,   // 5+ streak bonus
  },
  monster: {
    slime:      0.70,
    goblin:     1.00,
    orc:        1.20,
    dark_mage:  1.40,
    boss:       1.60,   // increases as boss HP drops
  },
}

/**
 * Get player bar speed based on current streak
 * @param {number} streak
 * @returns {number}
 */
export function getPlayerBarSpeed(streak) {
  if (streak >= 5) return BAR_SPEED.player.streak5
  if (streak >= 3) return BAR_SPEED.player.streak3
  return BAR_SPEED.player.base
}

// ─── Streak / Skill ──────────────────────────────────────────────────────────

export const STREAK_THRESHOLDS = {
  skill_lv1: 3,
  ultimate:  5,
}

/**
 * Determine which skill is unlocked at given streak level
 * @param {number} streak
 * @returns {'none'|'skill_lv1'|'ultimate'}
 */
export function getSkillFromStreak(streak) {
  if (streak >= STREAK_THRESHOLDS.ultimate) return 'ultimate'
  if (streak >= STREAK_THRESHOLDS.skill_lv1) return 'skill_lv1'
  return 'none'
}

// ─── Stage Config ────────────────────────────────────────────────────────────

export const STAGES = [
  {
    id: 1,
    monster: 'Slime',
    monsterKey: 'slime',
    mechanics: [],
    barSpeedKey: 'slime',
    questionDifficulty: 'easy',
    bgScene: 'grassland',
  },
  {
    id: 2,
    monster: 'Goblin',
    monsterKey: 'goblin',
    mechanics: ['shuffle_options'],
    barSpeedKey: 'goblin',
    questionDifficulty: 'easy',
    bgScene: 'forest',
  },
  {
    id: 3,
    monster: 'Orc',
    monsterKey: 'orc',
    mechanics: ['stun_bar'],
    barSpeedKey: 'orc',
    questionDifficulty: 'normal',
    bgScene: 'cave',
    cooldownBonus: 2,
  },
  {
    id: 4,
    monster: 'Dark Mage',
    monsterKey: 'dark_mage',
    mechanics: ['blind', 'counter'],
    barSpeedKey: 'dark_mage',
    questionDifficulty: 'normal',
    bgScene: 'tower',
  },
  {
    id: 5,
    monster: 'Boss',
    monsterKey: 'boss',
    mechanics: ['rage', 'decoy', 'vanishing_choices', 'no_miss_zone'],
    barSpeedKey: 'boss',
    questionDifficulty: 'hard',
    bgScene: 'throne',
  },
]

/**
 * Get stage config by stage number (1–5)
 * @param {number} stageId
 * @returns {object}
 */
export function getStageConfig(stageId) {
  return STAGES.find(s => s.id === stageId) ?? STAGES[0]
}
