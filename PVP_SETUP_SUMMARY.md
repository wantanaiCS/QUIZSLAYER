# 📊 PvP Setup - Visual Summary

> ภาพรวมด่วนของกระบวนการทั้งหมด

---

## 🎯 Overall Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PvP DEPLOYMENT PROCESS                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ PHASE 1: DATABASE    │ ⏱ 5 min
│                      │
│ ✓ SQL Script         │
│ ✓ RLS Policies       │
│ ✓ Realtime Enable    │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ PHASE 2: LOCAL DEV   │ ⏱ 5 min
│                      │
│ ✓ npm install        │
│ ✓ .env check         │
│ ✓ npm run dev        │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ PHASE 3: MOCK TEST   │ ⏱ 15 min
│ (1 Person)           │
│                      │
│ ✓ Create Room        │
│ ✓ Join Room (same)   │
│ ✓ RPS Round          │
│ ✓ Battle Play        │
│ ✓ Lucky Box          │
│ ✓ Game Finish        │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ PHASE 4: REALTIME    │ ⏱ 20 min
│ TEST (2 People)      │
│                      │
│ ✓ Device 1: Host     │
│ ✓ Device 2: Guest    │
│ ✓ Realtime Sync ✓    │
│ ✓ Full Game Play     │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ PHASE 5: EDGE CASES  │ ⏱ 20 min
│                      │
│ ✓ Disconnect         │
│ ✓ Refresh Page       │
│ ✓ Invalid Code       │
│ ✓ Multiple Guests    │
│ ✓ Slow Network       │
│ ✓ Rapid Clicks       │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ PHASE 6: PRODUCTION  │ ⏱ 10 min
│                      │
│ ✓ npm run build      │
│ ✓ npm run preview    │
│ ✓ Deploy             │
│ ✓ Live Test          │
└──────────────────────┘
          ↓
       🎉 LIVE
```

---

## 📋 Database Setup Sequence

```
┌─────────────────────────────────────────────────┐
│          SUPABASE DASHBOARD                     │
└─────────────────────────────────────────────────┘

Step 1: SQL Editor
┌────────────────────────────────────────────┐
│ → SQL Editor → New Query                   │
│ → Copy supabase/pvp_setup.sql              │
│ → Paste all                                │
│ → Click RUN                                │
│ → Result: ✓ 0 errors                       │
└────────────────────────────────────────────┘
   │
   ↓
Step 2: Verify Tables
┌────────────────────────────────────────────┐
│ → Database → Tables                        │
│ → Check: pvp_rooms ✓                       │
│ → Check: pvp_sessions ✓                    │
└────────────────────────────────────────────┘
   │
   ↓
Step 3: Enable RLS
┌────────────────────────────────────────────┐
│ → pvp_rooms → RLS tab                      │
│ → Check: 3 policies enabled                │
│ → pvp_sessions → RLS tab                   │
│ → Check: 2 policies enabled                │
└────────────────────────────────────────────┘
   │
   ↓
Step 4: Realtime Publication
┌────────────────────────────────────────────┐
│ → Database → Publications                  │
│ → supabase_realtime                        │
│ → Toggle: pvp_rooms = ON                   │
│ → Click Save                               │
└────────────────────────────────────────────┘
   │
   ↓
   ✅ DATABASE READY
```

---

## 🎮 1-Person Game Flow (Mock Mode)

```
HOST TAB 1                      GUEST TAB 2
────────────────────────────────────────────

/pvp Lobby                      /pvp Lobby
  ↓                               ↓
"🏠 สร้างห้อง"                   "🚪 เข้าห้อง"
  ↓                               ↓
Select Quiz ✓                   Input Code ✓
  ↓                               ↓
Select Color ✓                  Select Color ✓
  ↓                               ↓
Click Create ✓                  Click Join ✓
  ↓                               ↓
Get Room Code: ABC123           Waiting...
  ↓                               ↓
Waiting Room                    Wait 1-2 sec
(รอ guest)                         ↓
  ↓                            Joined! ✓
Wait 1-2 sec                      ↓
  ↓                            Waiting Room
Guest Join ✓ (mock)            (รอ host เริ่มเกม)
  ↓
Button Active: "⚔️ เริ่มเกม!"
  ↓
Click Start ✓
    ──────────────────────────────
              ↓↓ (both)
            RPS SCREEN
    ──────────────────────────────
Host Pick: ✊          Guest Pick: ✌️
  ↓                     ↓
Committed              Committed
  ↓                     ↓
After 2-3 sec...
  ↓
Host Wins! (Rock > Scissors)
  ↓↓ (both)
    BATTLE SCREEN
    ─────────────────────────────
