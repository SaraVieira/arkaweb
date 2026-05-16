import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";

export interface GameBounds {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

/**
 * Visible area at the play plane (z=0), in world units, based on the active
 * perspective camera. Camera is assumed to look along -z from its position.
 */
export function useGameBounds(): GameBounds {
	const camera = useThree((s) => s.camera);
	const size = useThree((s) => s.size);

	if (!(camera instanceof PerspectiveCamera)) {
		return { left: -20, right: 20, top: 15, bottom: -10 };
	}

	const z = camera.position.z;
	const halfH = z * Math.tan(((camera.fov ?? 50) * Math.PI) / 360);
	const aspect = size.width / size.height;
	const halfW = halfH * aspect;
	return {
		left: -halfW,
		right: halfW,
		top: camera.position.y + halfH,
		bottom: camera.position.y - halfH,
	};
}
