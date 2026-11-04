import {
  centroid,
  resampleWithCorners,
  signedArea,
  type Contour,
  type Point,
} from './geometry';
import type { CursorShape } from './shapes';

/*
 * Shape-agnostic morphing. Every shape is compiled to the same fixed layout,
 * MAX_CONTOURS contours of POINTS_PER_CONTOUR points each, so any shape can be
 * interpolated into any other point by point. Each coordinate is its own
 * spring, which keeps velocity through interruptions: a new target bends the
 * motion instead of restarting it.
 */

export const MAX_CONTOURS = 6;
export const POINTS_PER_CONTOUR = 64;

const STRIDE = POINTS_PER_CONTOUR * 2;
const SIZE = MAX_CONTOURS * STRIDE;

/* Contours smaller than this (px²) are left out of the path entirely. */
const MIN_VISIBLE_AREA = 0.05;

/* Integration step cap; keeps stiff springs stable on slow frames. */
const MAX_STEP = 1 / 240;
const MAX_FRAME = 1 / 30;

/* Press feedback has to read on a 14px cursor; 0.95–0.98 would vanish. */
const PRESSED_SCALE = 0.92;

export type CompiledShape = {
  /* One pose for static shapes; the whole loop for sequences. */
  frames: readonly Float32Array[];
  /* Per frame, per contour: the original vertices (normalised winding). The
   * morph re-spreads these onto the ring of whatever shape it starts from. */
  polygons: readonly (readonly (readonly Point[] | null)[])[];
  /* Per frame: 1 where a resampled point is an original vertex. */
  corners: readonly Uint8Array[];
  /* Seconds per frame. */
  interval: number;
  present: readonly boolean[];
  centroids: readonly Point[];
};

function compileContours(contours: readonly Contour[]) {
  if (contours.length > MAX_CONTOURS) {
    throw new Error(
      `A cursor shape can have at most ${MAX_CONTOURS} contours.`,
    );
  }

  const data = new Float32Array(SIZE);
  const corners = new Uint8Array(MAX_CONTOURS * POINTS_PER_CONTOUR);
  const polygons: (Point[] | null)[] = [];
  const present: boolean[] = [];
  const centroids: Point[] = [];

  for (let c = 0; c < MAX_CONTOURS; c++) {
    const contour = contours[c];

    if (!contour) {
      polygons.push(null);
      present.push(false);
      centroids.push([0, 0]);
      continue;
    }

    /* Consistent winding: outlines clockwise, holes counter-clockwise. */
    const points = [...contour.points];
    const area = signedArea(points);
    if (contour.hole ? area > 0 : area < 0) points.reverse();

    const sampled = resampleWithCorners(points, POINTS_PER_CONTOUR);
    sampled.points.forEach(([x, y], i) => {
      data[c * STRIDE + i * 2] = x;
      data[c * STRIDE + i * 2 + 1] = y;
    });
    sampled.corners.forEach((i) => {
      corners[c * POINTS_PER_CONTOUR + i] = 1;
    });

    polygons.push(points);
    present.push(true);
    centroids.push(centroid(points));
  }

  return { data, corners, polygons, present, centroids };
}

export function compileShape(shape: CursorShape): CompiledShape {
  const rest = compileContours(shape.contours);
  const frames = shape.sequence
    ? shape.sequence.frames.map((frame) => compileContours(frame))
    : [rest];

  return {
    frames: frames.map((frame) => frame.data),
    polygons: frames.map((frame) => frame.polygons),
    corners: frames.map((frame) => frame.corners),
    interval: (shape.sequence?.interval ?? 0) / 1000,
    present: rest.present,
    centroids: rest.centroids,
  };
}