Host Turn ✓             Guest Waiting
Answer: C               Animation
  ↓                     ↓
HP Update              Sync HP ✓
Turn Switch            Turn Active
  ↓                     ↓
Guest Turn ✓            Host Waiting
Answer: B               Animation
  ↓                     ↓
...continue until Question 5...
    ─────────────────────────────
              LUCKY BOX
    Both see: [❓] [❓] [❓]
              ↓
         Host Pick Card 1
         Get: 💊 Double HP
              ↓
         Both see item picked
              ↓
    Continue Battle...
    ─────────────────────────────
Play until HP = 0
  ↓↓ (both)
    VICTORY/DEFEAT
  ─────────────────────────────
Host: 🏆 ชนะแล้ว!
Guest: 💀 แพ้แล้ว...
HP Remaining: 5/20
  ↓
[🚪 กลับ] [🔄 เล่นใหม่]
```

---

## 👥 2-Person Game Flow (Realtime)

```
DEVICE 1 (Host PC)              DEVICE 2 (Guest Laptop)
════════════════════════════════════════════════════════

http://localhost:5173           http://localhost:5173
Login: Account A                Login: Account B
/pvp                            /pvp
  ↓                               ↓
"🏠 สร้างห้อง"                   "🚪 เข้าห้อง"
Select Quiz                     Input Code
Select Color: Red               Select Color: Blue
Click Create                    Click Join
  ↓                               ↓
Room Code: XY7K9Z               ⏳ Loading...
Waiting Room ✓                    ↓
(รอ guest)                      Joined? ✓
  ↓                               ↓
⏳ Realtime Sync (1-2 sec)
  ↓                               ↓
Guest Info Appears ✓            Waiting Room ✓
"🟢 Test User 2"
Button: "⚔️ เริ่มเกม!" (active)
  ↓
Click Start
════════════════════════════════════════════════════════
                    REALTIME SYNC (2-way)
────────────────────────────────────────────────────────

  RPS Phase                     RPS Phase
  ──────────────────────────────────────
  Host: Pick Rock ✓             Guest: Pick Scissors ✓
  Sent: broadcast('rps_pick')   Sent: broadcast('rps_pick')
    ↓                             ↓
    ←──── Supabase Broadcast ────→
    ↓                             ↓
  Received Guest Pick ✓         Received Host Pick ✓
    ↓                             ↓
  Auto Reveal                   Auto Reveal
    ↓                             ↓
    ←──── RPS Result Sync ────→
    ↓                             ↓
  Both Show: Host Wins!
  ──────────────────────────────────────
          ↓↓ (both)
       BATTLE PHASE
  ──────────────────────────────────────

  HP: 20/20                     HP: 20/20
    ↓                             ↓
  "⚔️ ตาของคุณ!"                "⏳ รอ Host..."
  Answer: C ✓                    Animation Play
    ↓                             ↓
  Sent: broadcast('answer')
    ↓                             ↓
  ← State Sync (HP, Turn) →
    ↓                             ↓
  HP: 20/16 ✓                   HP: 20/16 ✓ (synced)
  Turn: Guest                   Turn: Guest
    ↓                             ↓
  "⏳ รอ Guest..."               "⚔️ ตาของคุณ!"
  Animation Play                Answer: A ✓
    ↓                             ↓
                Sent: broadcast('answer')
                ←── HP & Turn Sync ──→
    ↓                             ↓
  HP: 17/16 ✓ (update)          HP: 17/16 ✓
  ...continue...
  ──────────────────────────────────────
      (Every 5 questions: Lucky Box)
  ──────────────────────────────────────
  
  Lucky Box ✓                   Lucky Box ✓
  [❓] [❓] [❓]                  [❓] [❓] [❓]
    ↓                             ↓
  Host Pick: 💊                 (waiting)
    ↓                             ↓
  ← Lucky Card Sync →
    ↓                             ↓
  Both see: Item picked ✓
  Resume Battle...
  ──────────────────────────────────────
  
  Play until HP = 0
  ├─ One player HP drops to 0
  │   ↓
  ← Game End Sync →
  │   ↓
  └─ Victory Screen
    ├─ Host: 🏆 ชนะแล้ว! (HP: 8/20)
    └─ Guest: 💀 แพ้แล้ว... (HP: 0/20)
