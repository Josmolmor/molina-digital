/*
 * Plain polygon helpers. Every cursor shape is described as one or more closed
 * polygons centred on the hotspot at (0, 0), in CSS pixels, y pointing down.
 */

export type Point = readonly [x: number, y: number];

export type Contour = {
  points: readonly Point[];
  /* A hole is cut out of the contour around it (nonzero winding). */
  hole?: boolean;
};

export function rect(x: number, y: number, width: number, height: number) {
  return [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ] satisfies Point[];
}

/*
 * Trig results can differ in the last bits between the server and the
 * browser; quantising keeps server-rendered previews identical to the client's.
 */
const quantise = (value: number) => Math.round(value * 1000) / 1000;

/* Points along a circular arc, both ends included. Angles in radians. */
export function arc(
  radius: number,
  from: number,
  to: number,
  segments: number,
): Point[] {
  const points: Point[] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = from + ((to - from) * i) / segments;
    points.push([
      quantise(Math.cos(angle) * radius),
      quantise(Math.sin(angle) * radius),
    ]);
  }

  return points;
}

export function circle(radius: number, segments: number): Point[] {
  return arc(radius, -Math.PI / 2, Math.PI * 1.5, segments).slice(0, -1);
}

export function translate(points: readonly Point[], dx: number, dy: number) {
  return points.map(([x, y]) => [x + dx, y + dy] satisfies Point);
}

/* Rotate around the origin. Positive angles turn clockwise on screen. */
export function rotate(points: readonly Point[], angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return points.map(
    ([x, y]) =>
      [
        quantise(x * cos - y * sin),
        quantise(x * sin + y * cos),
      ] satisfies Point,
  );
}

export function mirror(
  points: readonly Point[],
  flipX: boolean,
  flipY: boolean,
) {
  return points.map(
    ([x, y]) => [flipX ? -x : x, flipY ? -y : y] satisfies Point,
  );
}

/* Mirror across the diagonal, turning a horizontal shape vertical. */
export function swapAxes(points: readonly Point[]) {
  return points.map(([x, y]) => [y, x] satisfies Point);
}

/* Shoelace area. Positive when the points run clockwise on screen. */
export function signedArea(points: readonly Point[]) {
  let sum = 0;

  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }

  return sum / 2;
}

export function centroid(points: readonly Point[]): Point {
  const area = signedArea(points);

  if (Math.abs(area) < 1e-6) {
    const sx = points.reduce((total, [x]) => total + x, 0);
    const sy = points.reduce((total, [, y]) => total + y, 0);
    return [sx / points.length, sy / points.length];
  }

  let cx = 0;
  let cy = 0;

  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    const cross = x1 * y2 - x2 * y1;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }

  return [cx / (6 * area), cy / (6 * area)];
}

/*
 * Redistribute a polygon onto exactly `count` points so any two shapes can be
 * interpolated point by point. Original vertices are always kept, so corners
 * stay sharp; the extra points are spread along the edges by length.
 */
export function resample(points: readonly Point[], count: number) {
  return resampleWithCorners(points, count).points;
}

/* As `resample`, also reporting where each original vertex ended up. */
export function resampleWithCorners(
  points: readonly Point[],
  count: number,
): { points: Point[]; corners: number[] } {
  const n = points.length;

  if (n > count) {
    throw new Error(
      `Contour has ${n} vertices but the morph only supports ${count}.`,
    );
  }

  const lengths = points.map(([x1, y1], i) => {
    const [x2, y2] = points[(i + 1) % n];
    return Math.hypot(x2 - x1, y2 - y1);
  });
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const extra = count - n;

  const exact = lengths.map((length) =>
    total > 0 ? (length / total) * extra : extra / n,
  );
  const allocation = exact.map(Math.floor);

  /* Largest remainder: hand leftover points to the edges that lost the most. */
  let remaining = extra - allocation.reduce((sum, value) => sum + value, 0);
  const byRemainder = exact
    .map((value, i) => ({ i, remainder: value - allocation[i] }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let k = 0; remaining > 0; k++, remaining--) {
    allocation[byRemainder[k % n].i]++;
  }

  const result: Point[] = [];
  const corners: number[] = [];

  points.forEach(([x1, y1], i) => {
    const [x2, y2] = points[(i + 1) % n];
    const steps = allocation[i] + 1;
    corners.push(result.length);
    result.push([x1, y1]);

    for (let step = 1; step < steps; step++) {
      const t = step / steps;
      result.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
    }
  });

  return { points: result, corners };
}
