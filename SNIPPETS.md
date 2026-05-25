# Arkanoid talk — paste snippets

Open this in a side editor. Each beat below has the files to paste in order. The matching beat in `TALK.md` says what to talk about while pasting.

The starter (`talk-start` branch) has every file you'll touch already in place:

- **Filled**: `src/lib/consts.ts`, `src/lib/hooks/useGameBounds.ts`, `src/components/walls.tsx`, `src/levels/*`, `src/styles.css`, `src/types/meshline.d.ts`, `public/*` (HDRI, sounds, GLBs, fonts), `src/App.tsx` (empty Canvas)
- **Empty (paste into them, don't create them)**: `src/lib/game-store.ts`, `src/lib/hooks/usePaddle.ts`, `src/lib/hooks/useBall.ts`, `src/lib/hooks/useEnemy.ts`, `src/lib/hooks/useParticles.ts`, `src/components/paddle.tsx`, `src/components/ball.tsx`, `src/components/enemy.tsx`, `src/components/overlay.tsx`, `src/components/Effects.tsx`, `src/components/Background.tsx`, `src/models/paddle.tsx`, `src/models/enemy.tsx`

Each paste step below says "paste into X" — the file is already there, you just open it (Cmd+P → name → paste).

---

## Beat 2 (0:30–1:00) — Strip to nothing

`src/App.tsx` ships with an orange placeholder cube so you can prove the dev server's up. First on-stage action: delete the cube and the unused drei import. The Canvas stays. Black screen.

```tsx
import { Canvas } from "@react-three/fiber";

export function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas camera={{ position: [0, 5, 24], fov: 50 }} />
    </div>
  );
}
```

✅ Black screen. Camera's positioned at `[0, 5, 24]` looking at origin — we just have nothing to render yet.

---

## Beat 3 (1:00–1:30) — Add lights

Type two lines inside `<Canvas>`:

```tsx
<ambientLight intensity={0.2} />
<directionalLight position={[10, 15, 8]} intensity={2} />
```

✅ Still black — lights with nothing to illuminate are invisible.

**Talking point**: R3F is React rendering Three.js — every JSX tag becomes `new THREE.Whatever()`.

---

## Beat 4 (1:30–2:30) — Add a ball

Add a sphere mesh after the lights:

```tsx
<mesh>
  <sphereGeometry args={[0.5, 32, 32]} />
  <meshStandardMaterial color="white" />
</mesh>
```

✅ White sphere at origin, static. The directional light now bounces off it.

---

## Beat 5 (2:30–5:00) — Make it bounce

`src/components/walls.tsx` + `src/lib/hooks/useGameBounds.ts` are pre-staged. Open them briefly to show: three `<RigidBody><CuboidCollider />` blocks (left/right/ceiling — no floor) plus a viewport-bounds hook.

Then in `App.tsx`:

1. Import `Physics`, `RigidBody`, `Walls`.
2. Wrap the lights + ball in `<Physics gravity={[0, 0, 0]}>`.
3. Add `<Walls />` inside Physics.
4. Wrap the ball `<mesh>` in a `<RigidBody>` with the four physics knobs + initial velocity.

```tsx
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Walls } from "#/components/walls";

export function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas camera={{ position: [0, 5, 24], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 15, 8]} intensity={2} />
        <Physics gravity={[0, 0, 0]}>
          <Walls />
          <RigidBody
            colliders="ball"
            restitution={1}
            friction={0}
            lockRotations
            linearVelocity={[6, 8, 0]}
          >
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </RigidBody>
        </Physics>
      </Canvas>
    </div>
  );
}
```

✅ Ball bounces between left/right/ceiling. After a few bounces it drifts past the open bottom and escapes — *"we need to catch this thing."*

**Talking points**: `restitution: 1` = perfectly elastic (no energy loss). `friction: 0` = no drag. Zero gravity because arkanoid is 2D pretending to be 3D. Walls are colliders, not visible — toggle `<Physics debug>` to see them, then remove.

---

## Beat 6 (5:00–7:30) — The paddle (mesh + arrows in one shot)

Open the empty `src/lib/hooks/usePaddle.ts`, paste the minimal version (~30 lines — keys + frame-loop movement):

```ts
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { useGameBounds } from "./useGameBounds";

const PADDLE_HALF_WIDTH = 2;
const PADDLE_BOTTOM_OFFSET = 1.5;
const SPEED = 24;

export function usePaddle() {
  const keys = useRef<Record<string, boolean>>({});
  const ref = useRef<RapierRigidBody | null>(null);
  const x = useRef(0);
  const bounds = useGameBounds();
  const minX = bounds.left + PADDLE_HALF_WIDTH;
  const maxX = bounds.right - PADDLE_HALF_WIDTH;
  const paddleY = bounds.bottom + PADDLE_BOTTOM_OFFSET;

  useFrame((_, delta) => {
    const step = SPEED * delta;
    if (keys.current.ArrowLeft) x.current -= step;
    if (keys.current.ArrowRight) x.current += step;
    x.current = Math.max(minX, Math.min(maxX, x.current));
    ref.current?.setNextKinematicTranslation({ x: x.current, y: paddleY, z: 0 });
  });

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
    const onUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  return { ref };
}
```

Open the empty `src/components/paddle.tsx`, paste:

```tsx
import { RigidBody } from "@react-three/rapier";
import { usePaddle } from "#/lib/hooks/usePaddle";

export function Paddle() {
  const { ref } = usePaddle();
  return (
    <RigidBody ref={ref} colliders="cuboid" type="kinematicPosition">
      <mesh>
        <boxGeometry args={[4, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}
```

In `App.tsx`, import `Paddle` and drop `<Paddle />` inside `<Physics>` after `<Walls />`.

✅ Red paddle, arrow keys move it. Ball bounces off it (at the angle it came in — fixed in the next beat).

**Talking points**: `kinematicPosition` = we set position via code, physics doesn't push it around. `dynamic` would fall away when hit. Position updated in `useFrame` (every frame), not React state — keeps the render loop out of React's reconciliation.

---

## Beat 7 (7:30–9:30) — Make the paddle deflect the ball

This is the "huh" insight. Right now ball bounces off paddle at whatever angle it came in. In real arkanoid, **where** you hit the paddle changes the exit angle — that's the whole game.

Add to `src/lib/hooks/usePaddle.ts` (above the `useEffect`):

```ts
import { BALL_SPEED, PADDLE_MAX_ANGLE } from "../consts";

// inside usePaddle, near the other handlers:
const onCollisionEnter = ({
  other,
}: { other: { rigidBody?: RapierRigidBody } }) => {
  const ball = other.rigidBody;
  if (!ball) return;
  const offset = (ball.translation().x - x.current) / PADDLE_HALF_WIDTH;
  const clamped = Math.max(-0.5, Math.min(0.5, offset));
  const angle = clamped * PADDLE_MAX_ANGLE;
  ball.setLinvel(
    { x: Math.sin(angle) * BALL_SPEED, y: Math.cos(angle) * BALL_SPEED, z: 0 },
    true,
  );
};

// then in the return:
return { ref, onCollisionEnter };
```

Edit `src/components/paddle.tsx` — wire it up:

```tsx
const { ref, onCollisionEnter } = usePaddle();
// ...
<RigidBody
  ref={ref}
  colliders="cuboid"
  type="kinematicPosition"
  onCollisionEnter={onCollisionEnter}
>
```

✅ Hit the ball near the paddle's left edge → it flies up-left. Hit near the right → up-right. Hit dead center → straight up. **This is what makes it a game.**

**Talking points**: offset normalized to `[-1, 1]`, clamped to `[-0.5, 0.5]` to avoid extreme angles, multiplied by `PADDLE_MAX_ANGLE` (~65°). The new velocity is computed from that angle, magnitude preserved at `BALL_SPEED`. Open `src/lib/consts.ts` and live-edit `PADDLE_MAX_ANGLE` to `2.5` (pre-decided — don't take audience suggestions, higher values can tunnel through walls) to show the ball flying near-horizontally — *"this number is the difference between fun and broken."* Restore to `1.15`.

---

## Beat 8 (9:30–12:00) — Ball: Trail + speed clamp (the `MIN_VY_RATIO` moment)

The ball is bouncing nicely but two problems lurk: (1) no visual trail, (2) if the deflection angle gets steep, the ball can end up moving purely horizontal between two walls forever.

Open the empty `src/lib/hooks/useBall.ts`, paste:

```ts
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { BALL_SPEED, MIN_VY_RATIO } from "../consts";

export const useBall = () => {
  const ref = useRef<RapierRigidBody | null>(null);

  useFrame(() => {
    const body = ref.current;
    if (!body) return;
    const v = body.linvel();
    const mag = Math.hypot(v.x, v.y);
    if (mag < 0.001) return;
    let nx = v.x / mag;
    let ny = v.y / mag;
    if (Math.abs(ny) < MIN_VY_RATIO) {
      ny = Math.sign(ny || 1) * MIN_VY_RATIO;
      nx = Math.sign(nx || 1) * Math.sqrt(Math.max(0, 1 - ny * ny));
    }
    body.setLinvel({ x: nx * BALL_SPEED, y: ny * BALL_SPEED, z: 0 }, true);
  });

  return { ref };
};
```

Open the empty `src/components/ball.tsx`, paste:

```tsx
import { Trail } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useBall } from "#/lib/hooks/useBall";

extend({ MeshLineGeometry, MeshLineMaterial });

export function Ball() {
  const { ref } = useBall();
  return (
    <Trail width={0.6} length={2} decay={1} stride={0.03} interval={1}>
      <meshLineMaterial
        lineWidth={1}
        color="#88ccff"
        opacity={0.8}
        transparent
        depthWrite={false}
      />
      <RigidBody
        ref={ref}
        colliders="ball"
        restitution={1}
        friction={0}
        lockRotations
        linearVelocity={[6, 8, 0]}
      >
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </RigidBody>
    </Trail>
  );
}
```

Edit `src/App.tsx` — replace the inline `<RigidBody>...<sphereGeometry>...</RigidBody>` with `<Ball />` (and drop the `RigidBody` import):

```tsx
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Ball } from "#/components/ball";
import { Paddle } from "#/components/paddle";
import { Walls } from "#/components/walls";

export function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas camera={{ position: [0, 5, 24], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 15, 8]} intensity={2} />
        <Physics gravity={[0, 0, 0]}>
          <Walls />
          <Paddle />
          <Ball />
        </Physics>
      </Canvas>
    </div>
  );
}
```

✅ Ball trails a cyan line behind it as it bounces. Speed stays constant.

**The live edit moment**: open `src/lib/consts.ts`, change `MIN_VY_RATIO` from `0.25` → `0`, save. Hit the ball until it ends up nearly horizontal — it stays horizontal forever, bouncing between walls. Change back to `0.25`. *"This single line is what stops the game from being broken."*

---


## Beat 9 (12:00–15:30) — Bricks (built in 3 small steps)

One level lives at `src/levels/level-01.json`. We render it as a wall, add color, then add destruction. No hit-count logic, no particles, no death animation — those live in `talk-demo`.

### 9a (12:00–13:00) — Render bricks from the JSON

Open the empty `src/components/enemy.tsx`, paste:

```tsx
import { RigidBody } from "@react-three/rapier";

export function Enemy({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} restitution={1}>
      <mesh>
        <boxGeometry args={[2.5, 1, 1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </RigidBody>
  );
}
```

Edit `src/App.tsx` — import the level, expand the grid into positions, render `<Enemy>` per cell:

```tsx
// add imports
import { useMemo } from "react";
import { Enemy } from "#/components/enemy";
import { levels } from "#/levels";
import { CELL_HEIGHT, CELL_WIDTH, START_X, START_Y } from "#/lib/consts";

// inside the component, above the return:
const bricks = useMemo(
  () =>
    levels[0].grid.flatMap((row, r) =>
      row.flatMap((type, c) =>
        type
          ? [{
              id: `${r}-${c}`,
              position: [
                START_X + c * CELL_WIDTH,
                START_Y - r * CELL_HEIGHT,
                0,
              ] as [number, number, number],
            }]
          : [],
      ),
    ),
  [],
);

// inside <Physics>, after <Ball />:
{bricks.map((b) => (
  <Enemy key={b.id} position={b.position} />
))}
```

✅ 24 white bricks in a grid. Ball bounces off them. They can't be destroyed yet.

**Talking point**: Open `level-01.json` in a side pane. _"The whole layout is one JSON file. Three rows × eight columns. That's what we just walked."_

---

### 9b (13:00–13:30) — Color by type

Every brick is white but the JSON has `"normal"`, `"silver"`, `"gold"` types. Map them to colors.

Edit `src/components/enemy.tsx`:

```tsx
import { RigidBody } from "@react-three/rapier";
import type { EnemyType } from "#/levels";

const COLOR: Record<EnemyType, string> = {
  normal: "#18c9ff",
  silver: "#c0c0c0",
  gold: "#ffd700",
};

export function Enemy({
  type,
  position,
}: {
  type: EnemyType;
  position: [number, number, number];
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} restitution={1}>
      <mesh>
        <boxGeometry args={[2.5, 1, 1]} />
        <meshStandardMaterial color={COLOR[type]} />
      </mesh>
    </RigidBody>
  );
}
```

Edit `src/App.tsx` — pass `type` from the grid cell:

```tsx
const bricks = useMemo(
  () =>
    levels[0].grid.flatMap((row, r) =>
      row.flatMap((type, c) =>
        type
          ? [{
              id: `${r}-${c}`,
              type,
              position: [
                START_X + c * CELL_WIDTH,
                START_Y - r * CELL_HEIGHT,
                0,
              ] as [number, number, number],
            }]
          : [],
      ),
    ),
  [],
);

// later:
{bricks.map((b) => (
  <Enemy key={b.id} type={b.type} position={b.position} />
))}
```

✅ Blue bricks. Open `level-01.json`, change one cell from `"normal"` to `"silver"` — that brick turns grey. Another to `"gold"` — yellow. _"This is what types add. Instant variation from a JSON edit."_

---

### 9c (13:30–15:30) — Destroy on hit

We need state — a brick that's been hit must vanish. Smallest possible game-store: one atom + one action.

Open the empty `src/lib/game-store.ts`, paste:

```ts
import { atom } from "jotai";
import type { EnemyType } from "#/levels";

export const enemiesAtom = atom<
  Record<string, { position: [number, number, number]; type: EnemyType }>
>({});

export const destroyEnemyAtom = atom(null, (_get, set, id: string) => {
  set(enemiesAtom, (prev) => {
    const next = { ...prev };
    delete next[id];
    return next;
  });
});
```

Edit `src/App.tsx` — move generation into `useEffect`, render from the atom:

```tsx
// new imports
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { enemiesAtom } from "#/lib/game-store";

// inside the component (replace the bricks useMemo):
const enemies = useAtomValue(enemiesAtom);
const setEnemies = useSetAtom(enemiesAtom);

useEffect(() => {
  const next: typeof enemies = {};
  levels[0].grid.forEach((row, r) => {
    row.forEach((type, c) => {
      if (type) {
        next[`${r}-${c}`] = {
          type,
          position: [START_X + c * CELL_WIDTH, START_Y - r * CELL_HEIGHT, 0],
        };
      }
    });
  });
  setEnemies(next);
}, [setEnemies]);

const enemyElements = useMemo(
  () =>
    Object.entries(enemies).map(([id, e]) => (
      <Enemy key={id} id={id} type={e.type} position={e.position} />
    )),
  [enemies],
);

// in JSX, replace {bricks.map(...)} with:
{enemyElements}
```

Edit `src/components/enemy.tsx` — add `id` prop and a collision handler:

```tsx
import { RigidBody } from "@react-three/rapier";
import { useSetAtom } from "jotai";
import { destroyEnemyAtom } from "#/lib/game-store";
import type { EnemyType } from "#/levels";

const COLOR: Record<EnemyType, string> = {
  normal: "#18c9ff",
  silver: "#c0c0c0",
  gold: "#ffd700",
};

export function Enemy({
  id,
  type,
  position,
}: {
  id: string;
  type: EnemyType;
  position: [number, number, number];
}) {
  const destroy = useSetAtom(destroyEnemyAtom);
  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      position={position}
      restitution={1}
      onCollisionEnter={() => destroy(id)}
    >
      <mesh>
        <boxGeometry args={[2.5, 1, 1]} />
        <meshStandardMaterial color={COLOR[type]} />
      </mesh>
    </RigidBody>
  );
}
```

✅ Bricks disappear on first hit. (In `talk-demo`, silver takes 2 hits and gold takes 3 — same lookup table in `consts.ts`. Mention this, point at the finished version, move on.)

**Talking point**: Jotai earns its keep here — the atom is shared between App (reads, renders) and Enemy (writes). No prop-drilling, no event bus.

---

## Beat 10 (15:30–17:30) — State machine wiring

The ball can hit bricks but it can't lose. This beat adds the lose condition: the ball dies when it falls past the paddle, lives decrement, and the game enters a terminal state. No UI yet — that's beat 11.

We extend `game-store.ts` with the state machine, give `useBall` knowledge of `gameStateAtom` (so it spawns above the paddle when READY and triggers GAME_OVER on floor), and give `usePaddle` a `paddlePositionRef` to publish.

**Replace `src/lib/game-store.ts`** — extend it with the state machine, score, and the `settingAtom` we'll need for effects toggling:

```ts
import { atom } from "jotai";
import { CELL_HEIGHT, CELL_WIDTH, START_X, START_Y } from "./consts";
import { levels } from "#/levels";
import type { EnemyType } from "#/levels";

export enum GAME_STATE {
  READY = "ready",
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "game_over",
  WON = "won",
}

export enum settingsEnum {
  bloom = "bloom",
  vignette = "vignette",
  chromaticAberration = "chromaticAberration",
  scanline = "scanline",
}

export const paddlePositionRef = { current: 0 };

const INITIAL_LIVES = 3;
const POINTS: Record<EnemyType, number> = { normal: 10, silver: 25, gold: 50 };

const buildEnemies = () => {
  const next: Record<string, { position: [number, number, number]; type: EnemyType }> = {};
  levels[0].grid.forEach((row, r) => {
    row.forEach((type, c) => {
      if (type) {
        next[`${r}-${c}`] = {
          type,
          position: [START_X + c * CELL_WIDTH, START_Y - r * CELL_HEIGHT, 0],
        };
      }
    });
  });
  return next;
};

export const gameStateAtom = atom<GAME_STATE>(GAME_STATE.READY);
export const livesAtom = atom(INITIAL_LIVES);
export const scoreAtom = atom(0);
export const gameStartTimeAtom = atom<number | null>(null);
export const playDurationAtom = atom(0);
export const settingAtom = atom<Record<settingsEnum, boolean>>({
  bloom: true,
  vignette: true,
  chromaticAberration: true,
  scanline: true,
});

export const enemiesAtom = atom<
  Record<string, { position: [number, number, number]; type: EnemyType }>
>(buildEnemies());

export const destroyEnemyAtom = atom(
  null,
  (get, set, { id, type }: { id: string; type: EnemyType }) => {
    set(enemiesAtom, (prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    set(scoreAtom, get(scoreAtom) + POINTS[type]);
    if (Object.keys(get(enemiesAtom)).length === 0) {
      const startTime = get(gameStartTimeAtom);
      if (startTime !== null) {
        set(playDurationAtom, Math.round((Date.now() - startTime) / 1000));
      }
      set(gameStateAtom, GAME_STATE.WON);
    }
  },
);

export const resetGameAtom = atom(null, (_get, set) => {
  set(scoreAtom, 0);
  set(livesAtom, INITIAL_LIVES);
  set(gameStateAtom, GAME_STATE.READY);
  set(gameStartTimeAtom, null);
  set(playDurationAtom, 0);
  set(enemiesAtom, buildEnemies());
});
```

The `buildEnemies` helper now lives in game-store, called both as the `enemiesAtom` initial value and on reset. This means **App.tsx no longer needs its level-loading `useEffect`** — drop that.

`destroyEnemyAtom` now takes `{ id, type }` instead of just `id`. Update the one call site:

**Edit `src/components/enemy.tsx`** — change `destroy(id)` to `destroy({ id, type })`:

```tsx
onCollisionEnter={() => destroy({ id, type })}
```

**Edit `src/lib/hooks/usePaddle.ts`** — add one line so the paddle's position is readable by the ball:

```ts
// at the top, alongside the other imports
import { paddlePositionRef } from "../game-store";

// inside useFrame, after the bounds-clamp:
paddlePositionRef.current = x.current;
```

**Replace `src/lib/hooks/useBall.ts`** — full state-aware version:

```ts
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { BALL_SPEED, MIN_VY_RATIO } from "../consts";
import {
  GAME_STATE,
  gameStartTimeAtom,
  gameStateAtom,
  livesAtom,
  paddlePositionRef,
  playDurationAtom,
} from "../game-store";
import { useGameBounds } from "./useGameBounds";

export const PADDLE_BOTTOM_OFFSET = 1;
export const BALL_SPAWN_OFFSET_Y = 1.5;
export const FLOOR_THICKNESS = 1;

export const useBall = () => {
  const ref = useRef<RapierRigidBody | null>(null);
  const [lives, setLives] = useAtom(livesAtom);
  const livesRef = useRef(lives);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  const gameState = useAtomValue(gameStateAtom);
  const setGameState = useSetAtom(gameStateAtom);
  const setPlayDuration = useSetAtom(playDurationAtom);
  const gameStartTime = useAtomValue(gameStartTimeAtom);
  const bounds = useGameBounds();
  const paddleY = bounds.bottom + PADDLE_BOTTOM_OFFSET;
  const floorY = bounds.bottom - FLOOR_THICKNESS;

  useFrame(() => {
    const body = ref.current;
    if (!body) return;
    if (gameState === GAME_STATE.READY) {
      body.setTranslation(
        { x: paddlePositionRef.current, y: paddleY + BALL_SPAWN_OFFSET_Y, z: 0 },
        true,
      );
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }
    if (gameState !== GAME_STATE.PLAYING) return;

    const v = body.linvel();
    const mag = Math.hypot(v.x, v.y);
    if (mag < 0.001) return;
    let nx = v.x / mag;
    let ny = v.y / mag;
    if (Math.abs(ny) < MIN_VY_RATIO) {
      ny = Math.sign(ny || 1) * MIN_VY_RATIO;
      nx = Math.sign(nx || 1) * Math.sqrt(Math.max(0, 1 - ny * ny));
    }
    body.setLinvel({ x: nx * BALL_SPEED, y: ny * BALL_SPEED, z: 0 }, true);
  });

  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING) return;
    const body = ref.current;
    if (!body) return;
    const v = body.linvel();
    if (Math.abs(v.x) > 0.01 || Math.abs(v.y) > 0.01) return;
    const angle = (Math.random() - 0.5) * 0.6;
    body.setLinvel(
      { x: Math.sin(angle) * BALL_SPEED, y: Math.cos(angle) * BALL_SPEED, z: 0 },
      true,
    );
  }, [gameState]);

  const onFloorCollision = () => {
    const body = ref.current;
    const currentLives = livesRef.current;
    if (currentLives <= 1) {
      setLives(0);
      if (gameStartTime !== null) {
        setPlayDuration(Math.round((Date.now() - gameStartTime) / 1000));
      }
      setGameState(GAME_STATE.GAME_OVER);
      body?.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }
    setLives(currentLives - 1);
    setGameState(GAME_STATE.READY);
  };

  return { onFloorCollision, ref, floorY };
};
```

**Replace `src/components/ball.tsx`** — wire in the floor collider:

```tsx
import { Trail } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { FLOOR_THICKNESS, useBall } from "#/lib/hooks/useBall";

extend({ MeshLineGeometry, MeshLineMaterial });

export function Ball() {
  const { onFloorCollision, ref, floorY } = useBall();
  return (
    <>
      <Trail width={0.6} length={2} decay={1} stride={0.03} interval={1}>
        <meshLineMaterial
          lineWidth={1}
          color="#88ccff"
          opacity={0.8}
          transparent
          depthWrite={false}
        />
        <RigidBody
          ref={ref}
          colliders="ball"
          restitution={1}
          friction={0}
          lockRotations
        >
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </RigidBody>
      </Trail>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[0, floorY, 0]}
        onCollisionEnter={onFloorCollision}
      >
        <CuboidCollider args={[30, FLOOR_THICKNESS, 30]} />
      </RigidBody>
    </>
  );
}
```

✅ Ball respawns at the paddle when state is READY. Falls past the paddle → lives go down (silently, no UI yet) → eventually GAME_OVER and the ball freezes. Clearing all bricks → WON state, ball freezes. **The game is mechanically complete; it just looks dead.**

---

## Beat 11 (17:30–19:30) — HUD + overlays

Now we give the state machine a face: score/lives at the top, a "Press SPACE to start" overlay, "GAME OVER" + "Play again", "YOU WIN!" + "Play again".

**Paste → `src/components/overlay.tsx`** (open the empty file, paste):

```tsx
import { useAtom } from "jotai";
import { settingAtom, settingsEnum } from "#/lib/game-store";

export const Overlay = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  subtitleComponent,
  type = "game_over",
}: {
  type?: "ready" | "game_over" | "level_complete" | "won" | "paused";
  title: string;
  subtitle?: string;
  subtitleComponent?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) => {
  const [settings, setSettings] = useAtom(settingAtom);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 text-white">
      <h2 className="text-6xl font-bold tracking-widest">{title}</h2>
      {subtitle && <p className="text-xl">{subtitle}</p>}
      {subtitleComponent && subtitleComponent}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded border border-white px-6 py-2 text-lg hover:bg-white hover:text-black"
        >
          {actionLabel}
        </button>
      )}

      {type === "paused" ? (
        <>
          <h3 className="text-4xl font-bold tracking-widest">Effects</h3>
          <div className="flex items-center gap-4">
            {Object.entries(settings).map(([key, value]) => {
              const settingKey = key as settingsEnum;
              return (
                <label
                  key={key}
                  className="flex gap-1 items-center cursor-pointer relative"
                >
                  <input
                    onChange={() =>
                      setSettings((prev) => ({
                        ...prev,
                        [settingKey]: !prev[settingKey],
                      }))
                    }
                    checked={value}
                    type="checkbox"
                    className="hidden peer"
                  />
                  <span className="w-5 h-5 border border-slate-300 rounded relative flex items-center justify-center peer-checked:border-green-300"></span>
                  <svg
                    className="absolute hidden peer-checked:inline left-1 top-1/2 transform -translate-y-1/2"
                    width="11"
                    height="8"
                    viewBox="0 0 11 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="fill-green-200 stroke-green-200"
                      d="m10.092.952-.005-.006-.006-.005A.45.45 0 0 0 9.43.939L4.162 6.23 1.585 3.636a.45.45 0 0 0-.652 0 .47.47 0 0 0 0 .657l.002.002L3.58 6.958a.8.8 0 0 0 .567.242.78.78 0 0 0 .567-.242l5.333-5.356a.474.474 0 0 0 .044-.65Zm-5.86 5.349V6.3Z"
                      stroke-width=".4"
                    />
                  </svg>
                  <span className="text-gray-200 select-none">{key}</span>
                </label>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};
```

**Replace `src/App.tsx`** — full wiring with HUD, space-to-start, all overlays:

```tsx
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import { Ball } from "#/components/ball";
import { Enemy } from "#/components/enemy";
import { Overlay } from "#/components/overlay";
import { Paddle } from "#/components/paddle";
import { Walls } from "#/components/walls";
import {
  enemiesAtom,
  GAME_STATE,
  gameStartTimeAtom,
  gameStateAtom,
  livesAtom,
  resetGameAtom,
  scoreAtom,
} from "#/lib/game-store";

export function App() {
  const enemies = useAtomValue(enemiesAtom);
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const lives = useAtomValue(livesAtom);
  const score = useAtomValue(scoreAtom);
  const resetGame = useSetAtom(resetGameAtom);
  const gameStartTime = useAtomValue(gameStartTimeAtom);
  const setGameStartTime = useSetAtom(gameStartTimeAtom);

  const enemyElements = useMemo(
    () =>
      Object.entries(enemies).map(([id, e]) => (
        <Enemy key={id} id={id} type={e.type} position={e.position} />
      )),
    [enemies],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        if (gameState === GAME_STATE.READY) {
          if (gameStartTime === null) setGameStartTime(Date.now());
          setGameState(GAME_STATE.PLAYING);
        } else if (gameState === GAME_STATE.PLAYING) {
          setGameState(GAME_STATE.PAUSED);
        } else if (gameState === GAME_STATE.PAUSED) {
          setGameState(GAME_STATE.PLAYING);
        }
      }
    },
    [gameState, setGameState, gameStartTime, setGameStartTime],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas camera={{ position: [0, 5, 24], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 15, 8]} intensity={2} />
        <Physics
          gravity={[0, 0, 0]}
          paused={
            gameState !== GAME_STATE.PLAYING && gameState !== GAME_STATE.READY
          }
        >
          <Walls />
          <Paddle />
          <Ball />
          {enemyElements}
        </Physics>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 text-white drop-shadow-lg">
        <div className="text-xl">Score: {score.toLocaleString()}</div>
        <div className="text-xl">Lives: {lives}</div>
      </div>

      {gameState === GAME_STATE.READY && (
        <Overlay title="Press SPACE to start" type="ready" />
      )}
      {gameState === GAME_STATE.PAUSED && (
        <Overlay title="PAUSED" type="paused" subtitle="Press space to resume" />
      )}
      {gameState === GAME_STATE.GAME_OVER && (
        <Overlay
          title="GAME OVER"
          subtitle={`Final score: ${score.toLocaleString()}`}
          actionLabel="Play again"
          onAction={resetGame}
        />
      )}
      {gameState === GAME_STATE.WON && (
        <Overlay
          title="YOU WIN!"
          subtitle={`Final score: ${score.toLocaleString()}`}
          actionLabel="Play again"
          onAction={resetGame}
        />
      )}
    </div>
  );
}
```

✅ Press SPACE to launch. Score updates. Die → GAME OVER → Play again. Clear all bricks → YOU WIN.

---

## Beat 12 (19:30–22:30) — Polish (four pastes, four "oohs")

### 12a. HDRI lighting

**Edit `src/App.tsx`** — add `Environment` import + element at top of `<Canvas>`:

```tsx
// add to imports
import { Environment } from "@react-three/drei";

// add as first child of <Canvas>
<Environment files={["/venice_sunset_2k.exr"]} />;
```

✅ Everything reflects sunset. Bricks suddenly look real.

### 12b. Postprocessing

**Paste → `src/components/Effects.tsx`** (open the empty file, paste):

```tsx
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Scanline,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { useAtomValue } from "jotai";
import { BlendFunction, Resolution, ToneMappingMode } from "postprocessing";
import { Fragment } from "react/jsx-runtime";
import { Vector2 } from "three";
import { settingAtom } from "#/lib/game-store";

export const Effects = () => {
  const settings = useAtomValue(settingAtom);
  const effectsToShow = {
    Bloom: {
      enabled: settings.bloom,
      component: (
        <Bloom
          luminanceThreshold={0.4}
          luminanceSmoothing={1}
          resolutionX={Resolution.AUTO_SIZE}
          resolutionY={Resolution.AUTO_SIZE}
        />
      ),
    },
    ToneMapping: {
      enabled: true,
      component: <ToneMapping mode={ToneMappingMode.CINEON} />,
    },
    Vignette: {
      enabled: settings.vignette,
      component: <Vignette eskil={false} offset={0.1} darkness={0.8} />,
    },
    ChromaticAberration: {
      enabled: settings.chromaticAberration,
      component: <ChromaticAberration offset={new Vector2(0.0008, 0.0008)} />,
    },
    Scanline: {
      enabled: settings.scanline,
      component: (
        <Scanline
          blendFunction={BlendFunction.OVERLAY}
          density={1.25}
          opacity={0.1}
        />
      ),
    },
  };
  return (
    <EffectComposer autoClear={false}>
      {Object.entries(effectsToShow).map(([key, { enabled, component }]) =>
        enabled ? <Fragment key={key}>{component}</Fragment> : <></>,
      )}
    </EffectComposer>
  );
};
```

**Edit `src/App.tsx`** — add Effects import + element inside Canvas (above Physics):

```tsx
import { Effects } from "#/components/Effects";

// inside <Canvas>, before <Physics>
<Effects />;
```

✅ Bloom + chromatic aberration + scanlines kick in. _"Toggle them with the checkboxes when paused."_

### 12c. Background

**Paste → `src/components/Background.tsx`** (open the empty file, paste):

```tsx
const BG_COLOR = "#042A2B";
const PLUS_COLOR = "#008148";
const BG_Z = -5;

export function Background() {
  const size = 80;
  return (
    <>
      <mesh position={[0, 10, BG_Z]}>
        <planeGeometry args={[size, size]} />
        <meshPhysicalMaterial color={BG_COLOR} side={2} />
      </mesh>
      <gridHelper
        args={[size, size, PLUS_COLOR, PLUS_COLOR]}
        position={[0, 10, BG_Z + 0.02]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </>
  );
}
```

**Edit `src/App.tsx`** — add Background import + element as first child of Canvas:

```tsx
import { Background } from "#/components/Background";

// inside <Canvas>, as first child
<Background />;
```

✅ Green-on-dark-teal grid behind the scene.

### 12d. Swap the paddle box for the GLB model

**Paste → `src/models/paddle.tsx`** (open the empty file, paste):

```tsx
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type { JSX } from "react/jsx-runtime";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Cube001: THREE.Mesh;
    Cube001_1: THREE.Mesh;
    Cube001_2: THREE.Mesh;
  };
  materials: {
    ["Material.002"]: THREE.MeshStandardMaterial;
    ["Material.003"]: THREE.MeshStandardMaterial;
    ["Material.004"]: THREE.MeshStandardMaterial;
  };
};

type PaddleModelProps = JSX.IntrinsicElements["group"] & {
  scaleRef?: RefObject<number>;
};

export function PaddleModel({ scaleRef, ...props }: PaddleModelProps) {
  const { nodes, materials } = useGLTF("/paddle.glb") as unknown as GLTFResult;
  const innerRef = useRef<THREE.Group>(null);

  const material = new THREE.MeshPhysicalMaterial({
    ...materials["Material.002"],
    color: "red",
    metalness: 1,
  });

  useFrame(() => {
    if (!innerRef.current || !scaleRef) return;
    innerRef.current.scale.x = 2 * scaleRef.current;
  });

  return (
    <group {...props} dispose={null}>
      <group ref={innerRef} scale={[2, 0.5, 0.5]}>
        <mesh geometry={nodes.Cube001.geometry} material={material} />
        <mesh
          geometry={nodes.Cube001_1.geometry}
          material={materials["Material.003"]}
        />
        <mesh
          geometry={nodes.Cube001_2.geometry}
          material={materials["Material.004"]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/paddle.glb");
```

**Edit `src/components/paddle.tsx`** — pull `paddleScaleX` out of the hook and swap the mesh for `<PaddleModel>`:

```tsx
import { type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { usePaddle } from "#/lib/hooks/usePaddle";
import { PaddleModel } from "#/models/paddle";

export function Paddle() {
  const { ref, onCollisionEnter, onCollisionExit, paddleScaleX } = usePaddle();

  const onHit = (handler: { other: { rigidBody?: RapierRigidBody } }) => {
    onCollisionExit(handler);
  };

  return (
    <RigidBody
      ref={ref}
      colliders="cuboid"
      type="kinematicPosition"
      onCollisionEnter={onCollisionEnter}
      onCollisionExit={onHit}
    >
      <PaddleModel scaleRef={paddleScaleX} />
    </RigidBody>
  );
}
```

✅ Paddle goes from a red box to a 3D model with squash-bounce on hit. Talk is visually complete.

---

## Beat 13 (22:30–25:00) — "And here's where it goes"

Switch to `talk-demo` branch in another terminal tab. Show:

```bash
git checkout talk-demo
ls src/components/  # Background, ball, Effects, enemy, overlay, paddle, walls (same)
ls src/levels/      # also same: schema, level-01, index
```

Then `git checkout main` and show:

- `src/scores/` — server function + Drizzle SQLite for leaderboard
- `src/routes/editor.tsx` + `src/dev/editor.tsx` — visual level editor
- 8 levels instead of 1
- Homepage with 3D text and "Start game" link

**Closing line**: _"All of that — the leaderboard, the editor, the levels — sits on top of what we just built. That's R3F. Thanks."_

---

## Cut-down order if behind

1. Skip 12d (GLB paddle swap) — paddle stays as red box, no harm done
2. Skip 12c (Background) — least visual impact
3. Skip 12b (Effects) — sad but the HDRI alone still gives the wow
4. Drop the live edit demos in beats 7 (PADDLE_MAX_ANGLE) and 8 (MIN_VY_RATIO) — just describe what they'd do, don't actually edit
5. Skip 9b (color by type) — keep all bricks white

## Risk areas

- **`extend({ MeshLineGeometry, MeshLineMaterial })` in ball.tsx** must run before the JSX uses `<meshLineMaterial>`. It's at module level so fine, but if HMR is weird, full reload.
- **Rapier HMR**: collisions sometimes go ghost after live edits. Full reload, don't debug.
- **GLB paths**: `/paddle.glb` and `/enemy.glb` are served from `public/`. If 404, the model code throws. Verify by hitting `http://localhost:3000/paddle.glb` before talk.