function contourArea(data: Float32Array, contour: number) {
  const base = contour * STRIDE;
  let sum = 0;

  for (let i = 0; i < POINTS_PER_CONTOUR; i++) {
    const j = (i + 1) % POINTS_PER_CONTOUR;
    sum +=
      data[base + i * 2] * data[base + j * 2 + 1] -
      data[base + j * 2] * data[base + i * 2 + 1];
  }

  return sum / 2;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function pathFromData(data: Float32Array, scale = 1) {
  let d = '';

  for (let c = 0; c < MAX_CONTOURS; c++) {
    if (Math.abs(contourArea(data, c)) * scale * scale < MIN_VISIBLE_AREA) {
      continue;
    }

    const base = c * STRIDE;

    for (let i = 0; i < POINTS_PER_CONTOUR; i++) {
      const x = round(data[base + i * 2] * scale);
      const y = round(data[base + i * 2 + 1] * scale);
      d += `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    }

    d += 'Z';
  }

  return d;
}

/*
 * Corner-aware correspondence.
 *
 * Every point of a contour lies on a straight edge of its polygon. If both
 * shapes are piecewise linear over the same index ranges, i.e. every corner of
 * either shape sits at an index where the other is also allowed to bend, every
 * in-between frame is a polygon with straight edges too: no bulges, no pills.
 * That stays true with springs and per-axis staggers, because all points of an
 * axis follow the same linear dynamics.
 *
 * So the new polygon's vertices are placed onto indices of the current ring,
 * preferring indices that are already corners, and its edges are spread evenly
 * between them. Vertices are matched by direction from the centre, with each
 * shape scaled to its own bounding box: a square and a caret are then the same
 * shape (corners meet corners), and a square becoming a plus pinches its
 * corners inwards rather than twisting them round.
 */

/* What it costs, in squared radians, to put a vertex where there's no corner
 * yet: a vertex will travel about 20° further to land on a corner. */
const CORNER_PREFERENCE = 0.12;
const UNREACHABLE = 1e9;

function angleBetween(a: number, b: number) {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

/* Direction of each point from the centre, in its own bounding box. */
function directions(xs: ArrayLike<number>, ys: ArrayLike<number>) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < xs.length; i++) {
    minX = Math.min(minX, xs[i]);
    maxX = Math.max(maxX, xs[i]);
    minY = Math.min(minY, ys[i]);
    maxY = Math.max(maxY, ys[i]);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const hw = Math.max((maxX - minX) / 2, 0.5);
  const hh = Math.max((maxY - minY) / 2, 0.5);

  const result = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    result[i] = Math.atan2((ys[i] - cy) / hh, (xs[i] - cx) / hw);
  }
  return result;
}

/*
 * Re-spread `polygon` onto the ring of contour `c` of `current`. Writes the
 * points into `out` and marks where the vertices landed in `corners`.
 */
function matchContour(
  current: Float32Array,
  currentCorners: Uint8Array,
  c: number,
  polygon: readonly Point[],
  out: Float32Array,
  corners: Uint8Array,
) {
  const N = POINTS_PER_CONTOUR;
  const base = c * STRIDE;
  const cornerBase = c * N;
  const m = polygon.length;

  const ringX = new Float64Array(N);
  const ringY = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    ringX[i] = current[base + i * 2];
    ringY[i] = current[base + i * 2 + 1];
  }
  const ring = directions(ringX, ringY);
  const target = directions(
    polygon.map(([x]) => x),
    polygon.map(([, y]) => y),
  );

  const cost = (vertex: number, index: number) => {
    const angle = angleBetween(ring[index], target[vertex]);
    return (
      angle * angle +
      (currentCorners[cornerBase + index] ? 0 : CORNER_PREFERENCE)
    );
  };

  /*
   * Cyclic, order-preserving assignment of the m vertices to ring indices,
   * solved exactly: for each starting index, a running-minimum dynamic
   * programme over (vertex, offset). O(m·N²), about 65k steps for 16 vertices.
   */
  const previous = new Float64Array(N);
  const next = new Float64Array(N);
  const from = new Int16Array(m * N);
  let bestTotal = UNREACHABLE;
  let bestStart = 0;
  let bestOffsets: number[] = [];

  for (let start = 0; start < N; start++) {
    previous.fill(UNREACHABLE);
    previous[0] = cost(0, start);

    for (let vertex = 1; vertex < m; vertex++) {
      next.fill(UNREACHABLE);
      let runningMin = UNREACHABLE;
      let runningArg = -1;
      for (let offset = vertex; offset <= N - (m - vertex); offset++) {
        if (previous[offset - 1] < runningMin) {
          runningMin = previous[offset - 1];
          runningArg = offset - 1;
        }
        if (runningArg < 0) continue;
        next[offset] = runningMin + cost(vertex, (start + offset) % N);
        from[vertex * N + offset] = runningArg;
      }
      previous.set(next);
    }

    let total = UNREACHABLE;
    let last = -1;
    for (let offset = m - 1; offset < N; offset++) {
      if (previous[offset] < total) {
        total = previous[offset];
        last = offset;
      }
    }

    if (total < bestTotal) {
      bestTotal = total;
      bestStart = start;
      const offsets = new Array<number>(m);
      offsets[m - 1] = last;
      for (let vertex = m - 1; vertex > 0; vertex--) {
        offsets[vertex - 1] = from[vertex * N + offsets[vertex]];
      }
      bestOffsets = offsets;
    }
  }

  /* Spread each edge evenly over the indices between its two vertices. */
  corners.fill(0, cornerBase, cornerBase + N);
  for (let vertex = 0; vertex < m; vertex++) {
    const [x0, y0] = polygon[vertex];
    const [x1, y1] = polygon[(vertex + 1) % m];
    const first = bestOffsets[vertex];
    const end = vertex + 1 < m ? bestOffsets[vertex + 1] : N;
    corners[cornerBase + ((bestStart + first) % N)] = 1;

    for (let offset = first; offset < end; offset++) {
      const t = (offset - first) / (end - first);
      const index = (bestStart + offset) % N;
      out[base + index * 2] = x0 + (x1 - x0) * t;
      out[base + index * 2 + 1] = y0 + (y1 - y0) * t;
    }
  }
}

export type Spring = { stiffness: number; damping: number };

/*
 * Motion's `{ visualDuration, bounce }` spring (mass 1), using the same
 * conversion as motion-dom: roughly how long it takes to arrive, and how much
 * it overshoots.
 */
export function spring(visualDuration: number, bounce: number): Spring {
  const omega = (2 * Math.PI) / (visualDuration * 1.2);
  return { stiffness: omega * omega, damping: 2 * (1 - bounce) * omega };
}

export type MorphMotion = {
  /* Hover-driven shape changes. */
  shape: Spring;
  /* Shape changes caused by a press: direct feedback, so they snap. */
  snap: Spring;
  /* One step of a sequence. */
  step: Spring;
  /* Press in snaps; release settles. */
  press: Spring;
  release: Spring;
  pressScale: boolean;
  sequences: boolean;
  /* Choreography for hover-driven morphs, in seconds. */
  stagger: {
    /* Most the trailing axis waits behind the leading one. */
    axis: number;
    /* How long new contours wait before growing in. */
    emerge: number;
  };
};

export const MORPH_MOTION = {
  /* A hint of overshoot gives the shape some character; no visible wobble. */
  full: {
    shape: spring(0.27, 0.12),
    snap: spring(0.1, 0),
    step: spring(0.07, 0),
    press: spring(0.1, 0),
    release: spring(0.21, 0.15),
    pressScale: true,
    sequences: true,
    stagger: { axis: 0.12, emerge: 0.08 },
  },
  /* Shapes still change, quickly and without overshoot. Nothing loops. */
  reduced: {
    shape: spring(0.1, 0),
    snap: spring(0.1, 0),
    step: spring(0.1, 0),
    press: spring(0.1, 0),
    release: spring(0.1, 0),
    pressScale: false,
    sequences: false,
    stagger: { axis: 0, emerge: 0 },
  },
} satisfies Record<string, MorphMotion>;

/* Bounding box of one contour: [minX, maxX, minY, maxY]. */
function bounds(data: Float32Array, contour: number) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const base = contour * STRIDE;

  for (let i = 0; i < POINTS_PER_CONTOUR; i++) {
    const x = data[base + i * 2];
    const y = data[base + i * 2 + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return [minX, maxX, minY, maxY] as const;
}

/* Below this difference in log-scale the two axes change alike: no stagger. */
const AXIS_LAG_THRESHOLD = 0.15;
/* The log-scale difference that earns the full delay (4× apart). */
const AXIS_LAG_FULL = Math.log(4);
/* A contour whose centre travels further than this share of its size is
 * moving, not reshaping. */
const TRAVEL_LIMIT = 0.25;

const NO_LAG = { trailing: -1, amount: 0 };

/*
 * Which axis of one contour should trail, and by how much (0–1). The axis
 * that contracts the most leads and the other follows: a square becoming a
 * caret narrows first, then stretches; the caret going back shortens first,
 * then widens.
 *
 * Only for contours that reshape in place. A contour that travels (an arrow
 * swinging from horizontal to vertical) moves both axes together, so it takes
 * the straight path instead of being dragged through the centre.
 */
function axisLag(from: Float32Array, to: Float32Array, contour: number) {
  const [fromMinX, fromMaxX, fromMinY, fromMaxY] = bounds(from, contour);
  const [toMinX, toMaxX, toMinY, toMaxY] = bounds(to, contour);
  const fromW = fromMaxX - fromMinX;
  const fromH = fromMaxY - fromMinY;
  const toW = toMaxX - toMinX;
  const toH = toMaxY - toMinY;

  const travel = Math.hypot(
    (toMinX + toMaxX - fromMinX - fromMaxX) / 2,
    (toMinY + toMaxY - fromMinY - fromMaxY) / 2,
  );
  if (travel > TRAVEL_LIMIT * Math.max(fromW, fromH, toW, toH)) return NO_LAG;

  const scaleX = Math.log(Math.max(toW, 1) / Math.max(fromW, 1));
  const scaleY = Math.log(Math.max(toH, 1) / Math.max(fromH, 1));
  const difference = Math.abs(scaleX - scaleY);
  if (difference < AXIS_LAG_THRESHOLD) return NO_LAG;

  return {
    /* Coordinate offset of the trailing axis: 0 for x, 1 for y. */
    trailing: scaleX < scaleY ? 1 : 0,
    amount: Math.min(difference / AXIS_LAG_FULL, 1),
  };
}

export type ShapeChange = {
  /* Jump straight to the shape, e.g. when the cursor reappears. */
  immediate?: boolean;
  /* Which spring carries the change. */
  via?: 'shape' | 'snap';
};

export class MorphEngine {
  private readonly pos = new Float32Array(SIZE);
  private readonly vel = new Float32Array(SIZE);
  private readonly goal = new Float32Array(SIZE);
  private shapeSpring: Spring;

  /*
   * Staggered morphs: each coordinate's new goal waits in `next` until the
   * clock passes its release time (-1 once released).
   */
  private readonly next = new Float32Array(SIZE);
  private readonly releaseAt = new Float32Array(SIZE).fill(-1);
  /* Which ring points are corners of the shape being morphed towards. */
  private readonly corners = new Uint8Array(MAX_CONTOURS * POINTS_PER_CONTOUR);
  private pending = 0;
  private clock = 0;

  private scale = 1;
  private scaleVel = 0;
  private scaleGoal = 1;
  private scaleSpring: Spring;

  private frameIndex = 0;
  private frameClock = 0;

  /* Playback speed: 1 is real time, 0.1 is ten times slower, 0 is paused. */
  private timeScale = 1;

  private frame = 0;
  private lastTime = 0;

  constructor(
    private readonly path: SVGPathElement,
    private shape: CompiledShape,
    private motion: MorphMotion,
  ) {
    this.shapeSpring = motion.shape;
    this.scaleSpring = motion.release;
    this.pos.set(shape.frames[0]);
    this.goal.set(shape.frames[0]);
    this.corners.set(shape.corners[0]);
    this.render();
    this.start();
  }

  setShape(
    shape: CompiledShape,
    { immediate = false, via = 'shape' }: ShapeChange = {},
  ) {
    if (shape === this.shape && !immediate) return;

    this.shape = shape;
    this.frameIndex = 0;
    this.frameClock = 0;
    this.shapeSpring = this.motion[via];

    if (immediate) {
      this.pos.set(shape.frames[0]);
      this.goal.set(shape.frames[0]);
      this.corners.set(shape.corners[0]);
      this.vel.fill(0);
      this.releaseAt.fill(-1);
      this.pending = 0;
      this.render();
    } else {
      /* Only hover-driven morphs are choreographed; a press must snap. */
      this.retarget(0, via === 'shape');
    }

    this.start();
  }

  setPressed(pressed: boolean) {
    this.scaleGoal = pressed && this.motion.pressScale ? PRESSED_SCALE : 1;
    this.scaleSpring = pressed ? this.motion.press : this.motion.release;
    this.start();
  }

  /*
   * Slows the whole engine down uniformly (springs and sequence steps), so
   * slow motion shows exactly the same morph, only stretched out.
   */
  setTimeScale(scale: number) {
    this.timeScale = Math.max(scale, 0);
    this.start();
  }

  setMotion(motion: MorphMotion) {
    this.motion = motion;
    this.shapeSpring = motion.shape;
    this.scaleSpring = motion.release;
    if (!motion.pressScale) this.scaleGoal = 1;
    this.start();
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private get sequencing() {
    return this.motion.sequences && this.shape.frames.length > 1;
  }

  private retarget(frame: number, choreograph = false) {
    const { present, centroids } = this.shape;
    const data = this.shape.frames[frame];
    const polygons = this.shape.polygons[frame];
    const targetCorners = this.shape.corners[frame];
    const visible: boolean[] = [];
    const emerging: boolean[] = [];

    for (let c = 0; c < MAX_CONTOURS; c++) {
      const base = c * STRIDE;
      visible[c] = Math.abs(contourArea(this.pos, c)) > MIN_VISIBLE_AREA;
      emerging[c] = present[c] && !visible[c];

      if (emerging[c]) {
        /* Grow a new contour out of its own centre; until it's released it
         * waits there as a point. */
        const [cx, cy] = centroids[c];
        for (let i = 0; i < POINTS_PER_CONTOUR; i++) {
          this.pos[base + i * 2] = cx;
          this.pos[base + i * 2 + 1] = cy;
        }
        this.goal.set(this.pos.subarray(base, base + STRIDE), base);
        this.vel.fill(0, base, base + STRIDE);
        this.next.set(data.subarray(base, base + STRIDE), base);
        const cornerBase = c * POINTS_PER_CONTOUR;
        this.corners.set(
          targetCorners.subarray(cornerBase, cornerBase + POINTS_PER_CONTOUR),
          cornerBase,
        );
      } else if (present[c]) {
        matchContour(
          this.pos,
          this.corners,
          c,
          polygons[c]!,
          this.next,
          this.corners,
        );
      } else {
        /* Shrink a contour the new shape doesn't have into its own centre. */
        let cx = 0;
        let cy = 0;
        for (let i = 0; i < POINTS_PER_CONTOUR; i++) {
          cx += this.pos[base + i * 2];
          cy += this.pos[base + i * 2 + 1];
        }
        cx /= POINTS_PER_CONTOUR;
        cy /= POINTS_PER_CONTOUR;
        for (let i = 0; i < POINTS_PER_CONTOUR; i++) {
          this.next[base + i * 2] = cx;
          this.next[base + i * 2 + 1] = cy;
        }
      }
    }

    const stagger = choreograph ? this.motion.stagger : null;

    this.pending = 0;
    for (let c = 0; c < MAX_CONTOURS; c++) {
      const base = c * STRIDE;
      const contourDelay = stagger && emerging[c] ? stagger.emerge : 0;
      /* Axis choreography only for contours reshaping from one form to the
       * next; new ones grow in, old ones shrink away. */
      const lag =
        stagger && present[c] && visible[c]
          ? axisLag(this.pos, this.next, c)
          : NO_LAG;

      for (let k = 0; k < STRIDE; k++) {
        const index = base + k;
        const axisDelay =
          stagger && k % 2 === lag.trailing ? lag.amount * stagger.axis : 0;
        const delay = contourDelay + axisDelay;

        if (delay > 0) {
          this.releaseAt[index] = this.clock + delay;
          this.pending++;
        } else {
          this.goal[index] = this.next[index];
          this.releaseAt[index] = -1;
        }
      }
    }
  }

  private releaseDue() {
    for (let i = 0; i < SIZE; i++) {
      if (this.releaseAt[i] >= 0 && this.clock >= this.releaseAt[i]) {
        this.goal[i] = this.next[i];
        this.releaseAt[i] = -1;
        this.pending--;
      }
    }
  }

  /* Sequences step on a clock; each step glides on its own quick spring. */
  private advanceSequence(dt: number) {
    const { frames, interval } = this.shape;
    this.frameClock += dt;
    if (this.frameClock < interval) return;

    this.frameClock %= interval;
    this.frameIndex = (this.frameIndex + 1) % frames.length;
    this.shapeSpring = this.motion.step;
    this.retarget(this.frameIndex);
  }

  private start() {
    /* Paused: changes queue up as goals and play out once time runs again. */
    if (this.frame || this.timeScale === 0) return;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private readonly tick = (now: number) => {
    if (this.timeScale === 0) {
      this.frame = 0;
      return;
    }

    const elapsed = Math.min(
      Math.max((now - this.lastTime) / 1000, 0),
      MAX_FRAME,
    );
    const dt = elapsed * this.timeScale;
    this.lastTime = now;

    this.clock += dt;
    if (this.sequencing) this.advanceSequence(dt);
    if (this.pending > 0) this.releaseDue();

    /* Resting on the current goals isn't done while staggered goals wait. */
    const atRest = this.integrate(dt);
    const settled = atRest && this.pending === 0;
    this.render();

    if (settled && !this.sequencing) {
      this.frame = 0;
      return;
    }

    this.frame = requestAnimationFrame(this.tick);
  };

  private integrate(dt: number) {
    const steps = Math.max(1, Math.ceil(dt / MAX_STEP));
    const h = dt / steps;
    const { stiffness: k, damping: d } = this.shapeSpring;
    const { stiffness: sk, damping: sd } = this.scaleSpring;

    for (let step = 0; step < steps; step++) {
      for (let i = 0; i < SIZE; i++) {
        this.vel[i] +=
          (-k * (this.pos[i] - this.goal[i]) - d * this.vel[i]) * h;
        this.pos[i] += this.vel[i] * h;
      }

      this.scaleVel +=
        (-sk * (this.scale - this.scaleGoal) - sd * this.scaleVel) * h;
      this.scale += this.scaleVel * h;
    }

    if (
      Math.abs(this.scale - this.scaleGoal) > 1e-3 ||
      Math.abs(this.scaleVel) > 1e-2
    ) {
      return false;
    }

    for (let i = 0; i < SIZE; i++) {
      if (
        Math.abs(this.pos[i] - this.goal[i]) > 0.01 ||
        Math.abs(this.vel[i]) > 0.05
      ) {
        return false;
      }
    }

    this.pos.set(this.goal);
    this.vel.fill(0);
    this.scale = this.scaleGoal;
    this.scaleVel = 0;
    return true;
  }

  private render() {
    this.path.setAttribute('d', pathFromData(this.pos, this.scale));
  }
}
