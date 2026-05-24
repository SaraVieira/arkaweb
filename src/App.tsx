import { Canvas } from "@react-three/fiber";

export function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900">
      <Canvas>
        <mesh position={[0, 0, 0]} rotation={[0.4, 0.6, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </div>
  );
}
