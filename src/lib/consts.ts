// Speed the ball is clamped to every frame; direction comes from bounces + paddle deflection.
export const BALL_SPEED = 20;
// Max paddle deflection angle from vertical, in radians (~65°).
export const PADDLE_MAX_ANGLE = 1.15;
// How far above the bottom wall the paddle sits. Read by usePaddle (positioning) and useBall (knows where the ball spawns).
export const PADDLE_BOTTOM_OFFSET = 8;

const COLS = 8;
export const CELL_WIDTH = 3;
export const CELL_HEIGHT = 1.3;
export const START_X = (-(COLS - 1) * CELL_WIDTH) / 2;
export const START_Y = 8;
export const INITIAL_LIVES = 3;
