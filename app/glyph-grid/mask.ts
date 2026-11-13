import { EMPTY, type Mask, type MaskValue } from './generator';

/*
 * The mask is a plain array of roles rather than a painted canvas: strokes
 * are hard-edged, flood fill is exact, undo is a copy, and the generator can
 * read it without a getImageData round trip on every frame.
 */

/* Long edge of the mask in pixels: about 12px per cell at 64 columns. */
const MASK_LONG_EDGE = 800;

export function maskSize(aspectWidth: number, aspectHeight: number) {
  const scale = MASK_LONG_EDGE / Math.max(aspectWidth, aspectHeight);
  return {
    width: Math.round(aspectWidth * scale),
    height: Math.round(aspectHeight * scale),
  };
}

export function createMask(width: number, height: number): Mask {
  return { width, height, data: new Uint8Array(width * height) };
}

/* Paints a round-capped segment. A zero-length segment is a dot. */
export function stampSegment(
  mask: Mask,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  radius: number,
  value: MaskValue,
) {
  const { width, height, data } = mask;
  const left = Math.max(0, Math.floor(Math.min(x0, x1) - radius));
  const right = Math.min(width - 1, Math.ceil(Math.max(x0, x1) + radius));
  const top = Math.max(0, Math.floor(Math.min(y0, y1) - radius));
  const bottom = Math.min(height - 1, Math.ceil(Math.max(y0, y1) + radius));
  const dx = x1 - x0;
  const dy = y1 - y0;
  const lengthSq = dx * dx + dy * dy;
  const radiusSq = radius * radius;

  for (let y = top; y <= bottom; y++) {
    const py = y + 0.5 - y0;
    const offset = y * width;
    for (let x = left; x <= right; x++) {
      const px = x + 0.5 - x0;
      /* Closest point on the segment, as a 0..1 position along it. */
      const t =
        lengthSq === 0
          ? 0
          : Math.min(1, Math.max(0, (px * dx + py * dy) / lengthSq));
      const ex = px - t * dx;
      const ey = py - t * dy;
      if (ex * ex + ey * ey <= radiusSq) data[offset + x] = value;
    }
  }
}

/*
 * Scanline flood fill over 4-connected pixels of the same role. Returns
 * false when there was nothing to change.
 */
export function floodFill(mask: Mask, x: number, y: number, value: MaskValue) {
  const { width, height, data } = mask;
  const startX = Math.floor(x);
  const startY = Math.floor(y);
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    return false;
  }

  const target = data[startY * width + startX];
  if (target === value) return false;

  const stack = [startX, startY];
  while (stack.length > 0) {
    const sy = stack.pop() as number;
    const sx = stack.pop() as number;
    const offset = sy * width;
    if (data[offset + sx] !== target) continue;

    let left = sx;
    while (left > 0 && data[offset + left - 1] === target) left--;
    let right = sx;
    while (right < width - 1 && data[offset + right + 1] === target) right++;

    for (let i = left; i <= right; i++) data[offset + i] = value;

    /* Queue one seed per run of target pixels in the rows above and below. */
    for (const ny of [sy - 1, sy + 1]) {
      if (ny < 0 || ny >= height) continue;
      const row = ny * width;
      let inRun = false;
      for (let i = left; i <= right; i++) {
        const match = data[row + i] === target;
        if (match && !inRun) stack.push(i, ny);
        inRun = match;
      }
    }
  }

  return true;
}

/* The square every aspect ratio is a centred window onto. */
export const MASTER_SIZE = MASK_LONG_EDGE;

/*
 * Copies the overlap of two masks that share a centre. Used both ways
 * between the square master and the current window, so changing the aspect
 * ratio crops and restores a drawing instead of rescaling it.
 */
export function copyCentred(from: Mask, to: Mask) {
  const dx = Math.round((from.width - to.width) / 2);
  const dy = Math.round((from.height - to.height) / 2);

  for (let y = 0; y < to.height; y++) {
    const sy = y + dy;
    if (sy < 0 || sy >= from.height) continue;
    for (let x = 0; x < to.width; x++) {
      const sx = x + dx;
      if (sx < 0 || sx >= from.width) continue;
      to.data[y * to.width + x] = from.data[sy * from.width + sx];
    }
  }
}

function packColor(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  /* ImageData is RGBA in memory, which reads as ABGR on little-endian. */
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

/* The raw drawing as pixels, for the faint overlay. */
export function maskToImageData(mask: Mask, shape: string, accent: string) {
  const image = new ImageData(mask.width, mask.height);
  const pixels = new Uint32Array(image.data.buffer);
  const colors = [0, packColor(shape), packColor(accent)];
  const { data } = mask;
  for (let i = 0; i < data.length; i++) {
    if (data[i] !== EMPTY) pixels[i] = colors[data[i]];
  }
  return image;
}
