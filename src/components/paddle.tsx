import { RigidBody } from "@react-three/rapier";
import { usePaddle } from "#/lib/hooks/usePaddle";
import { PaddleModel } from "#/models/paddle";

export function Paddle() {
  const { ref, onCollisionEnter } = usePaddle();

  return (
    <RigidBody
      ref={ref}
      colliders="cuboid"
      type="kinematicPosition"
      onCollisionEnter={onCollisionEnter}
    >
      <PaddleModel />
    </RigidBody>
  );
}
