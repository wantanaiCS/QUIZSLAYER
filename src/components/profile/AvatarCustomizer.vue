<template>
  <div class="space-y-6">

    <!-- Live preview -->
    <div class="flex justify-center">
      <div class="text-center">
        <AvatarFrame :name="authStore.displayName" :color="selectedGradient" size="xl" class="mx-auto mb-3" />
        <p class="text-xs text-qs-muted">ตัวอย่าง</p>
        <p v-if="selectedTitle" class="mt-1">
          <span class="badge bg-qs-primary/10 text-qs-primary border-qs-primary/30 text-xs">
            {{ selectedTitle }}
          </span>
        </p>
      </div>
    </div>

    <!-- Gradient swatches -->
    <div>
      <p class="input-label mb-3">สีตัวละคร</p>
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="(colors, key) in AVATAR_GRADIENTS"
          :key="key"
          class="aspect-square rounded-qs border-2 transition-all duration-150 hover:scale-110 active:scale-95"
          :class="selectedGradient === key
            ? 'border-white shadow-qs-glow scale-105'
            : 'border-transparent'"
          :aria-label="key"
          :aria-pressed="selectedGradient === key"
          :style="{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }"
          @click="selectedGradient = key"
        >
          <PhCheckCircle
            v-if="selectedGradient === key"
            :size="18" weight="fill" class="text-white mx-auto"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <!-- Title badge selector -->
    <div>
      <p class="input-label mb-3">Title Badge</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="title in availableTitles"
          :key="title"
          class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150"
          :class="selectedTitle === title
            ? 'bg-qs-primary text-white border-qs-primary shadow-qs'
            : 'bg-qs-surface border-qs-border text-qs-muted hover:border-qs-primary/50 hover:text-qs-text'"
          @click="selectedTitle = title"
        >{{ title }}</button>
      </div>
    </div>

    <!-- Save button -->
    <button
      class="btn-primary w-full gap-2"
      :disabled="saving || (!hasGradientChanged && !hasTitleChanged)"
      @click="save"
    >
      <span v-if="saving" class="inline-flex items-center gap-2">
        <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></span>
        กำลังบันทึก...
      </span>
      <template v-else>
        <PhFloppyDisk :size="16" weight="bold" aria-hidden="true" />
        บันทึกการตั้งค่า
      </template>
    </button>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import { AVATAR_GRADIENTS } from '@/lib/avatarGradients'
import AvatarFrame from '@/components/ui/AvatarFrame.vue'
import { PhCheckCircle, PhFloppyDisk } from '@phosphor-icons/vue'

const ALL_TITLES = [
  'Slayer Apprentice',
  'Battle-Hardened',
  'Duelist',
  'Flawless',
  'Iron Will',
  'Legendary',
]

const authStore = useAuthStore()
const { toast } = useToast()

const selectedGradient = ref(authStore.profile?.avatar_gradient ?? 'purple')
const selectedTitle    = ref(authStore.profile?.title_badge ?? '')
const saving           = ref(false)

const availableTitles = computed(() => ALL_TITLES)

const hasGradientChanged = computed(() =>
  selectedGradient.value !== (authStore.profile?.avatar_gradient ?? 'purple')
)
const hasTitleChanged = computed(() =>
  selectedTitle.value !== (authStore.profile?.title_badge ?? '')
)

async function save() {
  saving.value = true
  let ok = true

  if (hasGradientChanged.value) {
    ok = ok && await authStore.updateAvatarGradient(selectedGradient.value)
  }
  if (hasTitleChanged.value) {
    ok = ok && await authStore.updateTitleBadge(selectedTitle.value)
  }

  saving.value = false
  if (ok) toast.success('บันทึกการตั้งค่าแล้ว')
  else    toast.error('บันทึกไม่สำเร็จ กรุณาลองใหม่')
}
</script>
