import Phaser from 'phaser'

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
  }

  preload() {
    this.load.spritesheet('soldier-idle', '/assets/soldier/Soldier-Idle.png', {
      frameWidth: 100,
      frameHeight: 100,
    })
    this.load.spritesheet('soldier-attack', '/assets/soldier/Soldier-Attack01.png', {
      frameWidth: 100,
      frameHeight: 100,
    })
    this.load.spritesheet('soldier-hurt', '/assets/soldier/Soldier-Hurt.png', {
      frameWidth: 100,
      frameHeight: 100,
    })
    this.load.spritesheet('soldier-death', '/assets/soldier/Soldier-Death.png', {
      frameWidth: 100,
      frameHeight: 100,
    })
    this.load.spritesheet('orc-idle', '/assets/orc/Orc-Idle.png', {
      frameWidth: 100,
      frameHeight: 100,
    })
    this.load.spritesheet('orc-attack', '/assets/orc/Orc-Attack01.png', {
      frameWidth: 100,
      frameHeight: 100,
    })
    this.load.spritesheet('orc-attack-heavy', '/assets/orc/Orc-Attack02.png', {
      frameWidth: 100,
      frameHeight: 100,
    })
    this.load.spritesheet('orc-hurt', '/assets/orc/Orc-Hurt.png', {
      frameWidth: 100,
      frameHeight: 100,
    })
    this.load.spritesheet('orc-death', '/assets/orc/Orc-Death.png', {
      frameWidth: 100,
      frameHeight: 100,
    })

    this.createStageBackgroundTextures()
  }

  create() {
    this.createAnimations()

    this.background = this.add.image(240, 135, 'bg_grassland')

    // Add Player (Left side)
    this.player = this.add.sprite(105, 175, 'soldier-idle')
      .setScale(5)
      .play('soldier-idle')
    
    // Add Monster (Right side)
    this.monster = this.add.sprite(375, 175, 'orc-idle')
      .setScale(5)
      .setFlipX(true)
      .play('orc-idle')

    // Store reference to Vue store if injected later, or listen to events
    this.events.on('playerAttack', this.playPlayerAttack, this)
    this.events.on('monsterAttack', this.playMonsterAttack, this)
    this.events.on('monsterRage', this.playMonsterRage, this)
    this.events.on('playerDamage', this.playPlayerHurt, this)
    this.events.on('playerDeath', this.playPlayerDeath, this)
    this.events.on('monsterDamage', this.playMonsterHurt, this)
    this.events.on('monsterDeath', this.playMonsterDeath, this)
    this.events.on('stageChanged', this.resetStage, this)
  }

  createStageBackgroundTextures() {
    const scenes = {
      grassland: { sky: 0x1d4f7a, ground: 0x2f7d45, accent: 0x8ed081, back: 0x153a2f },
      forest: { sky: 0x17233f, ground: 0x1f4f34, accent: 0x4caf50, back: 0x0d261c },
      cave: { sky: 0x171524, ground: 0x3a3345, accent: 0x8f6f4d, back: 0x0b0a12 },
      tower: { sky: 0x27183f, ground: 0x34364f, accent: 0x7d5cff, back: 0x111226 },
      throne: { sky: 0x2b0f1f, ground: 0x3d2630, accent: 0xffc857, back: 0x120810 },
    }

    Object.entries(scenes).forEach(([key, palette]) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false })

      g.fillGradientStyle(palette.sky, palette.sky, palette.back, palette.back, 1)
      g.fillRect(0, 0, 480, 270)

      g.fillStyle(palette.back, 0.85)
      for (let i = 0; i < 6; i++) {
        const x = i * 96 - 20
        const h = 34 + (i % 3) * 18
        g.fillTriangle(x, 145, x + 64, 145 - h, x + 128, 145)
      }

      if (key === 'forest') {
        this.drawForest(g, palette)
      } else if (key === 'cave') {
        this.drawCave(g, palette)
      } else if (key === 'tower') {
        this.drawTower(g, palette)
      } else if (key === 'throne') {
        this.drawThrone(g, palette)
      } else {
        this.drawGrassland(g, palette)
      }

      g.fillStyle(palette.ground, 1)
      g.fillRect(0, 205, 480, 65)
      g.fillStyle(0x000000, 0.25)
      g.fillEllipse(110, 225, 92, 18)
      g.fillEllipse(375, 225, 104, 20)

      g.generateTexture(`bg_${key}`, 480, 270)
      g.destroy()
    })
  }

  drawGrassland(g, palette) {
    g.fillStyle(0xf5d66b, 1)
    g.fillCircle(404, 48, 18)
    g.fillStyle(palette.accent, 1)
    for (let x = 15; x < 480; x += 28) {
      g.fillTriangle(x, 206, x + 8, 181, x + 16, 206)
    }
  }

  drawForest(g, palette) {
    for (let x = 20; x < 480; x += 44) {
      g.fillStyle(0x3c2a22, 1)
      g.fillRect(x + 12, 150, 10, 56)
      g.fillStyle(palette.accent, 1)
      g.fillTriangle(x, 165, x + 18, 104, x + 36, 165)
      g.fillTriangle(x - 4, 188, x + 18, 125, x + 40, 188)
    }
  }

  drawCave(g, palette) {
    g.fillStyle(0x100f17, 0.85)
    g.fillRect(0, 0, 58, 270)
    g.fillRect(422, 0, 58, 270)
    g.fillStyle(palette.accent, 1)
    g.fillRect(64, 188, 48, 9)
    g.fillRect(344, 184, 52, 9)
    g.fillStyle(0x6ee7ff, 0.65)
    g.fillTriangle(236, 36, 250, 94, 222, 94)
  }

  drawTower(g, palette) {
    g.fillStyle(0x1b1d32, 0.9)
    g.fillRect(188, 64, 104, 142)
    g.fillStyle(0x272a48, 1)
    g.fillRect(206, 84, 16, 36)
    g.fillRect(258, 84, 16, 36)
    g.fillStyle(palette.accent, 0.85)
    g.fillCircle(240, 130, 18)
  }

  drawThrone(g, palette) {
    g.fillStyle(0x1d1118, 1)
    g.fillRect(180, 78, 120, 128)
    g.fillStyle(0x5a2636, 1)
    g.fillRect(206, 106, 68, 100)
    g.fillStyle(palette.accent, 1)
    g.fillRect(198, 100, 84, 8)
    g.fillCircle(240, 69, 13)
  }

  setStageBackground(stageId = 1) {
    const textureKeys = ['grassland', 'forest', 'cave', 'tower', 'throne']
    const key = textureKeys[Math.max(0, Math.min(4, stageId - 1))]
    this.background?.setTexture(`bg_${key}`)
  }

  resetStage(stageId = 1) {
    this.setStageBackground(stageId)
    this.resetMonster()
    this.resetPlayer()
  }

  resetMonster() {
    if (!this.monster) return
    this.monster.off(Phaser.Animations.Events.ANIMATION_COMPLETE)
    this.monster
      .clearTint()
      .setAlpha(1)
      .setVisible(true)
      .setPosition(375, 175)
      .setScale(5)
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

  createAnimations() {
    const definitions = [
      { key: 'soldier-idle', texture: 'soldier-idle', end: 5, frameRate: 6, repeat: -1 },
      { key: 'soldier-attack', texture: 'soldier-attack', end: 5, frameRate: 12, repeat: 0 },
      { key: 'soldier-hurt', texture: 'soldier-hurt', end: 3, frameRate: 10, repeat: 0 },
      { key: 'soldier-death', texture: 'soldier-death', end: 3, frameRate: 8, repeat: 0 },
      { key: 'orc-idle', texture: 'orc-idle', end: 5, frameRate: 6, repeat: -1 },
      { key: 'orc-attack', texture: 'orc-attack', end: 5, frameRate: 12, repeat: 0 },
      { key: 'orc-attack-heavy', texture: 'orc-attack-heavy', end: 5, frameRate: 12, repeat: 0 },
      { key: 'orc-hurt', texture: 'orc-hurt', end: 3, frameRate: 10, repeat: 0 },
      { key: 'orc-rage', texture: 'orc-hurt', end: 3, frameRate: 8, repeat: 1 },
      { key: 'orc-death', texture: 'orc-death', end: 3, frameRate: 8, repeat: 0 },
    ]

    definitions.forEach(({ key, texture, end, frameRate, repeat }) => {
      if (this.anims.exists(key)) return
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(texture, { start: 0, end }),
        frameRate,
        repeat,
      })
    })
  }

  playPlayerAttack() {
    this.player.play('soldier-attack')
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.player.play('soldier-idle')
    })
  }

  playPlayerHurt(damage = 1) {
    this.showDamageNumber(100, damage)
    this.player.play('soldier-hurt')
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.player.play('soldier-idle')
    })
  }

  playPlayerDeath() {
    this.player.play('soldier-death')
  }

  playMonsterAttack() {
    const animationKey = Math.random() > 0.5 ? 'orc-attack' : 'orc-attack-heavy'
    this.monster.play(animationKey)
    this.monster.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.monster.play('orc-idle')
    })
  }

  playMonsterRage() {
    if (!this.monster || this.monster.anims.currentAnim?.key === 'orc-death') return
    this.monster.setTint(0xff4d4d)
    this.monster.play('orc-rage')
    this.cameras.main.shake(180, 0.006)
    this.monster.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.monster.clearTint()
      this.monster.play('orc-idle')
    })
  }

  playMonsterHurt(damage = 1) {
    this.showDamageNumber(380, damage)
    this.monster.play('orc-hurt')
    this.monster.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.monster.play('orc-idle')
    })
  }

  playMonsterDeath(damage = 1) {
    this.showDamageNumber(380, damage)
    this.monster.play('orc-death')
  }

  showDamageNumber(x, damage, isCrit = false) {
    const color = isCrit ? '#fca311' : '#ffffff'
    const fontSize = isCrit ? '24px' : '16px'
    
    const text = this.add.text(x, 150, `-${damage}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: fontSize,
      fill: color,
      stroke: '#ef233c',
      strokeThickness: 2
    }).setOrigin(0.5)

    this.tweens.add({
      targets: text,
      y: 100,
      alpha: 0,
      duration: 800,
      ease: 'Power1',
      onComplete: () => text.destroy()
    })
  }
}
