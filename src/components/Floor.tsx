import { Instance, Instances } from "@react-three/drei";

const FLOOR_Y = -1;

const PLUS_COLOR = "#008148";
const FLOOR_COLOR = "#042A2B";

export function Crosses({
  size = 23,
  lineWidth = 0.026,
  height = 0.5,
}: {
  size?: number;
  lineWidth?: number;
  height?: number;
}) {
  return (
    <Instances position={[0, FLOOR_Y - 0.02, 0]} limit={size * size * 2 + 10}>
      <planeGeometry args={[lineWidth, height]} />
      <meshBasicMaterial color={PLUS_COLOR} />
      {Array.from({ length: size }, (_, y) =>
        Array.from({ length: size }, (_, x) => (
          <group
            key={`${x}:${y}`}
            position={[
              x * 2 - Math.floor(size / 2) * 2,
              -0.01,
              y * 2 - Math.floor(size / 2) * 2,
            ]}
          >
            <Instance rotation={[-Math.PI / 2, 0, 0]} />
            <Instance rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
          </group>
        )),
      )}
    </Instances>
  );
}

type FloorProps = {
  width?: number;
  depth?: number;
  color?: string;
};

export function Floor({
  width = 100,
  depth = 100,
  color = FLOOR_COLOR,
}: FloorProps) {
  const gridSize = Math.max(width, depth);
  const gridDivisions = Math.ceil(gridSize);

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, FLOOR_Y - 0.04, 0]}
        receiveShadow
      >
        <planeGeometry args={[gridSize, gridSize]} />
        <meshPhysicalMaterial color={color} />
      </mesh>
      <gridHelper
        args={[gridSize, gridDivisions, PLUS_COLOR, PLUS_COLOR]}
        position={[0, FLOOR_Y - 0.01, 0]}
      />
    </>
  );
}
