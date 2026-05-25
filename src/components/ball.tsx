import { Trail } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { MeshLineMaterial as MeshLineMaterialType } from "meshline";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useEffect, useRef, useState } from "react";
import { FLOOR_THICKNESS, useBall } from "#/lib/hooks/useBall";

extend({ MeshLineGeometry, MeshLineMaterial });

const BASE_LENGTH = 2;
const BASE_HZ = 60;

function useRefreshRate() {
  const [hz, setHz] = useState(BASE_HZ);
  useEffect(() => {
    let raf = 0;
    let frames = 0;
    const start = performance.now();
    const tick = (t: number) => {
      frames++;
      if (t - start < 250) {
        raf = requestAnimationFrame(tick);
      } else {
        setHz(Math.round((frames * 1000) / (t - start)));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return hz;
}

export function Ball() {
  const { onFloorCollision, ref, floorY } = useBall();
  const trailMat = useRef<MeshLineMaterialType>(null);
  const hz = useRefreshRate();
  const length = Math.max(1, Math.round(BASE_LENGTH * (hz / BASE_HZ)));

  return (
    <>
      <Trail
        width={0.6}
        length={length}
        decay={1}
        stride={0.03}
        interval={1}
        attenuation={(width) => width * 0.85}
      >
        <meshLineMaterial
          ref={trailMat}
          lineWidth={1}
          color="#88ccff"
          opacity={0.8}
          transparent
          depthWrite={false}
          dashRatio={0.2}
        />
        <RigidBody
          ref={ref}
          colliders="ball"
          mass={1}
          restitution={1}
          friction={0}
          linearDamping={0}
          lockRotations
        >
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </RigidBody>
      </Trail>
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
