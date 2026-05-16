import { Instance, Instances } from "@react-three/drei";

const BG_COLOR = "#042A2B";
const PLUS_COLOR = "#008148";
const BG_Z = -5;

function Crosses({
  size = 50,
  lineWidth = 0.1,
  height = 0.3,
}: {
  size?: number;
  lineWidth?: number;
  height?: number;
}) {
  return (
    <Instances position={[0, 15, BG_Z + 0.01]} limit={size * size}>
      <planeGeometry args={[lineWidth, height]} />
      <meshBasicMaterial color={PLUS_COLOR} />
      {Array.from({ length: size }, (_, y) =>
        Array.from({ length: size }, (_, x) => (
          <group
            key={x + ":" + y}
            position={[x - Math.floor(size / 2), y - Math.floor(size / 2), 0]}
          >
            <Instance />
            <Instance rotation={[0, 0, Math.PI / 2]} />
          </group>
        )),
      )}
    </Instances>
  );
}

export function Background() {
  const size = 80;
  return (
    <>
      <mesh position={[0, 10, BG_Z]}>
        <planeGeometry args={[size, size]} />
        <meshPhysicalMaterial color={BG_COLOR} side={2} />
      </mesh>
      <gridHelper
        args={[size, size, PLUS_COLOR, PLUS_COLOR]}
        position={[0, 10, BG_Z + 0.02]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/*
      <Crosses size={size} />*/}
    </>
  );
}
