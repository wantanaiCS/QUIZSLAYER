<template>
  <div class="skill-gauge-root flex flex-col items-center gap-1.5 select-none">

    <!-- Streak badge -->
    <div class="h-5 flex items-center">
      <span v-if="streak > 0" class="streak-badge animate-bounce-in text-[10px]">
        🔥 {{ streak }}x Combo
      </span>
    </div>

    <!-- Main row: pips + orb button -->
    <div class="flex items-center gap-3">

      <!-- Charge pip column (vertical stack) -->
      <div class="flex flex-col-reverse gap-[3px]">
        <div
          v-for="i in ULTIMATE_THRESHOLD"
          :key="i"
          class="pip"
          :class="pipClass(i)"
        ></div>
      </div>

      <!-- Skill Orb -->
      <button
        class="skill-orb relative"
        :class="orbClass"
        :disabled="ready === 'none' || ready === 'ultimate_locked'"
        :title="orbTitle"
        @click="(ready === 'ultimate' || ready === 'skill_lv1') && $emit('use-skill')"
      >
        <!-- Animated ring when ready -->
        <span v-if="ready !== 'none'" class="orb-ring" :class="ready === 'ultimate' ? 'ring-ultimate' : 'ring-lv1'"></span>
        <span v-if="ready === 'ultimate'" class="orb-ring orb-ring-delay" :class="'ring-ultimate'"></span>

        <!-- Icon -->
        <span class="orb-icon" :class="iconClass">{{ orbIcon }}</span>

        <!-- Charge progress arc (SVG overlay) -->
        <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none" />
          <circle
            cx="22" cy="22" r="18"
            :stroke="arcColor"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="arcCircumference"
            :stroke-dashoffset="arcDashOffset"
            class="transition-all duration-500"
          />
        </svg>
      </button>

      <!-- Label column -->
      <div class="flex flex-col gap-0.5 text-left">
        <span class="text-[11px] font-bold leading-none" :class="labelColor">{{ skillLabel }}</span>
        <span class="text-[9px] text-qs-muted leading-none">
          <template v-if="ready === 'ultimate'">กดใช้ท่าไม้ตาย!</template>
          <template v-else-if="ready === 'ultimate_locked'">
            Monster HP ที่เหลือ {{ Math.ceil(monsterHpPct) }}%
          </template>
          <template v-else-if="ready === 'skill_lv1'">กดใช้สกิล!</template>
          <template v-else>+{{ chargeNeeded }} ครั้ง</template>
        </span>
        <!-- Mini HP bar แสดง progress ไปหา 30% threshold ตอน locked -->
        <div v-if="ready === 'ultimate_locked'" class="w-16 h-1 bg-qs-bg rounded-full overflow-hidden mt-0.5">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="monsterHpPct <= 35 ? 'bg-qs-danger' : 'bg-yellow-500'"
            :style="{ width: Math.min(100, monsterHpPct) + '%' }"
          ></div>
        </div>
      </div>

    </div>

    <!-- Persists across stages hint -->
    <p class="text-[9px] text-qs-muted/60 leading-none">⚔️ Skill ข้ามด่านได้</p>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SKILL_LV1_THRESHOLD, ULTIMATE_THRESHOLD } from '@/utils/battleCalculator'

const props = defineProps({
  streak:       { type: Number,  required: true },
  charge:       { type: Number,  required: true },
  gaugePct:     { type: Number,  required: true },
  ready:        { type: String,  default: 'none' }, // 'none'|'skill_lv1'|'ultimate'|'ultimate_locked'
  skillUsed:    { type: Boolean, default: false },
  monsterHpPct: { type: Number,  default: 100 },    // 0-100 ใช้แสดง progress ใน locked state
})

defineEmits(['use-skill'])

// ── Arc progress ──────────────────────────────────────────────────────────
const arcCircumference = 2 * Math.PI * 18

