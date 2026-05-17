import type { RigidBodyOptions } from "@react-three/rapier";
import { RigidBody } from "@react-three/rapier";
import { useSetAtom } from "jotai";
import { useRef } from "react";
import { destroyEnemyAtom, EnemyType } from "#/lib/game-store";

const HITS_TO_DESTROY: Record<EnemyType, number> = {
  [EnemyType.Normal]: 1,
  [EnemyType.Silver]: 2,
  [EnemyType.Gold]: 3,
};

export const Enemy = ({
  position,
  type,
  onHit,
  id,
}: {
  onHit: () => void;
  position: RigidBodyOptions["position"];
  type: EnemyType;
  id: string;
}) => {
  const hitCount = useRef(0);
  const lastCollisionTime = useRef(0);
  const destroyEnemy = useSetAtom(destroyEnemyAtom);

  return (
    <RigidBody
      colliders="cuboid"
      type="fixed"
      position={position}
      restitution={1}
      onCollisionEnter={({ other }) => {
        // Cooldown to prevent multiple hits from the same collision contact
        const now = performance.now();
        if (now - lastCollisionTime.current < 50) return;
        lastCollisionTime.current = now;

        // Only count if the colliding body is a ball
        if (other.rigidBody) {
          const linvel = other.rigidBody.linvel();
          if (Math.hypot(linvel.x, linvel.y) < 0.5) return;
        }

        const next = hitCount.current + 1;
        hitCount.current = next;
        if (next >= HITS_TO_DESTROY[type]) {
          destroyEnemy({ id, type });
          onHit();
        }
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[2.5, 1, 1]} />
        <meshPhysicalMaterial
          metalness={type !== EnemyType.Normal ? 1 : 0}
          roughness={type !== EnemyType.Normal ? 0 : 0.5}
          color={
            type === EnemyType.Normal
              ? "lightblue"
              : type === EnemyType.Silver
                ? "silver"
                : "gold"
          }
        />
      </mesh>
    </RigidBody>
  );
};
