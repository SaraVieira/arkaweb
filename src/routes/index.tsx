import { Canvas } from "@react-three/fiber";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HomeScene } from "#/components/HomeScene";
import { Leaderboard } from "#/components/Leaderboard";

export const Route = createFileRoute("/")({
  component: Home,
  ssr: false,
});

function Home() {
  const [showScores, setShowScores] = useState(false);

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
        <button
          type="button"
          onClick={() => setShowScores(true)}
          className="rounded-lg bg-white/10 px-6 py-3 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        >
          Show scores
        </button>
      </div>

      {showScores && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close scores"
            onClick={() => setShowScores(false)}
            className="absolute inset-0 cursor-default"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Top scores"
            className="relative flex w-full max-w-md flex-col gap-4 rounded-lg bg-black/80 p-6"
          >
            <h2 className="text-center text-2xl tracking-widest text-white">
              TOP SCORES
            </h2>
            <Leaderboard />
            <button
              type="button"
              onClick={() => setShowScores(false)}
              className="self-center rounded border border-white px-4 py-1 text-sm text-white hover:bg-white hover:text-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
