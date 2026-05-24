import { useEffect, useRef } from "react";
import { BALL_SPEED, MIN_VY_RATIO } from "../consts";
import {
  GAME_STATE,
  gameStartTimeAtom,
  gameStateAtom,
  livesAtom,
  paddlePositionRef,
  playDurationAtom,
} from "../game-store";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useGameBounds } from "./useGameBounds";

export const PADDLE_BOTTOM_OFFSET = 1;
export const BALL_SPAWN_OFFSET_Y = 1.5;
export const FLOOR_THICKNESS = 1;

export const useBall = () => {
  const ref = useRef<RapierRigidBody | null>(null);
  const [lives, setLives] = useAtom(livesAtom);
  const livesRef = useRef(lives);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  const gameState = useAtomValue(gameStateAtom);
  const setGameState = useSetAtom(gameStateAtom);
  const setPlayDuration = useSetAtom(playDurationAtom);
  const gameStartTime = useAtomValue(gameStartTimeAtom);
  const bounds = useGameBounds();
  const paddleY = bounds.bottom + PADDLE_BOTTOM_OFFSET;
  const floorY = bounds.bottom - FLOOR_THICKNESS;

  useFrame(() => {
    const body = ref.current;
    if (!body) return;

    if (gameState === GAME_STATE.READY) {
      body.setTranslation(
        {
          x: paddlePositionRef.current,
          y: paddleY + BALL_SPAWN_OFFSET_Y,
          z: 0,
        },
        true,
      );
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    if (gameState !== GAME_STATE.PLAYING) return;

    // Keep ball speed constant + prevent purely-horizontal motion.
    const v = body.linvel();
    const mag = Math.hypot(v.x, v.y);
    if (mag < 0.001) {
      // Restore vertical bias so the ball doesn't stay stuck horizontal
      body.setLinvel(
        { x: Math.sin(0.3) * BALL_SPEED, y: Math.cos(0.3) * BALL_SPEED, z: 0 },
        true,
      );
      return;
    }
    let nx = v.x / mag;
    let ny = v.y / mag;
    const minVy = MIN_VY_RATIO;
    if (Math.abs(ny) < minVy) {
      ny = Math.sign(ny || 1) * minVy;
      const remaining = Math.sqrt(Math.max(0, 1 - ny * ny));
      nx = Math.sign(nx || 1) * remaining;
    }
    body.setLinvel({ x: nx * BALL_SPEED, y: ny * BALL_SPEED, z: 0 }, true);
  });

  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING) return;
    const body = ref.current;
    if (!body) return;
    const linvel = body.linvel();
    if (Math.abs(linvel.x) > 0.01 || Math.abs(linvel.y) > 0.01) return;
    const angle = (Math.random() - 0.5) * 0.6;
    body.setLinvel(
      {
        x: Math.sin(angle) * BALL_SPEED,
        y: Math.cos(angle) * BALL_SPEED,
        z: 0,
      },
      true,
    );
  }, [gameState]);

  const onFloorCollision = () => {
    const body = ref.current;
    const currentLives = livesRef.current;
    if (currentLives <= 1) {
      setLives(0);
      if (gameStartTime !== null) {
        setPlayDuration(Math.round((Date.now() - gameStartTime) / 1000));
      }
      setGameState(GAME_STATE.GAME_OVER);
      body?.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }
    setLives(currentLives - 1);
    setGameState(GAME_STATE.READY);
  };

  return {
    onFloorCollision,
    ref,
    floorY,
  };
};
