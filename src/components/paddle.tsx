import { RigidBody } from "@react-three/rapier";
import { usePaddle } from "#/lib/hooks/usePaddle";

export function Paddle() {
	const { ref, onCollisionEnter } = usePaddle();

	return (
		<RigidBody
			ref={ref}
			colliders="cuboid"
			type="fixed"
			onCollisionEnter={onCollisionEnter}
		>
			<mesh castShadow>
				<boxGeometry args={[4, 1, 1]} />
				<meshPhysicalMaterial
					color="lightblue"
					metalness={0.8}
					roughness={0.2}
					clearcoat={0.5}
				/>
			</mesh>
		</RigidBody>
	);
}
