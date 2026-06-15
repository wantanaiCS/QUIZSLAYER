# Vite Troubleshooting Guide for QuizSlayer

## 🚨 If `npm run dev` Fails

This project **MUST use Vite 4.5.14** due to the `#` character in the path `r:\C#\QUIZSLAYER`.

### Quick Fix Checklist

Run these checks in order:

#### 1. Check Vite Version
```bash
npm list vite
```
**Expected:** `vite@4.5.14`  
**If different:** Run `npm install vite@4.5.14 @vitejs/plugin-vue@4.6.2 --save-dev`

#### 2. Check package.json dev script
```json
{
  "scripts": {
    "dev": "vite build && vite preview --host 127.0.0.1"
  }
}
```
**Must be:** `vite build && vite preview --host 127.0.0.1`  
**NOT:** `vite` (regular dev server doesn't work)

#### 3. Check index.html script path
```html
<script type="module" src="./src/main.js"></script>
```
**Must be:** `./src/main.js` (relative path)  
**NOT:** `/src/main.js` (absolute path breaks build)

#### 4. Clear cache and restart
```bash
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

---

## Common Error Messages

### Error: "Failed to load url /src/main.js"
**Cause:** Wrong Vite version OR wrong path in index.html  
**Fix:** Follow checklist #1 and #3 above

### Error: "The project root contains the '#' character"
**Cause:** This is a **warning**, not an error. It's expected.  
**Action:** Ignore this warning. The workaround is already in place.

### Error: Build fails with Rollup errors
**Cause:** Wrong index.html path  
**Fix:** Use `./src/main.js` (relative) not `/src/main.js` (absolute)

### Error: White screen after `npm run dev`
**Cause:** Build succeeded but preview server failed to start  
**Fix:** Check if port 5173 is already in use. Change preview port in vite.config.js

---

## Why Vite 4.x and not 5.x?

**Tested configurations:**
- ✅ **Vite 4.5.14**: Works with `vite build && vite preview` workaround
- ❌ **Vite 5.x**: Module resolution completely broken due to `#` in path
- ❌ **Vite 6.x+**: Same issue as 5.x

**Root cause:** Vite 5+ changed how it encodes URLs, breaking support for `#` character in Windows paths.

---

## Development Workflow

Since we use `vite build && vite preview`, the workflow is different:

1. Make code changes
2. Stop the preview server (Ctrl+C)
3. Run `npm run dev` again (rebuilds + restarts)
4. Refresh browser at `http://127.0.0.1:5173/`

**No hot-reload** — this is a limitation of the workaround.

---

## Deployment to Vercel

Deployment works normally because:
- Vercel runs `npm run build` (not `npm run dev`)
- `vite build` works fine regardless of local path issues
- The `#` character issue only affects local dev server

---

## If You Must Upgrade Vite

**Don't.** The only solution is to move the project to a path without `#`:

```bash
# Move project to new location
xcopy "r:\C#\QUIZSLAYER" "r:\dev\QUIZSLAYER" /E /I /H
cd "r:\dev\QUIZSLAYER"

# Then you can use Vite 5.x
npm install vite@latest @vitejs/plugin-vue@latest --save-dev
```

But this breaks your existing workflow and paths. **Not recommended.**
