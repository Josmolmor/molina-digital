import {
  mirror,
  rect,
  rotate,
  swapAxes,
  translate,
  type Contour,
  type Point,
} from './geometry';

/*
 * Cursor states, as pure data. The morph engine knows nothing about any of
 * them: adding a state is adding an entry here.
 *
 * Coordinates are CSS pixels around the hotspot at (0, 0). Shapes are drawn
 * with a 1.5px stroke in the fill colour (it softens the corners), so each
 * outline sits 0.75px inside the edge you actually see.
 */

export type CursorShape = {
  label: string;
  /* The native CSS cursor this shape stands in for. */
  css: string;
  hint?: string;
  /* The resting pose; also the tile preview. Up to six contours; holes
   * need `hole: true`. */
  contours: readonly Contour[];
  /* Poses stepped through on a loop. Every frame needs the same contours. */
  sequence?: {
    /* Milliseconds per frame. */
    interval: number;
    frames: readonly (readonly Contour[])[];
  };
  /* Blink like a text caret once the pointer rests. */
  blink?: boolean;
  /* State to switch to while the pointer is held down. */
  pressed?: string;
  /* Defined and still resolvable, but left out of the tile grid. */
  hidden?: boolean;
};

/* Points right, with its centroid on the hotspot. Pointer and the resize
 * arrows share these proportions. */
const TRIANGLE: Point[] = [
  [-16 / 3, -8.5],
  [32 / 3, 0],
  [-16 / 3, 8.5],
];

/* Default, and the base of not-allowed. */
const SQUARE = rect(-7, -7, 14, 14);

/* Two smaller copies of the triangle, back to back: ◀ ▶. RESIZE_GAP is each
 * base's distance from the hotspot. */
const RESIZE_WIDTH = 7;
const RESIZE_HEIGHT = 7.5;
const RESIZE_GAP = 3;
const RESIZE_RIGHT: Point[] = [
  [RESIZE_GAP, -RESIZE_HEIGHT / 2],
  [RESIZE_GAP + RESIZE_WIDTH, 0],
  [RESIZE_GAP, RESIZE_HEIGHT / 2],
];
const RESIZE_LEFT = mirror(RESIZE_RIGHT, true, false);

/* Four fingers on a palm. The fist reuses the same columns so the fingers
 * retract into knuckles instead of rearranging. */
function hand(fingerTops: readonly number[], palmBottom: number): Point[] {
  const columns = [
    [-9.5, -7],
    [-4, -1.5],
    [1.5, 4],
    [7, 9.5],
  ] as const;
  const palmTop = -1;
  const points: Point[] = [[-9.5, palmBottom]];

  columns.forEach(([left, right], i) => {
    if (i > 0) points.push([left, palmTop]);
    points.push([left, fingerTops[i]], [right, fingerTops[i]]);
    if (i < columns.length - 1) points.push([right, palmTop]);
  });

  points.push([9.5, palmBottom]);
  return points;
}

/* Scope: a thin plus inside four corner brackets, 2px lines. */
const PLUS_ARM = 4.25;
const PLUS_HALF = 0.25;
const PLUS: Point[] = [
  [-PLUS_HALF, -PLUS_ARM],
  [PLUS_HALF, -PLUS_ARM],
  [PLUS_HALF, -PLUS_HALF],
  [PLUS_ARM, -PLUS_HALF],
  [PLUS_ARM, PLUS_HALF],
  [PLUS_HALF, PLUS_HALF],
  [PLUS_HALF, PLUS_ARM],
  [-PLUS_HALF, PLUS_ARM],
  [-PLUS_HALF, PLUS_HALF],
  [-PLUS_ARM, PLUS_HALF],
  [-PLUS_ARM, -PLUS_HALF],
  [-PLUS_HALF, -PLUS_HALF],
];
const BRACKET: Point[] = [
  [-9.25, -9.25],
  [-6.75, -9.25],
  [-6.75, -8.75],
  [-8.75, -8.75],
  [-8.75, -6.75],
  [-9.25, -6.75],
];

