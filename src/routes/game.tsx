import { createFileRoute } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Ball } from "#/components/ball";
import { Paddle } from "#/components/paddle";
import { Enemy } from "#/components/enemy";
import { Environment } from "@react-three/drei";
import { useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { enemiesAtom, loadLevelAtom, pausedAtom } from "#/lib/game-store";

export const Game = () => {
  const loadLevel = useSetAtom(loadLevelAtom);
  const enemies = useAtomValue(enemiesAtom);
  const [paused, setPaused] = useAtom(pausedAtom);

  useEffect(() => {
    loadLevel();
  }, [loadLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setPaused]);

  return (
    <Canvas camera={{ position: [0, 5, 24], fov: 50 }}>
      <Environment preset="city" />
      <Physics gravity={[0, -30, 0]} paused={paused}>
        <Ball />
        <Paddle />
        {Object.keys(enemies).map((id) => {
          const enemy = enemies[id];
          return (
            <Enemy
              key={id}
              id={id}
              color={enemy.color}
              position={enemy.position}
            />
          );
        })}
      </Physics>
    </Canvas>
  );
};

export const Route = createFileRoute("/game")({
  component: Game,
  ssr: false,
});
