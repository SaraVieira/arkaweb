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
import { useEffect, useState } from "react";
import { Vector2 } from "three";
import { Background } from "#/components/Background";
import { Ball } from "#/components/ball";
import { Enemy } from "#/components/enemy";
import { Overlay } from "#/components/overlay";
import { Paddle } from "#/components/paddle";
import { Walls } from "#/components/walls";
import {
	enemiesAtom,
	GAME_STATE,
	gameStateAtom,
	livesAtom,
	loadLevelAtom,
	resetGameAtom,
	roundAtom,
	scoreAtom,
} from "#/lib/game-store";

export const Game = () => {
	const loadLevel = useSetAtom(loadLevelAtom);
	const resetGame = useSetAtom(resetGameAtom);
	const enemies = useAtomValue(enemiesAtom);
	const [gameState, setGameState] = useAtom(gameStateAtom);
	const [hit, setHit] = useState(false);
	const lives = useAtomValue(livesAtom);
	const score = useAtomValue(scoreAtom);
	const round = useAtomValue(roundAtom);

	const onHit = () => {
		setHit(true);
		setTimeout(() => setHit(false), 100);
	};

	useEffect(() => {
		loadLevel();
	}, [loadLevel]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
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
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [gameState, setGameState]);

	return (
		<div className="relative h-screen w-screen overflow-hidden">
			<Canvas shadows camera={{ position: [0, 5, 24], fov: 50 }}>
				<Environment preset="sunset" />
				<Background />

				<Physics
					gravity={[0, -30, 0]}
					paused={
						gameState === GAME_STATE.PAUSED ||
						gameState === GAME_STATE.GAME_OVER ||
						gameState === GAME_STATE.WON
					}
				>
					<Walls />
					<Ball key={round} />
					<Paddle key={round} />
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

			<div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 font-mono text-white drop-shadow-lg">
				<div className="text-xl">Score: {score.toLocaleString()}</div>
				<div className="text-xl">Lives: {lives}</div>
			</div>

			{gameState === GAME_STATE.READY && (
				<div className="pointer-events-none absolute inset-x-0 bottom-8 text-center font-mono text-xl text-white drop-shadow-lg">
					Press SPACE to launch
				</div>
			)}

			{gameState === GAME_STATE.PAUSED && (
				<Overlay title="PAUSED" subtitle="Press space to resume" />
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
