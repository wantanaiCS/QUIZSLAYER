/**
 * battleCalculator.js
 * Pure utility functions for QuizSlayer battle mechanics
 * Reference: QUIZSLAYER_SKILL.md section 2.3
 */

// ─── HP System ──────────────────────────────────────────────────────────────

/**
 * Player max HP is fixed at 20 regardless of quiz length or difficulty.
 * Difficulty affects only damage received per hit.
 */
const PLAYER_BASE_HP = 20

export function calcPlayerMaxHP() {
  return PLAYER_BASE_HP
}

const DIFFICULTY_MULTIPLIER = {
  easy:   2.0,
  normal: 3.0,
  hard:   4.5,
}

const MONSTER_HP_MIN = {
  easy:   20,
  normal: 30,
  hard:   40,
}

/**
 * Calculate monster HP for a stage
 * HP = max(difficulty_min, ceil(questionsInStage × multiplier))
 */
export function calcMonsterHP(questionsInStage, difficulty) {
  const mult = DIFFICULTY_MULTIPLIER[difficulty] ?? DIFFICULTY_MULTIPLIER.normal
  const min  = MONSTER_HP_MIN[difficulty] ?? 20
  return Math.max(min, Math.ceil(questionsInStage * mult))
}

/**
 * Damage dealt to monster per correct answer.
 * Guarantees kill if ALL questions in stage answered correctly.
 * = ceil(monsterHP / questionsInStage)
 */
export function calcPlayerDamage(monsterHP, questionsInStage) {
  if (questionsInStage <= 0) return monsterHP
  return Math.ceil(monsterHP / questionsInStage)
}

/**
 * Damage dealt to player per wrong answer / cooldown expire.
 *
 * Fixed values based on difficulty. Hero starts with 20 HP always.
 *
 * mistake_tolerance:
 *   Easy:   1 dmg  → ผิดได้ ~20 ครั้ง
 *   Normal: 2 dmg  → ผิดได้ ~10 ครั้ง
 *   Hard:   4 dmg  → ผิดได้ ~5 ครั้ง
 *
 * @param {'easy'|'normal'|'hard'} difficulty
 * @returns {number}
 */
const MONSTER_DAMAGE_PER_HIT = {
  easy:   1,
  normal: 2,
  hard:   4,
}

export function calcMonsterDamage(difficulty) {
  return MONSTER_DAMAGE_PER_HIT[difficulty] ?? MONSTER_DAMAGE_PER_HIT.normal
}

// ─── Skill Damage ────────────────────────────────────────────────────────────

/**
 * Skill damage — percentage of monster max HP
 * skill_lv1: 15% of monster max HP
 * ultimate  : 40% of monster max HP
 */
export function calcSkillDamage(monsterMaxHP, skillType) {
  if (skillType === 'ultimate') return Math.ceil(monsterMaxHP * 0.40)
  if (skillType === 'skill_lv1') return Math.ceil(monsterMaxHP * 0.15)
  return 0
}

// ─── Cooldown Times ──────────────────────────────────────────────────────────

const COOLDOWN_SECONDS = {
  easy:   null,   // no cooldown
  normal: 10,
  hard:   7,
}

/** @returns {number|null} seconds, or null if no cooldown */
export function getCooldownSeconds(difficulty) {
  return COOLDOWN_SECONDS[difficulty] ?? null
}

// ─── Bar Time Speed ──────────────────────────────────────────────────────────

/**
 * Base fill rate (units/sec at FILL_SCALE = 26).
 * Player base = 1.10 → always wins first turn vs monster base (all ≤ 1.0).
 *
 * Streak bonus stacks additively:
 *   streak 1 → +0.06
 *   streak 2 → +0.12
 *   streak 3 → +0.20  (≥3 threshold)
 *   streak 4 → +0.26
 *   streak 5 → +0.35  (≥5 threshold, caps here)
 */
export const PLAYER_BAR_BASE = 1.10

export function getPlayerBarSpeed(streak) {
  const s = Math.min(streak, 5)  // cap effect at 5 but still display higher
  if (s >= 5) return PLAYER_BAR_BASE + 0.35
  if (s >= 3) return PLAYER_BAR_BASE + 0.20
  if (s >= 2) return PLAYER_BAR_BASE + 0.12
  if (s >= 1) return PLAYER_BAR_BASE + 0.06
  return PLAYER_BAR_BASE
}

/** Monster fill speeds per stage (all < 1.10 so player always starts first) */
export const MONSTER_BAR_SPEEDS = {
  slime:     0.65,
  goblin:    0.88,
  orc:       1.00,
  dark_mage: 1.10,   // ties with player base → player just wins tie-break
  boss:      1.20,   // boss is faster than player base — streak is required
}

