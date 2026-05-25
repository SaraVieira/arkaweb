import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { useGameBounds } from "./useGameBounds";
import { BALL_SPEED, PADDLE_MAX_ANGLE } from "../consts";

const PADDLE_HALF_WIDTH = 2;
const PADDLE_BOTTOM_OFFSET = 1.5;
const SPEED = 24;

export function usePaddle() {
  const keys = useRef<Record<string, boolean>>({});
  const ref = useRef<RapierRigidBody | null>(null);
  const x = useRef(0);
  const bounds = useGameBounds();
  const minX = bounds.left + PADDLE_HALF_WIDTH;
  const maxX = bounds.right - PADDLE_HALF_WIDTH;
  const paddleY = bounds.bottom + PADDLE_BOTTOM_OFFSET;

  const onCollisionEnter = ({
    other,
  }: {
    other: { rigidBody?: RapierRigidBody };
  }) => {
    const ball = other.rigidBody;
    if (!ball) return;
    const offset = (ball.translation().x - x.current) / PADDLE_HALF_WIDTH;
    const clamped = Math.max(-0.5, Math.min(0.5, offset));
    const angle = clamped * PADDLE_MAX_ANGLE;
    ball.setLinvel(
      {
        x: Math.sin(angle) * BALL_SPEED,
        y: Math.cos(angle) * BALL_SPEED,
        z: 0,
      },
      true,
    );
  };

  useFrame((_, delta) => {
    const step = SPEED * delta;
    if (keys.current.ArrowLeft) x.current -= step;
    if (keys.current.ArrowRight) x.current += step;
    x.current = Math.max(minX, Math.min(maxX, x.current));
    ref.current?.setNextKinematicTranslation({
      x: x.current,
      y: paddleY,
      z: 0,
    });
  });

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };
    const onUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  return { ref, onCollisionEnter };
}
