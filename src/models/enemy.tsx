import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";
import { EnemyType } from "#/levels";
import type { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Cube: THREE.Mesh;
  };
  materials: {};
};

export function EnemyModel(
  props: JSX.IntrinsicElements["group"] & { type: EnemyType },
) {
  const { nodes } = useGLTF("/enemy.glb") as unknown as GLTFResult;
  const color =
    {
      normal: "lightblue",
      silver: "silver",
      gold: "gold",
    }[props.type] || "blue";

  const material = new THREE.MeshPhysicalMaterial({
    color,
    metalness: props.type !== EnemyType.Normal ? 1 : 0,
    roughness: props.type !== EnemyType.Normal ? 0 : 0.5,
  });
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube.geometry}
        material={material}
        scale={[1.25, 0.5, 0.5]}
      />
    </group>
  );
}

useGLTF.preload("/enemy.glb");
