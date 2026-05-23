import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { FLOOR_THICKNESS, useBall } from "#/lib/hooks/useBall";
import {
  registerOutline,
  unregisterOutline,
} from "#/lib/outline-selection";
import { Trail } from "@react-three/drei";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { extend, useFrame } from "@react-three/fiber";
import { useCallback, useRef } from "react";
import type { Mesh } from "three";
import type { MeshLineMaterial as MeshLineMaterialType } from "meshline";

extend({ MeshLineGeometry, MeshLineMaterial });

export function Ball() {
  const { onFloorCollision, ref, floorY } = useBall();
  const trailMat = useRef<MeshLineMaterialType>(null);
  const meshRef = useCallback((node: Mesh | null) => {
    if (node) {
      registerOutline(node);
      return () => unregisterOutline(node);
    }
  }, []);

  useFrame((_state, delta) => {
    if (trailMat.current) {
      trailMat.current.dashOffset -= delta * 1.5;
    }
  });

  return (
    <>
      <Trail
        width={0.6}
        length={7}
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
          dashArray={0.5}
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
          <mesh ref={meshRef} castShadow receiveShadow>
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
