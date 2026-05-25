import { atom } from "jotai";
import { EnemyType, type Level } from "#/levels/schema";
import { CELL_HEIGHT, CELL_WIDTH, START_X, START_Y } from "./consts";

export { EnemyType };

export const levelsAtom = atom<Level[]>([]);

export enum GAME_STATE {
  READY = "ready",
  PLAYING = "playing",
  PAUSED = "paused",
  LEVEL_COMPLETE = "level_complete",
  GAME_OVER = "game_over",
  WON = "won",
}

export const paddlePositionRef = { current: 0 };

export const POINTS_PER_TYPE: Record<EnemyType, number> = {
  [EnemyType.Normal]: 10,
  [EnemyType.Silver]: 25,
  [EnemyType.Gold]: 50,
};

const INITIAL_LIVES = 3;
export enum settingsEnum {
  bloom = "bloom",
  toneMapping = "toneMapping",
  vignette = "vignette",
  chromaticAberration = "chromaticAberration",
  scanline = "scanline",
}

export const livesAtom = atom(INITIAL_LIVES);
export const scoreAtom = atom(0);
export const roundAtom = atom(0);
export const currentLevelAtom = atom(0);
export const gameStateAtom = atom<GAME_STATE>(GAME_STATE.READY);
export const settingAtom = atom<Record<settingsEnum, boolean>>({
  bloom: true,
  toneMapping: true,
  vignette: true,
  chromaticAberration: true,
  scanline: true,
});

export const enemiesAtom = atom<
  Record<string, { position: [number, number, number]; type: EnemyType }>
>({});

export const gameStartTimeAtom = atom<number | null>(null);
export const playDurationAtom = atom(0);

const gridToWorld = (row: number, col: number): [number, number, number] => [
  START_X + col * CELL_WIDTH,
  START_Y - row * CELL_HEIGHT,
  0,
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

export const destroyEnemyAtom = atom(
  null,
  (get, set, { id, type }: { id: string; type: EnemyType }) => {
    set(removeEnemyAtom, id);
    set(scoreAtom, get(scoreAtom) + POINTS_PER_TYPE[type]);
    const remaining = get(enemiesAtom);
    if (Object.keys(remaining).length === 0) {
      const next = get(currentLevelAtom) + 1;
      const isWon = next >= get(levelsAtom).length;
      if (isWon) {
        const startTime = get(gameStartTimeAtom);
        if (startTime !== null) {
          set(playDurationAtom, Math.round((Date.now() - startTime) / 1000));
        }
      }
      set(gameStateAtom, isWon ? GAME_STATE.WON : GAME_STATE.LEVEL_COMPLETE);
    }
  },
);

export const loadLevelAtom = atom(null, (get, set) => {
  const level = get(levelsAtom)[get(currentLevelAtom)];
  set(enemiesAtom, {});
  if (!level) return;
  let id = 0;
  level.grid.forEach((row, rowIndex) => {
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

export const advanceLevelAtom = atom(null, (get, set) => {
  const next = get(currentLevelAtom) + 1;
  if (next >= get(levelsAtom).length) {
    set(gameStateAtom, GAME_STATE.WON);
    return;
  }
  set(currentLevelAtom, next);
  set(gameStateAtom, GAME_STATE.READY);
  set(roundAtom, get(roundAtom) + 1);
  set(loadLevelAtom);
});

export const resetGameAtom = atom(null, (get, set) => {
  set(scoreAtom, 0);
  set(livesAtom, INITIAL_LIVES);
  set(currentLevelAtom, 0);
  set(gameStateAtom, GAME_STATE.READY);
  set(roundAtom, get(roundAtom) + 1);
  set(gameStartTimeAtom, null);
  set(playDurationAtom, 0);
  set(loadLevelAtom);
});
