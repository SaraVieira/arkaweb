import { atom } from "jotai";
import { CELL_HEIGHT, CELL_WIDTH, START_X, START_Y } from "./consts";

export const pausedAtom = atom(false);

export const enemiesAtom = atom<
  Record<string, { position: [number, number, number]; color: string }>
>({});

const gridToWorld = (row: number, col: number): [number, number, number] => [
  START_X + col * CELL_WIDTH,
  START_Y - row * CELL_HEIGHT,
  0,
];

type EnemyColor = string | null;
type LevelRow = EnemyColor[];
type Level = LevelRow[];

const levels: Level[] = [
  [
    [
      "hotpink",
      "hotpink",
      "orange",
      "hotpink",
      null,
      "hotpink",
      "hotpink",
      "hotpink",
    ],
    [
      "hotpink",
      "hotpink",
      "orange",
      "hotpink",
      null,
      "hotpink",
      "hotpink",
      "hotpink",
    ],
    [
      "hotpink",
      "hotpink",
      "orange",
      "hotpink",
      null,
      "hotpink",
      "hotpink",
      "hotpink",
    ],
    [
      "orange",
      "hotpink",
      "orange",
      "hotpink",
      "orange",
      "orange",
      "hotpink",
      "hotpink",
    ],
    [
      "hotpink",
      "orange",
      "hotpink",
      "orange",
      "hotpink",
      "orange",
      "hotpink",
      "hotpink",
    ],
    [
      "orange",
      "hotpink",
      "orange",
      "hotpink",
      "orange",
      "orange",
      "hotpink",
      "hotpink",
    ],
  ],
];

export const addEnemyAtom = atom(
  null,
  (
    _get,
    set,
    {
      id,
      position,
      color,
    }: { id: string; position: [number, number, number]; color: string },
  ) => {
    set(enemiesAtom, (prev) => ({
      ...prev,
      [id]: { position, color },
    }));
  },
);

export const removeEnemyAtom = atom(null, (_get, set, id: string) => {
  set(enemiesAtom, (prev) => {
    const next = { ...prev };
    delete next[id];
    return next;
  });
});

export const loadLevelAtom = atom(null, (_get, set) => {
  const level = levels[0];
  set(enemiesAtom, {});
  let id = 0;
  level.forEach((row, rowIndex) => {
    row.forEach((color, colIndex) => {
      if (color) {
        set(addEnemyAtom, {
          id: String(id++),
          position: gridToWorld(rowIndex, colIndex),
          color,
        });
      }
    });
  });
});
