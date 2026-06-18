<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden" style="z-index: 0;">
    <!-- Background Image with Smooth Transition -->
    <transition name="bg-fade" mode="out-in">
      <div :key="bgImage" class="absolute inset-0">
        <!-- Background image (if provided) -->
        <div v-if="bgImage" 
             class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700" 
             :style="{ backgroundImage: `url(${bgImage})` }">
        </div>
        
        <!-- Dark overlay for readability -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
      </div>
    </transition>

    <!-- Particle Effects (ABOVE overlay) with Smooth Transition -->
    <transition name="particles-fade" mode="out-in">
      <div v-if="effect !== 'none'" :key="`${effect}-${particleCount}`" class="absolute inset-0" style="z-index: 1;" aria-hidden="true">
      <!-- Fireflies (Green-Yellow) -->
      <template v-if="effect === 'fireflies'">
        <div v-for="(particle, i) in particles" :key="`firefly-${i}`" 
             class="firefly"
             :style="particle">
          <div class="firefly-glow"></div>
        </div>
      </template>

      <!-- Fireflies (Blue/Cyan) -->
      <template v-else-if="effect === 'fireflies-blue'">
        <div v-for="(particle, i) in particles" :key="`firefly-blue-${i}`" 
             class="firefly"
             :style="particle">
          <div class="firefly-glow-blue"></div>
        </div>
      </template>

      <!-- Snow Effect -->
      <template v-else-if="effect === 'snow'">
        <div v-for="(particle, i) in particles" :key="`snow-${i}`" 
             class="snowflake"
             :style="particle">
          ❄
        </div>
      </template>

      <!-- Ash/Embers Effect -->
      <template v-else-if="effect === 'ash'">
        <div v-for="(particle, i) in particles" :key="`ash-${i}`" 
             class="ash-particle"
             :style="particle">
        </div>
      </template>

      <!-- Fire Sparks Effect -->
      <template v-else-if="effect === 'sparks'">
        <div v-for="(particle, i) in particles" :key="`spark-${i}`" 
             class="fire-spark"
             :style="particle">
        </div>
      </template>

      <!-- Combined: Snow + Ash -->
      <template v-else-if="effect === 'snow-ash'">
        <div v-for="(particle, i) in snowParticles" :key="`snow-${i}`" 
             class="snowflake"
             :style="particle">
          ❄
        </div>
        <div v-for="(particle, i) in ashParticles" :key="`ash-${i}`" 
             class="ash-particle"
             :style="particle">
        </div>
      </template>

      <!-- Combined: Ash + Sparks -->
      <template v-else-if="effect === 'ash-sparks'">
        <div v-for="(particle, i) in ashParticles" :key="`ash-${i}`" 
             class="ash-particle"
             :style="particle">
        </div>
        <div v-for="(particle, i) in sparkParticles" :key="`spark-${i}`" 
             class="fire-spark"
             :style="particle">
        </div>
      </template>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'

const props = defineProps({
  bgImage: {
    type: String,
    default: null
  },
  effect: {
    type: String,
    default: 'none',
    validator: (value) => ['none', 'fireflies', 'fireflies-blue', 'snow', 'ash', 'sparks', 'snow-ash', 'ash-sparks'].includes(value)
  },
  particleCount: {
    type: Number,
    default: 15  // ลดจาก 20 → 15 เพื่อ performance
  }
})

// Debug on mount
onMounted(() => {
  console.log('🖼️ BackgroundEffect mounted:', {
    bgImage: props.bgImage,
    effect: props.effect,
    particleCount: props.particleCount
  })
})

// Preload background image for smooth transition
watch(() => props.bgImage, (newImage) => {
  if (newImage) {
    const img = new Image()
    img.src = newImage
  }
}, { immediate: true })

// Pre-compute particle positions once (cached by Vue)
const particles = computed(() => {
  const arr = []
  for (let i = 0; i < props.particleCount; i++) {
    const style = {}
    style.left = `${Math.random() * 100}%`
    
    if (props.effect.includes('fireflies')) {
      style.top = `${Math.random() * 100}%`
      style.animationDelay = `${Math.random() * 2}s`
      style.animationDuration = `${3 + Math.random() * 3}s` // เร็วมาก: 3-6s
    } else if (props.effect === 'snow') {
      style.animationDelay = `${Math.random() * 2}s`
      style.animationDuration = `${4 + Math.random() * 4}s` // เร็วขึ้น: 4-8s
      style.fontSize = `${14 + Math.random() * 12}px` // ใหญ่ขึ้น: 14-26px (เดิม 10-20px)
      style.opacity = 0.6 + Math.random() * 0.4 // สว่างขึ้น: 0.6-1.0 (เดิม 0.3-0.8)
    } else if (props.effect === 'ash') {
      style.animationDelay = `${Math.random() * 3}s`
      style.animationDuration = `${4 + Math.random() * 4}s` // เร็วขึ้น: 4-8s
      style.opacity = 0.3 + Math.random() * 0.4
    } else if (props.effect === 'sparks') {
      style.bottom = '-10%'
      style.animationDelay = `${Math.random() * 2}s`
      style.animationDuration = `${1.5 + Math.random() * 1.5}s` // เร็วมาก: 1.5-3s
    }
    
    arr.push(style)
  }
  return arr
})

// For combined effects
const snowParticles = computed(() => {
  if (props.effect !== 'snow-ash') return []
  const count = Math.floor(props.particleCount * 0.7) // เพิ่มหิมะ: 70% (เดิม 60%)
  const arr = []
  for (let i = 0; i < count; i++) {
    arr.push({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${4 + Math.random() * 4}s`, // เร็วขึ้น: 4-8s
      fontSize: `${14 + Math.random() * 12}px`, // ใหญ่ขึ้น
      opacity: 0.6 + Math.random() * 0.4 // สว่างขึ้น
    })
  }
  return arr
})

const ashParticles = computed(() => {
  if (!['snow-ash', 'ash-sparks'].includes(props.effect)) return []
  const count = Math.floor(props.particleCount * (props.effect === 'snow-ash' ? 0.3 : 0.6)) // ลดขี้เถ้าเล็กน้อย
  const arr = []
  for (let i = 0; i < count; i++) {
    arr.push({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${4 + Math.random() * 4}s`, // เร็วขึ้น
      opacity: 0.3 + Math.random() * 0.4
    })
  }
  return arr
})

const sparkParticles = computed(() => {
  if (props.effect !== 'ash-sparks') return []
  const count = Math.floor(props.particleCount * 0.4)
  const arr = []
  for (let i = 0; i < count; i++) {
    arr.push({
      left: `${Math.random() * 100}%`,
      bottom: '-10%',
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${1.5 + Math.random() * 1.5}s` // เร็วมาก
    })
  }
  return arr
})
</script>
