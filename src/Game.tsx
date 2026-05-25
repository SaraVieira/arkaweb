import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Background } from "#/components/Background";
import { Ball } from "#/components/ball";
import { Effects } from "#/components/Effects";
import { Enemy } from "#/components/enemy";
import { Overlay } from "#/components/overlay";
import { Paddle } from "#/components/paddle";
import { Walls } from "#/components/walls";
import { levels as ALL_LEVELS } from "#/levels";
import {
  advanceLevelAtom,
  currentLevelAtom,
  enemiesAtom,
  GAME_STATE,
  gameStartTimeAtom,
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
  const lives = useAtomValue(livesAtom);
  const score = useAtomValue(scoreAtom);
  const round = useAtomValue(roundAtom);
  const currentLevel = useAtomValue(currentLevelAtom);
  const [levels, setLevels] = useAtom(levelsAtom);
  const gameStartTime = useAtomValue(gameStartTimeAtom);
  const setGameStartTime = useSetAtom(gameStartTimeAtom);
  const level = levels[currentLevel];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const enemyElements = useMemo(
    () =>
      Object.keys(enemies).map((id) => {
        const enemy = enemies[id];
        return (
          <Enemy
            key={`enemy-${id}`}
            id={id}
            type={enemy.type}
            position={enemy.position}
          />
        );
      }),
    [enemies],
  );

  useEffect(() => {
    setLevels(ALL_LEVELS);
    loadLevel();
  }, [setLevels, loadLevel]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        if (gameState === GAME_STATE.READY) {
          if (gameStartTime === null) {
            setGameStartTime(Date.now());
          }
          setGameState(GAME_STATE.PLAYING);
        } else if (gameState === GAME_STATE.PLAYING) {
          setGameState(GAME_STATE.PAUSED);
        } else if (gameState === GAME_STATE.PAUSED) {
          setGameState(GAME_STATE.PLAYING);
        }
      }
    },
    [gameState, setGameState, gameStartTime, setGameStartTime],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    audioRef.current = new Audio(
      "607942__bloodpixelhero__retro-arcade-music-3.wav",
    );
    audioRef.current.volume = 0.1;
    audioRef.current.play().catch(() => {});
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
      <Canvas camera={{ position: [0, 5, 24], fov: 50 }} dpr={[1, 1.5]}>
        <Background />
        <Environment files={["/venice_sunset_2k.exr"]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 15, 8]} intensity={2} />
        <pointLight position={[-10, 10, -5]} intensity={0.5} color="#4488ff" />

        <Effects />

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
          <Paddle key={`paddle-${round}`} />
          <Ball key={`ball-${round}`} />
          {enemyElements}
        </Physics>
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
        <Overlay
          title="Press SPACE to start"
          type="ready"
          subtitleComponent={
            <>
              <h3 className="bold text-2xl mt-8">How to play</h3>
              <ul className="text-center">
                <li>Use left and right arrow keys to move the paddle</li>
                <li>
                  Blue bricks only need one hit. Silver bricks need 2 and gold 3
                  to destroy
                </li>
              </ul>
            </>
          }
        />
      )}

      {gameState === GAME_STATE.PAUSED && (
        <Overlay
          title="PAUSED"
          type="paused"
          subtitle="Press space to resume"
        />
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
