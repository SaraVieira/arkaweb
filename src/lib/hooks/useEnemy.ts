import { useCallback, useEffect, useRef, useState } from "react";
import { destroyEnemyAtom, EnemyType } from "../game-store";
import { useSetAtom } from "jotai";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { CollisionEnterPayload } from "@react-three/rapier";
import { useParticles } from "./useParticles";
import { DEATH_DURATION, HITS_TO_DESTROY } from "../consts";

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
