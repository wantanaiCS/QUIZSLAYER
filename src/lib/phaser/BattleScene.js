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
    this.load.spritesheet('orc-hurt', '/assets/orc/Orc-Hurt.png', {
      frameWidth: 100,
      frameHeight: 100,
    })
    this.load.spritesheet('orc-death', '/assets/orc/Orc-Death.png', {
      frameWidth: 100,
      frameHeight: 100,
    })

    // Generate placeholder graphics for the background.
    const g = this.make.graphics({ x: 0, y: 0, add: false })

    // Background placeholder
    g.fillStyle(0x0d0f1a, 1)
    g.fillRect(0, 0, 480, 270)
    g.generateTexture('bg_placeholder', 480, 270)
    g.clear()
  }

  create() {
    this.createAnimations()

    // Add background
    this.add.image(240, 135, 'bg_placeholder')

    // Add Player (Left side)
    this.player = this.add.sprite(100, 180, 'soldier-idle')
      .setScale(1.5)
      .play('soldier-idle')
    
    // Add Monster (Right side)
    this.monster = this.add.sprite(380, 180, 'orc-idle')
      .setScale(1.5)
      .setFlipX(true)
      .play('orc-idle')

    // Store reference to Vue store if injected later, or listen to events
    this.events.on('playerAttack', this.playPlayerAttack, this)
    this.events.on('monsterAttack', this.playMonsterAttack, this)
    this.events.on('playerDamage', this.playPlayerHurt, this)
    this.events.on('playerDeath', this.playPlayerDeath, this)
    this.events.on('monsterDamage', this.playMonsterHurt, this)
    this.events.on('monsterDeath', this.playMonsterDeath, this)
  }

  createAnimations() {
    const definitions = [
      { key: 'soldier-idle', texture: 'soldier-idle', end: 5, frameRate: 6, repeat: -1 },
      { key: 'soldier-attack', texture: 'soldier-attack', end: 5, frameRate: 12, repeat: 0 },
      { key: 'soldier-hurt', texture: 'soldier-hurt', end: 3, frameRate: 10, repeat: 0 },
      { key: 'soldier-death', texture: 'soldier-death', end: 3, frameRate: 8, repeat: 0 },
      { key: 'orc-idle', texture: 'orc-idle', end: 5, frameRate: 6, repeat: -1 },
      { key: 'orc-attack', texture: 'orc-attack', end: 5, frameRate: 12, repeat: 0 },
      { key: 'orc-hurt', texture: 'orc-hurt', end: 3, frameRate: 10, repeat: 0 },
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
    this.monster.play('orc-attack')
    this.monster.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
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
