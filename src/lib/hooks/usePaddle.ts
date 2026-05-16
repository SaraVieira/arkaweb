import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { PADDLE_HIT_SPEED, PADDLE_LIMITS } from "../consts";
import { paddlePositionRef } from "../game-store";

export function usePaddle() {
	const keys = useRef<Record<string, boolean>>({});
	const ref = useRef<RapierRigidBody | null>(null);
	const x = useRef(0);

	useFrame(({ viewport }, delta) => {
		const step = 24 * delta;
		if (keys.current.ArrowLeft) x.current -= step;
		if (keys.current.ArrowRight) x.current += step;
		x.current = Math.max(
			PADDLE_LIMITS.left,
			Math.min(PADDLE_LIMITS.right, x.current),
		);
		paddlePositionRef.current = x.current;
		ref.current?.setNextKinematicTranslation({
			x: x.current,
			y: -viewport.height / 3,
			z: 0,
		});
	});

	const onCollisionEnter = ({ other }: any) => {
		const ballX = other.rigidBody.translation().x;
		const paddleX = x.current;
		const hitOffset = ballX - paddleX;
		const speed = PADDLE_HIT_SPEED;
		other.rigidBody.setLinvel({ x: hitOffset * 5, y: speed, z: 0 }, true);
	};
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				e.preventDefault();
			}
			keys.current[e.key] = true;
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				e.preventDefault();
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

	return { keys, ref, onCollisionEnter };
}