/*
 * Snake: five equal squares chasing each other round the edge of a 3×3 grid,
 * exactly two full sides when the head reaches a corner. One step per frame,
 * clockwise.
 */
const SNAKE_PITCH = 7;
const SNAKE_DOT = 3.5;
const SNAKE_LENGTH = 5;
const SNAKE_PATH = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
] as const;
/* The loop starts with the head in the top-right corner, so the resting pose
 * (and the tile preview) covers the top and left sides. */
const SNAKE_START = 2;
const SNAKE_FRAMES = SNAKE_PATH.map((_, step) =>
  Array.from({ length: SNAKE_LENGTH }, (_, i): Contour => {
    const head = step + SNAKE_START;
    const [col, row] =
      SNAKE_PATH[(head - i + SNAKE_PATH.length) % SNAKE_PATH.length];
    return {
      points: rect(
        col * SNAKE_PITCH - SNAKE_DOT / 2,
        row * SNAKE_PITCH - SNAKE_DOT / 2,
        SNAKE_DOT,
        SNAKE_DOT,
      ),
    };
  }),
);

const shapes = {
  default: {
    label: 'Default',
    css: 'default',
    contours: [{ points: SQUARE }],
  },
  pointer: {
    label: 'Pointer',
    css: 'pointer',
    /* Tip leans 30° right of vertical (60° up from pointing right). */
    contours: [{ points: rotate(TRIANGLE, -Math.PI / 3) }],
  },
  text: {
    label: 'Text',
    css: 'text',
    blink: true,
    contours: [{ points: rect(-1, -11, 2, 22) }],
  },
  grab: {
    label: 'Grab',
    css: 'grab',
    hint: 'Press and hold',
    pressed: 'grabbing',
    hidden: true,
    contours: [{ points: translate(hand([-6, -10, -10.5, -8], 8), 0, 1.25) }],
  },
  grabbing: {
    label: 'Grabbing',
    css: 'grabbing',
    hidden: true,
    contours: [{ points: translate(hand([-3, -4, -4, -3.5], 6), 0, -1) }],
  },
  crosshair: {
    label: 'Crosshair',
    css: 'crosshair',
    contours: [
      { points: PLUS },
      { points: BRACKET },
      { points: mirror(BRACKET, true, false) },
      { points: mirror(BRACKET, true, true) },
      { points: mirror(BRACKET, false, true) },
    ],
  },
  'not-allowed': {
    label: 'Not allowed',
    css: 'not-allowed',
    /* The default square with a slash cut through it, top-left to
     * bottom-right like 🚫. A level slot read as a "mixed" checkbox. */
    contours: [
      { points: SQUARE },
      { hole: true, points: rotate(rect(-6, -2, 12, 4), Math.PI / 4) },
    ],
  },
  'ew-resize': {
    label: 'Resize horizontal',
    css: 'ew-resize',
    contours: [{ points: RESIZE_RIGHT }, { points: RESIZE_LEFT }],
  },
  'ns-resize': {
    label: 'Resize vertical',
    css: 'ns-resize',
    contours: [
      { points: swapAxes(RESIZE_RIGHT) },
      { points: swapAxes(RESIZE_LEFT) },
    ],
  },
  wait: {
    label: 'Wait',
    css: 'wait',
    contours: SNAKE_FRAMES[0],
    sequence: { interval: 100, frames: SNAKE_FRAMES },
  },
} satisfies Record<string, CursorShape>;

export type CursorStateId = keyof typeof shapes;

export const CURSOR_SHAPES: Record<CursorStateId, CursorShape> = shapes;

export const CURSOR_STATES = Object.keys(shapes) as CursorStateId[];

/* The states that get a tile. */
export const TILE_STATES = CURSOR_STATES.filter(
  (id) => !CURSOR_SHAPES[id].hidden,
);

export function isCursorState(value: unknown): value is CursorStateId {
  return typeof value === 'string' && Object.hasOwn(shapes, value);
}
