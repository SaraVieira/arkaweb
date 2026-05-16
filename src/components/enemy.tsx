import type { RigidBodyOptions } from "@react-three/rapier";
import { RigidBody } from "@react-three/rapier";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { destroyEnemyAtom, EnemyType } from "#/lib/game-store";

const HITS_TO_DESTROY: Record<EnemyType, number> = {
	[EnemyType.Normal]: 1,
	[EnemyType.Silver]: 2,
	[EnemyType.Gold]: 3,
};

export const Enemy = ({
	position,
	type,
	onHit,
	id,
}: {
	onHit: () => void;
	position: RigidBodyOptions["position"];
	type: EnemyType;
	id: string;
}) => {
	const [hits, setHits] = useState(0);
	const destroyEnemy = useSetAtom(destroyEnemyAtom);

	return (
		<RigidBody
			colliders="cuboid"
			type="fixed"
			position={position}
			restitution={1}
			onCollisionEnter={() => {
				const next = hits + 1;
				setHits(next);
				if (next >= HITS_TO_DESTROY[type]) {
					destroyEnemy({ id, type });
					onHit();
				}
			}}
		>
			<mesh castShadow>
				<boxGeometry args={[2.5, 1, 1]} />
				<meshPhysicalMaterial
					metalness={type !== EnemyType.Normal ? 1 : 0}
					roughness={type !== EnemyType.Normal ? 0 : 0.5}
					color={
						type === EnemyType.Normal
							? "lightblue"
							: type === EnemyType.Silver
								? "silver"
								: "gold "
					}
				/>
			</mesh>
		</RigidBody>
	);
};
