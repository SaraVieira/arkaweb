# Arkanoid in 25 minutes — talk plan

## Pre-talk setup (do at home, on hotel wifi)

### Branch 1 — `talk-demo` (the finished demo, current branch)
Already done. Plays clean, one level, no scores/homepage. Kept running in a background tab — you'll switch to it in the **finale (beat 13)**, not the hook.

### Branch 2 — `talk-start` (the empty starting point)
New branch off `talk-demo`. Strip everything down to:

- `package.json` with all deps already in `node_modules` (drei, fiber, rapier, jotai, meshline, three, postprocessing, tailwindcss)
- `vite.config.ts`, `index.html`, `src/styles.css`, `src/main.tsx` rendering `<App />`
- `src/App.tsx` containing **only** an empty `<Canvas>` from R3F — black screen on load
- `public/` with the HDRI, sounds, GLB models, fonts — pre-positioned so paths in pasted code Just Work
- `src/lib/consts.ts` — keep, it's just numbers worth showing once
- `src/levels/` — keep `schema.ts` + `level-01.json` (the data the audience sees as input)
- That's it. No `components/`, no `lib/hooks/`, no `lib/game-store.ts`, no models

### Snippets file
A single `~/talk/snippets.md` with each paste-block in order, numbered. Open in a split editor on stage. Each block is exactly what's in the corresponding file in `talk-demo`.

### Verify offline
Turn wifi off, run `pnpm dev` on `talk-start`, then walk through each paste end-to-end. If anything tries to fetch from a CDN or trigger an install, find it now.

## The 25 minutes

### 0:00–0:30 — Hook (one sentence, no demo)
Open `talk-start` in the browser. Audience sees the orange placeholder cube. Single line:

> "You know arkanoid — paddle, ball, bricks. We're going to build it in React Three Fiber in 25 minutes. Live coding, mostly paste, some typing. Let's start by deleting this cube."

No demo of the finished game. The polish reveal (beat 12) and the closer (beat 13) carry the "look what we made" moment — keeping it hidden makes them land harder.

### 0:30–1:00 — Strip the starter cube
The starter has an orange placeholder cube so you can prove the dev server's up. First on-stage action: delete the cube + the unused drei import. Black screen.

### 1:00–1:30 — Add lights
Type two lines: `<ambientLight />` + `<directionalLight />`. Still black — nothing to light.

**Talking point**: R3F is React rendering Three.js. Every JSX tag becomes `new THREE.Whatever()`.

### 1:30–2:30 — Add a ball (mesh only)
Type `<mesh><sphereGeometry /><meshStandardMaterial /></mesh>`. White sphere appears at origin, static.

### 2:30–5:00 — Make it bounce
Open `walls.tsx` + `useGameBounds.ts` (pre-staged) briefly. Then in App.tsx: wrap in `<Physics gravity={[0,0,0]}>`, add `<Walls />`, wrap the ball mesh in `<RigidBody>` with `restitution={1}`, `friction={0}`, `lockRotations`, `linearVelocity={[6, 8, 0]}`. Ball bounces around — and eventually drifts past the open bottom.

**Narration cue (don't skip)**: when the ball escapes, say *"and now we need something to catch this."* Sets up beat 6.

**Talking point**: `restitution: 1` = perfectly elastic. `friction: 0` = no drag. Zero gravity because arkanoid is 2D pretending to be 3D.

### 5:00–7:30 — The paddle (mesh + arrows in one shot)
Paste minimal `usePaddle.ts` (~30 lines: keys + `useFrame` translating x), then `paddle.tsx` (kinematic RigidBody + red box). Wire `<Paddle />` into App.tsx. Paddle exists *and* responds to arrows in the same beat — no dead-end "static paddle" interlude.

**Talking point**: `kinematicPosition` = we set position via code, physics doesn't push it around. Position updated in `useFrame`, not React state — keeps the render loop out of reconciliation.

### 7:30–9:30 — Paddle deflects the ball ← THE INSIGHT BEAT
Add `onCollisionEnter` to `usePaddle`: offset from paddle center → exit angle. Wire to `<RigidBody>`. Now where you hit the paddle changes the ball's direction. **This is what makes it a game.** Live-edit `PADDLE_MAX_ANGLE` in `consts.ts` to a **pre-decided** `2.5` (don't take audience suggestions — higher can tunnel) to show the ball flying near-horizontal. Restore to `1.15`.

### 9:30–12:00 — Ball: Trail + speed clamp + `MIN_VY_RATIO` ← THE OTHER INSIGHT BEAT
Paste a minimal `useBall.ts` (~20 lines) — just speed clamp + horizontal guard. Paste `ball.tsx` wrapping the existing RigidBody in `<Trail>`. Replace inline ball in App.tsx with `<Ball />`. Live-edit `MIN_VY_RATIO` to `0` → ball ends up purely horizontal forever → restore to `0.25`. *"This single line is what stops the game from being broken."*

