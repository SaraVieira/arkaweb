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
  <sphereGeometry args={[0.5]} />
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
            linearVelocity={[12, 16, 0]}
          >
            <mesh>
              <sphereGeometry args={[0.5]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </RigidBody>
        </Physics>
      </Canvas>
    </div>
  );
}
```

✅ Ball bounces between left/right/ceiling. After a few bounces it drifts past the open bottom and escapes — _"we need to catch this thing."_

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
    ref.current?.setNextKinematicTranslation({
      x: x.current,
      y: paddleY,
      z: 0,
    });
  });

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };
    const onUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
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
const onCollisionEnter = ({
  other,
}: {
  other: { rigidBody?: RapierRigidBody };
}) => {
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

**Talking points**: offset normalized to `[-1, 1]`, clamped to `[-0.5, 0.5]` to avoid extreme angles, multiplied by `PADDLE_MAX_ANGLE` (~65°). The new velocity is computed from that angle, magnitude preserved at `BALL_SPEED`. Open `src/lib/consts.ts` and live-edit `PADDLE_MAX_ANGLE` to `2.5` (pre-decided — don't take audience suggestions, higher values can tunnel through walls) to show the ball flying near-horizontally — _"this number is the difference between fun and broken."_ Restore to `1.15`.

## Beat 8 (9:30–10:30) — Ball: add a Trail

Pure visual beat. Wrap the inline ball in drei's `<Trail>` to leave a cyan streak behind it. No hook, no math.

Open the empty `src/components/ball.tsx`, paste:

```tsx
import { Trail } from "@react-three/drei";
import { MeshLineMaterial } from "meshline";

extend({ MeshLineMaterial });

