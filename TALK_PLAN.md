# Arkanoid R3F Talk — Game Plan

25-minute live-coding talk. Plain Vite, no SSR, no scores. Build an Arkanoid clone from scratch with React Three Fiber, Rapier, Jotai, and post-processing.

---

## Pre-talk setup (night before)

### Starter repo

```bash
pnpm create vite arkaweb-talk --template react-ts
cd arkaweb-talk
pnpm add three @react-three/fiber @react-three/rapier @react-three/drei @react-three/postprocessing jotai
pnpm dev
```

Strip `App.tsx` to `<div>hello</div>`. Verify it runs. Commit as `step-0-empty`.

### Build the whole talk once, tagging checkpoints

Work through every section end-to-end. After each section, tag the result. These tags are your rescues if anything goes wrong on stage.

```bash
git tag step-0-empty       # fresh vite + deps, empty App
git tag step-1-canvas      # Canvas + lights + static paddle mesh
git tag step-2-physics     # Physics, walls, bouncing ball
git tag step-3-paddle      # Paddle deflection working
git tag step-4-state       # Jotai store, enemies, levels, scoring
git tag step-5-juice       # Trail, particles, paddle squash
git tag step-6-final       # Post-processing complete
```

### Maccy clipboard — pin these (in reverse paste order so newest = first)

