# Arkanoid talk — paste snippets

Open in a side editor. Each beat below is a paste/edit step. Pre-staged files (`walls.tsx`, `useGameBounds.ts`, `consts.ts`, `overlay.tsx`, `Effects.tsx`, `Background.tsx`, `models/paddle.tsx`, `levels/*`) already have content — just open them to read or `import` them. Everything else is empty until the talk pastes into it.

---

## Beat 3 (1:00–1:30) — Add lights

Type two lines inside `<Canvas>`:

```tsx
<ambientLight intensity={0.2} />
<directionalLight position={[10, 15, 8]} intensity={2} />
```

---

## Beat 4 (1:30–2:30) — Add a ball

```tsx
<mesh>
  <sphereGeometry args={[0.5]} />
  <meshStandardMaterial color="white" />
</mesh>
```

---

## Beat 5 (2:30–5:00) — Make it bounce

```tsx
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
```

---

## Beat 6 (5:00–7:30) — The paddle (mesh + arrows in one shot)

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

---

## Beat 7 (7:30–9:30) — Make the paddle deflect the ball

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
```

Edit `src/App.tsx` — import the level, expand the grid into positions, render `<Enemy>` per cell:

```ts
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
```

```tsx
// inside <Physics>, after <Ball />:
{
  bricks.map((b) => <Enemy key={b.id} {...b} />);
}
```

### 9b (11:30–12:00) — Color by type

Every brick is white but the JSON has `"normal"`, `"silver"`, `"gold"` types. Map them to colors.

Replace `src/components/enemy.tsx`:

```ts
const COLOR: Record<EnemyType, string> = {
  normal: "blue",
  silver: "silver",
  gold: "gold",
};
```

Edit `src/App.tsx` — pass `type` from each grid cell and pass it to `<Enemy>`:

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
  [],
);
```

### 9c (12:00–14:00) — Destroy on hit

```ts
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
```

```tsx

// inside the component (replace the bricks useMemo):
const enemies = useAtomValue(enemiesAtom);

const enemyElements = useMemo(
  () =>
    Object.entries(enemies).map(([id, enemy]) => (
      <Enemy key={id} id={id} type={enemy.type} position={enemy.position} />
    )),

```

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

## Beat 10 (14:00–16:00) — State machine wiring

```ts
import { atom } from "jotai";
import {
  CELL_HEIGHT,
  CELL_WIDTH,
  START_X,
  START_Y,
  INITIAL_LIVES,
} from "./consts";
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
```

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
```

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
  const gameState = useAtomValue(gameStateAtom);
  const setGameState = useSetAtom(gameStateAtom);
  const bounds = useGameBounds();
  const paddleY = bounds.bottom + PADDLE_BOTTOM_OFFSET;

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

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

## Beat 11 (16:00–18:00) — HUD + overlays

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

## Beat 12 (18:00–21:00) — Polish (four pastes, four "oohs")

### 12a. HDRI lighting

```tsx
// add to imports
import { Environment } from "@react-three/drei";

// add as first child of <Canvas>
<Environment files={["/venice_sunset_2k.exr"]} />;
```

### 12b. Postprocessing

```tsx
// add to imports
import { Effects } from "#/components/Effects";

// inside <Canvas>, before <Physics>
<Effects />;
```

### 12c. Background

`src/components/Background.tsx` is **pre-staged** — a dark-teal plane + a green grid behind the play area. Wire it in:

```tsx
import { Background } from "#/components/Background";

// inside <Canvas>, as first child
<Background />;
```

### 12d. Swap the paddle box for the GLB

```tsx
// add to imports
import { PaddleModel } from "#/models/paddle";

// replace the inline <mesh>...</mesh> block with:
<PaddleModel />;
```
