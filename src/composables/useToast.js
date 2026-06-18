import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

function addToast(message, type = 'info', duration = null) {
  const id = ++nextId
  const ms = duration ?? (type === 'error' ? 5000 : 3000)
  toasts.value.push({ id, message, type })
  setTimeout(() => remove(id), ms)
  // Enforce max 3 visible
  if (toasts.value.length > 3) {
    toasts.value.shift()
  }
}

function remove(id) {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
}

export function useToast() {
  return {
    toasts,
    remove,
    toast: {
      success: (msg) => addToast(msg, 'success'),
      error:   (msg) => addToast(msg, 'error'),
      warning: (msg) => addToast(msg, 'warning'),
      info:    (msg) => addToast(msg, 'info'),
    },
  }
}
