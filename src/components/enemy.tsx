import { removeEnemyAtom } from "#/lib/game-store";
import { RigidBody } from "@react-three/rapier";
import type { RigidBodyOptions } from "@react-three/rapier";
import { useSetAtom } from "jotai";

export const Enemy = ({
  position,
  color,
  id,
}: {
  position: RigidBodyOptions["position"];
  color: string;
  id: string;
}) => {
  const removeEnemy = useSetAtom(removeEnemyAtom);

  return (
    <RigidBody
      colliders="cuboid"
      type="fixed"
      position={position}
      restitution={2.1}
      onCollisionEnter={() => removeEnemy(id)}
    >
      <mesh>
        <boxGeometry args={[2.5, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
};
