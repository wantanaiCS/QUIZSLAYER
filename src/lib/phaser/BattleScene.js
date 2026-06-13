import Phaser from 'phaser'

// ─── Stage definitions ────────────────────────────────────────────────────────
const STAGE_CONFIG = [
  {
    id: 1,
    name: 'SLIME',
    bg: 'grassland',
    monsterSprite: 'orc-idle',      // reuse orc sprite with tint
    monsterTint: 0x6fcf5a,          // green tint → slime
    monsterScale: 4,
    deathColor: 0x6fcf5a,
    flashColor: 0x43d98f,
  },
  {
    id: 2,
    name: 'GOBLIN',
    bg: 'forest',
    monsterSprite: 'orc-idle',
    monsterTint: 0x8fbc56,          // olive green → goblin
    monsterScale: 4.5,
    deathColor: 0x8fbc56,
    flashColor: 0xffd93d,
  },
  {
    id: 3,
    name: 'ORC',
    bg: 'cave',
    monsterSprite: 'orc-idle',
    monsterTint: 0xffffff,          // default → orc
    monsterScale: 5,
    deathColor: 0x78909c,
    flashColor: 0xff9800,
  },
  {
    id: 4,
    name: 'DARK MAGE',
    bg: 'tower',
    monsterSprite: 'orc-idle',
    monsterTint: 0xce93d8,          // purple → dark mage
    monsterScale: 5,
    deathColor: 0x9c27b0,
    flashColor: 0x9c27b0,
  },
  {
    id: 5,
    name: 'BOSS',
    bg: 'throne',
    monsterSprite: 'orc-idle',
    monsterTint: 0xff6b6b,          // red → boss
    monsterScale: 5.8,
    deathColor: 0xc62828,
    flashColor: 0xff4757,
  },
]

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
    this._currentStageId = 1
    this._transitioning  = false
  }

  preload() {
    this.load.spritesheet('soldier-idle',   '/assets/soldier/Soldier-Idle.png',     { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier-attack', '/assets/soldier/Soldier-Attack01.png', { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier-hurt',   '/assets/soldier/Soldier-Hurt.png',     { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier-death',  '/assets/soldier/Soldier-Death.png',    { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('orc-idle',        '/assets/orc/Orc-Idle.png',       { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('orc-attack',      '/assets/orc/Orc-Attack01.png',   { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('orc-attack-heavy','/assets/orc/Orc-Attack02.png',   { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('orc-hurt',        '/assets/orc/Orc-Hurt.png',       { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('orc-death',       '/assets/orc/Orc-Death.png',      { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('orc-walk',        '/assets/orc/Orc-Walk.png',       { frameWidth: 100, frameHeight: 100 })

    this.createStageBackgroundTextures()
  }

  create() {
    this.createAnimations()

    // Background
    this.background = this.add.image(240, 135, 'bg_grassland')

    // Player
    this.player = this.add.sprite(105, 175, 'soldier-idle').setScale(5).play('soldier-idle')

    // Monster
    this.monster = this.add.sprite(375, 175, 'orc-idle').setScale(5).setFlipX(true).play('orc-idle')

    // ── Overlay layers (created once, reused) ──────────────────────────────
    // Flash overlay
    this.flashOverlay = this.add.rectangle(240, 135, 480, 270, 0xffffff, 0).setDepth(10)

    // Stage transition panel (full screen dark)
    this.transitionBg = this.add.rectangle(240, 135, 480, 270, 0x000000, 0).setDepth(20)

    // Stage label text
    this.stageLabelTop = this.add.text(240, 100, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize:   '10px',
      fill:       '#8b8fa8',
    }).setOrigin(0.5).setDepth(21).setAlpha(0)

    this.stageLabelMain = this.add.text(240, 135, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize:   '20px',
      fill:       '#ffffff',
      stroke:     '#6c63ff',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(21).setAlpha(0)

    this.stageLabelSub = this.add.text(240, 168, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize:   '8px',
      fill:       '#ffd93d',
    }).setOrigin(0.5).setDepth(21).setAlpha(0)

    // Event listeners
    this.events.on('playerAttack',   this.playPlayerAttack,  this)
    this.events.on('monsterAttack',  this.playMonsterAttack, this)
    this.events.on('monsterRage',    this.playMonsterRage,   this)
    this.events.on('playerDamage',   this.playPlayerHurt,    this)
    this.events.on('playerDeath',    this.playPlayerDeath,   this)
    this.events.on('monsterDamage',  this.playMonsterHurt,   this)
    this.events.on('monsterDeath',   this.playMonsterDeath,  this)
    this.events.on('stageChanged',   this.onStageChanged,    this)
  }

  // ─── Stage change entry point (called from Vue) ───────────────────────────
  onStageChanged(stageId = 1) {
    const isFirst = stageId === 1
    if (isFirst) {
      // Stage 1 = game start, no fancy transition
      this._currentStageId = 1
      this.setStageBackground(1)
      this.applyMonsterConfig(1)
      this.resetMonster()
      this.resetPlayer()
      return
    }

    // Stage 2–5 = stage transition animation
    this._doStageTransition(stageId)
  }

  // ─── Death → transition → new stage ──────────────────────────────────────
  _doStageTransition(nextStageId) {
    if (this._transitioning) return
    this._transitioning = true

    const cfg = STAGE_CONFIG[nextStageId - 1] ?? STAGE_CONFIG[0]

    // 1. Flash → fade to black
    this._flashScreen(cfg.flashColor, 0.6, 120, () => {
      this.tweens.add({
        targets:  this.transitionBg,
        alpha:    0.92,
        duration: 280,
        ease:     'Power2',
        onComplete: () => {
          // 2. ตั้งค่า background + player ใหม่ (ขณะจอมืด)
          this.setStageBackground(nextStageId)
          this.applyMonsterConfig(nextStageId)
          this.resetPlayer()
          this._currentStageId = nextStageId

          // ซ่อน monster ไว้ก่อน จะเดินเข้ามาทีหลัง
          this.monster.setAlpha(0).setVisible(false)

          // 3. Fade จอออก
          this.tweens.add({
            targets:  this.transitionBg,
            alpha:    0,
            duration: 350,
            ease:     'Power2',
            onComplete: () => {
              // 4. Monster เดินเข้ามาก่อน
              this._monsterWalkIn(() => {
                // 5. หลัง monster เข้ามาอยู่ที่แล้ว → แสดง title
                this._showStageTitle(nextStageId, cfg, () => {
                  this._transitioning = false
                })
              })
            },
          })
        },
      })
    })
  }

  _showStageTitle(stageId, cfg, onDone) {
    const prevStage = stageId - 1

    this.stageLabelTop.setText(`STAGE ${prevStage} CLEAR!`).setAlpha(0).setPosition(240, 100)
    this.stageLabelMain.setText(cfg.name).setAlpha(0).setPosition(240, 135).setStyle({
      fill: '#ffffff',
      stroke: `#${cfg.flashColor.toString(16).padStart(6, '0')}`,
      strokeThickness: 4,
    })
    this.stageLabelSub.setText(`STAGE ${stageId}`).setAlpha(0).setPosition(240, 168)

    // กล่องพื้นหลัง title (semi-transparent)
    this.transitionBg.setAlpha(0.45)

    // Animate labels in
    this.tweens.add({
      targets:  this.stageLabelTop,
      alpha:    1,
      y:        90,
      duration: 220,
      ease:     'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets:  this.stageLabelMain,
          alpha:    1,
          scaleX:   { from: 0.4, to: 1 },
          scaleY:   { from: 0.4, to: 1 },
          duration: 300,
          ease:     'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets:  this.stageLabelSub,
              alpha:    1,
              duration: 150,
              onComplete: () => {
                // แสดงค้างสักครู่
                this.time.delayedCall(800, () => {
                  // Fade ทุกอย่างออกพร้อมกัน
                  this.tweens.add({
                    targets:  [this.stageLabelTop, this.stageLabelMain, this.stageLabelSub, this.transitionBg],
                    alpha:    0,
                    duration: 300,
                    onComplete: () => onDone?.(),
                  })
                })
              },
            })
          },
        })
      },
    })
  }

  // Monster เดินเข้ามาจากขวา → หยุด → title ขึ้น
  _monsterWalkIn(onDone) {
    if (!this.monster) { onDone?.(); return }

    const cfg = STAGE_CONFIG[this._currentStageId - 1] ?? STAGE_CONFIG[0]

    // ตั้งต้นนอกจอขวา
    this.monster
      .setPosition(540, 175)
      .setAlpha(1)
      .setVisible(true)
      .setFlipX(true)
      .play('orc-walk', true)

    this.tweens.add({
      targets:  this.monster,
      x:        375,
      duration: 600,
      ease:     'Power2.easeOut',
      onComplete: () => {
        // หยุดที่ตำแหน่ง → เล่น idle + stomp shake
        this.monster.play('orc-idle', true)
        this.cameras.main.shake(120, 0.004)

        // flash สีของ monster สั้นๆ
        this.monster.setTint(0xffffff)
        this.time.delayedCall(80, () => {
          this.monster.setTint(cfg.monsterTint)
        })

        // รอสักครู่แล้ว callback → title จะขึ้น
        this.time.delayedCall(200, () => onDone?.())
      },
    })
  }

  // ─── Apply monster visual config per stage ────────────────────────────────
  applyMonsterConfig(stageId) {
    if (!this.monster) return
    const cfg = STAGE_CONFIG[stageId - 1] ?? STAGE_CONFIG[0]
    this.monster.setTint(cfg.monsterTint).setScale(cfg.monsterScale)
  }

  // ─── Flash screen helper ──────────────────────────────────────────────────
  _flashScreen(color = 0xffffff, maxAlpha = 0.7, duration = 100, onDone) {
    this.flashOverlay.setFillStyle(color, maxAlpha)
    this.tweens.add({
      targets:  this.flashOverlay,
      alpha:    { from: maxAlpha, to: 0 },
      duration,
      ease:     'Power2',
      onComplete: () => onDone?.(),
    })
  }

  // ─── Particle burst (pixel squares) ──────────────────────────────────────
  _burstParticles(x, y, color) {
    const count = 14
    const particles = []
    for (let i = 0; i < count; i++) {
      const p = this.add.rectangle(x, y, 5, 5, color).setDepth(9)
      particles.push(p)
      const angle  = (i / count) * Math.PI * 2
      const dist   = 30 + Math.random() * 55
      const tx     = x + Math.cos(angle) * dist
      const ty     = y + Math.sin(angle) * dist
      const dur    = 350 + Math.random() * 250
      this.tweens.add({
        targets:  p,
        x: tx, y: ty,
        alpha:    0,
        scaleX:   0, scaleY: 0,
        duration: dur,
        ease:     'Power2',
        onComplete: () => p.destroy(),
      })
    }
  }

  // ─── Background ───────────────────────────────────────────────────────────
  setStageBackground(stageId = 1) {
    const keys = ['grassland', 'forest', 'cave', 'tower', 'throne']
    const key  = keys[Math.max(0, Math.min(4, stageId - 1))]
    this.background?.setTexture(`bg_${key}`)
  }

  // ─── Reset helpers ────────────────────────────────────────────────────────
  resetMonster() {
    if (!this.monster) return
    this.monster.off(Phaser.Animations.Events.ANIMATION_COMPLETE)
    this.monster
      .setAlpha(1)
      .setVisible(true)
      .setPosition(375, 175)
      .setFlipX(true)
      .play('orc-idle', true)
  }

  resetPlayer() {
    if (!this.player) return
    this.player.off(Phaser.Animations.Events.ANIMATION_COMPLETE)
    this.player
      .clearTint()
      .setAlpha(1)
      .setVisible(true)
      .setPosition(105, 175)
      .setScale(5)
      .setFlipX(false)
      .play('soldier-idle', true)
  }

  // ─── Animations ───────────────────────────────────────────────────────────
  createAnimations() {
    const defs = [
      { key: 'soldier-idle',        texture: 'soldier-idle',        end: 5, fps: 6,  repeat: -1 },
      { key: 'soldier-attack',      texture: 'soldier-attack',      end: 5, fps: 12, repeat: 0  },
      { key: 'soldier-hurt',        texture: 'soldier-hurt',        end: 3, fps: 10, repeat: 0  },
      { key: 'soldier-death',       texture: 'soldier-death',       end: 3, fps: 8,  repeat: 0  },
      { key: 'orc-idle',            texture: 'orc-idle',            end: 5, fps: 6,  repeat: -1 },
      { key: 'orc-walk',            texture: 'orc-walk',            end: 5, fps: 10, repeat: -1 },
      { key: 'orc-attack',          texture: 'orc-attack',          end: 5, fps: 12, repeat: 0  },
      { key: 'orc-attack-heavy',    texture: 'orc-attack-heavy',    end: 5, fps: 12, repeat: 0  },
      { key: 'orc-hurt',            texture: 'orc-hurt',            end: 3, fps: 10, repeat: 0  },
      { key: 'orc-rage',            texture: 'orc-hurt',            end: 3, fps: 8,  repeat: 1  },
      { key: 'orc-death',           texture: 'orc-death',           end: 3, fps: 8,  repeat: 0  },
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

  // ─── Player animations ────────────────────────────────────────────────────
  playPlayerAttack() {
    this.player.play('soldier-attack')
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.player.play('soldier-idle')
    })
  }

  playPlayerHurt(damage = 1) {
    this.showDamageNumber(100, damage, false)
    this.player.play('soldier-hurt')
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.player.play('soldier-idle')
    })
  }

  playPlayerDeath() {
    this.player.play('soldier-death')
  }

  // ─── Monster animations ───────────────────────────────────────────────────
  playMonsterAttack() {
    const key = Math.random() > 0.5 ? 'orc-attack' : 'orc-attack-heavy'
    this.monster.play(key)
    this.monster.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.monster.play('orc-idle')
    })
  }

  playMonsterRage() {
    if (!this.monster || this.monster.anims.currentAnim?.key === 'orc-death') return
    const cfg = STAGE_CONFIG[this._currentStageId - 1] ?? STAGE_CONFIG[0]
    this.monster.setTint(0xff4d4d)
    this.monster.play('orc-rage')
    this.cameras.main.shake(180, 0.006)
    this.monster.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.monster.setTint(cfg.monsterTint)
      this.monster.play('orc-idle')
    })
  }

  playMonsterHurt(damage = 1) {
    this.showDamageNumber(380, damage, false)
    this.monster.play('orc-hurt')
    this.monster.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.monster.play('orc-idle')
    })
  }

  // ─── Monster death → particle burst → Vue handles nextStage timing ────────
  playMonsterDeath(damage = 1) {
    const cfg = STAGE_CONFIG[this._currentStageId - 1] ?? STAGE_CONFIG[0]

    this.showDamageNumber(380, damage, true)

    // Play death animation
    this.monster.play('orc-death')
    this.monster.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      // 1. Particle burst at monster position
      this._burstParticles(this.monster.x, this.monster.y - 20, cfg.deathColor)

      // 2. Monster fade out + shrink
      this.tweens.add({
        targets:  this.monster,
        alpha:    0,
        scaleX:   { from: this.monster.scaleX, to: this.monster.scaleX * 0.3 },
        scaleY:   { from: this.monster.scaleY, to: this.monster.scaleY * 0.3 },
        y:        this.monster.y + 20,
        duration: 350,
        ease:     'Power2',
      })

      // 3. Flash the screen in death color
      this._flashScreen(cfg.deathColor, 0.5, 200)

      // 4. Camera shake
      this.cameras.main.shake(250, 0.008)
    })
  }

  // ─── Damage number popup ──────────────────────────────────────────────────
  showDamageNumber(x, damage, isCrit = false) {
    const cfg    = STAGE_CONFIG[this._currentStageId - 1] ?? STAGE_CONFIG[0]
    const color  = isCrit ? `#${cfg.flashColor.toString(16).padStart(6,'0')}` : '#ffffff'
    const size   = isCrit ? '20px' : '14px'
    const prefix = isCrit ? '💥 ' : '-'

    const text = this.add.text(x, 150, `${prefix}${damage}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize:   size,
      fill:       color,
      stroke:     '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(8)

    this.tweens.add({
      targets:  text,
      y:        isCrit ? 85 : 105,
      alpha:    0,
      scaleX:   isCrit ? { from: 1.4, to: 0.8 } : 1,
      scaleY:   isCrit ? { from: 1.4, to: 0.8 } : 1,
      duration: isCrit ? 900 : 700,
      ease:     'Power2',
      onComplete: () => text.destroy(),
    })
  }

  // ─── Background textures ──────────────────────────────────────────────────
  createStageBackgroundTextures() {
    const palettes = {
      grassland: { sky: 0x1d4f7a, ground: 0x2f7d45, accent: 0x8ed081, back: 0x153a2f },
      forest:    { sky: 0x17233f, ground: 0x1f4f34, accent: 0x4caf50, back: 0x0d261c },
      cave:      { sky: 0x171524, ground: 0x3a3345, accent: 0x8f6f4d, back: 0x0b0a12 },
      tower:     { sky: 0x27183f, ground: 0x34364f, accent: 0x7d5cff, back: 0x111226 },
      throne:    { sky: 0x2b0f1f, ground: 0x3d2630, accent: 0xffc857, back: 0x120810 },
    }

    Object.entries(palettes).forEach(([key, p]) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      g.fillGradientStyle(p.sky, p.sky, p.back, p.back, 1)
      g.fillRect(0, 0, 480, 270)
      g.fillStyle(p.back, 0.85)
      for (let i = 0; i < 6; i++) {
        const x = i * 96 - 20
        const h = 34 + (i % 3) * 18
        g.fillTriangle(x, 145, x + 64, 145 - h, x + 128, 145)
      }
      if (key === 'forest')   this._drawForest(g, p)
      else if (key === 'cave')   this._drawCave(g, p)
      else if (key === 'tower')  this._drawTower(g, p)
      else if (key === 'throne') this._drawThrone(g, p)
      else                       this._drawGrassland(g, p)
      g.fillStyle(p.ground, 1)
      g.fillRect(0, 205, 480, 65)
      g.fillStyle(0x000000, 0.25)
      g.fillEllipse(110, 225, 92, 18)
      g.fillEllipse(375, 225, 104, 20)
      g.generateTexture(`bg_${key}`, 480, 270)
      g.destroy()
    })
  }

  _drawGrassland(g, p) {
    g.fillStyle(0xf5d66b, 1); g.fillCircle(404, 48, 18)
    g.fillStyle(p.accent, 1)
    for (let x = 15; x < 480; x += 28) g.fillTriangle(x, 206, x + 8, 181, x + 16, 206)
  }

  _drawForest(g, p) {
    for (let x = 20; x < 480; x += 44) {
      g.fillStyle(0x3c2a22, 1); g.fillRect(x + 12, 150, 10, 56)
      g.fillStyle(p.accent, 1)
      g.fillTriangle(x, 165, x + 18, 104, x + 36, 165)
      g.fillTriangle(x - 4, 188, x + 18, 125, x + 40, 188)
    }
  }

  _drawCave(g, p) {
    g.fillStyle(0x100f17, 0.85); g.fillRect(0, 0, 58, 270); g.fillRect(422, 0, 58, 270)
    g.fillStyle(p.accent, 1); g.fillRect(64, 188, 48, 9); g.fillRect(344, 184, 52, 9)
    g.fillStyle(0x6ee7ff, 0.65); g.fillTriangle(236, 36, 250, 94, 222, 94)
  }

  _drawTower(g, p) {
    g.fillStyle(0x1b1d32, 0.9); g.fillRect(188, 64, 104, 142)
    g.fillStyle(0x272a48, 1); g.fillRect(206, 84, 16, 36); g.fillRect(258, 84, 16, 36)
    g.fillStyle(p.accent, 0.85); g.fillCircle(240, 130, 18)
  }

  _drawThrone(g, p) {
    g.fillStyle(0x1d1118, 1); g.fillRect(180, 78, 120, 128)
    g.fillStyle(0x5a2636, 1); g.fillRect(206, 106, 68, 100)
    g.fillStyle(p.accent, 1); g.fillRect(198, 100, 84, 8); g.fillCircle(240, 69, 13)
  }
}
