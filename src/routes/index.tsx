import { Canvas } from "@react-three/fiber";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeScene } from "#/components/HomeScene";

export const Route = createFileRoute("/")({
  component: Home,
  ssr: false,
});

function Home() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas>
        <HomeScene />
      </Canvas>

      <div className="flex gap-4 absolute bottom-8 left-1/2 -translate-x-1/2 ">
        <a
          href="/game"
          className="rounded-lg bg-white/10 px-6 py-3 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        >
          Start Game
        </a>
        <button className="rounded-lg bg-white/10 px-6 py-3 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white">
          Show scores
        </button>
      </div>
    </div>
  );
}
