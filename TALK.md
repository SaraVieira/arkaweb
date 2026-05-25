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

### 1:30–4:00 — Scene & camera (live type, ~30 lines)
In `App.tsx`: `<Canvas camera={{ position: [0, 5, 24], fov: 50 }}>` + ambientLight + directionalLight + a hardcoded `<mesh><boxGeometry /></mesh>`. Audience sees a grey cube.

**Talking point**: R3F is just React components that render Three.js — every JSX tag is a `THREE.Whatever`.

### 4:00–7:00 — Walls (paste `walls.tsx` + `useGameBounds.ts`, paste `consts.ts` if not present)
Wrap everything in `<Physics gravity={[0,0,0]}>`. Add `<Walls />`. Cube is now boxed in.

**Talking point**: Rapier gives us colliders as JSX too. Zero gravity because Arkanoid is a 2D game pretending to be 3D.

### 7:00–11:00 — Paddle (paste `paddle.tsx` + `usePaddle.ts` + `src/models/paddle.tsx`)
Arrow keys move the paddle.

**Talking points**: kinematic body vs dynamic, the GLB import, why position is updated outside React in a ref (frame-loop perf). Live-edit `BALL_SPEED` or paddle width in `consts.ts` to show HMR.

### 11:00–15:30 — Ball (paste `ball.tsx` + `useBall.ts`)
Ball bounces forever.

**The crucial moment**: explain `restitution: 1` + `MIN_VY_RATIO`. Live-edit the ratio to 0 → ball goes horizontal forever → reset to 0.25 → "this is the only line of code that prevents the game from being broken."

### 15:30–19:00 — Bricks (paste `enemy.tsx` + `useEnemy.ts` + `useParticles.ts` + `models/enemy.tsx` + `game-store.ts`)
Open `level-01.json` in the side pane.

> "This JSON is the level."

Game.tsx already iterates `enemiesAtom`, so once `game-store` is pasted, bricks appear. Hit one — it explodes with particles.

**Talking points**: Jotai as a state-machine layer separate from R3F, hits-to-destroy lookup table, why dying bricks switch from RigidBody to plain `<group>`.

### 19:00–21:30 — HUD + overlays (paste `overlay.tsx` + the HUD div + game-over wiring)
Score updates, lives count down, GAME OVER appears. Game is playable end-to-end.

### 21:30–23:30 — The polish reveal (3 pastes, big visual jumps)
1. Add `<Environment files="/venice_sunset_2k.exr" />` → suddenly everything reflects sunset lighting.
2. Paste `Effects.tsx` and drop it in → bloom + chromatic aberration + scanlines kick in.
3. Paste `Background.tsx` → the starfield/space background appears.

Three pastes, three "ohh" moments. This is the showstopper.

### 23:30–25:00 — "And here's where it goes"
Open `talk-demo` in another tab. Show:

- More levels in `src/levels/` (drag the JSON viewer open)
- Change one cell to `"silver"` live in `level-01`, save, watch the brick render differently in `talk-start`. *"The whole level format is one JSON file. That's the extension story."*
- Tease: scoring, leaderboard, level editor exist on `main` — link to GitHub.

## Safety nets

- **`talk-demo` is one terminal away**: if any paste blows up at minute 14, switch tabs and demo the finished version while you fix off-screen. The audience never knows.
- **HMR breakage with Rapier**: if collisions go weird mid-talk, hit reload — don't debug live.
- **Git checkpoints**: commit after each beat in `talk-start` so `git reset --hard HEAD` recovers if you mistype during the live edits in beats 4 and 11.
- **Cut order if behind**: skip the Background paste (23:00), then the particles in `useParticles` (you can paste a stub that just removes bricks without explosion), then the Effects.

## Risks

- **25 min is tight for 8 pastes.** Time yourself in rehearsal — first run will go 35–40min, you'll need to trim banter.
- **Beat 11 (the ball) is the hard one.** Two files, the deflection math, the floor-collider. Rehearse this twice as much as the others.
- **The polish reveal carries the talk.** If you have to cut for time, cut earlier beats — never this one.