const arcProgress = computed(() => {
  const c = props.charge
  if (c >= ULTIMATE_THRESHOLD) return 1
  if (c >= SKILL_LV1_THRESHOLD) {
    return SKILL_LV1_THRESHOLD / ULTIMATE_THRESHOLD +
      ((c - SKILL_LV1_THRESHOLD) / (ULTIMATE_THRESHOLD - SKILL_LV1_THRESHOLD)) *
      ((ULTIMATE_THRESHOLD - SKILL_LV1_THRESHOLD) / ULTIMATE_THRESHOLD)
  }
  return c / ULTIMATE_THRESHOLD
})

const arcDashOffset = computed(() =>
  arcCircumference * (1 - arcProgress.value)
)

const arcColor = computed(() => {
  if (props.ready === 'ultimate')        return '#f4c842'
  if (props.ready === 'ultimate_locked') return '#f4c842'   // gold แต่ orb lock
  if (props.ready === 'skill_lv1')       return '#6c63ff'
  return '#4fc3f7'
})

// ── Orb visuals ───────────────────────────────────────────────────────────
const orbIcon = computed(() => {
  if (props.ready === 'ultimate')        return '✦'
  if (props.ready === 'ultimate_locked') return '🔒'
  if (props.ready === 'skill_lv1')       return '⚡'
  return '◈'
})

const orbClass = computed(() => {
  if (props.ready === 'ultimate')        return 'orb-ultimate'
  if (props.ready === 'ultimate_locked') return 'orb-locked'
  if (props.ready === 'skill_lv1')       return 'orb-ready'
  return 'orb-empty'
})

const iconClass = computed(() => {
  if (props.ready === 'ultimate')        return 'text-qs-accent'
  if (props.ready === 'ultimate_locked') return 'text-yellow-400/80'
  if (props.ready === 'skill_lv1')       return 'text-qs-primary'
  return 'text-qs-muted/50'
})

const orbTitle = computed(() => {
  if (props.ready === 'ultimate')        return 'Ultimate พร้อม! กดเพื่อโจมตีหนัก 40% HP'
  if (props.ready === 'ultimate_locked') return 'Ultimate ชาร์จครบ — รอ Monster HP < 30%'
  if (props.ready === 'skill_lv1')       return 'Skill พร้อม! กดเพื่อโจมตี 15% HP'
  return 'ตอบถูกเพื่อชาร์จ Skill'
})

const labelColor = computed(() => {
  if (props.ready === 'ultimate')        return 'text-qs-accent'
  if (props.ready === 'ultimate_locked') return 'text-yellow-400'
  if (props.ready === 'skill_lv1')       return 'text-qs-primary'
  return 'text-qs-muted'
})

const skillLabel = computed(() => {
  if (props.ready === 'ultimate')        return '✦ ULTIMATE'
  if (props.ready === 'ultimate_locked') return '✦ รอ HP < 30%'
  if (props.ready === 'skill_lv1')       return '⚡ SKILL'
  return '◈ Charging'
})

const chargeNeeded = computed(() => {
  if (props.skillUsed) return Math.max(0, SKILL_LV1_THRESHOLD - props.charge)
  if (props.charge >= SKILL_LV1_THRESHOLD) return Math.max(0, ULTIMATE_THRESHOLD - props.charge)
  return Math.max(0, SKILL_LV1_THRESHOLD - props.charge)
})

// ── Pips ─────────────────────────────────────────────────────────────────
function pipClass(i) {
  if (i <= props.charge) {
    if (props.charge >= ULTIMATE_THRESHOLD) return 'pip-gold'
    if (props.charge >= SKILL_LV1_THRESHOLD) return 'pip-purple'
    return 'pip-blue'
  }
  return 'pip-empty'
}
</script>

<style scoped>
/* ── Orb base ── */
.skill-orb {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.3s;
  flex-shrink: 0;
}
.skill-orb:active:not(:disabled) {
  transform: scale(0.9);
}

