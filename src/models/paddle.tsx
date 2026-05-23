import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type { JSX } from "react/jsx-runtime";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Cube001: THREE.Mesh;
    Cube001_1: THREE.Mesh;
    Cube001_2: THREE.Mesh;
  };
  materials: {
    ["Material.002"]: THREE.MeshStandardMaterial;
    ["Material.003"]: THREE.MeshStandardMaterial;
    ["Material.004"]: THREE.MeshStandardMaterial;
  };
};

type PaddleModelProps = JSX.IntrinsicElements["group"] & {
  scaleRef?: RefObject<number>;
};

export function PaddleModel({ scaleRef, ...props }: PaddleModelProps) {
  const { nodes, materials } = useGLTF("/paddle.glb") as unknown as GLTFResult;
  const innerRef = useRef<THREE.Group>(null);

  const material = new THREE.MeshPhysicalMaterial({
    ...materials["Material.002"],
    color: "red",
    metalness: 1,
  });

  useFrame(() => {
    if (!innerRef.current || !scaleRef) return;
    innerRef.current.scale.x = 2 * scaleRef.current;
  });

  return (
    <group {...props} dispose={null}>
      <group ref={innerRef} scale={[2, 0.5, 0.5]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001.geometry}
          material={material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_1.geometry}
          material={materials["Material.003"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_2.geometry}
          material={materials["Material.004"]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/paddle.glb");
