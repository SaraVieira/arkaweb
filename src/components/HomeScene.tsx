import {
  Environment,
  Lightformer,
  OrthographicCamera,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { EvilEmpireText } from "./EvilEmpireText";
import { Crosses, Floor } from "./Floor";

const CAMERA_POSITION = new Vector3(10, 20, 20);
const LOOK_AT = new Vector3(0, 0, 0);
const ZOOM = 80;

function CameraRig() {
  useFrame((state) => {
    state.camera.position.lerp(CAMERA_POSITION, 0.1);
    state.camera.lookAt(LOOK_AT);
  });

  return null;
}

export function HomeScene() {
  return (
    <>
      <color attach="background" args={["#000"]} />

      <OrthographicCamera
        makeDefault
        position={CAMERA_POSITION}
        zoom={ZOOM}
      />
      <CameraRig />

      <Environment preset="dawn" environmentIntensity={0.3}>
        <group rotation={[-Math.PI / 4, -0.3, 0]}>
          <Lightformer
            castShadow
            intensity={20}
            rotation-x={Math.PI / 2}
            color="pink"
            position={[0, 5, -9]}
            scale={[10, 10, 1]}
          />
          <Lightformer
            castShadow
            intensity={2}
            rotation-y={Math.PI / 2}
            color="pink"
            position={[-5, 1, -1]}
            scale={[10, 2, 1]}
          />
          <Lightformer
            castShadow
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, -1, -1]}
            color="pink"
            scale={[10, 2, 1]}
          />
          <Lightformer
            castShadow
            intensity={2}
            color="pink"
            rotation-y={-Math.PI / 2}
            position={[10, 1, 0]}
            scale={[20, 2, 1]}
          />
          <Lightformer
            castShadow
            type="ring"
            intensity={2}
            color="pink"
            rotation-y={Math.PI / 2}
            position={[-0.1, -1, -5]}
            scale={10}
          />
        </group>
      </Environment>

      <Floor width={120} depth={80} />
      <Crosses />

      <EvilEmpireText
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1, 2.25]}
      >
        arkanoid
      </EvilEmpireText>
    </>
  );
}
