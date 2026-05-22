import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { FLOOR_THICKNESS, useBall } from "#/lib/hooks/useBall";

export function Ball() {
  const { onFloorCollision, ref, floorY } = useBall();
  return (
    <>
      <RigidBody
        ref={ref}
        colliders="ball"
        mass={1}
        restitution={1}
        friction={0}
        linearDamping={0}
        lockRotations
      >
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[0, floorY, 0]}
        onCollisionEnter={onFloorCollision}
      >
        <CuboidCollider args={[30, FLOOR_THICKNESS, 30]} />
      </RigidBody>
    </>
  );
}
