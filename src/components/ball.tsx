import { useThree } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useAtom, useSetAtom } from "jotai";
import { useRef } from "react";
import { GAME_STATE, gameStateAtom, livesAtom } from "#/lib/game-store";

export function Ball() {
	const ref = useRef<RapierRigidBody | null>(null);
	const [lives, setLives] = useAtom(livesAtom);
	const setGameState = useSetAtom(gameStateAtom);
	const { viewport } = useThree();

	const onFloorCollision = () => {
		if (lives <= 1) {
			setLives(0);
			setGameState(GAME_STATE.GAME_OVER);
			ref.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
			return;
		}
		setLives(lives - 1);
		const angle = (Math.random() - 0.5) * 0.8;
		ref.current?.setTranslation({ x: 0, y: 0, z: 0 }, true);
		ref.current?.setLinvel({ x: Math.sin(angle) * 10, y: 10, z: 0 }, true);
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
