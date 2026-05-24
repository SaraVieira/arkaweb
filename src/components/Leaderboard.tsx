import { useEffect, useState } from "react";
import { getScoresFn, type ScoreEntry } from "#/scores/server";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const Leaderboard = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [scores, setScores] = useState<ScoreEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    // refreshKey is intentionally read so callers can force a refetch
    void refreshKey;
    getScoresFn().then((data) => {
      if (!cancelled) setScores(data);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (scores === null) {
    return <div className="text-white/70">Loading scores…</div>;
  }

  if (scores.length === 0) {
    return <div className="text-white/70">No scores yet — be the first.</div>;
  }

  return (
    <ol className="flex flex-col gap-2 text-white">
      {scores.map((entry, index) => (
        <li
          key={entry.id}
          className="flex items-center justify-between gap-8 border-b border-white/10 pb-1 text-lg"
        >
          <span className="w-8 text-white/50">{index + 1}.</span>
          <span className="flex-1 truncate">{entry.name ?? "—"}</span>
          <span className="font-mono">
            {(entry.score ?? 0).toLocaleString()}
          </span>
          <span className="text-sm text-white/60">
            {entry.duration != null
              ? formatDuration(entry.duration)
              : "—"}
          </span>
        </li>
      ))}
    </ol>
  );
};
