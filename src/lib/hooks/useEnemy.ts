import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { destroyEnemyAtom, EnemyType } from "../game-store";
import { useSetAtom } from "jotai";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { CollisionEnterPayload } from "@react-three/rapier";

const HITS_TO_DESTROY: Record<EnemyType, number> = {
  [EnemyType.Normal]: 1,
  [EnemyType.Silver]: 2,
  [EnemyType.Gold]: 3,
};

const PARTICLE_COLORS: Record<EnemyType, string> = {
  [EnemyType.Normal]: "#18c9ff",
  [EnemyType.Silver]: "#c0c0c0",
  [EnemyType.Gold]: "#ffd700",
};

const PARTICLE_COUNT = 12;
const DEATH_DURATION = 300;

function spawnParticles(): {
  positions: Float32Array;
  velocities: Float32Array;
} {
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

export const useEnemy = ({ type, id }: { type: EnemyType; id: string }) => {
  const [_, setHitCount] = useState(0);
  const [dying, setDying] = useState(false);
  const [flash, setFlash] = useState(false);
  const lastCollisionTime = useRef(0);
  const destroyEnemy = useSetAtom(destroyEnemyAtom);
  const groupRef = useRef<THREE.Group>(null);
  const animationStart = useRef(0);
  const particles = useRef(spawnParticles());
  const pointsRef = useRef<THREE.Points>(null);
  const destroyed = useRef(false);

  const hitsNeeded = HITS_TO_DESTROY[type];
  const particleColor = PARTICLE_COLORS[type];

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

    if (progress >= 1 && !destroyed.current) {
      destroyed.current = true;
      destroyEnemy({ id, type });
    }
  });

  const pointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(particles.current.positions, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", attr);
    return geo;
  }, []);

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
