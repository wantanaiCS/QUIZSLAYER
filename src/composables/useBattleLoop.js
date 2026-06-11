/**
 * useBattleLoop.js — requestAnimationFrame-based battle loop
 * Manages bar time filling, cooldown countdown, and turn triggers
 */
import { onMounted, onUnmounted, watch } from 'vue'
import { useBattleStore } from '@/stores/battleStore'
import { getPlayerBarSpeed, getCooldownSeconds } from '@/utils/battleCalculator'

// Monster bar fill speeds (multiplier × FILL_SCALE units/sec)
const MONSTER_SPEEDS = {
  slime:     0.65,
  goblin:    0.90,
  orc:       1.15,
  dark_mage: 1.35,
  boss:      1.55,
}
const MONSTER_KEYS  = ['slime', 'goblin', 'orc', 'dark_mage', 'boss']
const FILL_SCALE    = 26  // units/sec at speed 1.0 → full bar in ~3.8s

function monsterFillRate(stageId) {
  return (MONSTER_SPEEDS[MONSTER_KEYS[stageId - 1]] ?? 1.0) * FILL_SCALE
}

export function useBattleLoop() {
  const store      = useBattleStore()
  let rafId        = null
  let lastTs       = 0
  let cooldownStart = 0

  function loop(ts) {
    if (lastTs === 0) lastTs = ts
    const dt = Math.min((ts - lastTs) / 1000, 0.1)   // cap delta at 100ms
    lastTs = ts

    if (store.phase === 'player_turn') {
      if (!store.cooldownActive) {
        // ── Both bars filling ──────────────────────────────────────────────
        const ps = getPlayerBarSpeed(store.streak) * FILL_SCALE
        const ms = monsterFillRate(store.currentStageId)

        store.playerBar  = Math.min(100, store.playerBar  + ps * dt)
        store.monsterBar = Math.min(100, store.monsterBar + ms * dt)

        // Tie-break: player wins
        if (store.playerBar >= 100 && store.monsterBar >= 100) {
          store.monsterBar = 99.5
        }

        if (store.monsterBar >= 100) {
          // Monster attacks!
          store.monsterBar = 100
          store.monsterAttack()
          if (store.phase === 'player_turn') {
            store.playerBar  = 0
            store.monsterBar = 0
          }
        } else if (store.playerBar >= 100) {
          // Player's turn to answer
          store.playerBar     = 100
          store.cooldownActive = true
          cooldownStart        = ts
          const total          = getCooldownSeconds(store.difficulty)
          store.cooldownLeft   = total ?? 0
        }
      } else {
        // ── Cooldown countdown ────────────────────────────────────────────
        const total = getCooldownSeconds(store.difficulty)
        if (total !== null) {
          const elapsed      = (ts - cooldownStart) / 1000
          store.cooldownLeft = Math.max(0, total - elapsed)

          if (store.cooldownLeft <= 0 && store.cooldownActive) {
            // Time expired → monster attack penalty
            store.cooldownActive = false
            store.streak         = 0
            store.monsterAttack()
            if (store.phase === 'player_turn') {
              store.playerBar  = 0
              store.monsterBar = 0
            }
          }
        }
        // Easy: no countdown, player answers whenever
      }
    }

    rafId = requestAnimationFrame(loop)
  }

  // Reset cooldown timer when answer is submitted (cooldownActive → false)
  watch(() => store.cooldownActive, (active) => {
    if (!active) cooldownStart = 0
  })

  onMounted(() => {
    lastTs = 0
    rafId  = requestAnimationFrame(loop)
  })

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
  })
}
