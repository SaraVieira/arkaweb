import { usePaddle } from "#/lib/hooks/usePaddle";
import { RigidBody } from "@react-three/rapier";

export function Paddle() {
  const { ref, onCollisionEnter } = usePaddle();
  return (
    <RigidBody
      ref={ref}
      colliders="cuboid"
      type="kinematicPosition"
      onCollisionEnter={onCollisionEnter}
    >
      <mesh>
        <boxGeometry args={[4, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}
