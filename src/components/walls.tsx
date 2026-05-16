import { PADDLE_LIMITS } from "#/lib/consts";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

const WALL_THICKNESS = 2;
const WALL_HEIGHT = 30;
const WALL_RESTITUTION = 1.1;

export const Walls = () => (
  <>
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[WALL_THICKNESS, WALL_HEIGHT, 30]}
        position={[PADDLE_LIMITS.left - 3 - WALL_THICKNESS, 0, 0]}
        restitution={WALL_RESTITUTION}
      />
    </RigidBody>
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[WALL_THICKNESS, WALL_HEIGHT, 30]}
        position={[PADDLE_LIMITS.right + 3 + WALL_THICKNESS, 0, 0]}
        restitution={WALL_RESTITUTION}
      />
    </RigidBody>
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[30, WALL_THICKNESS, 30]}
        position={[0, 10, 0]}
        restitution={WALL_RESTITUTION}
      />
    </RigidBody>
  </>
);
