// Ball moves at a constant speed (no gravity). Bounces are perfectly elastic;
// direction changes come from collision normals + paddle deflection.
export const BALL_SPEED = 20;
// Max paddle deflection angle from vertical, in radians (~65°).
export const PADDLE_MAX_ANGLE = 1.15;
// Minimum |vy| / speed; prevents the ball going purely horizontal.
export const MIN_VY_RATIO = 0.25;

export const COLS = 8;
export const CELL_WIDTH = 3;
export const CELL_HEIGHT = 1.3;
export const START_X = (-(COLS - 1) * CELL_WIDTH) / 2;
export const START_Y = 8;