### 12:00–15:30 — Bricks (3 small sub-steps)
**9a (1 min)**: paste a 12-line `Enemy` (plain white box). App.tsx expands the level grid into positions with `useMemo`, renders `<Enemy>` per cell. 24 white bricks.
**9b (30 sec)**: add a `type → color` map in Enemy. Edit `level-01.json` live: one cell `→ "silver"`, another `→ "gold"`. *"This is what types add."* Leave the edits in place.
**9c (2 min)**: paste a 14-line `game-store.ts` (just `enemiesAtom` + `destroyEnemyAtom`). Move generation into `useEffect`. Wire `onCollisionEnter` on Enemy. Bricks vanish on first hit.

No hit-count logic, no `useEnemy` hook, no particles, no death animation — those live in `talk-demo`. Mention in passing: *"in the production version, silver takes 2 hits and gold takes 3."*

### 15:30–17:30 — State machine wiring (no UI yet)
The ball can hit bricks but can't lose. Add the lose condition. Replace `game-store.ts` with the full state machine + `buildEnemies` helper (which lets `enemiesAtom` self-initialise). usePaddle gets one line (`paddlePositionRef.current = x.current`). Replace `useBall.ts` and `ball.tsx` with state-aware versions (READY spawn pose, floor collider → GAME_OVER). Ball falls past paddle → lives go down (silently, no UI yet) → eventually GAME_OVER and ball freezes.

**Success criterion**: game mechanically over, just looks dead. UI is the next beat.

### 17:30–19:30 — HUD + overlays
Paste `overlay.tsx`. Replace App.tsx with HUD (score, lives) + space-to-start handler + state-machine overlays (READY / PAUSED / GAME_OVER / WON). SPACE launches, score updates, dying triggers GAME OVER → Play again restarts. Clear all bricks → YOU WIN → Play again restarts.

### 19:30–22:30 — The polish reveal (4 pastes, four "oohs")
1. `<Environment files="/venice_sunset_2k.exr" />` → sunset reflections.
2. `Effects.tsx` → bloom + chromatic aberration + scanlines.
3. `Background.tsx` → dark teal grid behind the scene.
4. **GLB paddle swap**: paste `models/paddle.tsx`, swap the `<boxGeometry>` for `<PaddleModel scaleRef={paddleScaleX} />`. Red box → 3D model.

### 22:30–25:00 — Finale: "with more hours, I did this"
This is now a real reveal, not a teaser. Audience has spent 22 minutes watching you build the bare game. Now you show what it can become.

> "That took 25 minutes. With a few more weekends I did this —"

**Switch to `talk-demo` running in another tab.** Play 30 seconds. Now they see:
- The same code they just watched you write, polished — full state machine, level transitions, sounds
- Particles when bricks explode
- Silver and gold bricks taking multiple hits (the production-version mention from beat 9c now visible)

Then `git checkout main` (or open the prod URL in another tab):
- Homepage with 3D text + "Start game" link
- The `/editor` route — visual level editor where you drag bricks around
- 8 levels instead of 1
- Leaderboard with submitted scores

**Closing line**: *"Everything you saw — leaderboard, editor, levels — is just more components on top of the core we built today. That's R3F. Thanks."*

The audience leaves having seen the destination *after* understanding how to get there, not before. The "ohh" lands as discovery, not as confirmation.

## Safety nets

- **`talk-demo` is one terminal away** for *reference*, not for showing. If a paste breaks, peek at the working version (or `git diff talk-demo -- <file>`) to spot the typo — don't switch tabs to play it for the audience, you'll spoil the finale. If you must stall, just rehearse the next beat verbally while typing the fix.
- **HMR breakage with Rapier**: if collisions go weird mid-talk, hit reload — don't debug live.
- **Git checkpoints**: commit after each beat in `talk-start` so `git reset --hard HEAD` recovers if you mistype during a live edit (beats 7 and 8 have live edits).
- **Cut order if behind**: skip the GLB paddle swap → skip the Background paste → skip the Effects paste → cut the "live edit" demos on beats 7/8 (just describe instead).

## Risks

- **Beats 2–5 are all typed live** (small bits each). They're short but back-to-back — rehearse the transitions.
- **Beats 7 and 8 are the insight beats.** Paddle deflection (offset → angle) and `MIN_VY_RATIO` (the horizontal-stuck fix). Don't rush these — they're the "huh" moments the audience came for.
- **Beat 10 is the heaviest paste** — game-store + useBall + ball.tsx + usePaddle edit. One missed paste cascades. Rehearse this transition twice. Success criterion is *"ball dies on floor escape, GAME_OVER state fires"*, even though nothing's rendered yet.
- **The polish reveal carries the talk.** If you have to cut for time, cut earlier beats — never this one.