// ─── Skill / Charge System ───────────────────────────────────────────────────

/**
 * NEW: Skill is charge-based, NOT streak-gated.
 *
 * Each correct answer adds SKILL_CHARGE_PER_CORRECT points.
 * When charge reaches SKILL_CHARGE_MAX → skill becomes "ready" (icon lights up).
 * Player can then click to use it once → charge resets to 0.
 *
 * skill_lv1 threshold : 2 correct answers (charge 0→2)
 * ultimate  threshold : 5 correct answers (charge 0→5)
 *
 * We expose a single 0–MAX charge value; the UI decides which tier to show.
 */
export const SKILL_CHARGE_PER_CORRECT = 1
export const SKILL_LV1_THRESHOLD      = 2   // Skill lv1 ready after 2 correct
export const ULTIMATE_THRESHOLD       = 3   // Ultimate ready after 3 correct (ลดจาก 5 → 3)
export const ULTIMATE_HP_THRESHOLD    = 0.30 // Ultimate ใช้ได้เฉพาะตอน monster HP < 30%

/**
 * Returns skill state based on current charge.
 * Note: ultimate จะ "ready" ก็ต่อเมื่อ charge ≥ ULTIMATE_THRESHOLD เท่านั้น
 * การเช็ค HP condition ทำที่ store (skillReady computed)
 * @param {number} charge
 * @returns {'none'|'skill_lv1'|'ultimate'}
 */
export function getSkillState(charge) {
  if (charge >= ULTIMATE_THRESHOLD) return 'ultimate'
  if (charge >= SKILL_LV1_THRESHOLD) return 'skill_lv1'
  return 'none'
}

// ─── Stage Config ────────────────────────────────────────────────────────────

/**
 * Stage Mechanics Guide:
 * 
 * Stage 1 (Slime):        Tutorial - no mechanics
 * Stage 2 (Goblin):       shuffle_options - สลับตำแหน่งตัวเลือก
 * Stage 3 (Orc):          double_damage_zone - ตอบผิดตอน Monster Bar > 75% โดน dmg x2
 * Stage 4 (Dark Mage):    counter_attack - มีโอกาส 40% สวนกลับเมื่อ player โจมตีถูก
 * Stage 5 (Boss):         pressure_mode - cooldown ลดลงทุกครั้งที่ตอบผิด, 
 *                         reverse_controls - สลับตำแหน่ง A/D ทุกข้อที่ 3,
 *                         true_no_miss - ตอบผิด 3 ครั้งใน stage = Game Over
 */
export const STAGES = [
  {
    id: 1,
    monster:   'Slime',
    monsterKey: 'slime',
    mechanics:  [],
    barSpeedKey: 'slime',
    questionDifficulty: 'easy',
    bgScene: 'grassland',
    description: 'ฝึกซ้อมพื้นฐาน ไม่มีกลไกพิเศษ',
  },
  {
    id: 2,
    monster:   'Goblin',
    monsterKey: 'goblin',
    mechanics:  ['shuffle_options'],
    barSpeedKey: 'goblin',
    questionDifficulty: 'easy',
    bgScene: 'forest',
    description: 'ตัวเลือกคำตอบจะสลับตำแหน่งทุกข้อ',
  },
  {
    id: 3,
    monster:   'Orc',
    monsterKey: 'orc',
    mechanics:  ['double_damage_zone'],
    barSpeedKey: 'orc',
    questionDifficulty: 'normal',
    bgScene: 'cave',
    description: 'ตอบผิดตอน Monster Bar > 75% จะโดน Damage ×2',
  },
  {
    id: 4,
    monster:   'Dark Mage',
    monsterKey: 'dark_mage',
    mechanics:  ['counter_attack'],
    barSpeedKey: 'dark_mage',
    questionDifficulty: 'normal',
    bgScene: 'tower',
    description: 'มีโอกาส 40% ที่ Dark Mage จะสวนกลับเมื่อ Hero โจมตี',
    counterChance: 0.40,
  },
  {
    id: 5,
    monster:   'Boss',
    monsterKey: 'boss',
    mechanics:  ['pressure_mode', 'reverse_controls', 'true_no_miss'],
    barSpeedKey: 'boss',
    questionDifficulty: 'hard',
    bgScene: 'throne',
    description: 'ตอบผิด → Cooldown ลดลง, ทุกข้อที่ 3 ตัวเลือกสลับที่, ผิด 3 ครั้ง = Game Over',
  },
]

export function getStageConfig(stageId) {
  return STAGES.find(s => s.id === stageId) ?? STAGES[0]
}
