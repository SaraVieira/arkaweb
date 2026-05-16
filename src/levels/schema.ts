import { z } from "zod";

export enum EnemyType {
	Normal = "normal",
	Silver = "silver",
	Gold = "gold",
}

export const enemyTypeSchema = z.nativeEnum(EnemyType);
export const levelCellSchema = z.union([enemyTypeSchema, z.null()]);

export const levelSchema = z.object({
	id: z
		.string()
		.min(1)
		.regex(/^[a-z0-9-]+$/, "id must be kebab-case (a-z, 0-9, -)"),
	name: z.string().min(1),
	grid: z.array(z.array(levelCellSchema).min(1)).min(1),
});

export type LevelCell = z.infer<typeof levelCellSchema>;
export type Level = z.infer<typeof levelSchema>;
