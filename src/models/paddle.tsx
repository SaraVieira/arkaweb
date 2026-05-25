import { useGLTF } from "@react-three/drei";
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

export function PaddleModel(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/paddle.glb") as unknown as GLTFResult;
  const material = new THREE.MeshPhysicalMaterial({
    ...materials["Material.002"],
    color: "red",
    metalness: 1,
  });

  return (
    <group {...props} dispose={null}>
      <group scale={[2, 0.5, 0.5]}>
        <mesh geometry={nodes.Cube001.geometry} material={material} />
        <mesh
          geometry={nodes.Cube001_1.geometry}
          material={materials["Material.003"]}
        />
        <mesh
          geometry={nodes.Cube001_2.geometry}
          material={materials["Material.004"]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/paddle.glb");
