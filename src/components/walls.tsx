import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useGameBounds } from "#/lib/hooks/useGameBounds";

const T = 1; // wall thickness
const D = 30; // wall depth

export const Walls = () => {
  const bounds = useGameBounds();
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[T, D, D]}
          position={[bounds.left - T, 0, 0]}
          restitution={1}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[T, D, D]}
          position={[bounds.right + T, 0, 0]}
          restitution={1}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[D, T, D]}
          position={[0, bounds.top + T, 0]}
          restitution={1}
        />
      </RigidBody>
    </>
  );
};
