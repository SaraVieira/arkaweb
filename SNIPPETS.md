# Arkanoid talk — paste snippets

Open this in a side editor. Each beat below has the files to paste in order. The matching beat in `TALK.md` says what to talk about while pasting.

The starter (`talk-start` branch) has every file you'll touch already in place:

- **Filled**: `src/lib/consts.ts`, `src/lib/hooks/useGameBounds.ts`, `src/components/walls.tsx`, `src/levels/*`, `src/styles.css`, `src/types/meshline.d.ts`, `public/*` (HDRI, sounds, GLBs, fonts), `src/App.tsx` (empty Canvas)
- **Empty (paste into them, don't create them)**: `src/lib/game-store.ts`, `src/lib/hooks/usePaddle.ts`, `src/lib/hooks/useBall.ts`, `src/lib/hooks/useEnemy.ts`, `src/lib/hooks/useParticles.ts`, `src/components/paddle.tsx`, `src/components/ball.tsx`, `src/components/enemy.tsx`, `src/components/overlay.tsx`, `src/components/Effects.tsx`, `src/components/Background.tsx`, `src/models/paddle.tsx`, `src/models/enemy.tsx`

Each paste step below says "paste into X" — the file is already there, you just open it (Cmd+P → name → paste).

---

## Beat 2 (1:30–5:00) — Bouncing ball in a box

`src/components/walls.tsx` and `src/lib/hooks/useGameBounds.ts` are **already in the starter**. Open them briefly — three `<RigidBody><CuboidCollider />` blocks for left/right/ceiling, plus a viewport-bounds hook. Then live-type the rest in App.tsx.

**Type this live into `src/App.tsx`** (the first visible thing the audience sees is a ball bouncing forever inside the walls):

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
            linearVelocity={[6, -8, 0]}
            position={[0, 6, 0]}
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

✅ White ball bouncing forever inside an invisible box. The walls are colliders only — toggle `<Physics debug>` to show them, then remove.

---

## Beat 3 (5:00–9:00) — Paddle (as plain mesh)

**Paste → `src/lib/game-store.ts`** (open the empty file, paste — just the paddle ref for now, atoms come in beat 4):

```ts
export const paddlePositionRef = { current: 0 };
```

**Paste → `src/lib/hooks/usePaddle.ts`** (open the empty file, paste):

```ts
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { BALL_SPEED, PADDLE_MAX_ANGLE } from "../consts";
import { paddlePositionRef } from "../game-store";
import { useGameBounds } from "./useGameBounds";

const PADDLE_HALF_WIDTH = 2;
const PADDLE_BOTTOM_OFFSET = 1.5;
const SPEED = 24;
const DOUBLE_SPEED = SPEED * 2;

export function usePaddle() {
  const isDoubleSpeed = useRef(false);
  const keys = useRef<Record<string, boolean>>({});
  const ref = useRef<RapierRigidBody | null>(null);
  const x = useRef(0);
  const collisionHandled = useRef(false);
  const paddleScaleX = useRef(1);
  const bounceRef = useRef({ active: false, elapsed: 0 });
  const bounds = useGameBounds();
  const minX = bounds.left + PADDLE_HALF_WIDTH;
  const maxX = bounds.right - PADDLE_HALF_WIDTH;
  const paddleY = bounds.bottom + PADDLE_BOTTOM_OFFSET;

  const BOUNCE_DURATION = 0.1;
  const BOUNCE_HEIGHT = 0.6;

  useFrame((_state, delta) => {
    const speed = isDoubleSpeed.current ? DOUBLE_SPEED : SPEED;
    const step = speed * delta;
    if (keys.current.ArrowLeft) x.current -= step;
    if (keys.current.ArrowRight) x.current += step;
    x.current = Math.max(minX, Math.min(maxX, x.current));
    paddlePositionRef.current = x.current;

    let y = paddleY;
    const bounce = bounceRef.current;
    if (bounce.active) {
      bounce.elapsed += delta;
      const progress = Math.min(bounce.elapsed / BOUNCE_DURATION, 1);
      y = paddleY - BOUNCE_HEIGHT * Math.sin(progress * Math.PI);
      paddleScaleX.current = 1 + 0.2 * Math.sin(progress * Math.PI);
      if (progress >= 1) bounce.active = false;
    }

    ref.current?.setNextKinematicTranslation({ x: x.current, y, z: 0 });
  });

  const onCollisionEnter = ({
    other,
  }: {
    other: { rigidBody?: RapierRigidBody };
  }) => {
    const ball = other.rigidBody;
    if (!ball) return;
    if (collisionHandled.current) return;

    const ballX = ball.translation().x;
    const offset = (ballX - x.current) / PADDLE_HALF_WIDTH;
    const clamped = Math.max(-0.5, Math.min(0.5, offset));
    const angle = clamped * PADDLE_MAX_ANGLE;
    ball.setLinvel(
      {
        x: Math.sin(angle) * BALL_SPEED,
        y: Math.cos(angle) * BALL_SPEED,
        z: 0,
      },
      true,
    );
    collisionHandled.current = true;
  };

  const onCollisionExit = ({
    other,
  }: {
    other: { rigidBody?: RapierRigidBody };
  }) => {
    if (other.rigidBody) {
      collisionHandled.current = false;
      bounceRef.current.active = true;
      bounceRef.current.elapsed = 0;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
      if (e.key === "Shift") {
        isDoubleSpeed.current = true;
        return;
      }
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
      if (e.key === "Shift") {
        isDoubleSpeed.current = false;
        return;
      }
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { keys, ref, onCollisionEnter, onCollisionExit, paddleScaleX };
}
```

**Paste → `src/components/paddle.tsx`** (open the empty file, paste — plain mesh, GLB swap comes in beat 7):

```tsx
import { type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { usePaddle } from "#/lib/hooks/usePaddle";

export function Paddle() {
  const { ref, onCollisionEnter, onCollisionExit } = usePaddle();

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
      <mesh>
        <boxGeometry args={[4, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}
```

**Edit `src/App.tsx`** — import `Paddle`, drop it in inside `<Physics>` next to the existing inline ball:

```tsx
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
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
          <RigidBody
            colliders="ball"
            restitution={1}
            friction={0}
            lockRotations
            linearVelocity={[6, -8, 0]}
            position={[0, 6, 0]}
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

✅ Red box paddle, arrow keys move it. Ball deflects off paddle based on hit position. Shift = double speed.

---

## Beat 4 (9:00–13:00) — Ball upgrade (Trail + state machine)

**Append to `src/lib/game-store.ts`** — atoms needed by `useBall`. We'll fully replace this file in beat 5, but the ball needs `GAME_STATE` etc. now:

```ts
import { atom } from "jotai";

export enum GAME_STATE {
  READY = "ready",
  PLAYING = "playing",
  PAUSED = "paused",
  LEVEL_COMPLETE = "level_complete",
  GAME_OVER = "game_over",
  WON = "won",
}

export const gameStateAtom = atom<GAME_STATE>(GAME_STATE.PLAYING);
export const livesAtom = atom(3);
export const gameStartTimeAtom = atom<number | null>(null);
export const playDurationAtom = atom(0);
```

> Keep the existing `paddlePositionRef` line at the top. Result: ref + 4 atoms + enum.

**Paste → `src/lib/hooks/useBall.ts`** (open the empty file, paste):

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
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
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
        {
          x: paddlePositionRef.current,
          y: paddleY + BALL_SPAWN_OFFSET_Y,
          z: 0,
        },
        true,
      );
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    if (gameState !== GAME_STATE.PLAYING) return;

    const v = body.linvel();
    const mag = Math.hypot(v.x, v.y);
    if (mag < 0.001) {
      body.setLinvel(
        { x: Math.sin(0.3) * BALL_SPEED, y: Math.cos(0.3) * BALL_SPEED, z: 0 },
        true,
      );
      return;
    }
    let nx = v.x / mag;
    let ny = v.y / mag;
    const minVy = MIN_VY_RATIO;
    if (Math.abs(ny) < minVy) {
      ny = Math.sign(ny || 1) * minVy;
      const remaining = Math.sqrt(Math.max(0, 1 - ny * ny));
      nx = Math.sign(nx || 1) * remaining;
    }
    body.setLinvel({ x: nx * BALL_SPEED, y: ny * BALL_SPEED, z: 0 }, true);
  });

  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING) return;
    const body = ref.current;
    if (!body) return;
    const linvel = body.linvel();
    if (Math.abs(linvel.x) > 0.01 || Math.abs(linvel.y) > 0.01) return;
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

**Paste → `src/components/ball.tsx`** (open the empty file, paste):

```tsx
import { Trail } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { MeshLineMaterial as MeshLineMaterialType } from "meshline";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useRef } from "react";
import { FLOOR_THICKNESS, useBall } from "#/lib/hooks/useBall";

