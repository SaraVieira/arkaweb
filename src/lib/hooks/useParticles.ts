import { useMemo, useRef } from "react";
import { EnemyType } from "../game-store";
import * as THREE from "three";

const PARTICLE_COLORS: Record<EnemyType, string> = {
  [EnemyType.Normal]: "#18c9ff",
  [EnemyType.Silver]: "#c0c0c0",
  [EnemyType.Gold]: "#ffd700",
};

const PARTICLE_COUNT = 12;

function spawnParticles(): {
  positions: Float32Array;
  velocities: Float32Array;
} {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5;
    const speed = 4 + Math.random() * 6;
    velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
    velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * speed * 0.5;
  }
  return { positions, velocities };
}

export const useParticles = ({ type }: { type: EnemyType }) => {
  const particles = useRef(spawnParticles());
  const particleColor = PARTICLE_COLORS[type];

  const pointsRef = useRef<THREE.Points>(null);

  const pointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(particles.current.positions, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", attr);
    return geo;
  }, []);

  const spreadParticles = ({
    delta,
    progress,
  }: {
    delta: number;
    progress: number;
  }) => {
    const pts = particles.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pts.positions[i * 3] += pts.velocities[i * 3] * delta;
      pts.positions[i * 3 + 1] += pts.velocities[i * 3 + 1] * delta;
      pts.positions[i * 3 + 2] += pts.velocities[i * 3 + 2] * delta;
    }

    if (pointsRef.current) {
      const attr = pointsRef.current.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      attr.array.set(pts.positions);
      attr.needsUpdate = true;
      (pointsRef.current.material as THREE.PointsMaterial).opacity =
        1 - progress;
    }
  };

  return {
    pointsGeo,
    particleColor,
    spreadParticles,
    pointsRef,
  };
};
