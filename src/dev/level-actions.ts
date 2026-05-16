import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createServerFn } from "@tanstack/react-start";
import { levelSchema } from "#/levels/schema";

const LEVELS_DIR = "src/levels";

function levelsDir() {
	return join(process.cwd(), LEVELS_DIR);
}

function levelPath(id: string) {
	if (!/^[a-z0-9-]+$/.test(id)) {
		throw new Error("Invalid level id");
	}
	return join(levelsDir(), `${id}.json`);
}

function assertDev() {
	if (process.env.NODE_ENV === "production") {
		throw new Error("Level editor is disabled in production");
	}
}

export const saveLevelFn = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => levelSchema.parse(data))
	.handler(async ({ data }) => {
		assertDev();
		await mkdir(levelsDir(), { recursive: true });
		await writeFile(
			levelPath(data.id),
			`${JSON.stringify(data, null, "\t")}\n`,
			"utf-8",
		);
		return { ok: true };
	});

export const deleteLevelFn = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => {
		if (typeof data !== "object" || data === null) {
			throw new Error("Expected { id: string }");
		}
		const id = (data as { id?: unknown }).id;
		if (typeof id !== "string") throw new Error("Expected id to be string");
		return { id };
	})
	.handler(async ({ data }) => {
		assertDev();
		await unlink(levelPath(data.id));
		return { ok: true };
	});
