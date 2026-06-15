---
inclusion: auto
---

# 🔒 Vite Version Lock — DO NOT MODIFY

## Critical Rule for AI Assistants

**This project MUST use Vite 4.5.14 — DO NOT suggest upgrading to 5.x or newer.**

### Why?
The project path `r:\C#\QUIZSLAYER` contains a `#` character which breaks Vite 5.x+ module resolution on Windows.

### Required Configuration

**package.json:**
```json
{
  "scripts": {
    "dev": "vite build && vite preview --host 127.0.0.1"
  },
  "devDependencies": {
    "vite": "^4.5.14",
    "@vitejs/plugin-vue": "^4.6.2"
  }
}
```

**index.html:**
```html
<script type="module" src="./src/main.js"></script>
```
(Must use relative path `./src/` not absolute `/src/`)

### If Build Fails

1. Check Vite version: `npm list vite` (must be 4.5.14)
2. Check dev script uses `vite build && vite preview`
3. Check index.html uses `./src/main.js`
4. See `VITE_TROUBLESHOOTING.md` for full guide

### When Suggesting Changes

- ✅ You can modify any Vue/JS/CSS files
- ✅ You can add new dependencies
- ✅ You can modify Tailwind/PostCSS config
- ❌ DO NOT upgrade Vite or @vitejs/plugin-vue
- ❌ DO NOT change package.json dev script
- ❌ DO NOT change index.html script src path
- ❌ DO NOT suggest "try Vite 5.x" or "upgrade to latest Vite"

### Testing Your Changes

After making changes, verify build works:
```bash
npm run build
```

If successful, start dev server:
```bash
npm run dev
```
Then open `http://127.0.0.1:5173/` in browser.