1. Canvas + lights boilerplate (full lighting setup)
2. Walls (3 `<RigidBody>` blocks with `CuboidCollider`)
3. `usePaddle` scaffold — **with deflection block missing** (that's the typed bit)
4. Levels TS array + grid constants (`CELL_WIDTH`, `START_X`, etc.)
5. `game-store.ts` atom skeleton — everything except `destroyEnemyAtom`
6. `Enemy` component + `loadLevel` helper
7. `<Trail>` wrapper for ball
8. `useEnemy` particle/dying block
9. `<EffectComposer>` with all 4 effects commented out

### Last checks

- Editor font size 16-18pt minimum
- Slack/Discord/notifications off
- Dev server runs cleanly
- Browser sized next to editor (no fiddling on stage)
- Second window with finished repo open as cheat sheet
- `paddle.glb` in `public/` if using GLB models (or skip — a box mesh works fine)

---

## The talk

### 0:00–0:30 — Hook

Show the finished game running. Play one level. "We're building this in 25 minutes. Plain Vite, no backend. Let's go."

### 0:30–3:00 — Mental model (~2.5 min)

No code. The pitch:

- R3F is React for THREE.js. JSX tree → 3D scene graph
- Tonight: Canvas → physics → state → polish
- Skip the slide deck, open the editor

### 3:00–7:00 — Scene basics (~4 min)

**Type live:**

```tsx
import { Canvas } from "@react-three/fiber"

export default function App() {
  return (
    <Canvas style={{ height: "100vh" }}>
      <ambientLight intensity={0.5} />
      <mesh>
        <boxGeometry args={[4, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </Canvas>
  )
}
```

Paddle on screen. "That's it. JSX. No imperative scene setup."

**Paste from Maccy:** fuller lighting setup (directional + shadows + camera position). Pan over: "standard 3D lighting, nothing R3F-specific."

**Rescue tag:** `step-1-canvas`

### 7:00–13:00 — Physics + paddle feel (~6 min) ← the big one

**Type live:**

```tsx
import { Physics, RigidBody } from "@react-three/rapier"

<Canvas>
  <Physics gravity={[0, 0, 0]}>
    <RigidBody type="kinematicPosition">
      {/* paddle mesh */}
    </RigidBody>
    <RigidBody colliders="ball" restitution={1}>
      <mesh><sphereGeometry args={[0.5]} /></mesh>
    </RigidBody>
  </Physics>
</Canvas>
```

**Paste:** walls (3 fixed `<RigidBody>` with `CuboidCollider`).

Run it. Ball bounces in a box. **First "oh" moment.** Pause. Let it land.

**Paste:** `usePaddle` scaffold — keyboard listeners, refs, useFrame moving the kinematic body. "Standard kinematic body movement. Watch this part though." Scroll to the empty `onCollisionEnter`.

**Type live, slowly:**

```ts
const offset = (ballX - x.current) / PADDLE_HALF_WIDTH
const clamped = Math.max(-0.5, Math.min(0.5, offset))
const angle = clamped * PADDLE_MAX_ANGLE
ball.setLinvel({
  x: Math.sin(angle) * BALL_SPEED,
  y: Math.cos(angle) * BALL_SPEED,
  z: 0,
})
```

Narrate: "Where the ball hits the paddle decides the angle. Center = straight up. Edge = sharp angle. That's the entire Arkanoid feel in five lines."

Run. Hit edges. **Second "oh" moment.**

**Rescue tag:** `step-3-paddle`

### 13:00–17:00 — State + levels (~4 min)

**Paste:** `levels.ts` (TS file with a grid array) + grid-to-world constants. "Levels are just data. A grid of `'normal' | 'silver' | 'gold' | null`."

**Paste:** `game-store.ts` skeleton — `scoreAtom`, `livesAtom`, `enemiesAtom`, `gameStateAtom`. Walk through in 30 seconds. "Jotai atoms instead of Redux. Each one's a primitive."

**Type live:**

```ts
export const destroyEnemyAtom = atom(null, (get, set, { id, type }) => {
  set(removeEnemyAtom, id)
  set(scoreAtom, get(scoreAtom) + POINTS[type])
  if (Object.keys(get(enemiesAtom)).length === 0) {
    set(gameStateAtom, GAME_STATE.LEVEL_COMPLETE)
  }
})
```

"This is the whole game loop in 6 lines. Remove enemy, score, check win condition."

**Paste:** `Enemy` component (RigidBody calling `destroyEnemy` on collision) + `loadLevel` (grid → enemy atoms).

Run. Play. Score climbs. Level clears.

**Rescue tag:** `step-4-state`

### 17:00–21:00 — Game feel polish (~4 min)

Three quick wins, each ~75 sec. **Don't type these — paste and narrate.**

**1. Ball trail.** Paste `<Trail>` wrapping the ball mesh:

```tsx
<Trail width={0.6} length={7} decay={1}>
  <RigidBody>...ball...</RigidBody>
</Trail>
```

Run. Streak appears. "Drei's `<Trail>`. Free."

**2. Enemy death particles.** Paste the dying state + particle system from `useEnemy`. Run. Hit an enemy. Explosion. "Buffer geometry, points material, additive blending. The trick: don't unmount on hit — transition to a `dying` state, animate, *then* unmount."

**3. Paddle squash.** Paste the bounce animation. "Scale-x bump on contact. 6 lines. This is the difference between 'a paddle' and 'a paddle that feels alive.'"

**Rescue tag:** `step-5-juice`

### 21:00–24:00 — Post-processing (~3 min) ← the closer

**Paste:** `<EffectComposer>` with Bloom, Outline, ChromaticAberration, Scanline all commented out.

Live, one at a time:

- Uncomment **Bloom** → save → glow appears. "One line."
- Uncomment **Outline** → save → bright edges. "One line."
- Uncomment **ChromaticAberration** + **Scanline** → save → CRT arcade look. "Two lines."

Stop typing. Let it sit on screen.

"That's R3F. JSX scene graph, physics in a wrapper component, atoms for state, drei + postprocessing for polish. The whole game is under 1000 lines."

**Rescue tag:** `step-6-final`

### 24:00–25:00 — Wrap + Q&A

Repo URL on screen ("tags are the chapters"). Take questions.

---

## What to type vs. paste — cheat sheet

| Section | Type live | Paste |
|---|---|---|
| Scene | Canvas + first mesh | Lights, camera tuning |
| Physics | Physics wrapper, RigidBody, **paddle deflection** | Walls, paddle scaffold |
| State | **destroyEnemyAtom** | Other atoms, Enemy, loadLevel |
| Polish | Nothing | Trail, particles, squash |
| Post-fx | Uncommenting effects | EffectComposer setup |

**Rule:** type the *idea* (5-15 lines), paste the *plumbing*.

---

## Recovery playbook

- **Bug you can't fix in 30s:** `git reset --hard step-N`, narrate "I'll grab the working version, this is the interesting part anyway," carry on.
- **5+ min over:** skip section 5 entirely. Jump straight to post-fx. It's the strongest closer.
- **5 min under:** linger on section 3 with the deflection — explain why purely-horizontal motion is killed (`MIN_VY_RATIO`).
- **Demo doesn't work:** finished repo in second window. Switch. Nobody cares.

---

## Morning of

- Dry-run section 3 once. Just that one. If the deflection types out smoothly, the talk works.
- Charge laptop fully + bring charger.
- Close every app except editor, browser, Maccy.
- Water on stage.