export function Ball() {
  return (
    <Trail width={0.6} length={2} stride={0.03}>
      <meshLineMaterial
        lineWidth={1}
        color="#88ccff"
        opacity={0.8}
        transparent
        depthWrite={false}
        linearVelocity={[12, 16, 0]}
      >
        <mesh>
          <sphereGeometry args={[0.5]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </RigidBody>
    </Trail>
  );
}
```

Edit `src/App.tsx` — replace the inline `<RigidBody>...<sphereGeometry>...</RigidBody>` with `<Ball />` (and drop the `RigidBody` import):

````tsx
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
✅ Ball trails a cyan line behind it as it bounces.

**Talking point**: `<Trail>` is from `@react-three/drei` — drei is the helper library on top of R3F that gives you common scene utilities like Trail, OrbitControls, Environment, Text, useGLTF. We'll use more drei stuff in the polish reveal.

---

## Beat 9 (10:30–14:00) — Bricks (built in 3 small steps)

One level lives at `src/levels/level-01.json`. We render it as a wall, add color, then add destruction. No hit-count logic, no particles, no death animation — those live in `talk-demo`.

### 9a (10:30–11:30) — Render bricks from the JSON

Open the empty `src/components/enemy.tsx`, paste:

```tsx
import { RigidBody } from "@react-three/rapier";

export function Enemy({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      position={position}
      restitution={1}
    >
      <mesh>
        <boxGeometry args={[2.5, 1, 1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </RigidBody>
  );
}
````

Edit `src/App.tsx` — import the level, expand the grid into positions, render `<Enemy>` per cell:

    levels[0].grid.flatMap((row, r) =>
      row.flatMap((type, c) =>
        type
          ? [
              {
                id: `${r}-${c}`,
                position: [
                  START_X + c * CELL_WIDTH,
                  START_Y - r * CELL_HEIGHT,
                  0,
                ] as [number, number, number],
              },
            ]
          : [],
      ),
    ),

````

```tsx
// inside <Physics>, after <Ball />:
{
  bricks.map((b) => <Enemy key={b.id} position={b.position} />);
}
````

✅ 24 white bricks in a grid. Ball bounces off them. They can't be destroyed yet.

**Talking point**: Open `level-01.json` in a side pane. _"The whole layout is one JSON file. Three rows × eight columns. That's what we just walked."_

### 9b (11:30–12:00) — Color by type

Every brick is white but the JSON has `"normal"`, `"silver"`, `"gold"` types. Map them to colors.

Edit `src/components/enemy.tsx`:

normal: "#18c9ff",
silver: "#c0c0c0",

```tsx
const bricks = useMemo(
  () =>
    levels[0].grid.flatMap((row, r) =>
      row.flatMap((type, c) =>
        type
          ? [
              {
                id: `${r}-${c}`,
                type,
                position: [
                  START_X + c * CELL_WIDTH,
                  START_Y - r * CELL_HEIGHT,
                  0,
                ] as [number, number, number],
              },
            ]
          : [],
      ),
    ),
```

```tsx
// later:
{
  bricks.map((b) => <Enemy key={b.id} type={b.type} position={b.position} />);
}
```

✅ Blue bricks. Open `level-01.json`, change one cell from `"normal"` to `"silver"` — that brick turns grey. Another to `"gold"` — yellow. _"This is what types add. Instant variation from a JSON edit."_

### 9c (12:00–14:00) — Destroy on hit

We need state — a brick that's been hit must vanish. `enemiesAtom` is a dictionary of bricks; `destroyEnemyAtom` removes one by id. The level-expansion logic moves out of App.tsx and lives next to the state it produces.

Open the empty `src/lib/game-store.ts`, paste:

````ts
import { atom } from "jotai";
import { CELL_HEIGHT, CELL_WIDTH, START_X, START_Y } from "./consts";
import { levels } from "#/levels";
import type { EnemyType } from "#/levels";

const buildEnemies = () => {
  const next: Record<
    string,
    { position: [number, number, number]; type: EnemyType }
  > = {};
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

export const enemiesAtom =
  atom<Record<string, { position: [number, number, number]; type: EnemyType }>>(
    buildEnemies(),
  );

export const destroyEnemyAtom = atom(null, (_get, set, id: string) => {
  set(enemiesAtom, (prev) => {
    const next = { ...prev };
    delete next[id];
    return next;
  });
});
Notice we pass `buildEnemies()` as the **initial value** of the atom — bricks exist before App ever renders, so no `useEffect` to bootstrap them.

Edit `src/App.tsx` — drop the local `bricks` useMemo, read the atom, render from it:

```tsx
// new imports
import { useAtomValue } from "jotai";
import { enemiesAtom } from "#/lib/game-store";

// inside the component (replace the bricks useMemo):
const enemies = useAtomValue(enemiesAtom);

const enemyElements = useMemo(
  () =>
    Object.entries(enemies).map(([id, e]) => (
      <Enemy key={id} id={id} type={e.type} position={e.position} />
    )),
You can also drop the now-unused imports from beat 9a/b: `levels`, `START_X`, `START_Y`, `CELL_WIDTH`, `CELL_HEIGHT` — they all moved into `game-store.ts`.

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
````

✅ Bricks disappear on first hit. (In `talk-demo`, silver takes 2 hits and gold takes 3 — same lookup table in `consts.ts`. Mention this, point at the finished version, move on.)

**Talking point**: Jotai earns its keep here — the atom is shared between App (reads, renders) and Enemy (writes). No prop-drilling, no event bus.

## Beat 10 (14:00–16:00) — State machine wiring

The ball can hit bricks but it can't lose. This beat adds the lose condition: the ball dies when it falls past the paddle, lives decrement, and the game enters a terminal state. No UI yet — that's beat 11.

We extend `game-store.ts` with the state machine, give `useBall` knowledge of `gameStateAtom` (so it spawns above the paddle when READY and triggers GAME_OVER on floor), and give `usePaddle` a `paddlePositionRef` to publish.

**Replace `src/lib/game-store.ts`** — extend with the state machine, lives, and a `WON` check. No score, no timer, no effect-toggle state — just what `useBall` and the HUD need:

````ts
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

export const paddlePositionRef = { current: 0 };

const INITIAL_LIVES = 3;

const buildEnemies = () => {
  const next: Record<
    string,
    { position: [number, number, number]; type: EnemyType }
  > = {};
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

export const enemiesAtom =
  atom<Record<string, { position: [number, number, number]; type: EnemyType }>>(
    buildEnemies(),
  );

export const destroyEnemyAtom = atom(null, (get, set, id: string) => {
  set(enemiesAtom, (prev) => {
    const next = { ...prev };
    delete next[id];
    return next;
  });
  if (Object.keys(get(enemiesAtom)).length === 0) {
    set(gameStateAtom, GAME_STATE.WON);
  }
});

export const resetGameAtom = atom(null, (_get, set) => {
  set(livesAtom, INITIAL_LIVES);
  set(gameStateAtom, GAME_STATE.READY);
  set(enemiesAtom, buildEnemies());
});
`buildEnemies` is unchanged from beat 9c — we just made the file grow around it with the state machine, lives, and `WON` detection. `destroyEnemyAtom` keeps its `(id: string)` signature, so no Enemy change needed.

`resetGameAtom` calls `buildEnemies()` again on "play again" — that's why the helper had to be a function and not just inlined into the atom initializer.

**Edit `src/lib/hooks/usePaddle.ts`** — publish the paddle's x position to a ref the ball can read. Add the import and one line in the existing `useFrame`:

```ts
// add this import at the top
import { paddlePositionRef } from "../game-store";

// the useFrame from beat 6 stays — just add the one new line:
useFrame((_, delta) => {
  const step = SPEED * delta;
  if (keys.current.ArrowLeft) x.current -= step;
  if (keys.current.ArrowRight) x.current += step;
  x.current = Math.max(minX, Math.min(maxX, x.current));
  paddlePositionRef.current = x.current; // ← NEW
  ref.current?.setNextKinematicTranslation({
    x: x.current,
    y: paddleY,
    z: 0,
  });
});
````

**Paste → `src/lib/hooks/useBall.ts`** (first time this hook exists):

```ts
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { BALL_SPEED } from "../consts";
import {
  GAME_STATE,
  gameStateAtom,
  livesAtom,
  paddlePositionRef,
} from "../game-store";
import { useGameBounds } from "./useGameBounds";

export const PADDLE_BOTTOM_OFFSET = 1;
export const BALL_SPAWN_OFFSET_Y = 1.5;
export const FLOOR_THICKNESS = 1;

export const useBall = () => {
  const ref = useRef<RapierRigidBody | null>(null);
  const [lives, setLives] = useAtom(livesAtom);
  const livesRef = useRef(lives);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  const gameState = useAtomValue(gameStateAtom);
  const setGameState = useSetAtom(gameStateAtom);
  const bounds = useGameBounds();
  const paddleY = bounds.bottom + PADDLE_BOTTOM_OFFSET;
  // While READY, glue the ball above the paddle and freeze it.
  useFrame(() => {
    if (gameState !== GAME_STATE.READY) return;
    const body = ref.current;
    if (!body) return;
    body.setTranslation(
      {
        x: paddlePositionRef.current,
        y: paddleY + BALL_SPAWN_OFFSET_Y,
        z: 0,
      },
      true,
    );
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  });

  // When SPACE flips us into PLAYING, kick the ball off at a random small angle.
  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING) return;
    const body = ref.current;
    if (!body) return;
    const v = body.linvel();
    if (Math.abs(v.x) > 0.01 || Math.abs(v.y) > 0.01) return;
    const angle = (Math.random() - 0.5) * 0.6;
    body.setLinvel(
      {
        x: Math.sin(angle) * BALL_SPEED,
        y: Math.cos(angle) * BALL_SPEED,
        z: 0,
      },
      true,
    );
  }, [gameState]);

  const onFloorCollision = () => {
    const currentLives = livesRef.current;
    if (currentLives <= 1) {
      setLives(0);
      setGameState(GAME_STATE.GAME_OVER);
      ref.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
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
<RigidBody
type="fixed"
colliders={false}
position={[0, floorY, 0]}
onCollisionEnter={onFloorCollision}

  <CuboidCollider args={[30, FLOOR_THICKNESS, 30]} />
</RigidBody>

```

✅ Ball respawns at the paddle when state is READY. Falls past the paddle → lives go down (silently, no UI yet) → eventually GAME_OVER and the ball freezes. Clearing all bricks → WON state, ball freezes. **The game is mechanically complete; it just looks dead.**

## Beat 11 (16:00–18:00) — HUD + overlays

Now we give the state machine a face: lives at the top, a "Press SPACE to start" overlay, "GAME OVER" + "Play again", "YOU WIN!" + "Play again".

`src/components/overlay.tsx` is **pre-staged** — it's just a `title + subtitle + button` Tailwind component, no insight value to paste live. Skim it (or skip it) and go straight to the App.tsx wiring below.

**Replace `src/App.tsx`** — full wiring with HUD, space-to-start, all overlays:

```tsx
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { Ball } from "#/components/ball";
import { Enemy } from "#/components/enemy";
import { Overlay } from "#/components/overlay";
import { Paddle } from "#/components/paddle";
import { Walls } from "#/components/walls";
import {
  enemiesAtom,
  GAME_STATE,
  gameStateAtom,
  livesAtom,
  resetGameAtom,
} from "#/lib/game-store";

export function App() {
  const enemies = useAtomValue(enemiesAtom);
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const lives = useAtomValue(livesAtom);
  const resetGame = useSetAtom(resetGameAtom);

  const enemyElements = useMemo(
    () =>
      Object.entries(enemies).map(([id, e]) => (
        <Enemy key={id} id={id} type={e.type} position={e.position} />
      )),
    [enemies],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== " ") return;
      else if (gameState === GAME_STATE.PLAYING)
        setGameState(GAME_STATE.PAUSED);
      else if (gameState === GAME_STATE.PAUSED)
        setGameState(GAME_STATE.PLAYING);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameState, setGameState]);

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

      <div className="pointer-events-none absolute top-4 right-4 text-xl text-white drop-shadow-lg">
        Lives: {lives}
      {gameState === GAME_STATE.READY && (
        <Overlay title="Press SPACE to start" />
      )}
      {gameState === GAME_STATE.PAUSED && (
        <Overlay title="PAUSED" subtitle="Press space to resume" />
      )}
      {gameState === GAME_STATE.GAME_OVER && (
        <Overlay
          title="GAME OVER"
          actionLabel="Play again"
          onAction={resetGame}
        />
      )}
      {gameState === GAME_STATE.WON && (
        <Overlay
          title="YOU WIN!"
          actionLabel="Play again"
          onAction={resetGame}
        />
      )}
    </div>
  );
}
```

✅ Press SPACE to launch. Die → GAME OVER → Play again. Clear all bricks → YOU WIN.

## Beat 12 (18:00–21:00) — Polish (four pastes, four "oohs")

### 12a. HDRI lighting

**Edit `src/App.tsx`** — add `Environment` import + element at top of `<Canvas>`:

```tsx
// add to imports
import { Environment } from "@react-three/drei";

// add as first child of <Canvas>
<Environment files={["/venice_sunset_2k.exr"]} />;
```

✅ Everything reflects sunset. Bricks suddenly look real.

`src/components/Effects.tsx` is **pre-staged** — Bloom + ToneMapping + Vignette + ChromaticAberration + Scanline wrapped in one `<EffectComposer>`. Just wire it into `App.tsx`:

````tsx
// add to imports
import { Effects } from "#/components/Effects";

// inside <Canvas>, before <Physics>
<Effects />;
✅ Bloom + chromatic aberration + scanlines kick in. Everything pops.

### 12c. Background

`src/components/Background.tsx` is **pre-staged** — a dark-teal plane + a green grid behind the play area. Wire it in:

```tsx
import { Background } from "#/components/Background";

// inside <Canvas>, as first child
<Background />;
````

✅ Green-on-dark-teal grid behind the scene.

`src/models/paddle.tsx` is **pre-staged** — `PaddleModel` loads `/paddle.glb` and returns a `<group>` with the three sub-meshes (GLTF type boilerplate, no insight). Two-line edit to `src/components/paddle.tsx`:

```tsx
// add to imports
import { PaddleModel } from "#/models/paddle";

// replace the inline <mesh>...</mesh> block with:
<PaddleModel />;
```

✅ Paddle goes from a red box to a proper 3D model. Talk is visually complete.

## Beat 13 (21:00–23:30) — "And here's where it goes"

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
