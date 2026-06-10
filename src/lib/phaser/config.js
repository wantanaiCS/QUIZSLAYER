/**
 * Phaser 3 Battle Scene — Placeholder
 * Full implementation: Phase 1 Battle System
 *
 * Reference: QUIZSLAYER_SKILL.md section 2 (Battle Mechanics)
 *            QUIZSLAYER_SKILL.md section 10 (Pixel Art Assets)
 */

// import Phaser from 'phaser'
// import { useBattleStore } from '@/stores/battleStore'

// TODO: Implement in Phase 1
// export class BattleScene extends Phaser.Scene { ... }

export const PHASER_CONFIG = {
  type: 0, // Phaser.AUTO
  width: 480,
  height: 270,
  pixelArt: true,           // Pixel-perfect rendering
  antialias: false,         // No anti-aliasing
  backgroundColor: '#0d0f1a',
  scale: {
    mode: 3,                // Phaser.Scale.FIT
    autoCenter: 1,          // Phaser.Scale.CENTER_BOTH
  },
  // scenes: [BattleScene] — add when implementing
}
