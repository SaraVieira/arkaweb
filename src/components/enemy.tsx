import { EnemyType, removeEnemyAtom } from "#/lib/game-store";
import { RigidBody } from "@react-three/rapier";
import type { RigidBodyOptions } from "@react-three/rapier";
import { useSetAtom } from "jotai";
import { useState } from "react";

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
  const [hits, setHits] = useState(0);
  const removeEnemy = useSetAtom(removeEnemyAtom);

  return (
    <RigidBody
      colliders="cuboid"
      type="fixed"
      position={position}
      restitution={2.1}
      onCollisionEnter={() => {
        setHits((h) => h + 1);
        if (
          (type === EnemyType.Normal && hits + 1 >= 1) ||
          (type === EnemyType.Silver && hits + 1 >= 2) ||
          (type === EnemyType.Gold && hits + 1 >= 3)
        ) {
          removeEnemy(id);
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
                : "gold "
          }
        />
      </mesh>
    </RigidBody>
  );
};