extend({ MeshLineGeometry, MeshLineMaterial });

export function Ball() {
  const { onFloorCollision, ref, floorY } = useBall();
  const trailMat = useRef<MeshLineMaterialType>(null);

  return (
    <>
      <Trail
        width={0.6}
        length={2}
        decay={1}
        stride={0.03}
        interval={1}
        attenuation={(width) => width * 0.85}
      >
        <meshLineMaterial
          ref={trailMat}
          lineWidth={1}
          color="#88ccff"
          opacity={0.8}
          transparent
          depthWrite={false}
          dashRatio={0.2}
        />
        <RigidBody
          ref={ref}
          colliders="ball"
          restitution={1}
          friction={0}
          lockRotations
        >
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#ffffff" />
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

**Edit `src/App.tsx`** — replace the inline ball `RigidBody` with `<Ball />` (drop the `RigidBody` import since paddle still works without it):

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

✅ Ball now has a trail. State machine starts in `PLAYING` so behavior looks the same — but death is wired (ball that escapes will reset state to `GAME_OVER`).

**Live edit moment**: open `src/lib/consts.ts`, change `MIN_VY_RATIO` from `0.25` → `0`, save, watch the ball go purely horizontal forever, change it back. _"This single line is the only thing preventing the game from being broken."_

---

## Beat 5 (13:00–17:30) — Bricks

**Replace → `src/lib/game-store.ts`** (full file, replacing the stub from beats 3 and 4):

```ts
import { atom } from "jotai";
import { EnemyType, type Level } from "#/levels/schema";
import { CELL_HEIGHT, CELL_WIDTH, START_X, START_Y } from "./consts";

export { EnemyType };

export const levelsAtom = atom<Level[]>([]);

export enum GAME_STATE {
  READY = "ready",
  PLAYING = "playing",
  PAUSED = "paused",
  LEVEL_COMPLETE = "level_complete",
  GAME_OVER = "game_over",
  WON = "won",
}

export const paddlePositionRef = { current: 0 };

export const POINTS_PER_TYPE: Record<EnemyType, number> = {
  [EnemyType.Normal]: 10,
  [EnemyType.Silver]: 25,
  [EnemyType.Gold]: 50,
};

const INITIAL_LIVES = 3;

export enum settingsEnum {
  bloom = "bloom",
  toneMapping = "toneMapping",
  vignette = "vignette",
  chromaticAberration = "chromaticAberration",
  scanline = "scanline",
}

export const livesAtom = atom(INITIAL_LIVES);
export const scoreAtom = atom(0);
export const roundAtom = atom(0);
export const currentLevelAtom = atom(0);
export const gameStateAtom = atom<GAME_STATE>(GAME_STATE.READY);
export const settingAtom = atom<Record<settingsEnum, boolean>>({
  bloom: true,
  toneMapping: true,
  vignette: true,
  chromaticAberration: true,
  scanline: true,
});

export const enemiesAtom = atom<
  Record<string, { position: [number, number, number]; type: EnemyType }>
>({});

export const gameStartTimeAtom = atom<number | null>(null);
export const playDurationAtom = atom(0);

const gridToWorld = (row: number, col: number): [number, number, number] => [
  START_X + col * CELL_WIDTH,
  START_Y - row * CELL_HEIGHT,
  0,
];

export const addEnemyAtom = atom(
  null,
  (
    _get,
    set,
    {
      id,
      position,
      type,
    }: { id: string; position: [number, number, number]; type: EnemyType },
  ) => {
    set(enemiesAtom, (prev) => ({ ...prev, [id]: { position, type } }));
  },
);

export const removeEnemyAtom = atom(null, (_get, set, id: string) => {
  set(enemiesAtom, (prev) => {
    const next = { ...prev };
    delete next[id];
    return next;
  });
});

export const destroyEnemyAtom = atom(
  null,
  (get, set, { id, type }: { id: string; type: EnemyType }) => {
    set(removeEnemyAtom, id);
    set(scoreAtom, get(scoreAtom) + POINTS_PER_TYPE[type]);
    const remaining = get(enemiesAtom);
    if (Object.keys(remaining).length === 0) {
      const next = get(currentLevelAtom) + 1;
      const isWon = next >= get(levelsAtom).length;
      if (isWon) {
        const startTime = get(gameStartTimeAtom);
        if (startTime !== null) {
          set(playDurationAtom, Math.round((Date.now() - startTime) / 1000));
        }
      }
      set(gameStateAtom, isWon ? GAME_STATE.WON : GAME_STATE.LEVEL_COMPLETE);
    }
  },
);

export const loadLevelAtom = atom(null, (get, set) => {
  const level = get(levelsAtom)[get(currentLevelAtom)];
  set(enemiesAtom, {});
  if (!level) return;
  let id = 0;
  level.grid.forEach((row, rowIndex) => {
    row.forEach((type, colIndex) => {
      if (type) {
        set(addEnemyAtom, {
          id: String(id++),
          position: gridToWorld(rowIndex, colIndex),
          type,
        });
      }
    });
  });
});

export const advanceLevelAtom = atom(null, (get, set) => {
  const next = get(currentLevelAtom) + 1;
  if (next >= get(levelsAtom).length) {
    set(gameStateAtom, GAME_STATE.WON);
    return;
  }
  set(currentLevelAtom, next);
  set(gameStateAtom, GAME_STATE.READY);
  set(roundAtom, get(roundAtom) + 1);
  set(loadLevelAtom);
});

export const resetGameAtom = atom(null, (get, set) => {
  set(scoreAtom, 0);
  set(livesAtom, INITIAL_LIVES);
  set(currentLevelAtom, 0);
  set(gameStateAtom, GAME_STATE.READY);
  set(roundAtom, get(roundAtom) + 1);
  set(gameStartTimeAtom, null);
  set(playDurationAtom, 0);
  set(loadLevelAtom);
});
```

**Paste → `src/lib/hooks/useParticles.ts`** (open the empty file, paste):

```ts
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { EnemyType } from "../game-store";

const PARTICLE_COLORS: Record<EnemyType, string> = {
  [EnemyType.Normal]: "#18c9ff",
  [EnemyType.Silver]: "#c0c0c0",
  [EnemyType.Gold]: "#ffd700",
};

const PARTICLE_COUNT = 12;

function spawnParticles() {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5;
    const speed = 4 + Math.random() * 6;
    velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
    velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * speed * 0.5;
  }
  return { positions, velocities };
}

export const useParticles = ({ type }: { type: EnemyType }) => {
  const particles = useRef(spawnParticles());
  const particleColor = PARTICLE_COLORS[type];

  const pointsRef = useRef<THREE.Points>(null);

  const pointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(particles.current.positions, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", attr);
    return geo;
  }, []);

  const spreadParticles = ({
    delta,
    progress,
  }: {
    delta: number;
    progress: number;
  }) => {
    const pts = particles.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pts.positions[i * 3] += pts.velocities[i * 3] * delta;
      pts.positions[i * 3 + 1] += pts.velocities[i * 3 + 1] * delta;
      pts.positions[i * 3 + 2] += pts.velocities[i * 3 + 2] * delta;
    }
    if (pointsRef.current) {
      const attr = pointsRef.current.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      attr.array.set(pts.positions);
      attr.needsUpdate = true;
      (pointsRef.current.material as THREE.PointsMaterial).opacity =
        1 - progress;
    }
  };

  return { pointsGeo, particleColor, spreadParticles, pointsRef };
};
```

**Paste → `src/lib/hooks/useEnemy.ts`** (open the empty file, paste):

```ts
import { useFrame } from "@react-three/fiber";
import type { CollisionEnterPayload } from "@react-three/rapier";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DEATH_DURATION, HITS_TO_DESTROY } from "../consts";
import { destroyEnemyAtom, EnemyType } from "../game-store";
import { useParticles } from "./useParticles";

export const useEnemy = ({ type, id }: { type: EnemyType; id: string }) => {
  const [_, setHitCount] = useState(0);
  const [dying, setDying] = useState(false);
  const [flash, setFlash] = useState(false);
  const lastCollisionTime = useRef(0);
  const destroyEnemy = useSetAtom(destroyEnemyAtom);
  const groupRef = useRef<THREE.Group>(null);
  const animationStart = useRef(0);
  const { pointsGeo, particleColor, spreadParticles, pointsRef } = useParticles(
    { type },
  );
  const destroyed = useRef(false);
  const hitsNeeded = HITS_TO_DESTROY[type];

  const handleCollision = useCallback(
    ({ other }: CollisionEnterPayload) => {
      const now = performance.now();
      if (now - lastCollisionTime.current < 50) return;
      lastCollisionTime.current = now;

      if (other.rigidBody) {
        const linvel = other.rigidBody.linvel();
        if (Math.hypot(linvel.x, linvel.y) < 0.5) return;
      }

      setHitCount((prev) => {
        const next = prev + 1;
        setFlash(true);
        if (next >= hitsNeeded) {
          setDying(true);
          animationStart.current = performance.now();
        }
        return next;
      });
    },
    [hitsNeeded],
  );

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(false), 80);
    return () => clearTimeout(timer);
  }, [flash]);

  useFrame((_state, delta) => {
    if (!dying) return;
    const elapsed = performance.now() - animationStart.current;
    const progress = Math.min(elapsed / DEATH_DURATION, 1);

    if (groupRef.current) {
      let scale: number;
      if (progress < 0.3) {
        scale = 1 + (progress / 0.3) * 0.3;
      } else {
        scale = Math.max(0, 1.3 * (1 - (progress - 0.3) / 0.7));
      }
      groupRef.current.scale.setScalar(scale);
    }

    spreadParticles({ delta, progress });

    if (progress >= 1 && !destroyed.current) {
      destroyed.current = true;
      destroyEnemy({ id, type });
    }
  });

  return {
    handleCollision,
    groupRef,
    pointsGeo,
    particleColor,
    flash,
    dying,
    pointsRef,
    hitsNeeded,
  };
};
```

**Paste → `src/models/enemy.tsx`** (open the empty file, paste):

```tsx
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import type { JSX } from "react/jsx-runtime";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { EnemyType } from "#/levels";

type GLTFResult = GLTF & {
  nodes: { Cube: THREE.Mesh };
  materials: {};
};

export function EnemyModel(
  props: JSX.IntrinsicElements["group"] & {
    type: EnemyType;
    damage?: number;
    flash?: boolean;
  },
) {
  const { type, damage = 0, flash, ...groupProps } = props;
  const { nodes } = useGLTF("/enemy.glb") as unknown as GLTFResult;

  const base =
    {
      normal: "#18c9ff",
      silver: "#c0c0c0",
      gold: "#ffd700",
    }[type] || "#18c9ff";

  const color = useMemo(() => {
    if (type === EnemyType.Normal) return new THREE.Color(base);
    const c = new THREE.Color(base);
    if (flash) return new THREE.Color("white");
    return c;
  }, [base, flash, type]);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        metalness: 1,
        roughness: type !== EnemyType.Normal ? 0 : 0.5,
      }),
    [color, type],
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <group {...groupProps} dispose={null}>
      <mesh
        geometry={nodes.Cube.geometry}
        material={material}
        scale={[1.25, 0.5, 0.5]}
      />
    </group>
  );
}

useGLTF.preload("/enemy.glb");
```

**Paste → `src/components/enemy.tsx`** (open the empty file, paste):

```tsx
import type {
  CollisionEnterPayload,
  RigidBodyOptions,
} from "@react-three/rapier";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { EnemyType } from "#/lib/game-store";
import { useEnemy } from "#/lib/hooks/useEnemy";
import { EnemyModel } from "#/models/enemy";

export const Enemy = ({
  position,
  type,
  id,
}: {
  position: RigidBodyOptions["position"];
  type: EnemyType;
  id: string;
}) => {
  const {
    handleCollision,
    groupRef,
    pointsGeo,
    particleColor,
    flash,
    dying,
    hitsNeeded,
    pointsRef,
  } = useEnemy({ id, type });

  if (dying) {
    return (
      <group ref={groupRef} position={position}>
        <EnemyModel type={type} damage={hitsNeeded} flash={flash} />
        <points ref={pointsRef} geometry={pointsGeo}>
          <pointsMaterial
            size={0.8}
            color={particleColor}
            transparent
            opacity={1}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    );
  }

  return (
    <RigidBody
      colliders="cuboid"
      type="fixed"
      position={position}
      restitution={1}
      onCollisionEnter={handleCollision}
    >
      <EnemyModel type={type} flash={flash} />
    </RigidBody>
  );
};
```

**Replace `src/App.tsx`** — wire up Jotai state, level loading, enemy rendering:

```tsx
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { Ball } from "#/components/ball";
import { Enemy } from "#/components/enemy";
import { Paddle } from "#/components/paddle";
import { Walls } from "#/components/walls";
import { levels as ALL_LEVELS } from "#/levels";
import {
  enemiesAtom,
  GAME_STATE,
  gameStateAtom,
  loadLevelAtom,
  levelsAtom,
} from "#/lib/game-store";

export function App() {
  const enemies = useAtomValue(enemiesAtom);
  const gameState = useAtomValue(gameStateAtom);
  const setLevels = useSetAtom(levelsAtom);
  const loadLevel = useSetAtom(loadLevelAtom);

  useEffect(() => {
    setLevels(ALL_LEVELS);
    loadLevel();
  }, [setLevels, loadLevel]);

  const enemyElements = useMemo(
    () =>
      Object.keys(enemies).map((id) => {
        const enemy = enemies[id];
        return (
          <Enemy
            key={`enemy-${id}`}
            id={id}
            type={enemy.type}
            position={enemy.position}
          />
        );
      }),
    [enemies],
  );

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
    </div>
  );
}
```

✅ 24 blue bricks render. Ball clears them. No game-over screen yet — that's beat 6.

---

## Beat 6 (17:30–20:30) — HUD + overlays

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
import { levels as ALL_LEVELS } from "#/levels";
import {
  advanceLevelAtom,
  currentLevelAtom,
  enemiesAtom,
  GAME_STATE,
  gameStartTimeAtom,
  gameStateAtom,
  levelsAtom,
  livesAtom,
  loadLevelAtom,
  resetGameAtom,
  roundAtom,
  scoreAtom,
} from "#/lib/game-store";

export function App() {
  const loadLevel = useSetAtom(loadLevelAtom);
  const resetGame = useSetAtom(resetGameAtom);
  const advanceLevel = useSetAtom(advanceLevelAtom);
  const enemies = useAtomValue(enemiesAtom);
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const lives = useAtomValue(livesAtom);
  const score = useAtomValue(scoreAtom);
  const round = useAtomValue(roundAtom);
  const currentLevel = useAtomValue(currentLevelAtom);
  const [levels, setLevels] = useAtom(levelsAtom);
  const gameStartTime = useAtomValue(gameStartTimeAtom);
  const setGameStartTime = useSetAtom(gameStartTimeAtom);
  const level = levels[currentLevel];

  const enemyElements = useMemo(
    () =>
      Object.keys(enemies).map((id) => {
        const enemy = enemies[id];
        return (
          <Enemy
            key={`enemy-${id}`}
            id={id}
            type={enemy.type}
            position={enemy.position}
          />
        );
      }),
    [enemies],
  );

  useEffect(() => {
    setLevels(ALL_LEVELS);
    loadLevel();
  }, [setLevels, loadLevel]);

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
            gameState === GAME_STATE.PAUSED ||
            gameState === GAME_STATE.LEVEL_COMPLETE ||
            gameState === GAME_STATE.GAME_OVER ||
            gameState === GAME_STATE.WON
          }
        >
          <Walls />
          <Paddle key={`paddle-${round}`} />
          <Ball key={`ball-${round}`} />
          {enemyElements}
        </Physics>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 text-white drop-shadow-lg">
        <div className="text-xl">Score: {score.toLocaleString()}</div>
        <div className="text-xl">
          Level {currentLevel + 1}
          {level ? ` — ${level.name}` : ""}
        </div>
        <div className="text-xl">Lives: {lives}</div>
      </div>

      {gameState === GAME_STATE.READY && (
        <Overlay title="Press SPACE to start" type="ready" />
      )}
      {gameState === GAME_STATE.PAUSED && (
        <Overlay
          title="PAUSED"
          type="paused"
          subtitle="Press space to resume"
        />
      )}
      {gameState === GAME_STATE.LEVEL_COMPLETE && (
        <Overlay
          title="LEVEL CLEAR"
          subtitle={`Score: ${score.toLocaleString()}`}
          actionLabel="Next level"
          onAction={advanceLevel}
        />
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

## Beat 7 (20:30–23:30) — Polish (four pastes, four "oohs")

### 7a. HDRI lighting

**Edit `src/App.tsx`** — add `Environment` import + element at top of `<Canvas>`:

```tsx
// add to imports
import { Environment } from "@react-three/drei";

// add as first child of <Canvas>
<Environment files={["/venice_sunset_2k.exr"]} />;
```

✅ Everything reflects sunset. Bricks suddenly look real.

### 8b. Postprocessing

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

### 7b. Postprocessing (continued — Effects.tsx pasted above, wire it up)

### 7c. Background

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

### 7d. Swap the paddle box for the GLB model

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

## Beat 8 (23:30–25:00) — "And here's where it goes"

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

1. Skip 7d (GLB paddle swap) — paddle stays as red box, no harm done
2. Skip 7c (Background) — least visual impact
3. Skip 7b (Effects) — sad but the HDRI alone still gives the wow
4. Skip particles in beat 5 — paste a stub that just calls `destroyEnemy` immediately on hit, no animation

## Risk areas

- **`extend({ MeshLineGeometry, MeshLineMaterial })` in ball.tsx** must run before the JSX uses `<meshLineMaterial>`. It's at module level so fine, but if HMR is weird, full reload.
- **Rapier HMR**: collisions sometimes go ghost after live edits. Full reload, don't debug.
- **GLB paths**: `/paddle.glb` and `/enemy.glb` are served from `public/`. If 404, the model code throws. Verify by hitting `http://localhost:3000/paddle.glb` before talk.
