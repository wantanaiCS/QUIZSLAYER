import Phaser from 'phaser'
import { BattleScene } from './BattleScene'

export const PHASER_CONFIG = {
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  pixelArt: true,           // Pixel-perfect rendering
  antialias: false,         // No anti-aliasing
  backgroundColor: '#0d0f1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BattleScene]
}
