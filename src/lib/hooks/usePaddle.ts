import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { BALL_SPEED, PADDLE_MAX_ANGLE } from "../consts";
import { paddlePositionRef } from "../game-store";
import { useGameBounds } from "./useGameBounds";

const PADDLE_HALF_WIDTH = 2;
const PADDLE_BOTTOM_OFFSET = 1.5;
const SPEED = 24;
const DOUBLE_SPEED = SPEED * 2;

export function usePaddle() {
  const isDoubleSpeed = useRef(false);
  const keys = useRef<Record<string, boolean>>({});
  const ref = useRef<RapierRigidBody | null>(null);
  const x = useRef(0);
  const collisionHandled = useRef(false);
  const paddleScaleX = useRef(1);
  const bounceRef = useRef({ active: false, elapsed: 0 });
  const bounds = useGameBounds();
  const minX = bounds.left + PADDLE_HALF_WIDTH;
  const maxX = bounds.right - PADDLE_HALF_WIDTH;
  const paddleY = bounds.bottom + PADDLE_BOTTOM_OFFSET;

  const BOUNCE_DURATION = 0.1; // seconds
  const BOUNCE_HEIGHT = 0.6;

  useFrame((_state, delta) => {
    const speed = isDoubleSpeed.current ? DOUBLE_SPEED : SPEED;
    const step = speed * delta;
    if (keys.current.ArrowLeft) x.current -= step;
    if (keys.current.ArrowRight) x.current += step;
    x.current = Math.max(minX, Math.min(maxX, x.current));
    paddlePositionRef.current = x.current;

    let y = paddleY;
    const bounce = bounceRef.current;
    if (bounce.active) {
      bounce.elapsed += delta;
      const progress = Math.min(bounce.elapsed / BOUNCE_DURATION, 1);
      y = paddleY - BOUNCE_HEIGHT * Math.sin(progress * Math.PI);
      paddleScaleX.current = 1 + 0.2 * Math.sin(progress * Math.PI);
      if (progress >= 1) {
        bounce.active = false;
      }
    }

    ref.current?.setNextKinematicTranslation({
      x: x.current,
      y,
      z: 0,
    });
  });

  const onCollisionEnter = ({
    other,
  }: {
    other: { rigidBody?: RapierRigidBody };
  }) => {
    const ball = other.rigidBody;
    if (!ball) return;

    // One-shot: only process collision once per contact cycle.
    // Reset when the ball moves away (detected by velocity change).
    if (collisionHandled.current) return;

    const ballX = ball.translation().x;
    const offset = (ballX - x.current) / PADDLE_HALF_WIDTH;
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
    collisionHandled.current = true;
  };

  const onCollisionExit = ({
    other,
  }: {
    other: { rigidBody?: RapierRigidBody };
  }) => {
    if (other.rigidBody) {
      collisionHandled.current = false;
      bounceRef.current.active = true;
      bounceRef.current.elapsed = 0;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
      }
      if (e.key === "Shift") {
        isDoubleSpeed.current = true;
        return;
      }
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
      }
      if (e.key === "Shift") {
        isDoubleSpeed.current = false;
        return;
      }
      keys.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { keys, ref, onCollisionEnter, onCollisionExit, paddleScaleX };
}
