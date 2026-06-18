/**
 * pvpStore.js — Online PvP state + Supabase Realtime
 *
 * Flow:
 *   Host: createRoom() → selectQuiz() → setColor() → ready()
 *   Guest: joinRoom(code) → setColor() → ready()
 *   Both: rps phase → playing phase → lucky_box every 5 q → finished
 *
 * Realtime: Supabase Broadcast channel "pvp:{room_code}"
 * DB sync:  pvp_rooms row updated on every state change (host drives)
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isMockMode } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

// ─── Item definitions ──────────────────────────────────────────────────────
export const PVP_ITEMS = [
  { id: 'skip',       icon: 'PhSkipForward',    name: 'Skip Question',  type: 'good',  desc: 'ข้ามข้อนี้โดยไม่เสีย/ได้ HP' },
  { id: 'shield',     icon: 'PhShieldCheck',    name: 'Shield',         type: 'good',  desc: 'บล็อก damage ครั้งถัดไป 1 ครั้ง' },
  { id: 'power',      icon: 'PhSword',          name: 'Power Strike',   type: 'good',  desc: 'ดีล ×2 damage ครั้งถัดไปที่ตอบถูก' },
  { id: 'reveal',     icon: 'PhLightbulb',      name: 'Reveal Answer',  type: 'good',  desc: 'แสดงเฉลยก่อนตอบ 1 ครั้ง' },
  { id: 'steal_turn', icon: 'PhArrowsClockwise',name: 'Steal Turn',     type: 'good',  desc: 'ดึง turn กลับมาหลังจบข้อนี้' },
  { id: 'double_hp',  icon: 'PhHeart',          name: 'Double HP',      type: 'good',  desc: 'HP +5 ทันที' },
  { id: 'q_swap',     icon: 'PhShuffle',        name: 'Question Swap',  type: 'good',  desc: 'สุ่มข้อคำถามใหม่' },
  { id: 'bomb',       icon: 'PhTarget',         name: 'Bomb',           type: 'trap',  desc: 'โดน 3 HP damage ทันที!' },
  { id: 'freeze',     icon: 'PhSnowflake',      name: 'Freeze',         type: 'trap',  desc: 'ตอบไม่ได้ 10 วินาที!' },
]

export const PLAYER_COLORS = {
  red:    { label: 'Red',    tailwind: 'border-red-500    bg-red-900/20  text-red-400',    tint: 0xff4757 },
  blue:   { label: 'Blue',   tailwind: 'border-blue-500   bg-blue-900/20 text-blue-400',   tint: 0x4fc3f7 },
  yellow: { label: 'Yellow', tailwind: 'border-yellow-400 bg-yellow-900/20 text-yellow-400', tint: 0xf4c842 },
  green:  { label: 'Green',  tailwind: 'border-green-500  bg-green-900/20 text-green-400',  tint: 0x43d98f },
}

const RPS_WIN = { rock: 'scissors', scissors: 'paper', paper: 'rock' }
const DAMAGE_PER_WRONG = 3
const DAMAGE_PER_CORRECT = 4
const LUCKY_BOX_EVERY = 5
const MAX_HP = 20

function seededShuffle(arr, seed) {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function drawLuckyCards() {
  const pool = [...PVP_ITEMS]
  const picked = []
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(idx, 1)[0])
  }
  return picked
}

// ─── Store ─────────────────────────────────────────────────────────────────
export const usePvpStore = defineStore('pvp', () => {
  const authStore = useAuthStore()

  // ── Room info ────────────────────────────────────────────────────────────
  const roomCode   = ref(null)
  const roomId     = ref(null)
  const myRole     = ref(null)     // 'host' | 'guest'
  const status     = ref('idle')   // idle | waiting | rps | playing | lucky_box | finished
  const hostId     = ref(null)
  const guestId    = ref(null)
  const hostName   = ref('')
  const guestName  = ref('')
  const hostColor  = ref('red')
  const guestColor = ref('blue')
  const bgTheme    = ref('arena')  // arena | grassland | forest | cave | tower | throne

  // ── Rematch voting ────────────────────────────────────────────────────────
  const rematchVoteHost  = ref(false)
  const rematchVoteGuest = ref(false)
  const rematchQuizSetId = ref(null)   // null = ใช้ชุดเดิม
  const rematchBgTheme   = ref(null)   // null = ใช้ theme เดิม

  // ── HP ───────────────────────────────────────────────────────────────────
  const hostHp  = ref(MAX_HP)
  const guestHp = ref(MAX_HP)

  // ── Items ────────────────────────────────────────────────────────────────
  const hostItems  = ref([])   // array of item ids
  const guestItems = ref([])
  const revealActive  = ref(false)   // reveal answer active this turn
  const freezeActive  = ref(false)   // local freeze countdown
  const freezeSeconds = ref(0)
  let freezeTimer = null

  // ── Turn / Questions ─────────────────────────────────────────────────────
  const currentTurn     = ref('host')
  const allQuestions    = ref([])    // shuffled by seed
  const currentQIndex   = ref(0)
  const questionsAnswered = ref(0)
  const questionSeed    = ref(0)
  const turnTimeLimit   = ref(10)    // seconds per turn; 0 = unlimited
  const quizSetId       = ref(null)  // quiz_set_id for history
  const quizSetTitle    = ref(null)  // quiz title for history
  const gameStartTime   = ref(null)  // timestamp when game started (for duration)
  const myAnswerLog     = ref([])    // track my answers for history
  const myCorrectCount  = ref(0)     // my correct answers count
  const sessionSaved    = ref(false) // prevent duplicate saves

  // ── RPS ──────────────────────────────────────────────────────────────────
  const rpsHost    = ref(null)
  const rpsGuest   = ref(null)
  const rpsResult  = ref(null)   // 'host_win'|'guest_win'|'draw'
  const myRpsPick  = ref(null)
  const opponentRpsPick = ref(null)

  // ── Lucky Box ────────────────────────────────────────────────────────────
  const luckyCards      = ref([])    // 3 items to pick from
  const luckyPicked     = ref(false)

  // ── UI ───────────────────────────────────────────────────────────────────
  const loadingRoom  = ref(false)
  const error        = ref(null)
  const lastEvent    = ref(null)     // last broadcast event for animations

  // ── Turn timer ───────────────────────────────────────────────────────────
  const turnTimeLeft = ref(0)        // countdown seconds remaining (0 = not active)
  let turnTimer = null

  function _startTurnTimer() {
    _clearTurnTimer()
    if (!turnTimeLimit.value || turnTimeLimit.value <= 0) return
    turnTimeLeft.value = turnTimeLimit.value
    turnTimer = setInterval(() => {
      turnTimeLeft.value--
      if (turnTimeLeft.value <= 0) {
        _clearTurnTimer()
        // Auto-submit wrong answer (index -1 sentinel → treated as wrong)
        if (isMyTurn.value && status.value === 'playing') {
          submitAnswer(-1)
        }
      }
    }, 1000)
  }

  function _clearTurnTimer() {
    if (turnTimer) { clearInterval(turnTimer); turnTimer = null }
    turnTimeLeft.value = 0
  }

  function setTurnTimeLimit(seconds) {
    turnTimeLimit.value = seconds
  }

  // ── Realtime channel ─────────────────────────────────────────────────────
  let channel = null

  // ─── Computed ────────────────────────────────────────────────────────────
  const isHost    = computed(() => myRole.value === 'host')
  const isMyTurn  = computed(() => currentTurn.value === myRole.value)
  const myHp      = computed(() => isHost.value ? hostHp.value  : guestHp.value)
  const oppHp     = computed(() => isHost.value ? guestHp.value : hostHp.value)
  const myColor   = computed(() => isHost.value ? hostColor.value  : guestColor.value)
  const oppColor  = computed(() => isHost.value ? guestColor.value : hostColor.value)
  const myName    = computed(() => isHost.value ? hostName.value  : guestName.value)
  const oppName   = computed(() => isHost.value ? guestName.value : hostName.value)
  const myItems   = computed(() => isHost.value ? hostItems.value  : guestItems.value)
  const currentQ  = computed(() => allQuestions.value[currentQIndex.value] ?? null)
  const isFrozen  = computed(() => freezeActive.value && freezeSeconds.value > 0)
  const isFinished = computed(() => status.value === 'finished')
  const winner = computed(() => {
    if (hostHp.value <= 0)  return 'guest'
    if (guestHp.value <= 0) return 'host'
    return null
  })
  const myItemObjects = computed(() =>
    myItems.value.map(id => PVP_ITEMS.find(i => i.id === id)).filter(Boolean)
  )

  // ─── Realtime helpers ─────────────────────────────────────────────────────
  function broadcast(type, payload = {}) {
    if (!channel) return
    channel.send({ type: 'broadcast', event: type, payload })
  }

  function subscribeChannel(code) {
    if (channel) supabase.removeChannel(channel)
    channel = supabase.channel(`pvp:${code}`, {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'rps_pick' },      e => onRpsPick(e.payload))
      .on('broadcast', { event: 'rps_reveal' },    e => onRpsReveal(e.payload))
      .on('broadcast', { event: 'answer' },         e => onAnswer(e.payload))
      .on('broadcast', { event: 'item_used' },      e => onItemUsed(e.payload))
      .on('broadcast', { event: 'lucky_pick' },     e => onLuckyPick(e.payload))
      .on('broadcast', { event: 'state_sync' },     e => onStateSync(e.payload))
      .on('broadcast', { event: 'color_change' },   e => onColorChange(e.payload))
      .on('broadcast', { event: 'guest_joined' },   e => onGuestJoined(e.payload))
      .on('broadcast', { event: 'ready' },           e => onReady(e.payload))
      .on('broadcast', { event: 'disconnect' },     e => onDisconnect(e.payload))
      .on('broadcast', { event: 'rematch_vote' },   e => onRematchVote(e.payload))
      .subscribe()
  }

  // ─── Room actions ─────────────────────────────────────────────────────────

  async function createRoom() {
    error.value    = null
    loadingRoom.value = true

    if (isMockMode) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      roomCode.value   = code
      roomId.value     = 'mock-' + code
      myRole.value     = 'host'
      hostId.value     = authStore.user?.id
      hostName.value   = authStore.displayName
      status.value     = 'waiting'
      subscribeChannel(code)
      loadingRoom.value = false
      return code
    }

    // สร้าง room ใน DB
    const code = await _generateUniqueCode()
    const { data, error: err } = await supabase
      .from('pvp_rooms')
      .insert({
        room_code:    code,
        host_id:      authStore.user.id,
        status:       'waiting',
        host_color:   'red',
        guest_color:  'blue',
        question_seed: Math.floor(Math.random() * 99999),
      })
      .select()
      .single()

    if (err) { error.value = err.message; loadingRoom.value = false; return null }

    roomCode.value  = code
    roomId.value    = data.id
    myRole.value    = 'host'
    hostId.value    = authStore.user.id
    hostName.value  = authStore.displayName
    questionSeed.value = data.question_seed
    status.value    = 'waiting'
    subscribeChannel(code)
    loadingRoom.value = false
    return code
  }

  async function joinRoom(code) {
    error.value = null
    loadingRoom.value = true
    const upper = code.trim().toUpperCase()

    if (isMockMode) {
      roomCode.value  = upper
      roomId.value    = 'mock-' + upper
      myRole.value    = 'guest'
      guestId.value   = authStore.user?.id
      guestName.value = authStore.displayName
      status.value    = 'waiting'
      subscribeChannel(upper)
      broadcast('guest_joined', {
        guestId:   authStore.user?.id,
        guestName: authStore.displayName,
      })
      loadingRoom.value = false
      return true
    }

    const { data, error: err } = await supabase
      .from('pvp_rooms')
      .select('*')
      .eq('room_code', upper)
      .eq('status', 'waiting')
      .single()

    if (err || !data) {
      error.value = 'ไม่พบห้อง หรือห้องเต็มแล้ว'
      loadingRoom.value = false
      return false
    }
    if (data.guest_id) {
      error.value = 'ห้องเต็มแล้ว'
      loadingRoom.value = false
      return false
    }

    // เข้าห้อง
    const { error: upErr } = await supabase
      .from('pvp_rooms')
      .update({ guest_id: authStore.user.id })
      .eq('id', data.id)

    if (upErr) { error.value = upErr.message; loadingRoom.value = false; return false }

    roomCode.value     = upper
    roomId.value       = data.id
    myRole.value       = 'guest'
    hostId.value       = data.host_id
    guestId.value      = authStore.user.id
    hostColor.value    = data.host_color
    hostHp.value       = data.host_hp
    guestHp.value      = data.guest_hp
    questionSeed.value = data.question_seed
    status.value       = 'waiting'
    subscribeChannel(upper)

    // fetch host profile name
    const { data: hostProfile } = await supabase
      .from('profiles').select('username').eq('id', data.host_id).single()
    hostName.value  = hostProfile?.username ?? 'Host'
    guestName.value = authStore.displayName

    broadcast('guest_joined', {
      guestId:   authStore.user.id,
      guestName: authStore.displayName,
    })
    loadingRoom.value = false
    return true
  }

  function setQuizSet(questions, quizSetIdValue, quizTitle = null) {
    // Mix in current time so every game play gets a different order
    const runtimeSeed = (questionSeed.value + Date.now()) % 999983
    const shuffled = seededShuffle(questions, runtimeSeed)
    allQuestions.value = shuffled
    quizSetId.value = quizSetIdValue  // store for history
    quizSetTitle.value = quizTitle    // store for history
    // sync to guest
    broadcast('state_sync', fullState())
  }

  function setColor(color) {
    if (isHost.value) {
      hostColor.value = color
    } else {
      guestColor.value = color
    }
    broadcast('color_change', { role: myRole.value, color })
    _dbUpdate({ [isHost.value ? 'host_color' : 'guest_color']: color })
  }

  function setReady() {
    broadcast('ready', { role: myRole.value })
  }

  // ─── RPS Phase ────────────────────────────────────────────────────────────

  function pickRps(choice) {
    if (myRpsPick.value) return
    myRpsPick.value = choice
    // ส่งแบบ hashed เพื่อ commit-reveal (ป้องกันแอบดู)
    broadcast('rps_pick', { role: myRole.value, hash: btoa(choice + roomCode.value) })

    // ถ้าเราเป็น guest และ host ส่งมาแล้ว → reveal
    if (opponentRpsPick.value) {
      _resolveRps()
    }
  }

  function onRpsPick(payload) {
    // opponent เลือกแล้ว แต่ยัง hidden
    opponentRpsPick.value = payload.hash   // store hash ก่อน

    if (myRpsPick.value) {
      // เราเลือกแล้วเหมือนกัน → reveal พร้อมกัน
      broadcast('rps_reveal', {
        hostChoice:  isHost.value ? myRpsPick.value : atob(payload.hash).replace(roomCode.value, ''),
        guestChoice: isHost.value ? atob(payload.hash).replace(roomCode.value, '') : myRpsPick.value,
      })
      _resolveRps()
    }
  }

  function onRpsReveal(payload) {
    rpsHost.value  = payload.hostChoice
    rpsGuest.value = payload.guestChoice
    const result = _calcRps(payload.hostChoice, payload.guestChoice)
    rpsResult.value = result
    lastEvent.value = { type: 'rps_result', result }

    if (result === 'draw') {
      // เสมอ — รอ 2.5 วิให้เห็น UI แล้วรีเซ็ตให้เป่าใหม่
      setTimeout(() => {
        rpsHost.value         = null
        rpsGuest.value        = null
        rpsResult.value       = null
        myRpsPick.value       = null
        opponentRpsPick.value = null
      }, 2500)
      return
    }

    setTimeout(() => {
      currentTurn.value = result === 'host_win' ? 'host' : 'guest'
      status.value = 'playing'
      gameStartTime.value = Date.now()  // Start tracking game duration
      allQuestions.value.length > 0 && broadcast('state_sync', fullState())
      // Start timer for whoever goes first
      if (isMyTurn.value) _startTurnTimer()
    }, 3000)  // เพิ่มเป็น 3 วินาที + transition time
  }

  function _resolveRps() {
    const myChoice  = myRpsPick.value
    const oppHash   = typeof opponentRpsPick.value === 'string' ? opponentRpsPick.value : null
    const oppChoice = oppHash ? atob(oppHash).replace(roomCode.value, '') : null
    if (!oppChoice) return

    const hostChoice  = isHost.value ? myChoice : oppChoice
    const guestChoice = isHost.value ? oppChoice : myChoice
    broadcast('rps_reveal', { hostChoice, guestChoice })
  }

  function _calcRps(h, g) {
    if (h === g) return 'draw'
    return RPS_WIN[h] === g ? 'host_win' : 'guest_win'
  }

  // ─── Answer ───────────────────────────────────────────────────────────────

  function submitAnswer(chosenIndex) {
    if (!isMyTurn.value || !currentQ.value) return
    if (isFrozen.value) return
    _clearTurnTimer()   // stop timer as soon as answer submitted

    const q = currentQ.value
    // chosenIndex === -1 means time ran out → treat as wrong
    const isCorrect = chosenIndex >= 0 && chosenIndex === q.correct_index
    revealActive.value = false

    // Track my answer for history
    myAnswerLog.value.push({
      question_id:   q.id ?? null,
      question_text: q.question_text,
      chosen_index:  chosenIndex,
      correct_index: q.correct_index,
      is_correct:    isCorrect,
      chosen_answer: chosenIndex >= 0 ? q.options?.[chosenIndex] : null,
      correct_answer: q.options?.[q.correct_index] ?? null,
    })
    if (isCorrect) myCorrectCount.value++

    let dmg = isCorrect ? DAMAGE_PER_CORRECT : DAMAGE_PER_WRONG
    let stealTurn = false
    let selfDmg = false

    // Apply my active items
    if (isCorrect) {
      if (_hasItem('power')) {
        dmg *= 2
        _removeItem('power')
      }
    }
    if (!isCorrect && _hasItem('shield')) {
      dmg = 0
      _removeItem('shield')
    }

    // Build payload
    const payload = {
      role: myRole.value,
      chosenIndex,
      isCorrect,
      damage: dmg,
      stealTurn,
      selfDmg,
      nextQIndex: currentQIndex.value + 1,
      questionsAnswered: questionsAnswered.value + 1,
    }

    broadcast('answer', payload)
    _applyAnswer(payload)
  }

  function onAnswer(payload) {
    _applyAnswer(payload)
  }

  function _applyAnswer(payload) {
    const { role, isCorrect, damage, stealTurn, nextQIndex, questionsAnswered: qa } = payload

    lastEvent.value = { type: 'answer', ...payload }

    if (isCorrect) {
      // attacker hits defender
      if (role === 'host') guestHp.value = Math.max(0, guestHp.value - damage)
      else                  hostHp.value  = Math.max(0, hostHp.value  - damage)
    } else {
      // wrong → attacker takes damage
      if (role === 'host') hostHp.value  = Math.max(0, hostHp.value  - damage)
      else                  guestHp.value = Math.max(0, guestHp.value - damage)
    }

    questionsAnswered.value = qa
    currentQIndex.value = nextQIndex

    // Check win
    if (hostHp.value <= 0 || guestHp.value <= 0) {
      _clearTurnTimer()
      status.value = 'finished'
      return
    }

    // Lucky box?
    if (qa % LUCKY_BOX_EVERY === 0) {
      _clearTurnTimer()
      status.value  = 'lucky_box'
      luckyCards.value  = drawLuckyCards()
      luckyPicked.value = false
      return
    }

    // Next turn
    if (stealTurn) {
      // keep same turn
    } else {
      currentTurn.value = currentTurn.value === 'host' ? 'guest' : 'host'
    }

    // Start timer for whichever player's turn it is now
    if (isMyTurn.value) _startTurnTimer()
  }

  // ─── Items ────────────────────────────────────────────────────────────────

  function useItem(itemId) {
    if (!_hasItem(itemId)) return
    const item = PVP_ITEMS.find(i => i.id === itemId)
    if (!item || item.type === 'trap') return  // traps auto-apply on pick

    broadcast('item_used', { role: myRole.value, itemId })
    _applyItem(itemId, myRole.value)
  }

  function onItemUsed(payload) {
    _applyItem(payload.itemId, payload.role)
  }

  function _applyItem(itemId, role) {
    switch (itemId) {
      case 'skip':
        // advance question without damage
        currentQIndex.value++
        questionsAnswered.value++
        currentTurn.value = currentTurn.value === 'host' ? 'guest' : 'host'
        break
      case 'steal_turn':
        // keep turn after this round
        currentTurn.value = role  // force stay
        break
      case 'double_hp':
        if (role === 'host') hostHp.value  = Math.min(MAX_HP, hostHp.value  + 5)
        else                  guestHp.value = Math.min(MAX_HP, guestHp.value + 5)
        break
      case 'q_swap':
        // skip current, go to random
        currentQIndex.value = Math.floor(Math.random() * allQuestions.value.length)
        break
      case 'reveal':
        revealActive.value = true
        break
    }
    _removeItem(itemId, role)
    lastEvent.value = { type: 'item_used', itemId, role }
  }

  // ─── Lucky Box ────────────────────────────────────────────────────────────

  function pickLuckyCard(cardIndex) {
    if (luckyPicked.value) return
    luckyPicked.value = true
    const item = luckyCards.value[cardIndex]
    if (!item) return

    broadcast('lucky_pick', { role: myRole.value, itemId: item.id, cardIndex })
    _applyLuckyPick(item.id, myRole.value)
  }

  function onLuckyPick(payload) {
    _applyLuckyPick(payload.itemId, payload.role)
  }

  function _applyLuckyPick(itemId, role) {
    const item = PVP_ITEMS.find(i => i.id === itemId)
    if (!item) return

    if (item.type === 'trap') {
      // Trap: apply immediately to picker
      if (itemId === 'bomb') {
        if (role === 'host') hostHp.value  = Math.max(0, hostHp.value  - 3)
        else                  guestHp.value = Math.max(0, guestHp.value - 3)
      } else if (itemId === 'freeze') {
        // only apply freeze if I'm the picker
        if (role === myRole.value) {
          freezeActive.value  = true
          freezeSeconds.value = 10
          if (freezeTimer) clearInterval(freezeTimer)
          freezeTimer = setInterval(() => {
            freezeSeconds.value--
            if (freezeSeconds.value <= 0) {
              freezeActive.value = false
              clearInterval(freezeTimer)
            }
          }, 1000)
        }
      }
      lastEvent.value = { type: 'trap', itemId, role }
    } else {
      // Good item: add to picker's inventory (use later)
      if (role === 'host') {
        if (hostItems.value.length < 3) hostItems.value = [...hostItems.value, itemId]
      } else {
        if (guestItems.value.length < 3) guestItems.value = [...guestItems.value, itemId]
      }
      lastEvent.value = { type: 'lucky_pick', itemId, role }
    }

    // Resume playing after short delay
    setTimeout(() => {
      status.value = 'playing'
      currentTurn.value = currentTurn.value === 'host' ? 'guest' : 'host'
      if (isMyTurn.value) _startTurnTimer()
    }, 1500)
  }

  // ─── Broadcast receivers ──────────────────────────────────────────────────

  function onColorChange(payload) {
    if (payload.role === 'host') hostColor.value  = payload.color
    else                          guestColor.value = payload.color
  }

  function onGuestJoined(payload) {
    guestId.value   = payload.guestId
    guestName.value = payload.guestName
    // host syncs full state back
    if (isHost.value) {
      setTimeout(() => broadcast('state_sync', fullState()), 300)
    }
  }

  function onReady(payload) {
    // If both ready, host starts RPS
    if (isHost.value && status.value === 'waiting') {
      status.value = 'rps'
      broadcast('state_sync', fullState())
    }
  }

  function onStateSync(payload) {
    if (payload.status)             status.value           = payload.status
    if (payload.hostHp != null)     hostHp.value           = payload.hostHp
    if (payload.guestHp != null)    guestHp.value          = payload.guestHp
    if (payload.currentTurn)        currentTurn.value      = payload.currentTurn
    if (payload.currentQIndex != null) currentQIndex.value = payload.currentQIndex
    if (payload.questionsAnswered != null) questionsAnswered.value = payload.questionsAnswered
    if (payload.hostItems)          hostItems.value        = payload.hostItems
    if (payload.guestItems)         guestItems.value       = payload.guestItems
    if (payload.hostColor)          hostColor.value        = payload.hostColor
    if (payload.guestColor)         guestColor.value       = payload.guestColor
    if (payload.hostName)           hostName.value         = payload.hostName
    if (payload.guestName)          guestName.value        = payload.guestName
    if (payload.luckyCards)         luckyCards.value       = payload.luckyCards
    if (payload.luckyPicked != null) luckyPicked.value     = payload.luckyPicked
    if (payload.questions)          allQuestions.value     = payload.questions
    if (payload.questionSeed != null) questionSeed.value   = payload.questionSeed
    if (payload.bgTheme)            bgTheme.value          = payload.bgTheme
    if (payload.turnTimeLimit != null) turnTimeLimit.value = payload.turnTimeLimit
    if (payload.rematchVoteHost != null)  rematchVoteHost.value  = payload.rematchVoteHost
    if (payload.rematchVoteGuest != null) rematchVoteGuest.value = payload.rematchVoteGuest
    if (payload.quizSetTitle)       quizSetTitle.value     = payload.quizSetTitle
  }

  function onDisconnect(payload) {
    lastEvent.value = { type: 'disconnect', role: payload.role }
    // Simple: other player wins
    if (payload.role !== myRole.value) {
      status.value = 'finished'
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function fullState() {
    return {
      status:             status.value,
      hostHp:             hostHp.value,
      guestHp:            guestHp.value,
      currentTurn:        currentTurn.value,
      currentQIndex:      currentQIndex.value,
      questionsAnswered:  questionsAnswered.value,
      hostItems:          hostItems.value,
      guestItems:         guestItems.value,
      hostColor:          hostColor.value,
      guestColor:         guestColor.value,
      hostName:           hostName.value,
      guestName:          guestName.value,
      luckyCards:         luckyCards.value,
      luckyPicked:        luckyPicked.value,
      questions:          allQuestions.value,
      questionSeed:       questionSeed.value,
      bgTheme:            bgTheme.value,
      turnTimeLimit:      turnTimeLimit.value,
      rematchVoteHost:    rematchVoteHost.value,
      rematchVoteGuest:   rematchVoteGuest.value,
      quizSetTitle:       quizSetTitle.value,
    }
  }

  function _hasItem(itemId, role) {
    const r = role ?? myRole.value
    const list = r === 'host' ? hostItems.value : guestItems.value
    return list.includes(itemId)
  }

  function _removeItem(itemId, role) {
    const r = role ?? myRole.value
    if (r === 'host') hostItems.value  = hostItems.value.filter(i => i !== itemId)
    else               guestItems.value = guestItems.value.filter(i => i !== itemId)
  }

  async function _generateUniqueCode() {
    for (let attempt = 0; attempt < 10; attempt++) {
      const { data } = await supabase.rpc('generate_room_code')
      const code = data
      const { data: existing } = await supabase
        .from('pvp_rooms').select('id').eq('room_code', code).maybeSingle()
      if (!existing) return code
    }
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  function _dbUpdate(patch) {
    if (!roomId.value || isMockMode) return
    supabase.from('pvp_rooms').update(patch).eq('id', roomId.value)
  }

  function leaveRoom() {
    broadcast('disconnect', { role: myRole.value })
    if (channel) { supabase.removeChannel(channel); channel = null }
    _clearTurnTimer()
    $reset()
  }

  // ─── Session History ──────────────────────────────────────────────────────
  async function savePvpSession() {
    // Prevent duplicate saves
    if (sessionSaved.value) return null
    sessionSaved.value = true

    // Only save if game actually started
    if (!gameStartTime.value || !quizSetId.value) return null

    const { usePlayerStore } = await import('@/stores/playerStore')
    const playerStore = usePlayerStore()

    const iWon = winner.value === myRole.value
    const durationSeconds = Math.max(0, Math.round((Date.now() - gameStartTime.value) / 1000))

    // Calculate score based on performance
    let score = myCorrectCount.value * 10  // 10 points per correct
    if (iWon) score += 50  // Bonus for winning
    score += Math.max(0, MAX_HP - (MAX_HP - myHp.value)) * 2  // HP preservation bonus

    // Calculate coins earned
    let coins = 0
    if (iWon) {
      coins = 20 + myCorrectCount.value * 2  // Win: 20 base + 2 per correct
    } else {
      coins = Math.max(5, myCorrectCount.value)  // Lose: at least 5, or 1 per correct
    }

    const payload = {
      quiz_set_id: quizSetId.value,
      quiz_title: quizSetTitle.value ?? 'PvP Match',
      difficulty: 'pvp',  // Mark as PvP difficulty
      stage_reached: 1,   // PvP has no stages
      result: iWon ? 'win' : 'lose',
      score,
      monsters_killed: 0,  // No monsters in PvP
      total_answered: myAnswerLog.value.length,
      total_correct: myCorrectCount.value,
      duration_seconds: durationSeconds,
      coins_earned: coins,
      answer_summary: myAnswerLog.value,
      mode: 'pvp',
    }

    return await playerStore.saveSession(payload)
  }

  // ─── Rematch ──────────────────────────────────────────────────────────────
  function voteRematch(newQuizQuestions = null, newBgTheme = null) {
    if (isHost.value) {
      rematchVoteHost.value = true
      if (newQuizQuestions) allQuestions.value = newQuizQuestions
      if (newBgTheme) bgTheme.value = newBgTheme
    } else {
      rematchVoteGuest.value = true
    }
    broadcast('rematch_vote', {
      role: myRole.value,
      questions: newQuizQuestions ?? null,
      bgTheme:   newBgTheme ?? bgTheme.value,
    })
    _checkRematchReady()
  }

  function onRematchVote(payload) {
    if (payload.role === 'host') {
      rematchVoteHost.value = true
      if (payload.questions?.length) allQuestions.value = payload.questions
      if (payload.bgTheme) bgTheme.value = payload.bgTheme
    } else {
      rematchVoteGuest.value = true
    }
    _checkRematchReady()
  }

  function _checkRematchReady() {
    if (!rematchVoteHost.value || !rematchVoteGuest.value) return
    // Both voted → restart game
    const newSeed = Math.floor(Math.random() * 99999)
    questionSeed.value      = newSeed
    hostHp.value            = MAX_HP
    guestHp.value           = MAX_HP
    hostItems.value         = []
    guestItems.value        = []
    currentQIndex.value     = 0
    questionsAnswered.value = 0
    currentTurn.value       = 'host'
    rpsHost.value           = null
    rpsGuest.value          = null
    rpsResult.value         = null
    myRpsPick.value         = null
    opponentRpsPick.value   = null
    luckyCards.value        = []
    luckyPicked.value       = false
    rematchVoteHost.value   = false
    rematchVoteGuest.value  = false
    // Reset session tracking for new match
    gameStartTime.value     = null
    myAnswerLog.value       = []
    myCorrectCount.value    = 0
    sessionSaved.value      = false
    // Re-shuffle questions with new seed + runtime offset for unique order each rematch
    if (allQuestions.value.length) {
      const runtimeSeed = (newSeed + Date.now()) % 999983
      allQuestions.value = seededShuffle([...allQuestions.value], runtimeSeed)
    }
    status.value = 'rps'
    broadcast('state_sync', fullState())
  }

  function setBgTheme(theme) {
    bgTheme.value = theme
    broadcast('state_sync', { bgTheme: theme })
  }

  function $reset() {
    roomCode.value    = null
    roomId.value      = null
    myRole.value      = null
    status.value      = 'idle'
    hostId.value      = null
    guestId.value     = null
    hostName.value    = ''
    guestName.value   = ''
    hostColor.value   = 'red'
    guestColor.value  = 'blue'
    bgTheme.value     = 'arena'
    hostHp.value      = MAX_HP
    guestHp.value     = MAX_HP
    hostItems.value   = []
    guestItems.value  = []
    revealActive.value = false
    freezeActive.value = false
    freezeSeconds.value = 0
    if (freezeTimer) clearInterval(freezeTimer)
    currentTurn.value    = 'host'
    allQuestions.value   = []
    currentQIndex.value  = 0
    questionsAnswered.value = 0
    turnTimeLimit.value  = 10
    quizSetId.value      = null
    quizSetTitle.value   = null
    gameStartTime.value  = null
    myAnswerLog.value    = []
    myCorrectCount.value = 0
    sessionSaved.value   = false
    _clearTurnTimer()
    rpsHost.value   = null
    rpsGuest.value  = null
    rpsResult.value = null
    myRpsPick.value = null
    opponentRpsPick.value = null
    luckyCards.value  = []
    luckyPicked.value = false
    rematchVoteHost.value  = false
    rematchVoteGuest.value = false
    rematchQuizSetId.value = null
    rematchBgTheme.value   = null
    error.value     = null
    lastEvent.value = null
  }

  return {
    // state
    roomCode, roomId, myRole, status,
    hostId, guestId, hostName, guestName,
    hostColor, guestColor, bgTheme,
    hostHp, guestHp, hostItems, guestItems,
    currentTurn, allQuestions, currentQIndex, questionsAnswered,
    turnTimeLimit, turnTimeLeft, quizSetId, quizSetTitle, gameStartTime,
    myAnswerLog, myCorrectCount, sessionSaved,
    rpsHost, rpsGuest, rpsResult, myRpsPick,
    luckyCards, luckyPicked,
    rematchVoteHost, rematchVoteGuest,
    revealActive, freezeActive, freezeSeconds,
    loadingRoom, error, lastEvent,
    // computed
    isHost, isMyTurn, myHp, oppHp, myColor, oppColor,
    myName, oppName, myItems, myItemObjects, currentQ,
    isFrozen, isFinished, winner,
    // actions
    createRoom, joinRoom, setQuizSet, setColor, setReady, setBgTheme,
    setTurnTimeLimit,
    pickRps, submitAnswer, useItem, pickLuckyCard,
    voteRematch, leaveRoom, savePvpSession, broadcast, fullState, $reset,
    PLAYER_COLORS, PVP_ITEMS,
  }
})
