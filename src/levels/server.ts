import { createServerFn } from "@tanstack/react-start";
import { type Level, levelSchema } from "./schema";

const levelModules = import.meta.glob<{ default: unknown }>("./level-*.json", {
  eager: true,
});

export const getLevelsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const levels: Level[] = [];
    const paths = Object.keys(levelModules).sort();
    for (const path of paths) {
      const result = levelSchema.safeParse(levelModules[path].default);
      if (result.success) levels.push(result.data);
    }
    return levels;
  },
);
