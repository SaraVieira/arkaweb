import { useState } from "react";
import { submitScoreFn } from "#/scores/server";
import { Leaderboard } from "./Leaderboard";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Props = {
  title: string;
  score: number;
  duration: number;
  onPlayAgain: () => void;
};

export const GameEndOverlay = ({
  title,
  score,
  duration,
  onPlayAgain,
}: Props) => {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitScoreFn({ data: { name: trimmed, score, duration } });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/70 text-white">
      <h2 className="text-6xl font-bold tracking-widest">{title}</h2>
      <p className="text-xl">Final score: {score.toLocaleString()}</p>
      {duration > 0 && (
        <p className="text-lg text-white/70">
          Play time: {formatDuration(duration)}
        </p>
      )}

      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={32}
            autoFocus
            className="rounded border border-white/40 bg-white/10 px-3 py-2 text-white placeholder-white/40 outline-none focus:border-white"
          />
          <button
            type="submit"
            disabled={submitting || name.trim().length === 0}
            className="rounded border border-white px-4 py-2 hover:bg-white hover:text-black disabled:opacity-40"
          >
            {submitting ? "Saving…" : "Save score"}
          </button>
        </form>
      ) : (
        <div className="flex w-full max-w-md flex-col gap-3">
          <h3 className="text-center text-xl tracking-wider text-white/80">
            TOP SCORES
          </h3>
          <Leaderboard refreshKey={1} />
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        onClick={onPlayAgain}
        className="mt-4 rounded border border-white px-6 py-2 text-lg hover:bg-white hover:text-black"
      >
        Play again
      </button>
    </div>
  );
};
