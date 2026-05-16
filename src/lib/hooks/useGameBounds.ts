import { useThree } from "@react-three/fiber";

export interface GameBounds {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

/**
 * Visible area at the play plane (z=0), in world units. Assumes the camera
 * is aimed at the world origin (R3F's default), so the visible area at z=0
 * is centered around (0, 0).
 */
export function useGameBounds(): GameBounds {
	const viewport = useThree((s) => s.viewport);
	return {
		left: -viewport.width / 2,
		right: viewport.width / 2,
		top: viewport.height / 2,
		bottom: -viewport.height / 2,
	};
}
