import { Canvas, extend } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Walls } from "./components/walls";
import { Paddle } from "./models/paddle";
import { Trail } from "@react-three/drei";
import { MeshLineMaterial } from "meshline";

extend({ MeshLineMaterial });

export function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas camera={{ position: [0, 5, 24], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 15, 8]} intensity={2} />

        <Physics gravity={[0, 0, 0]}>
          <Walls />
          <Paddle />
          <Trail width={0.6} length={2} decay={1} stride={0.03} interval={1}>
            <meshLineMaterial
              lineWidth={1}
              color="#88ccff"
              opacity={0.8}
              transparent
              depthWrite={false}
            />
            <RigidBody
              mass={2}
              colliders="ball"
              restitution={1}
              friction={0}
              lockRotations
              linearVelocity={[12, 16, 0]}
            >
              <mesh>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color="white" />
              </mesh>
            </RigidBody>
          </Trail>
        </Physics>
      </Canvas>
    </div>
  );
}
