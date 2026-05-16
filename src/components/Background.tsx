const BG_COLOR = "#042A2B";
const PLUS_COLOR = "#008148";
const BG_Z = -5;

export function Background() {
	const size = 80;
	return (
		<>
			<mesh position={[0, 10, BG_Z]}>
				<planeGeometry args={[size, size]} />
				<meshPhysicalMaterial color={BG_COLOR} side={2} />
			</mesh>
			<gridHelper
				args={[size, size, PLUS_COLOR, PLUS_COLOR]}
				position={[0, 10, BG_Z + 0.02]}
				rotation={[Math.PI / 2, 0, 0]}
			/>
		</>
	);
}
