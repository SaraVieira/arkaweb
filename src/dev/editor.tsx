import { useCallback, useEffect, useState } from "react";
import { deleteLevelFn, saveLevelFn } from "#/dev/level-actions";
import { EnemyType, type Level, type LevelCell } from "#/levels/schema";
import { getLevelsFn } from "#/levels/server";

const CYCLE: LevelCell[] = [
	null,
	EnemyType.Normal,
	EnemyType.Silver,
	EnemyType.Gold,
];

const CELL_STYLES: Record<string, string> = {
	null: "bg-zinc-900 hover:bg-zinc-800 border-zinc-700",
	[EnemyType.Normal]: "bg-sky-400 hover:bg-sky-300 border-sky-200 text-sky-950",
	[EnemyType.Silver]:
		"bg-zinc-300 hover:bg-zinc-200 border-zinc-100 text-zinc-900",
	[EnemyType.Gold]:
		"bg-yellow-400 hover:bg-yellow-300 border-yellow-200 text-yellow-950",
};

const DEFAULT_ROWS = 6;
const DEFAULT_COLS = 8;

function emptyGrid(rows: number, cols: number): LevelCell[][] {
	return Array.from({ length: rows }, () =>
		Array.from({ length: cols }, () => null as LevelCell),
	);
}

function cycle(cell: LevelCell): LevelCell {
	const idx = CYCLE.indexOf(cell);
	return CYCLE[(idx + 1) % CYCLE.length];
}

function cellLabel(cell: LevelCell): string {
	if (cell === null) return "";
	if (cell === EnemyType.Normal) return "N";
	if (cell === EnemyType.Silver) return "S";
	return "G";
}

export function Editor() {
	const [levels, setLevelsState] = useState<Level[]>([]);
	const [working, setWorking] = useState<Level | null>(null);
	const [status, setStatus] = useState<string>("");

	const refresh = useCallback(async () => {
		const data = await getLevelsFn();
		setLevelsState(data);
		return data;
	}, []);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const startNew = () => {
		const idBase = `level-${String(levels.length + 1).padStart(2, "0")}`;
		setWorking({
			id: idBase,
			name: "New level",
			grid: emptyGrid(DEFAULT_ROWS, DEFAULT_COLS),
		});
		setStatus("");
	};

	const startEdit = (level: Level) => {
		setWorking(structuredClone(level));
		setStatus("");
	};

	const updateCell = (row: number, col: number) => {
		if (!working) return;
		const grid = working.grid.map((r) => r.slice());
		grid[row][col] = cycle(grid[row][col]);
		setWorking({ ...working, grid });
	};

	const addRow = () => {
		if (!working) return;
		const cols = working.grid[0]?.length ?? DEFAULT_COLS;
		setWorking({
			...working,
			grid: [...working.grid, Array.from({ length: cols }, () => null)],
		});
	};

	const removeRow = () => {
		if (!working || working.grid.length <= 1) return;
		setWorking({ ...working, grid: working.grid.slice(0, -1) });
	};

	const addCol = () => {
		if (!working) return;
		setWorking({
			...working,
			grid: working.grid.map((r) => [...r, null as LevelCell]),
		});
	};

	const removeCol = () => {
		if (!working) return;
		if ((working.grid[0]?.length ?? 0) <= 1) return;
		setWorking({
			...working,
			grid: working.grid.map((r) => r.slice(0, -1)),
		});
	};

	const save = async () => {
		if (!working) return;
		setStatus("Saving…");
		try {
			await saveLevelFn({ data: working });
			await refresh();
			setStatus("Saved");
		} catch (err) {
			setStatus(`Error: ${(err as Error).message}`);
		}
	};

	const remove = async (id: string) => {
		if (!confirm(`Delete ${id}?`)) return;
		await deleteLevelFn({ data: { id } });
		if (working?.id === id) setWorking(null);
		await refresh();
	};

	return (
		<div className="flex h-screen w-screen bg-zinc-950 text-white">
			<aside className="w-64 border-zinc-800 border-r p-4">
				<h2 className="mb-4 font-bold text-lg">Levels</h2>
				<button
					type="button"
					onClick={startNew}
					className="mb-4 w-full rounded bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500"
				>
					+ New level
				</button>
				<ul className="space-y-1">
					{levels.map((lvl) => (
						<li key={lvl.id} className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => startEdit(lvl)}
								className={`flex-1 rounded px-2 py-1 text-left text-sm hover:bg-zinc-800 ${
									working?.id === lvl.id ? "bg-zinc-800" : ""
								}`}
							>
								<div className="font-mono">{lvl.id}</div>
								<div className="text-xs text-zinc-400">{lvl.name}</div>
							</button>
							<button
								type="button"
								onClick={() => remove(lvl.id)}
								className="rounded px-2 py-1 text-red-400 text-xs hover:bg-red-950"
							>
								Del
							</button>
						</li>
					))}
				</ul>
			</aside>

			<main className="flex-1 overflow-auto p-6">
				{!working ? (
					<div className="text-zinc-400">
						Select a level or create a new one.
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex flex-wrap items-end gap-4">
							<label className="block">
								<span className="block text-xs text-zinc-400">id</span>
								<input
									value={working.id}
									onChange={(e) =>
										setWorking({ ...working, id: e.target.value })
									}
									className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono"
								/>
							</label>
							<label className="block">
								<span className="block text-xs text-zinc-400">name</span>
								<input
									value={working.name}
									onChange={(e) =>
										setWorking({ ...working, name: e.target.value })
									}
									className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
								/>
							</label>
							<div className="ml-auto flex items-center gap-2">
								<button
									type="button"
									onClick={save}
									className="rounded bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-500"
								>
									Save
								</button>
								{status && (
									<span className="text-sm text-zinc-400">{status}</span>
								)}
							</div>
						</div>

						<div className="flex items-center gap-2 text-sm">
							<span className="text-zinc-400">Grid:</span>
							<button
								type="button"
								onClick={addRow}
								className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
							>
								+row
							</button>
							<button
								type="button"
								onClick={removeRow}
								className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
							>
								-row
							</button>
							<button
								type="button"
								onClick={addCol}
								className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
							>
								+col
							</button>
							<button
								type="button"
								onClick={removeCol}
								className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
							>
								-col
							</button>
							<span className="ml-4 text-xs text-zinc-500">
								click to cycle: empty → N → S → G
							</span>
						</div>

						<div
							className="inline-grid gap-1"
							style={{
								gridTemplateColumns: `repeat(${working.grid[0]?.length ?? 0}, minmax(0, 1fr))`,
							}}
						>
							{working.grid.map((row, rowIdx) =>
								row.map((cell, colIdx) => (
									<button
										// biome-ignore lint/suspicious/noArrayIndexKey: grid coordinates are stable
										key={`${rowIdx}-${colIdx}`}
										type="button"
										onClick={() => updateCell(rowIdx, colIdx)}
										className={`flex h-10 w-12 items-center justify-center rounded border text-sm ${
											CELL_STYLES[String(cell)]
										}`}
									>
										{cellLabel(cell)}
									</button>
								)),
							)}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
