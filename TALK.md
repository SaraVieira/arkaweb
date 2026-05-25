# Arkanoid in 25 minutes — talk plan

## Pre-talk setup (do at home, on hotel wifi)

### Branch 1 — `talk-demo` (the finished demo, current branch)
Already done. Plays clean, one level, no scores/homepage. This is what you open and play in the hook.

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

### 0:00–1:30 — Hook (no code)
Open `talk-demo` running in a browser tab. Play 20 seconds, die on purpose, show the GAME OVER overlay. Close it.

> "That's where we're going. Let's build it from this."

Switch to `talk-start`, browser shows black screen.

### 1:30–5:00 — Bouncing ball in a box (live type, ~25 lines)
`walls.tsx` + `useGameBounds.ts` are pre-staged. Open them briefly to show what's inside, then in `App.tsx` type: `<Canvas>` + lights + `<Physics gravity={[0,0,0]}>` + `<Walls />` + an inline `<RigidBody>` (restitution 1, friction 0, lockRotations, `linearVelocity={[6, -8, 0]}`) wrapping a `<sphereGeometry>`.

**The very first visible thing on screen is the ball bouncing forever between the walls.** No cube. No empty Canvas — the ball is the opener.

**Talking points**: R3F is React components rendering Three.js (every tag is a `THREE.Whatever`). Rapier gives colliders as JSX too. Zero gravity because Arkanoid is a 2D game pretending to be 3D. Walls aren't visible — they're just colliders. Add `debug` to `<Physics>` to see them, then remove.

### 5:00–9:00 — Paddle as a plain mesh (paste `paddle.tsx` + `usePaddle.ts`)
Paddle is a `<boxGeometry args={[4, 0.5, 0.5]} />` with a red `meshStandardMaterial` inside the `RigidBody`. No GLB yet — that's a polish swap later. Arrow keys move it; it can now intercept the ball.

**Talking points**: kinematic body vs dynamic, why paddle position is updated outside React in a ref (frame-loop perf), how the paddle deflection works (offset-from-center → exit angle). Live-edit `BALL_SPEED` or paddle width in `consts.ts` to show HMR.

### 9:00–13:00 — Ball upgrade: Trail + state machine (paste `ball.tsx` + `useBall.ts` + minimal `game-store.ts`)
Replace the inline `<RigidBody>` from beat 2 with the proper `<Ball />` component: Trail visual, speed-clamp via `useFrame`, `MIN_VY_RATIO` guard, floor-death wired to `GAME_STATE.GAME_OVER`. Introduces a minimal `game-store.ts` with `paddlePositionRef`, `gameStateAtom`, `livesAtom`, `gameStartTimeAtom`, `playDurationAtom`. Game state defaults to `PLAYING` — no overlays yet.

**The crucial moment**: explain `restitution: 1` + `MIN_VY_RATIO`. Live-edit the ratio to `0` → ball goes purely horizontal forever → restore to `0.25` → *"this is the only line of code that prevents the game from being broken."*

### 13:00–17:30 — Bricks (paste `enemy.tsx` + `useEnemy.ts` + `useParticles.ts` + `models/enemy.tsx`, replace `game-store.ts` with full)
Open `level-01.json` in the side pane.

> "This JSON is the level."

Full `game-store.ts` now has `enemiesAtom`, `loadLevelAtom`, `destroyEnemyAtom`. App.tsx adds a `useEffect` to load level + a `useMemo` mapping enemies to `<Enemy />`. Hit one — it explodes with particles.

**Talking points**: Jotai as a state-machine layer separate from R3F, hits-to-destroy lookup table, why dying bricks switch from RigidBody to plain `<group>`.

### 17:30–20:30 — HUD + overlays (paste `overlay.tsx` + HUD div + space-to-start wiring)
Score updates, lives count down. SPACE launches from READY. GAME OVER and YOU WIN overlays appear. Game is playable end-to-end.

### 20:30–23:30 — The polish reveal (4 pastes, big visual jumps)
1. Add `<Environment files="/venice_sunset_2k.exr" />` → suddenly everything reflects sunset lighting.
2. Paste `Effects.tsx` and drop it in → bloom + chromatic aberration + scanlines kick in.
3. Paste `Background.tsx` → the dark teal grid background appears.
4. **Swap the paddle mesh for the GLB**: paste `src/models/paddle.tsx`, change `<mesh><boxGeometry /></mesh>` in `paddle.tsx` to `<PaddleModel scaleRef={paddleScaleX} />`. Paddle goes from a red box to a proper 3D model.

Four pastes, four "ohh" moments. This is the showstopper.

### 23:30–25:00 — "And here's where it goes"
Open `talk-demo` in another tab. Show:

- More levels in `src/levels/` (drag the JSON viewer open)
- Change one cell to `"silver"` live in `level-01`, save, watch the brick render differently in `talk-start`. *"The whole level format is one JSON file. That's the extension story."*
- Tease: scoring, leaderboard, level editor exist on `main` — link to GitHub.

## Safety nets

- **`talk-demo` is one terminal away**: if any paste blows up at minute 14, switch tabs and demo the finished version while you fix off-screen. The audience never knows.
- **HMR breakage with Rapier**: if collisions go weird mid-talk, hit reload — don't debug live.
- **Git checkpoints**: commit after each beat in `talk-start` so `git reset --hard HEAD` recovers if you mistype during the live edits (beat 2 type + beat 4 MIN_VY_RATIO).
- **Cut order if behind**: skip the GLB paddle swap, then the Background paste, then the particles in `useParticles` (paste a stub that just removes bricks without explosion), then the Effects.

## Risks

- **Beat 2 is typed live.** Practice the ~25 lines until your fingers know them. If you blank, paste from SNIPPETS.md.
- **Beat 4 (ball upgrade) is the hard one.** useBall hook, ball.tsx, minimal game-store paste in one beat. The `MIN_VY_RATIO` live-edit is the highlight — don't skip it.
- **The polish reveal carries the talk.** If you have to cut for time, cut earlier beats — never this one.
