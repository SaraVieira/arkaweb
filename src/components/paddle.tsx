import { usePaddle } from "#/lib/hooks/usePaddle";
import { RigidBody } from "@react-three/rapier";

export function Paddle() {
  const { ref, onCollisionEnter } = usePaddle();

  return (
    <RigidBody
      ref={ref}
      colliders="cuboid"
      type="fixed"
      onCollisionEnter={onCollisionEnter}
    >
      <mesh>
        <boxGeometry args={[4, 1, 1]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>
    </RigidBody>
  );
}
