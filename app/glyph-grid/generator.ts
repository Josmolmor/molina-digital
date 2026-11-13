/*
 * The generator: pure functions from (mask, settings, seed) to data. No DOM,
 * no canvas. Both renderers (canvas and SVG) consume what this returns.
 */

/* Mask pixel values. */
export const EMPTY = 0;
export const SHAPE = 1;
export const ACCENT = 2;

export type MaskValue = typeof EMPTY | typeof SHAPE | typeof ACCENT;

/* One role per pixel, row-major. */
export type Mask = { width: number; height: number; data: Uint8Array };

export type Role = 'empty' | 'shape' | 'accent';
export type BandRule = 'flat' | 'depth' | 'row';

/* Normalised to the poster: 0..1 on both axes. */
export type Rect = { x0: number; y0: number; x1: number; y1: number };

export type Cell = {
  col: number;
  row: number;
  role: Role;
  /* Shape cells only: touches an empty cell (or the poster edge). */
  edge: boolean;
  /* Distance in cells from the nearest edge cell; 0 on the edge itself. */
  depth: number;
  /* Index into the palette's bands; -1 for cells that don't use one. */
  band: number;
  glyph: string;
};

export type CellSettings = {
  cols: number;
  rows: number;
  threshold: number;
  bandRule: BandRule;
  bandCount: number;
  /* Chance (0..1) that a cell shifts one band up or down. */
  jitter: number;
  charset: string;
  /* Anything overlapping these is forced to background. */
  quiet: Rect[];
};

export type Word = {
  /* Left edge in character columns; can be negative (clipped by the poster). */
  col: number;
  line: number;
  text: string;
  role: Role;
};

export type WordSettings = {
  charCols: number;
  lines: number;
  words: string[];
  threshold: number;
  quiet: Rect[];
};

export const DEFAULT_CHARSET = '0123456789ABCDEF!?#$%&*+-=<>()[]{}/\\|~^:@';

export const DEFAULT_WORDS =
  'GLYPH GRID MASK SIGNAL NOISE FIELD SHAPE ACCENT POSTER TYPE MONO SEED';

const ROLES: Role[] = ['empty', 'shape', 'accent'];

export function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/*
 * A stable random number for one cell. Keyed on seed + index (not on draw
 * order), so a cell keeps its glyph and jitter while the mask changes around
 * it. `channel` gives independent streams for glyph, jitter chance, etc.
 */
export function cellRandom(seed: number, index: number, channel: number) {
  return mulberry32(
    (seed ^ Math.imul(index + 1, 0x9e3779b1)) + Math.imul(channel, 0x85ebca6b),
  )();
}

const GLYPH = 0;
const JITTER_CHANCE = 1;
const JITTER_DIRECTION = 2;
const STAGGER = 3;

export function parseCharset(charset: string) {
  const glyphs = Array.from(charset.replace(/\s/g, ''));
  return glyphs.length > 0 ? glyphs : Array.from(DEFAULT_CHARSET);
}

export function parseWords(words: string) {
  const list = words
    .toUpperCase()
    .split(/[\s,]+/)
    .filter(Boolean);
  return list.length > 0 ? list : DEFAULT_WORDS.split(' ');
}

/*
 * The role of a normalised region of the mask. Accent wins when it clears the
 * threshold alone. Otherwise all paint counts towards Shape, so a cell that is
 * half Shape and half Accent doesn't fall through as a hole in the drawing.
 */
export function roleAt(mask: Mask, region: Rect, threshold: number): MaskValue {
  const { width, height, data } = mask;
  const x0 = Math.max(0, Math.round(region.x0 * width));
  const x1 = Math.min(width, Math.round(region.x1 * width));
  const y0 = Math.max(0, Math.round(region.y0 * height));
  const y1 = Math.min(height, Math.round(region.y1 * height));
  const total = (x1 - x0) * (y1 - y0);
  if (total <= 0) return EMPTY;

  let shape = 0;
  let accent = 0;
  for (let y = y0; y < y1; y++) {
    const offset = y * width;
    for (let x = x0; x < x1; x++) {
      const value = data[offset + x];
      if (value === SHAPE) shape++;
      else if (value === ACCENT) accent++;
    }
  }

  if (accent / total > threshold) return ACCENT;
  if ((shape + accent) / total > threshold) return SHAPE;
  return EMPTY;
}

/* Strict overlap: sharing only a border doesn't count. */
function overlaps(a: Rect, b: Rect) {
  const eps = 1e-6;
  return (
    a.x0 < b.x1 - eps &&
    a.x1 > b.x0 + eps &&
    a.y0 < b.y1 - eps &&
    a.y1 > b.y0 + eps
  );
}

function isQuiet(region: Rect, quiet: Rect[]) {
  for (const rect of quiet) if (overlaps(region, rect)) return true;
  return false;
}

