import { RigidBody, type CollisionEnterPayload } from "@react-three/rapier";
import { usePaddle } from "#/lib/hooks/usePaddle";
import { PaddleModel } from "#/models/paddle";
import { useEffect, useRef } from "react";

export function Paddle() {
  const { ref, onCollisionEnter, onCollisionExit, paddleScaleX } = usePaddle();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("523770__lilmati__retro-door-knocking.wav");
    audioRef.current.volume = 0.5;
  }, []);

  const onHit = (handler: CollisionEnterPayload) => {
    const a = audioRef.current;
    if (a) {
      a.currentTime = 0;
      a.play();
    }
    onCollisionExit(handler);
  };

  return (
    <RigidBody
      ref={ref}
      colliders="cuboid"
      type="kinematicPosition"
      onCollisionEnter={onCollisionEnter}
      onCollisionExit={onHit}
    >
      <PaddleModel scaleRef={paddleScaleX} />
    </RigidBody>
  );
}
