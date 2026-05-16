import { atom } from "jotai";
import { CELL_HEIGHT, CELL_WIDTH, START_X, START_Y } from "./consts";

export enum EnemyType {
  Normal = "normal",
  Silver = "silver",
  Gold = "gold",
}

export enum GAME_STATE {
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "game_over",
}

export const livesAtom = atom(3);
export const gameStateAtom = atom<GAME_STATE>(GAME_STATE.PLAYING);

export const enemiesAtom = atom<
  Record<string, { position: [number, number, number]; type: EnemyType }>
>({});

const gridToWorld = (row: number, col: number): [number, number, number] => [
  START_X + col * CELL_WIDTH,
  START_Y - row * CELL_HEIGHT,
  0,
];

type LevelRow = (EnemyType | null)[];
type Level = LevelRow[];

const levels: Level[] = [
  [
    [
      EnemyType.Normal,
      EnemyType.Normal,
      EnemyType.Silver,
      EnemyType.Normal,
      null,
      EnemyType.Normal,
      EnemyType.Normal,
      EnemyType.Normal,
    ],
    [
      EnemyType.Normal,
      EnemyType.Normal,
      EnemyType.Silver,
      EnemyType.Normal,
      null,
      EnemyType.Normal,
      EnemyType.Normal,
      EnemyType.Normal,
    ],
    [
      EnemyType.Normal,
      EnemyType.Normal,
      EnemyType.Silver,
      EnemyType.Normal,
      null,
      EnemyType.Normal,
      EnemyType.Normal,
      EnemyType.Normal,
    ],
    [
      EnemyType.Silver,
      EnemyType.Normal,
      EnemyType.Silver,
      EnemyType.Normal,
      EnemyType.Silver,
      EnemyType.Silver,
      EnemyType.Normal,
      EnemyType.Normal,
    ],
    [
      EnemyType.Normal,
      EnemyType.Silver,
      EnemyType.Normal,
      EnemyType.Silver,
      EnemyType.Normal,
      EnemyType.Silver,
      EnemyType.Normal,
      EnemyType.Normal,
    ],
    [
      EnemyType.Silver,
      EnemyType.Normal,
      EnemyType.Silver,
      EnemyType.Normal,
      EnemyType.Silver,
      EnemyType.Silver,
      EnemyType.Normal,
      EnemyType.Normal,
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
      type,
    }: { id: string; position: [number, number, number]; type: EnemyType },
  ) => {
    set(enemiesAtom, (prev) => ({
      ...prev,
      [id]: { position, type },
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
    row.forEach((type, colIndex) => {
      if (type) {
        set(addEnemyAtom, {
          id: String(id++),
          position: gridToWorld(rowIndex, colIndex),
          type,
        });
      }
    });
  });
});
