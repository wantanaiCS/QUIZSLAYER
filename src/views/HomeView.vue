<template>
  <div class="max-w-6xl mx-auto px-4 py-16">

    <!-- Hero Section -->
    <section class="text-center mb-24 animate-fade-in">
      <!-- Floating badge -->
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-qs-card border border-qs-primary/30 text-qs-primary text-xs font-semibold mb-8 animate-pulse-slow">
        <span class="w-2 h-2 rounded-full bg-qs-success animate-pulse"></span>
        Educational RPG Game — Phase 1 MVP
      </div>

      <h1 class="font-pixel text-4xl md:text-6xl text-gradient mb-6 leading-tight">
        QUIZ<br/>SLAYER
      </h1>
      <p class="text-qs-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        ต่อสู้กับมอนสเตอร์ด้วยปัญญา ตอบคำถามเพื่อเอาชนะ 5 ด่าน<br/>
        สร้างชุดข้อสอบเองผ่าน AI ได้เลย!
      </p>

      <div class="flex flex-wrap items-center justify-center gap-4">
        <router-link to="/battle" class="btn-primary text-base px-8 py-4 shadow-qs-glow animate-glow-pulse">
          ⚔️ เริ่มต่อสู้
        </router-link>
        <router-link to="/generator" class="btn-secondary text-base px-8 py-4">
          ✨ สร้างชุดข้อสอบ
        </router-link>
      </div>
    </section>

    <!-- Monster stages preview -->
    <section class="mb-24">
      <h2 class="text-2xl font-bold text-center text-qs-text mb-2">5 ด่าน — 5 มอนสเตอร์</h2>
      <p class="text-qs-muted text-center mb-10">แต่ละด่านมีกลไกพิเศษที่ยากขึ้นเรื่อยๆ</p>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          v-for="stage in stages"
          :key="stage.id"
          class="card-hover p-5 text-center group cursor-default"
        >
          <div class="text-5xl mb-3 group-hover:animate-float">{{ stage.emoji }}</div>
          <div class="text-xs font-pixel mb-1" :class="stage.color">Stage {{ stage.id }}</div>
          <div class="font-bold text-qs-text mb-2">{{ stage.name }}</div>
          <div class="text-xs text-qs-muted">{{ stage.mechanic }}</div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="mb-24">
      <h2 class="text-2xl font-bold text-center text-qs-text mb-10">ระบบเกม</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div v-for="feat in features" :key="feat.title" class="card p-6 group hover:border-qs-primary transition-all duration-300">
          <div class="text-3xl mb-4">{{ feat.icon }}</div>
          <h3 class="font-bold text-qs-text mb-2">{{ feat.title }}</h3>
          <p class="text-qs-muted text-sm leading-relaxed">{{ feat.desc }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="text-center">
      <div class="card p-12 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-primary opacity-5 pointer-events-none"></div>
        <h2 class="text-3xl font-bold text-qs-text mb-4">พร้อมเป็น QuizSlayer?</h2>
        <p class="text-qs-muted mb-8">สร้างชุดข้อสอบจากหัวข้อที่คุณชอบ แล้วลงสนามรบเลย!</p>
        <router-link to="/generator" class="btn-gold text-base px-8 py-4">
          🤖 สร้างข้อสอบด้วย AI
        </router-link>
      </div>
    </section>

  </div>
</template>

<script setup>
const stages = [
  { id: 1, name: 'Slime',     emoji: '🟢', color: 'text-monster-slime',  mechanic: 'Tutorial — ไม่มีกลไกพิเศษ' },
  { id: 2, name: 'Goblin',    emoji: '👺', color: 'text-monster-goblin', mechanic: 'Shuffle Options' },
  { id: 3, name: 'Orc',       emoji: '👹', color: 'text-monster-orc',    mechanic: 'Stun Bar' },
  { id: 4, name: 'Dark Mage', emoji: '🧙', color: 'text-monster-mage',   mechanic: 'Blind + Counter ×2' },
  { id: 5, name: 'Boss',      emoji: '👿', color: 'text-monster-boss',   mechanic: 'Rage / Decoy / Vanishing' },
]

const features = [
  {
    icon: '⏱️',
    title: 'Bar Time System',
    desc: 'ระบบ turn-based แบบไดนามิก — ใครเต็มก่อนได้ turn ก่อน ตอบถูกติดกันเพิ่มความเร็ว Bar'
  },
  {
    icon: '🔥',
    title: 'Streak & Skill',
    desc: 'ตอบถูก 3 ติดกัน → ปลด Skill | ตอบถูก 5 ติดกัน → Ultimate ดาเมจหนัก'
  },
  {
    icon: '🤖',
    title: 'AI Quiz Generator',
    desc: 'ระบุหัวข้อหรืออัปโหลดเอกสาร → AI สร้างข้อสอบ 4 ตัวเลือกให้ทันที'
  },
  {
    icon: '❤️',
    title: 'HP System',
    desc: 'HP ผูกกับจำนวนข้อสอบ ปรับตามโหมดความยาก Easy / Normal / Hard'
  },
  {
    icon: '🎮',
    title: '5-Stage Run',
    desc: 'ผ่าน 5 ด่านต่อเนื่อง กลไกยากขึ้นทุกด่าน จบด้วย Boss ที่เดือดมาก'
  },
  {
    icon: '🪙',
    title: 'Coins & Shop',
    desc: 'รับเหรียญจากชนะ Perfect Run ใช้ซื้อ Skin, Skill, Passive Item (Phase 2)'
  },
]
</script>
