import { createFileRoute } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Ball } from "#/components/ball";
import { Paddle } from "#/components/paddle";
import { Enemy } from "#/components/enemy";
import { BlendFunction, GlitchMode } from "postprocessing";

import { Environment, OrbitControls, Html } from "@react-three/drei";
import { useEffect, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  enemiesAtom,
  loadLevelAtom,
  gameStateAtom,
  GAME_STATE,
  livesAtom,
} from "#/lib/game-store";
import {
  Bloom,
  EffectComposer,
  Glitch,
  Noise,
  Outline,
} from "@react-three/postprocessing";
import { Background } from "#/components/Background";
import { Walls } from "#/components/walls";
import { Resizer, KernelSize } from "postprocessing";

export const Game = () => {
  const loadLevel = useSetAtom(loadLevelAtom);
  const enemies = useAtomValue(enemiesAtom);
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const [hit, setHit] = useState(false);
  const lives = useAtomValue(livesAtom);

  const onHit = () => {
    setHit(true);
    setTimeout(() => setHit(false), 100);
  };

  useEffect(() => {
    loadLevel();
  }, [loadLevel]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault();
      if (gameState === GAME_STATE.PLAYING) {
        setGameState(GAME_STATE.PAUSED);
      } else if (gameState === GAME_STATE.PAUSED) {
        setGameState(GAME_STATE.PLAYING);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Canvas shadows camera={{ position: [0, 5, 24], fov: 50 }}>
      <Html>Lives: {lives}</Html>
      {gameState === GAME_STATE.GAME_OVER && <Html>GAME OVER</Html>}
      {gameState === GAME_STATE.PAUSED && <Html>PAUSED</Html>}
      <OrbitControls />
      <Environment preset="sunset" />
      <Background />

      <Physics
        gravity={[0, -30, 0]}
        paused={
          gameState === GAME_STATE.PAUSED || gameState === GAME_STATE.GAME_OVER
        }
      >
        <Walls />
        <Ball />
        <Paddle />
        {Object.keys(enemies).map((id) => {
          const enemy = enemies[id];
          return (
            <Enemy
              onHit={onHit}
              key={id}
              id={id}
              type={enemy.type}
              position={enemy.position}
            />
          );
        })}
      </Physics>
      <EffectComposer>
        <Bloom luminanceThreshold={0.4} luminanceSmoothing={1} height={300} />
        <Noise
          blendFunction={BlendFunction.OVERLAY} // blend mode
        />
        <Glitch
          duration={[0.05]} // min and max glitch duration
          strength={[0.01]} // min and max glitch strength
          mode={GlitchMode.CONSTANT_MILD} // glitch mode
          active={hit} // turn on/off the effect (switches between "mode" prop and GlitchMode.DISABLED)
          ratio={1} // Threshold for strong glitches, 0 - no weak glitches, 1 - no strong glitches.
        />
        <Outline
          // selection={[meshRef1, meshRef2]} // selection of objects that will be outlined
          selectionLayer={10} // selection layer
          blendFunction={BlendFunction.SCREEN} // set this to BlendFunction.ALPHA for dark outlines
          edgeStrength={2.5} // the edge strength
          pulseSpeed={0.0} // a pulse speed. A value of zero disables the pulse effect
          visibleEdgeColor={0xffffff} // the color of visible edges
          hiddenEdgeColor={0x22090a} // the color of hidden edges
          width={Resizer.AUTO_SIZE} // render width
          height={Resizer.AUTO_SIZE} // render height
          kernelSize={KernelSize.LARGE} // blur kernel size
          blur={false} // whether the outline should be blurred
          xRay={true} // indicates whether X-Ray outlines are enabled
        />
      </EffectComposer>
    </Canvas>
  );
};

export const Route = createFileRoute("/game")({
  component: Game,
  ssr: false,
});
