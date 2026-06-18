import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
// RPG Awesome is loaded from CDN in index.html to avoid font path issues

const app = createApp(App)

// ── Error handlers: display crash info on screen instead of blank white page ──
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue Error]', err)
  document.getElementById('app').innerHTML =
    `<div style="font:13px monospace;padding:20px;background:#0d0f1a;color:#ff4757;min-height:100vh">
      <b>❌ Vue Runtime Error</b><br><br>
      <pre style="white-space:pre-wrap;color:#ffd93d">${err?.stack ?? err}</pre>
      <p style="color:#888">Hook: ${info}</p>
     </div>`
}

window.addEventListener('error', e => {
  console.error('[Window Error]', e)
  document.getElementById('app').innerHTML =
    `<div style="font:13px monospace;padding:20px;background:#0d0f1a;color:#ff4757;min-height:100vh">
      <b>❌ Uncaught Error</b><br><br>
      <pre style="white-space:pre-wrap;color:#ffd93d">${e.error?.stack ?? e.message}</pre>
     </div>`
})

window.addEventListener('unhandledrejection', e => {
  console.error('[Unhandled Promise]', e.reason)
  document.getElementById('app').innerHTML =
    `<div style="font:13px monospace;padding:20px;background:#0d0f1a;color:#ff4757;min-height:100vh">
      <b>❌ Unhandled Promise Rejection</b><br><br>
      <pre style="white-space:pre-wrap;color:#ffd93d">${e.reason?.stack ?? e.reason}</pre>
     </div>`
})

app.use(createPinia())
app.use(router)
app.mount('#app')
