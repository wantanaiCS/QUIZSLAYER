import Phaser from 'phaser'

// ─── PvP Phaser Scene ─────────────────────────────────────────────────────
// P1 = ซ้าย (ตัวเอง)  →  P2 = ขวา (คู่แข่ง) - flip
// รองรับ bgTheme: arena | grassland | forest | cave | tower | throne
//
// วาด background โดยตรงด้วย Graphics object (ไม่ใช้ texture)
// → เปลี่ยน theme ได้ทันทีโดยลบ graphics เก่าแล้ววาดใหม่

const PVP_BG_PALETTES = {
  arena:     { sky: 0x2a1b5f, mid: 0x0f0a25, ground: 0x0a050f, accent: 0x6c63ff },
  grassland: { sky: 0x1d4f7a, mid: 0x153a2f, ground: 0x2f7d45, accent: 0x8ed081 },
  forest:    { sky: 0x17233f, mid: 0x0d261c, ground: 0x1f4f34, accent: 0x4caf50 },
  cave:      { sky: 0x171524, mid: 0x0b0a12, ground: 0x3a3345, accent: 0x8f6f4d },
  tower:     { sky: 0x27183f, mid: 0x111226, ground: 0x34364f, accent: 0x7d5cff },
  throne:    { sky: 0x2b0f1f, mid: 0x120810, ground: 0x3d2630, accent: 0xffc857 },
}

export const PVP_BG_OPTIONS = [
  { id: 'arena',     label: '⚔️ Arena',     desc: 'สนามประลอง' },
  { id: 'grassland', label: '🌿 Grassland', desc: 'ทุ่งหญ้า' },
  { id: 'forest',    label: '🌲 Forest',    desc: 'ป่าทึบ' },
  { id: 'cave',      label: '🪨 Cave',      desc: 'ถ้ำมืด' },
  { id: 'tower',     label: '🏰 Tower',     desc: 'หอคอยมืด' },
  { id: 'throne',    label: '👑 Throne',    desc: 'ห้องบัลลังก์' },
]

