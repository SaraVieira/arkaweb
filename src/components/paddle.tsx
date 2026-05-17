import { RigidBody } from "@react-three/rapier";
import { usePaddle } from "#/lib/hooks/usePaddle";
import { PaddleModel } from "#/models/paddle";

export function Paddle() {
  const { ref, onCollisionEnter, onCollisionExit } = usePaddle();

  return (
    <RigidBody
      ref={ref}
      colliders="cuboid"
      type="kinematicPosition"
      onCollisionEnter={onCollisionEnter}
      onCollisionExit={onCollisionExit}
    >
      <PaddleModel />
    </RigidBody>
  );
}
