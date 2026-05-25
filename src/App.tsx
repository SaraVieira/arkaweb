import { Canvas } from "@react-three/fiber";

export function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas camera={{ position: [0, 5, 24], fov: 50 }}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </div>
  );
}