export class PvPScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PvPScene' })
    this._p1Tint  = 0x4fc3f7
    this._p2Tint  = 0xff4757
    this._isHost  = true
    this._bgTheme = 'arena'
    this._bgGraphics = null   // Graphics object สำหรับพื้นหลัง (swap ได้)
  }

  preload() {
    this.load.spritesheet('soldier-idle',   '/assets/soldier/Soldier-Idle.png',     { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier-attack', '/assets/soldier/Soldier-Attack01.png', { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier-hurt',   '/assets/soldier/Soldier-Hurt.png',     { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier-death',  '/assets/soldier/Soldier-Death.png',    { frameWidth: 100, frameHeight: 100 })
  }

  create() {
    this._createAnims()

    // ── วาด background (default = arena) ────────────────────────────────────
    this._bgGraphics = this.add.graphics().setDepth(0)
    this._drawBg('arena')

    // ── Center energy glow effect (animated) ──────────────────────────────
    this.centerGlow = this.add.rectangle(240, 125, 15, 170, 0x6c63ff, 0.08).setDepth(2)
    this.tweens.add({
      targets: this.centerGlow,
      alpha: { from: 0.08, to: 0.15 },
      duration: 2000,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
    })

    // ── Ambient particles (energy wisps) ──────────────────────────────────
    this._createAmbientParticles()

    // Center divider line
    this.add.line(240, 135, 0, -135, 0, 135, 0x6c63ff, 0.25).setLineWidth(1).setDepth(3)

    // ── Me (left, P1) ──────────────────────────────────────────────────────
    this.p1Glow = this.add.ellipse(105, 210, 100, 30, 0x4fc3f7, 0.15).setDepth(4)
    this.p1 = this.add.sprite(105, 175, 'soldier-idle')
      .setScale(5).setTint(this._p1Tint).setDepth(5)
      .play('soldier-idle')
    this.p1Label = this.add.text(105, 220, 'YOU', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', fill: '#4fc3f7',
    }).setOrigin(0.5).setDepth(6)

    // ── Opponent (right, P2, flipped) ─────────────────────────────────────
    this.p2Glow = this.add.ellipse(375, 210, 100, 30, 0xff4757, 0.15).setDepth(4)
    this.p2 = this.add.sprite(375, 175, 'soldier-idle')
      .setScale(5).setFlipX(true).setTint(this._p2Tint).setDepth(5)
      .play('soldier-idle')
    this.p2Label = this.add.text(375, 220, 'OPP', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', fill: '#ff4757',
    }).setOrigin(0.5).setDepth(6)

    // Flash overlay (top layer)
    this.flashOverlay = this.add.rectangle(240, 135, 480, 270, 0xffffff, 0).setDepth(20)

    // ── Event listeners ────────────────────────────────────────────────────
    this.events.on('p1Attack',         () => this._dashAttack(this.p1, this.p2, true),  this)
    this.events.on('p2Attack',         () => this._dashAttack(this.p2, this.p1, false), this)
    this.events.on('p1Hurt',           () => this._hurt(this.p1, true),  this)
    this.events.on('p2Hurt',           () => this._hurt(this.p2, false), this)
    this.events.on('p1Death',          () => this._death(this.p1), this)
    this.events.on('p2Death',          () => this._death(this.p2), this)
    this.events.on('explosion',        (role) => this._explosion(role), this)
    this.events.on('colorsChanged',    (data) => this._applyColors(data), this)
    this.events.on('updatePlayerRole', (isHost) => { this._isHost = isHost }, this)
    this.events.on('bgChanged',        (theme) => this._changeBg(theme), this)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BACKGROUND DRAWING — วาดทับ graphics object โดยตรง (ไม่ต้องใช้ texture)
  // ═══════════════════════════════════════════════════════════════════════════

  _changeBg(theme) {
    if (!theme || !PVP_BG_PALETTES[theme]) return
    this._bgTheme = theme
    this._drawBg(theme)

    // อัพเดต center glow color ตาม theme
    const accent = PVP_BG_PALETTES[theme].accent
    if (this.centerGlow) this.centerGlow.setFillStyle(accent, 0.08)
  }

  _drawBg(theme) {
    const g = this._bgGraphics
    if (!g) return
    g.clear()   // ลบของเก่าออกหมดแล้ววาดใหม่
    const p = PVP_BG_PALETTES[theme] ?? PVP_BG_PALETTES.arena

    if (theme === 'arena') {
      this._drawArenaBg(g, p)
    } else {
      this._drawNatureBg(g, p, theme)
    }
  }

  _drawArenaBg(g, p) {
    // Sky gradient (upper half)
    g.fillGradientStyle(0x2a1b5f, 0x1a0f3f, 0x0f0a25, 0x050220, 1)
    g.fillRect(0, 0, 480, 135)
    // Lower half
    g.fillGradientStyle(0x0f0a25, 0x050220, 0x1a0f2f, 0x0d0820, 1)
    g.fillRect(0, 135, 480, 135)
    // Ground
    g.fillStyle(0x0a050f, 1)
    g.fillRect(0, 200, 480, 70)
    // Floor glow lines
    g.fillStyle(0x6c63ff, 0.08); g.fillRect(0, 198, 240, 4)
    g.fillStyle(0xff4757, 0.08); g.fillRect(240, 198, 240, 4)
    // Center pillar
    g.fillStyle(0x6c63ff, 0.25); g.fillRect(235, 40, 10, 170)
    g.fillStyle(0x6c63ff, 0.10); g.fillRect(230, 35, 20, 180)
    // Center rings
    g.lineStyle(1, 0x6c63ff, 0.30); g.strokeCircle(240, 125, 20)
    g.lineStyle(1, 0x6c63ff, 0.15); g.strokeCircle(240, 125, 35)
    // Player zone boxes
    g.lineStyle(2, 0x4fc3f7, 0.15); g.strokeRect(10, 50, 220, 150)
    g.fillStyle(0x4fc3f7, 0.02);    g.fillRect(10, 50, 220, 150)
    g.lineStyle(2, 0xff4757, 0.15); g.strokeRect(250, 50, 220, 150)
    g.fillStyle(0xff4757, 0.02);    g.fillRect(250, 50, 220, 150)
    // Corner glows
    g.fillStyle(0x9c27b0, 0.08)
    g.fillCircle(20, 30, 40); g.fillCircle(460, 30, 40)
    g.fillStyle(0x9c27b0, 0.05)
    g.fillCircle(20, 250, 40); g.fillCircle(460, 250, 40)
    // Top center glow
    g.fillStyle(0x6c63ff, 0.15); g.fillCircle(240, 25, 30)
    // Grid lines
    g.lineStyle(0.5, 0x6c63ff, 0.08)
    for (let i = 0; i < 480; i += 60) g.lineBetween(i, 40, i, 200)
    for (let i = 40; i < 200; i += 40) g.lineBetween(0, i, 480, i)
    // Top accent bars
    g.fillStyle(0x4fc3f7, 0.20); g.fillRect(0, 0, 240, 3)
    g.fillStyle(0xff4757, 0.20); g.fillRect(240, 0, 240, 3)
    // Center gate frame
    g.lineStyle(1.5, 0x6c63ff, 0.20); g.strokeRect(220, 70, 40, 110)
    // Shadow under players
    g.fillStyle(0x000000, 0.30)
    g.fillEllipse(105, 218, 90, 16); g.fillEllipse(375, 218, 90, 16)
  }

  _drawNatureBg(g, p, theme) {
    // Sky gradient
    g.fillGradientStyle(p.sky, p.sky, p.mid, p.mid, 1)
    g.fillRect(0, 0, 480, 270)
    // Mountain silhouettes
    g.fillStyle(p.mid, 0.9)
    for (let i = 0; i < 6; i++) {
      const x = i * 96 - 20, h = 34 + (i % 3) * 18
      g.fillTriangle(x, 145, x + 64, 145 - h, x + 128, 145)
    }
    // Theme-specific foreground details
    if (theme === 'grassland') {
      // Sun
      g.fillStyle(0xf5d66b, 1); g.fillCircle(404, 48, 18)
      // Grass blades
      g.fillStyle(p.accent, 1)
      for (let x = 15; x < 480; x += 28)
        g.fillTriangle(x, 206, x + 8, 181, x + 16, 206)

    } else if (theme === 'forest') {
      // Trees
      for (let x = 20; x < 480; x += 44) {
        g.fillStyle(0x3c2a22, 1); g.fillRect(x + 12, 150, 10, 56)
        g.fillStyle(p.accent, 1)
        g.fillTriangle(x, 165, x + 18, 104, x + 36, 165)
        g.fillTriangle(x - 4, 188, x + 18, 125, x + 40, 188)
      }

    } else if (theme === 'cave') {
      // Side walls
      g.fillStyle(0x100f17, 0.85)
      g.fillRect(0, 0, 58, 270); g.fillRect(422, 0, 58, 270)
      // Ore veins
      g.fillStyle(p.accent, 1)
      g.fillRect(64, 188, 48, 9); g.fillRect(344, 184, 52, 9)
      // Stalactite glow
      g.fillStyle(0x6ee7ff, 0.65)
      g.fillTriangle(236, 36, 250, 94, 222, 94)

    } else if (theme === 'tower') {
      // Tower structure
      g.fillStyle(0x1b1d32, 0.90); g.fillRect(188, 64, 104, 142)
      g.fillStyle(0x272a48, 1)
      g.fillRect(206, 84, 16, 36); g.fillRect(258, 84, 16, 36)
      // Magic orb
      g.fillStyle(p.accent, 0.85); g.fillCircle(240, 130, 18)

    } else if (theme === 'throne') {
      // Throne room
      g.fillStyle(0x1d1118, 1); g.fillRect(180, 78, 120, 128)
      g.fillStyle(0x5a2636, 1); g.fillRect(206, 106, 68, 100)
      g.fillStyle(p.accent, 1)
      g.fillRect(198, 100, 84, 8); g.fillCircle(240, 69, 13)
    }

    // Ground strip
    g.fillStyle(p.ground, 1); g.fillRect(0, 205, 480, 65)
    // Center divider (subtle)
    g.fillStyle(p.accent, 0.15); g.fillRect(238, 50, 4, 155)
    // Shadow under players
    g.fillStyle(0x000000, 0.30)
    g.fillEllipse(105, 222, 92, 18); g.fillEllipse(375, 222, 104, 20)
    // Top accent bars (player colors)
    g.fillStyle(0x4fc3f7, 0.25); g.fillRect(0, 0, 240, 3)
    g.fillStyle(0xff4757, 0.25); g.fillRect(240, 0, 240, 3)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PARTICLES
  // ═══════════════════════════════════════════════════════════════════════════

  _createAmbientParticles() {
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 480
      const y = Math.random() * 200 + 10
      const color = Math.random() > 0.5 ? 0x6c63ff : 0xb366ff
      const size  = Math.random() * 2 + 1
      const particle = this.add.rectangle(x, y, size, size, color, 0.4).setDepth(1)
      this.tweens.add({
        targets: particle,
        y: y - 80,
        x: x + (Math.random() - 0.5) * (20 + Math.random() * 40),
        alpha: { from: 0.4, to: 0 },
        duration: 4000 + Math.random() * 3000,
        ease: 'Sine.easeInOut',
        repeat: -1,
        delay: Math.random() * 1000,
      })
    }
    for (let i = 0; i < 3; i++) {
      const circle = this.add.circle(240, 125, 15 + i * 10, 0x6c63ff, 0.1).setDepth(1)
      this.tweens.add({
        targets: circle,
        alpha: { from: 0.15, to: 0 },
        duration: 2000 + i * 500,
        ease: 'Sine.easeOut',
        repeat: -1,
        delay: i * 600,
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMBAT ANIMATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  _dashAttack(attacker, defender, isLeft) {
    const homeX    = isLeft ? 105 : 375
    const targetX  = isLeft ? 270 : 210
    const defHomeX = isLeft ? 375 : 105

    attacker.play('soldier-attack', true)
    this.tweens.add({
      targets: attacker, x: targetX, duration: 110, ease: 'Power2.easeIn',
      onComplete: () => {
        this.cameras.main.shake(55, 0.005)
        this._flashScreen(0xffffff, 0.3, 80)
        this.tweens.add({
          targets: defender, x: defHomeX + (isLeft ? 15 : -15), duration: 70, ease: 'Power2.easeOut',
          onComplete: () => {
            this.tweens.add({ targets: defender, x: defHomeX, duration: 140, ease: 'Back.easeOut' })
          },
        })
        this.tweens.add({ targets: attacker, x: homeX, duration: 170, ease: 'Power2.easeOut' })
      },
    })
    attacker.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      attacker.play('soldier-idle', true)
    })
  }

  _hurt(sprite, isLeft) {
    const homeX = isLeft ? 105 : 375
    sprite.play('soldier-hurt', true)
    this.tweens.add({
      targets: sprite, x: homeX + (isLeft ? -15 : 15), duration: 70, ease: 'Power2.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: sprite, x: homeX, duration: 140, ease: 'Back.easeOut' })
      },
    })
    sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      sprite.play('soldier-idle', true)
    })
  }

  _death(sprite) {
    sprite.play('soldier-death', true)
    this.tweens.add({ targets: sprite, alpha: 0, y: sprite.y + 15, duration: 800, delay: 400, ease: 'Power2' })
  }

  _explosion(role) {
    const x = role === this._isHost ? 105 : 375
    this._flashScreen(0xff6600, 0.6, 150)
    this.cameras.main.shake(200, 0.01)
    this._burstParticles(x, 165, 0xff6600)
  }

  _burstParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const p = this.add.rectangle(x, y, 5, 5, color).setDepth(9)
      const angle = (i / 10) * Math.PI * 2
      const dist  = 25 + Math.random() * 40
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: 350 + Math.random() * 200, ease: 'Power2',
        onComplete: () => p.destroy(),
      })
    }
  }

  _flashScreen(color, alpha, duration, onDone) {
    this.flashOverlay.setFillStyle(color, alpha)
    this.tweens.add({
      targets: this.flashOverlay, alpha: { from: alpha, to: 0 },
      duration, ease: 'Power2',
      onComplete: () => onDone?.(),
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COLORS & ANIMATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  _applyColors({ p1Tint, p2Tint }) {
    this._p1Tint = p1Tint
    this._p2Tint = p2Tint
    if (this.p1)      this.p1.setTint(p1Tint)
    if (this.p2)      this.p2.setTint(p2Tint)
    if (this.p1Glow)  this.p1Glow.setFillStyle(p1Tint, 0.15)
    if (this.p2Glow)  this.p2Glow.setFillStyle(p2Tint, 0.15)
    if (this.p1Label) this.p1Label.setStyle({ fill: `#${p1Tint.toString(16).padStart(6, '0')}` })
    if (this.p2Label) this.p2Label.setStyle({ fill: `#${p2Tint.toString(16).padStart(6, '0')}` })
  }

  _createAnims() {
    const defs = [
      { key: 'soldier-idle',   texture: 'soldier-idle',   end: 5, fps: 6,  repeat: -1 },
      { key: 'soldier-attack', texture: 'soldier-attack', end: 5, fps: 12, repeat: 0  },
      { key: 'soldier-hurt',   texture: 'soldier-hurt',   end: 3, fps: 10, repeat: 0  },
      { key: 'soldier-death',  texture: 'soldier-death',  end: 3, fps: 8,  repeat: 0  },
    ]
    defs.forEach(({ key, texture, end, fps, repeat }) => {
      if (this.anims.exists(key)) return
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(texture, { start: 0, end }),
        frameRate: fps,
        repeat,
      })
    })
  }
}
