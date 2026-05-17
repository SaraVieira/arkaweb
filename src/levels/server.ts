import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createServerFn } from "@tanstack/react-start";
import { type Level, levelSchema } from "./schema";

const LEVELS_DIR = "src/levels";

export const getLevelsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const dir = join(process.cwd(), LEVELS_DIR);
    const files = await readdir(dir).catch(() => [] as string[]);
    const levels: Level[] = [];
    for (const file of files.sort()) {
      if (!file.endsWith(".json")) continue;
      const content = await readFile(join(dir, file), "utf-8");
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        continue;
      }
      const result = levelSchema.safeParse(parsed);
      if (result.success) levels.push(result.data);
    }
    return levels;
  },
);
