import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { START_Y } from "#/lib/consts";
import { useGameBounds } from "#/lib/hooks/useGameBounds";

const WALL_THICKNESS = 1;
const WALL_DEPTH = 30;
// Ceiling sits just above the top brick row rather than at the viewport top,
// so the playfield feels tight regardless of window size.
const CEILING_HEADROOM = 2.5;

export const Walls = () => {
  const bounds = useGameBounds();
  const ceilingY = Math.min(bounds.top, START_Y + CEILING_HEADROOM);
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[WALL_THICKNESS, WALL_DEPTH, WALL_DEPTH]}
          position={[bounds.left - WALL_THICKNESS, 0, 0]}
          restitution={1}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[WALL_THICKNESS, WALL_DEPTH, WALL_DEPTH]}
          position={[bounds.right + WALL_THICKNESS, 0, 0]}
          restitution={1}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[WALL_DEPTH, WALL_THICKNESS, WALL_DEPTH]}
          position={[0, ceilingY + WALL_THICKNESS, 0]}
          restitution={1}
        />
      </RigidBody>
    </>
  );
};
