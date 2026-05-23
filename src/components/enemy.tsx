import type { RigidBodyOptions } from "@react-three/rapier";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { EnemyType } from "#/lib/game-store";
import { EnemyModel } from "#/models/enemy";
import { useEnemy } from "#/lib/hooks/useEnemy";

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
            size={0.25}
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
