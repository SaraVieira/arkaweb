import { useFrame, useThree } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import {
	GAME_STATE,
	gameStateAtom,
	livesAtom,
	paddlePositionRef,
} from "#/lib/game-store";

const BALL_SPAWN_OFFSET_Y = 1.5;
const BALL_LAUNCH_SPEED = 14;

export function Ball() {
	const ref = useRef<RapierRigidBody | null>(null);
	const [lives, setLives] = useAtom(livesAtom);
	const gameState = useAtomValue(gameStateAtom);
	const setGameState = useSetAtom(gameStateAtom);
	const { viewport } = useThree();

	useFrame(() => {
		if (gameState !== GAME_STATE.READY) return;
		const body = ref.current;
		if (!body) return;
		body.setTranslation(
			{
				x: paddlePositionRef.current,
				y: -viewport.height / 3 + BALL_SPAWN_OFFSET_Y,
				z: 0,
			},
			true,
		);
		body.setLinvel({ x: 0, y: 0, z: 0 }, true);
	});

	useEffect(() => {
		if (gameState !== GAME_STATE.PLAYING) return;
		const body = ref.current;
		if (!body) return;
		const linvel = body.linvel();
		if (Math.abs(linvel.x) > 0.01 || Math.abs(linvel.y) > 0.01) return;
		const angle = (Math.random() - 0.5) * 0.8;
		body.setLinvel(
			{
				x: Math.sin(angle) * BALL_LAUNCH_SPEED,
				y: BALL_LAUNCH_SPEED,
				z: 0,
			},
			true,
		);
	}, [gameState]);

	const onFloorCollision = () => {
		const body = ref.current;
		if (lives <= 1) {
			setLives(0);
			setGameState(GAME_STATE.GAME_OVER);
			body?.setLinvel({ x: 0, y: 0, z: 0 }, true);
			return;
		}
		setLives(lives - 1);
		setGameState(GAME_STATE.READY);
	};

	return (
		<>
			<RigidBody ref={ref} colliders="ball" mass={1} restitution={1.1}>
				<mesh>
					<sphereGeometry args={[0.75, 32, 32]} />
					<meshStandardMaterial />
				</mesh>
			</RigidBody>
			<RigidBody
				type="fixed"
				colliders={false}
				position={[0, -viewport.height, 0]}
				restitution={2.1}
				onCollisionEnter={onFloorCollision}
			>
				<CuboidCollider args={[30, 2, 30]} />
			</RigidBody>
		</>
	);
}