```

---

## 🔄 Realtime Sync Architecture

```
┌─────────────────────────────────────────────────────┐
│             SUPABASE REALTIME                       │
│                                                     │
│  Channel: pvp:{roomCode}                           │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  Host (Publisher)                          │   │
│  │  ─────────────────                         │   │
│  │  • submitAnswer()                          │   │
│  │  • broadcast('answer', payload)            │   │
│  │    └─ Sent to channel                      │   │
│  └────────────────────────────────────────────┘   │
│                    ↓ Network                       │
│        Supabase Realtime Broadcast                │
│                    ↓ Network                       │
│  ┌────────────────────────────────────────────┐   │
│  │  Guest (Subscriber)                        │   │
│  │  ─────────────────                         │   │
│  │  • Listening on channel                    │   │
│  │  • onAnswer(payload)                       │   │
│  │    └─ Received from channel                │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

Events Broadcast:
• rps_pick: RPS choice selection
• rps_reveal: RPS result reveal
• answer: Question answer + damage
• item_used: Item activation
• lucky_pick: Lucky box selection
• state_sync: Full state update
• color_change: Player color change
• guest_joined: Guest enters room
• ready: Player ready to start
• disconnect: Player disconnected
```

---

## ✅ Quick Deployment Checklist

```
PHASE 1: DATABASE (5 min)
───────────────────────────
□ Supabase Dashboard: QUIZSLAYER project open
□ SQL Editor: pvp_setup.sql executed ✓ (0 errors)
□ Tables: pvp_rooms + pvp_sessions created ✓
□ RLS: All policies enabled ✓
□ Realtime: pvp_rooms published ✓


PHASE 2: LOCAL (5 min)
───────────────────────────
□ npm install: success
□ .env variables: all set
□ npm run dev: running
□ http://localhost:5173: page loads


PHASE 3: MOCK (15 min)
───────────────────────────
□ Create room: works
□ Join room (same device): works
□ RPS phase: works
□ Battle: HP updates
□ Lucky box: every 5 questions
□ Game finish: victory screen
□ No console errors


PHASE 4: REALTIME (20 min)
───────────────────────────
□ Device 1: Host creates room ✓
□ Device 2: Guest joins ✓ (realtime sync)
□ RPS: Both same result ✓
□ Battle: HP synced ✓
□ Turn switching: correct ✓
□ Lucky box: both same cards ✓
□ Game finish: both same winner ✓


PHASE 5: EDGE CASES (20 min)
───────────────────────────
□ Network disconnect: handled
□ Page refresh: handled
□ Invalid code: error shown
□ Multiple guests: rejected
□ Rapid clicks: only first counts
□ Slow network: still works


PHASE 6: PRODUCTION (10 min)
───────────────────────────
□ npm run build: success (0 errors)
□ npm run preview: works
□ Deploy: success
□ Production 2P test: works
□ No CORS errors
□ Assets load


═══════════════════════════════════════════
TOTAL TIME: ~70 minutes
STATUS: Ready for Live ✅
═══════════════════════════════════════════
```

---

## 🎯 Key Decision Points

```
START
  ↓
Database Setup Complete?
  ├─ NO → Go to Phase 1: Database
  └─ YES ↓
    ↓
Local Environment Ready?
  ├─ NO → Go to Phase 2: Local Dev
  └─ YES ↓
    ↓
Mock Mode Works (1 person)?
  ├─ NO → Debug Phase 3
  │       (check store, components)
  └─ YES ↓
    ↓
Realtime Works (2 people)?
  ├─ NO → Debug Phase 4
  │       (check Realtime config)
  └─ YES ↓
    ↓
Edge Cases Passed?
  ├─ NO → Debug Phase 5
  │       (check network handling)
  └─ YES ↓
    ↓
Production Build OK?
  ├─ NO → Debug Phase 6
  │       (check build errors)
  └─ YES ↓
    ↓
Live Test Passed?
  ├─ NO → Troubleshoot
  │       (see PVP_TROUBLESHOOTING.md)
  └─ YES ↓
    ↓
🎉 READY TO PROMOTE LIVE
```

---

## 📞 Support Resources

**Stuck?** Check these in order:

1. **Quick Start** → `PVP_QUICK_START.md` (15 min overview)
2. **Full Guide** → `PVP_DEPLOYMENT_GUIDE.md` (detailed steps)
3. **Testing** → `PVP_TESTING_CHECKLIST.md` (mark your progress)
4. **Errors** → `PVP_TROUBLESHOOTING.md` (fix problems)

---

## 🕐 Time Estimates

| Phase | Task | Time |
|-------|------|------|
| 1 | Database Setup | 5 min |
| 2 | Local Dev Setup | 5 min |
| 3 | Mock Mode Test | 15 min |
| 4 | 2-Player Test | 20 min |
| 5 | Edge Cases | 20 min |
| 6 | Production | 10 min |
| **Total** | **All Phases** | **~70 min** |

---

**Ready? Start with Phase 1! 🚀**
