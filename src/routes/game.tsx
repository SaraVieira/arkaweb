import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  Glitch,
  Noise,
  Outline,
} from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { createFileRoute } from "@tanstack/react-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  BlendFunction,
  GlitchMode,
  KernelSize,
  Resolution,
} from "postprocessing";
import { useCallback, useEffect, useState } from "react";
import { Vector2 } from "three";
import { Background } from "#/components/Background";
import { Ball } from "#/components/ball";
import { Enemy } from "#/components/enemy";
import { Overlay } from "#/components/overlay";
import { Paddle } from "#/components/paddle";
import { Walls } from "#/components/walls";
import { getLevelsFn } from "#/levels/server";
import {
  advanceLevelAtom,
  currentLevelAtom,
  enemiesAtom,
  GAME_STATE,
  gameStateAtom,
  levelsAtom,
  livesAtom,
  loadLevelAtom,
  resetGameAtom,
  roundAtom,
  scoreAtom,
} from "#/lib/game-store";

export const Game = () => {
  const loadLevel = useSetAtom(loadLevelAtom);
  const resetGame = useSetAtom(resetGameAtom);
  const advanceLevel = useSetAtom(advanceLevelAtom);
  const enemies = useAtomValue(enemiesAtom);
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const [hit, setHit] = useState(false);
  const lives = useAtomValue(livesAtom);
  const score = useAtomValue(scoreAtom);
  const round = useAtomValue(roundAtom);
  const currentLevel = useAtomValue(currentLevelAtom);
  const [levels, setLevels] = useAtom(levelsAtom);
  const level = levels[currentLevel];

  const onHit = () => {
    setHit(true);
    setTimeout(() => setHit(false), 100);
  };

  useEffect(() => {
    let cancelled = false;
    getLevelsFn().then((data) => {
      if (cancelled) return;
      setLevels(data);
      loadLevel();
    });
    return () => {
      cancelled = true;
    };
  }, [setLevels, loadLevel]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        if (gameState === GAME_STATE.READY) {
          setGameState(GAME_STATE.PLAYING);
        } else if (gameState === GAME_STATE.PLAYING) {
          setGameState(GAME_STATE.PAUSED);
        } else if (gameState === GAME_STATE.PAUSED) {
          setGameState(GAME_STATE.PLAYING);
        }
      }
    },
    [gameState, setGameState],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (levels.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        Loading levels…
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas shadows camera={{ position: [0, 5, 24], fov: 50 }}>
        <Environment files={["/venice_sunset_2k.exr"]} />
        <Background />

        <Physics
          gravity={[0, 0, 0]}
          paused={
            gameState === GAME_STATE.PAUSED ||
            gameState === GAME_STATE.LEVEL_COMPLETE ||
            gameState === GAME_STATE.GAME_OVER ||
            gameState === GAME_STATE.WON
          }
        >
          <Walls />
          <Ball key={`ball-${round}`} />
          <Paddle key={`paddle-${round}`} />
          {Object.keys(enemies).map((id) => {
            const enemy = enemies[id];
            return (
              <Enemy
                onHit={onHit}
                key={`enemy-${id}`}
                id={id}
                type={enemy.type}
                position={enemy.position}
              />
            );
          })}
        </Physics>
        <EffectComposer>
          <Bloom luminanceThreshold={0.4} luminanceSmoothing={1} height={300} />
          <Noise blendFunction={BlendFunction.OVERLAY} />
          <Glitch
            duration={new Vector2(0.05, 0.1)}
            strength={new Vector2(0.01, 0.05)}
            mode={GlitchMode.CONSTANT_MILD}
            active={hit}
            ratio={1}
          />
          <Outline
            selectionLayer={10}
            blendFunction={BlendFunction.SCREEN}
            edgeStrength={2.5}
            pulseSpeed={0.0}
            visibleEdgeColor={0xffffff}
            hiddenEdgeColor={0x22090a}
            width={Resolution.AUTO_SIZE}
            height={Resolution.AUTO_SIZE}
            kernelSize={KernelSize.LARGE}
            blur={false}
            xRay={true}
          />
        </EffectComposer>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 text-white drop-shadow-lg">
        <div className="text-xl">Score: {score.toLocaleString()}</div>
        <div className="text-xl">
          Level {currentLevel + 1}
          {level ? ` — ${level.name}` : ""}
        </div>
        <div className="text-xl">Lives: {lives}</div>
      </div>

      {gameState === GAME_STATE.READY && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-xl text-white drop-shadow-lg">
          Press SPACE to launch
        </div>
      )}

      {gameState === GAME_STATE.PAUSED && (
        <Overlay title="PAUSED" subtitle="Press space to resume" />
      )}

      {gameState === GAME_STATE.LEVEL_COMPLETE && (
        <Overlay
          title="LEVEL CLEAR"
          subtitle={`Score: ${score.toLocaleString()}`}
          actionLabel="Next level"
          onAction={advanceLevel}
        />
      )}

      {gameState === GAME_STATE.GAME_OVER && (
        <Overlay
          title="GAME OVER"
          subtitle={`Final score: ${score.toLocaleString()}`}
          actionLabel="Play again"
          onAction={resetGame}
        />
      )}

      {gameState === GAME_STATE.WON && (
        <Overlay
          title="YOU WIN!"
          subtitle={`Final score: ${score.toLocaleString()}`}
          actionLabel="Play again"
          onAction={resetGame}
        />
      )}
    </div>
  );
};

export const Route = createFileRoute("/game")({
  component: Game,
  ssr: false,
});
