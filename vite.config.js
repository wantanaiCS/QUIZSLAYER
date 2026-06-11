import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 5173,
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) return 'phaser'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('vue-router')) return 'vendor'
        },
      },
    },
  },
})
