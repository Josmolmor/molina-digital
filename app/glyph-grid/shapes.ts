import { ACCENT, EMPTY, SHAPE, type Mask, type MaskValue } from './generator';
import { stampSegment } from './mask';

/*
 * Random drawings for "Randomize": a simple composition of one or two bold
 * forms, sometimes with a cut through them, plus a few accent marks. Bold on
 * purpose: at 16-64 columns, fine detail just turns into noise.
 */

type Random = () => number;
type Point = [x: number, y: number];

const between = (random: Random, min: number, max: number) =>
  min + random() * (max - min);

function pick<T>(random: Random, items: readonly T[]) {
  return items[Math.floor(random() * items.length)];
}

function disc(mask: Mask, x: number, y: number, r: number, value: MaskValue) {
  stampSegment(mask, x, y, x, y, r, value);
}

/* Even-odd fill of a polygon, tested at pixel centres. */
function polygon(mask: Mask, points: Point[], value: MaskValue) {
  const { width, height, data } = mask;
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const left = Math.max(0, Math.floor(Math.min(...xs)));
  const right = Math.min(width - 1, Math.ceil(Math.max(...xs)));
  const top = Math.max(0, Math.floor(Math.min(...ys)));
  const bottom = Math.min(height - 1, Math.ceil(Math.max(...ys)));

  for (let y = top; y <= bottom; y++) {
    const py = y + 0.5;
    for (let x = left; x <= right; x++) {
      const px = x + 0.5;
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i];
        const [xj, yj] = points[j];
        if (
          yi > py !== yj > py &&
          px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
        ) {
          inside = !inside;
        }
      }
      if (inside) data[y * width + x] = value;
    }
  }
}

function regular(
  x: number,
  y: number,
  r: number,
  sides: number,
  rotation: number,
): Point[] {
  return Array.from({ length: sides }, (_, i) => {
    const angle = rotation + (i * Math.PI * 2) / sides;
    return [x + Math.cos(angle) * r, y + Math.sin(angle) * r];
  });
}

type Form = (
  mask: Mask,
  random: Random,
  x: number,
  y: number,
  r: number,
) => void;

const FORMS: Form[] = [
  /* Disc */
  (mask, _random, x, y, r) => disc(mask, x, y, r, SHAPE),
  /* Ring */
  (mask, random, x, y, r) => {
    disc(mask, x, y, r, SHAPE);
    disc(mask, x, y, r * between(random, 0.4, 0.62), EMPTY);
  },
  /* Triangle, point up or down */
  (mask, random, x, y, r) =>
    polygon(
      mask,
      regular(x, y, r * 1.15, 3, random() < 0.7 ? -Math.PI / 2 : Math.PI / 2),
      SHAPE,
    ),
  /* Square or diamond */
  (mask, random, x, y, r) =>
    polygon(
      mask,
      regular(x, y, r * 1.1, 4, random() < 0.5 ? Math.PI / 4 : 0),
      SHAPE,
    ),
  /* Hexagon */
  (mask, random, x, y, r) =>
    polygon(mask, regular(x, y, r, 6, random() < 0.5 ? 0 : Math.PI / 6), SHAPE),
  /* Blob: a few discs that overlap around the centre */
  (mask, random, x, y, r) => {
    const lobes = 4 + Math.floor(random() * 3);
    for (let i = 0; i < lobes; i++) {
      const angle = random() * Math.PI * 2;
      const reach = between(random, 0.2, 0.6) * r;
      disc(
        mask,
        x + Math.cos(angle) * reach,
        y + Math.sin(angle) * reach,
        between(random, 0.45, 0.7) * r,
        SHAPE,
      );
    }
  },
  /* Bars: stacked strokes of varying length */
  (mask, random, x, y, r) => {
    const bars = 3 + Math.floor(random() * 3);
    const pitch = (r * 2) / bars;
    for (let i = 0; i < bars; i++) {
      const half = between(random, 0.45, 1.1) * r;
      const by = y - r + pitch * (i + 0.5);
      stampSegment(mask, x - half, by, x + half, by, pitch * 0.32, SHAPE);
    }
  },
  /* Half disc */
  (mask, random, x, y, r) => {
    disc(mask, x, y, r, SHAPE);
    const angle = pick(random, [0, Math.PI / 2, Math.PI, -Math.PI / 2]);
    const far = r * 3;
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    polygon(
      mask,
      [
        [x - ny * far, y + nx * far],
        [x + ny * far, y - nx * far],
        [x + ny * far + nx * far, y - nx * far + ny * far],
        [x - ny * far + nx * far, y + nx * far + ny * far],
      ],
      EMPTY,
    );
  },
];

/* Replaces the mask's contents with a fresh composition. */
export function paintRandomDrawing(mask: Mask, random: Random = Math.random) {
  const { width, height } = mask;
  const unit = Math.min(width, height);
  mask.data.fill(EMPTY);

  /* Slightly above centre: the headline usually takes the bottom. */
  const x = width * between(random, 0.4, 0.6);
  const y = height * between(random, 0.34, 0.5);
  const r = unit * between(random, 0.24, 0.34);
  pick(random, FORMS)(mask, random, x, y, r);

  /* Sometimes a smaller second form, offset so the two overlap or touch. */
  if (random() < 0.45) {
    const angle = random() * Math.PI * 2;
    pick(random, FORMS)(
      mask,
      random,
      x + Math.cos(angle) * r * 0.9,
      y + Math.sin(angle) * r * 0.9,
      r * between(random, 0.4, 0.65),
    );
  }

  /* Sometimes a cut: a band of empty cells straight through the form. */
  if (random() < 0.3) {
    const angle = random() * Math.PI;
    const dx = Math.cos(angle) * unit;
    const dy = Math.sin(angle) * unit;
    stampSegment(mask, x - dx, y - dy, x + dx, y + dy, unit * 0.022, EMPTY);
  }

  /* Accent marks: kept few and small, so the accent stays a highlight. */
  const marks = 1 + Math.floor(random() * 2);
  for (let i = 0; i < marks; i++) {
    const angle = random() * Math.PI * 2;
    if (random() < 0.5) {
      /* A stroke across the form */
      const reach = r * between(random, 0.5, 1.05);
      const offset = r * between(random, -0.5, 0.5);
      const ox = -Math.sin(angle) * offset;
      const oy = Math.cos(angle) * offset;
      stampSegment(
        mask,
        x + ox - Math.cos(angle) * reach,
        y + oy - Math.sin(angle) * reach,
        x + ox + Math.cos(angle) * reach,
        y + oy + Math.sin(angle) * reach,
        unit * between(random, 0.018, 0.03),
        ACCENT,
      );
    } else {
      /* A dot on or near the edge */
      const reach = r * between(random, 0.6, 1.15);
      disc(
        mask,
        x + Math.cos(angle) * reach,
        y + Math.sin(angle) * reach,
        unit * between(random, 0.04, 0.07),
        ACCENT,
      );
    }
  }
}
