import { Canvas } from "@react-three/fiber";

export function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas camera={{ position: [0, 5, 24], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 15, 8]} intensity={2} />
      </Canvas>
    </div>
  );
}