/* Empty state */
.orb-empty {
  background: rgba(255,255,255,0.04);
  border: 2px solid rgba(255,255,255,0.1);
  cursor: not-allowed;
}

/* Ultimate Locked — charge ครบแต่ HP ยังไม่ต่ำพอ */
.orb-locked {
  background: radial-gradient(circle at 35% 35%, #6b5f1a, #3a3008);
  border: 2px solid #f4c842;
  box-shadow: 0 0 8px rgba(244,200,66,0.3);
  cursor: not-allowed;
  animation: lockedPulse 2.5s ease-in-out infinite;
}

/* LV1 ready */
.orb-ready {
  background: radial-gradient(circle at 35% 35%, #9c8fff, #3d35a0);
  border: 2px solid #6c63ff;
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.5), inset 0 1px 0 rgba(255,255,255,0.2);
  cursor: pointer;
  animation: orbPulse 2s ease-in-out infinite;
}

/* Ultimate ready */
.orb-ultimate {
  background: radial-gradient(circle at 35% 35%, #ffe066, #ff9800);
  border: 2px solid #f4c842;
  box-shadow: 0 0 20px rgba(244, 200, 66, 0.7), 0 0 40px rgba(244, 200, 66, 0.3), inset 0 1px 0 rgba(255,255,255,0.3);
  cursor: pointer;
  animation: orbPulseGold 1.5s ease-in-out infinite;
}

/* Orb icon */
.orb-icon {
  font-size: 18px;
  position: relative;
  z-index: 2;
  line-height: 1;
  transition: transform 0.2s;
}
.orb-ultimate .orb-icon {
  animation: spinStar 4s linear infinite;
  font-size: 20px;
}

/* Rings */
.orb-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid transparent;
  animation: ringExpand 2s ease-out infinite;
}
.orb-ring-delay {
  animation-delay: 1s;
}
.ring-lv1 {
  border-color: rgba(108, 99, 255, 0.5);
}
.ring-ultimate {
  border-color: rgba(244, 200, 66, 0.6);
}

/* Pips */
.pip {
  width: 6px;
  height: 10px;
  border-radius: 3px;
  border: 1px solid rgba(255,255,255,0.12);
  transition: background 0.2s, box-shadow 0.2s;
}
.pip-empty  { background: rgba(255,255,255,0.05); }
.pip-blue   { background: #4fc3f7; box-shadow: 0 0 4px rgba(79,195,247,0.6); border-color: #4fc3f7; }
.pip-purple { background: #6c63ff; box-shadow: 0 0 4px rgba(108,99,255,0.6); border-color: #6c63ff; }
.pip-gold   { background: #f4c842; box-shadow: 0 0 6px rgba(244,200,66,0.8); border-color: #f4c842; }

/* ── Keyframes ── */
@keyframes orbPulse {
  0%, 100% { box-shadow: 0 0 12px rgba(108,99,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2); }
  50%      { box-shadow: 0 0 22px rgba(108,99,255,0.8), inset 0 1px 0 rgba(255,255,255,0.2); }
}
@keyframes orbPulseGold {
  0%, 100% { box-shadow: 0 0 20px rgba(244,200,66,0.7), 0 0 40px rgba(244,200,66,0.3); }
  50%      { box-shadow: 0 0 30px rgba(244,200,66,1.0), 0 0 60px rgba(244,200,66,0.5); }
}
@keyframes lockedPulse {
  0%, 100% { box-shadow: 0 0 6px rgba(244,200,66,0.2); border-color: #a88a1a; }
  50%      { box-shadow: 0 0 14px rgba(244,200,66,0.5); border-color: #f4c842; }
}
@keyframes spinStar {
  0%   { transform: rotate(0deg)   scale(1); }
  50%  { transform: rotate(180deg) scale(1.15); }
  100% { transform: rotate(360deg) scale(1); }
}
@keyframes ringExpand {
  0%   { inset: -2px; opacity: 0.8; }
  100% { inset: -12px; opacity: 0; }
}
</style>
