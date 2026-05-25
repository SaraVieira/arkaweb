import type {
  CollisionEnterPayload,
  RigidBodyOptions,
} from "@react-three/rapier";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { EnemyType } from "#/lib/game-store";
import { EnemyModel } from "#/models/enemy";
import { useEnemy } from "#/lib/hooks/useEnemy";
import { useEffect, useRef } from "react";

export const Enemy = ({
  position,
  type,
  id,
}: {
  position: RigidBodyOptions["position"];
  type: EnemyType;
  id: string;
}) => {
  const {
    handleCollision,
    groupRef,
    pointsGeo,
    particleColor,
    flash,
    dying,
    hitsNeeded,
    pointsRef,
  } = useEnemy({ id, type });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const url =
      type === EnemyType.Normal
        ? "/459150__lilmati__retro-underwater-explosion.wav"
        : "/446127__justinvoke__metal-clank-5.wav";
    audioRef.current = new Audio(url);
    audioRef.current.volume = 0.5;
  }, [type]);

  const onHit = (handler: CollisionEnterPayload) => {
    const a = audioRef.current;
    if (a) {
      a.currentTime = 0;
      a.play();
    }
    handleCollision(handler);
  };

  if (dying) {
    return (
      <>
        <group ref={groupRef} position={position}>
          <EnemyModel type={type} damage={hitsNeeded} flash={flash} />
          <points ref={pointsRef} geometry={pointsGeo}>
            <pointsMaterial
              size={0.8}
              color={particleColor}
              transparent
              opacity={1}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </points>
        </group>
      </>
    );
  }

  return (
    <RigidBody
      colliders="cuboid"
      type="fixed"
      position={position}
      restitution={1}
      onCollisionEnter={onHit}
    >
      <EnemyModel type={type} flash={flash} />
    </RigidBody>
  );
};
