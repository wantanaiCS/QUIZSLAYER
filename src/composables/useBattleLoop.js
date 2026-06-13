/**
 * useBattleLoop.js — requestAnimationFrame-based battle loop
 *
 * Bar Time Rules:
 * - ทั้งสอง bars เริ่มที่ 0 เมื่อเริ่มด่าน → ค่อยๆ fill พร้อมกัน
 * - Player speed (1.10 base) > monster stage 1–4 → hero ได้ turn แรกตามธรรมชาติ
 * - Boss speed (1.20) > player base → ต้องมี streak เพื่อแซง
 */
import { onMounted, onUnmounted, watch } from 'vue'
import { useBattleStore } from '@/stores/battleStore'
import { getPlayerBarSpeed, getCooldownSeconds, MONSTER_BAR_SPEEDS } from '@/utils/battleCalculator'

const STAGE_KEYS = ['slime', 'goblin', 'orc', 'dark_mage', 'boss']
const FILL_SCALE = 26  // units/sec at multiplier 1.0 → full bar in ~3.8s

function monsterFillRate(stageId) {
  const key   = STAGE_KEYS[(stageId - 1) % STAGE_KEYS.length]
  const speed = MONSTER_BAR_SPEEDS[key] ?? 1.0
  return speed * FILL_SCALE
}

export function useBattleLoop() {
  const store = useBattleStore()
  let rafId   = null
  let lastTs  = 0
  let cdStart = 0

  function loop(ts) {
    if (lastTs === 0) lastTs = ts
    const dt = Math.min((ts - lastTs) / 1000, 0.1)
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
          store.monsterBar = 99.9
        }

        if (store.monsterBar >= 100) {
          store.monsterBar = 100
          store.monsterAttack()
          if (store.phase === 'player_turn') {
            store.playerBar  = 0
            store.monsterBar = 0  // monster ใช้ turn ไปแล้ว reset ทั้งคู่
          }
        } else if (store.playerBar >= 100) {
          store.playerBar      = 100
          store.cooldownActive = true
          cdStart              = ts
          const total          = getCooldownSeconds(store.difficulty)
          store.cooldownLeft   = total ?? 0
          // *** monster bar ไม่ reset — เก็บค่าที่วิ่งมาไว้นับต่อหลังตอบ ***
        }

      } else {
        // ── Cooldown countdown ─────────────────────────────────────────────
        const total = getCooldownSeconds(store.difficulty)
        if (total !== null) {
          const elapsed      = (ts - cdStart) / 1000
          store.cooldownLeft = Math.max(0, total - elapsed)

          if (store.cooldownLeft <= 0 && store.cooldownActive) {
            store.cooldownActive = false
            store.streak         = 0
            store.monsterAttack()
            if (store.phase === 'player_turn') {
              store.playerBar  = 0
              store.monsterBar = 0
            }
          }
        }
        // Easy: no countdown
      }
    }

    rafId = requestAnimationFrame(loop)
  }

  watch(() => store.cooldownActive, (active) => {
    if (!active) cdStart = 0
  })

  onMounted(() => {
    lastTs = 0
    rafId  = requestAnimationFrame(loop)
  })

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
  })
}
