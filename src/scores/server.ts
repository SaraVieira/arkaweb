import { createServerFn } from "@tanstack/react-start";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { scores } from "#/db/schema";

const submitScoreSchema = z.object({
  name: z.string().trim().min(1).max(32),
  score: z.number().int().nonnegative(),
  duration: z.number().int().nonnegative().optional(),
});

export type ScoreEntry = {
  id: number;
  name: string | null;
  score: number | null;
  duration: number | null;
  createdAt: Date | null;
};

export const submitScoreFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitScoreSchema.parse(input))
  .handler(async ({ data }): Promise<ScoreEntry> => {
    const [row] = await db
      .insert(scores)
      .values({ name: data.name, score: data.score, duration: data.duration ?? null })
      .returning();
    return row;
  });

export const getScoresFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ScoreEntry[]> => {
    return db
      .select()
      .from(scores)
      .orderBy(desc(scores.score), desc(scores.createdAt))
      .limit(10);
  },
);
