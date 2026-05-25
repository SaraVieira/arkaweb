import level01 from "./level-01.json";
import { type Level, levelSchema } from "./schema";

export type { Level, LevelCell } from "./schema";
export { EnemyType, levelSchema } from "./schema";

export const levels: Level[] = [level01].map((data) => levelSchema.parse(data));
