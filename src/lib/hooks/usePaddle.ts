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
	const bounds = useGameBounds();
	const minX = bounds.left + PADDLE_HALF_WIDTH;
	const maxX = bounds.right - PADDLE_HALF_WIDTH;
	const paddleY = bounds.bottom + PADDLE_BOTTOM_OFFSET;

	useFrame((_state, delta) => {
		const speed = isDoubleSpeed.current ? DOUBLE_SPEED : SPEED;
		const step = speed * delta;
		if (keys.current.ArrowLeft) x.current -= step;
		if (keys.current.ArrowRight) x.current += step;
		x.current = Math.max(minX, Math.min(maxX, x.current));
		paddlePositionRef.current = x.current;
		ref.current?.setNextKinematicTranslation({
			x: x.current,
			y: paddleY,
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
		const ballX = ball.translation().x;
		const offset = (ballX - x.current) / PADDLE_HALF_WIDTH;
		const clamped = Math.max(-1, Math.min(1, offset));
		const angle = clamped * PADDLE_MAX_ANGLE;
		ball.setLinvel(
			{
				x: Math.sin(angle) * BALL_SPEED,
				y: Math.cos(angle) * BALL_SPEED,
				z: 0,
			},
			true,
		);
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

	return { keys, ref, onCollisionEnter };
}