export function generateCells(
  mask: Mask,
  settings: CellSettings,
  seed: number,
): Cell[] {
  const { cols, rows, threshold, bandRule, jitter, quiet } = settings;
  const bandCount = Math.max(1, settings.bandCount);
  const glyphs = parseCharset(settings.charset);
  const count = cols * rows;

  /* 1. Sample: one role per cell. */
  const roles = new Uint8Array(count);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const region = {
        x0: col / cols,
        y0: row / rows,
        x1: (col + 1) / cols,
        y1: (row + 1) / rows,
      };
      roles[row * cols + col] = isQuiet(region, quiet)
        ? EMPTY
        : roleAt(mask, region, threshold);
    }
  }

  /*
   * 2. Depth: breadth-first from every painted cell that touches an empty one.
   * The poster edge counts as empty, so a shape running off the canvas still
   * gets a closed outline. Accent cells carry the wave (they aren't empty)
   * but only Shape cells use the result.
   */
  const depth = new Int32Array(count).fill(-1);
  const queue = new Int32Array(count);
  let head = 0;
  let tail = 0;

  for (let i = 0; i < count; i++) {
    if (roles[i] === EMPTY) continue;
    const col = i % cols;
    const row = (i - col) / cols;
    const exposed =
      col === 0 ||
      col === cols - 1 ||
      row === 0 ||
      row === rows - 1 ||
      roles[i - 1] === EMPTY ||
      roles[i + 1] === EMPTY ||
      roles[i - cols] === EMPTY ||
      roles[i + cols] === EMPTY;
    if (exposed) {
      depth[i] = 0;
      queue[tail++] = i;
    }
  }

  while (head < tail) {
    const i = queue[head++];
    const col = i % cols;
    const next = depth[i] + 1;
    /* The column checks stop the wave wrapping from one row into the next. */
    if (col > 0 && depth[i - 1] === -1 && roles[i - 1] !== EMPTY) {
      depth[i - 1] = next;
      queue[tail++] = i - 1;
    }
    if (col < cols - 1 && depth[i + 1] === -1 && roles[i + 1] !== EMPTY) {
      depth[i + 1] = next;
      queue[tail++] = i + 1;
    }
    if (i - cols >= 0 && depth[i - cols] === -1 && roles[i - cols] !== EMPTY) {
      depth[i - cols] = next;
      queue[tail++] = i - cols;
    }
    if (
      i + cols < count &&
      depth[i + cols] === -1 &&
      roles[i + cols] !== EMPTY
    ) {
      depth[i + cols] = next;
      queue[tail++] = i + cols;
    }
  }

  /* Extents the band rules normalise against, so every band gets used
   * whatever the size of the drawing. */
  let maxDepth = 0;
  let minRow = rows;
  let maxRow = -1;
  for (let i = 0; i < count; i++) {
    if (roles[i] !== SHAPE) continue;
    if (depth[i] > maxDepth) maxDepth = depth[i];
    const row = Math.floor(i / cols);
    if (row < minRow) minRow = row;
    if (row > maxRow) maxRow = row;
  }
  const rowSpan = maxRow - minRow + 1;

  /* 3 + 4. Bands, jitter and glyphs. */
  const cells: Cell[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = (i - col) / cols;
    const value = roles[i];
    const edge = value === SHAPE && depth[i] === 0;
    let band = -1;

    if (value === SHAPE && !edge) {
      if (bandRule === 'depth') {
        band = Math.floor(((depth[i] - 1) * bandCount) / maxDepth);
      } else if (bandRule === 'row') {
        band = Math.floor(((row - minRow) * bandCount) / rowSpan);
      } else {
        band = 0;
      }

      if (jitter > 0 && cellRandom(seed, i, JITTER_CHANCE) < jitter) {
        band += cellRandom(seed, i, JITTER_DIRECTION) < 0.5 ? -1 : 1;
      }
      band = Math.min(bandCount - 1, Math.max(0, band));
    }

    cells[i] = {
      col,
      row,
      role: ROLES[value],
      edge,
      depth: value === EMPTY ? 0 : depth[i],
      band,
      glyph: glyphs[Math.floor(cellRandom(seed, i, GLYPH) * glyphs.length)],
    };
  }

  return cells;
}

/* Words per line are indexed inside this stride, keeping keys unique per line. */
const LINE_STRIDE = 4096;

/*
 * Word field: lines of words on a monospace character grid. Each word takes
 * the role of the mask under its centre.
 */
export function generateWords(
  mask: Mask,
  settings: WordSettings,
  seed: number,
): Word[] {
  const { charCols, lines, threshold, quiet } = settings;
  const list = settings.words.length > 0 ? settings.words : parseWords('');
  const words: Word[] = [];

  for (let line = 0; line < lines; line++) {
    /* Start a few characters off-canvas so lines don't share a left edge. */
    let col = -Math.floor(cellRandom(seed, line * LINE_STRIDE, STAGGER) * 4);

    for (let k = 0; k < LINE_STRIDE && col < charCols; k++) {
      const key = line * LINE_STRIDE + k;
      const text = list[Math.floor(cellRandom(seed, key, GLYPH) * list.length)];
      const length = Array.from(text).length;
      const centre = (col + length / 2) / charCols;
      const box = {
        x0: col / charCols,
        y0: line / lines,
        x1: (col + length) / charCols,
        y1: (line + 1) / lines,
      };
      /* A two-character window at the centre: wide enough to be stable,
       * narrow enough that long words still follow the drawing. */
      const sample = {
        x0: centre - 1 / charCols,
        y0: box.y0,
        x1: centre + 1 / charCols,
        y1: box.y1,
      };

      words.push({
        col,
        line,
        text,
        role: ROLES[
          isQuiet(box, quiet) ? EMPTY : roleAt(mask, sample, threshold)
        ],
      });
      col += length + 1;
    }
  }

  return words;
}
