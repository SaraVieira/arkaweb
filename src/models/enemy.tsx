import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
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
  props: JSX.IntrinsicElements["group"] & {
    type: EnemyType;
    damage?: number;
    flash?: boolean;
  },
) {
  const { type, damage = 0, flash, ...groupProps } = props;
  const { nodes } = useGLTF("/enemy.glb") as unknown as GLTFResult;

  const base =
    {
      normal: "#18c9ff",
      silver: "#c0c0c0",
      gold: "#ffd700",
    }[type] || "#18c9ff";

  const color = useMemo(() => {
    if (type === EnemyType.Normal) return new THREE.Color(base);
    const c = new THREE.Color(base);
    if (flash) return new THREE.Color("white");
    return c;
  }, [base, flash, type]);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        metalness: 1,
        roughness: type !== EnemyType.Normal ? 0 : 0.5,
      }),
    [color, type],
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <group {...groupProps} dispose={null}>
      <mesh
        geometry={nodes.Cube.geometry}
        material={material}
        scale={[1.25, 0.5, 0.5]}
      />
    </group>
  );
}

useGLTF.preload("/enemy.glb");
