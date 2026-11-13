import type { Mask, MaskValue } from './generator';

/*
 * Pasted SVGs. The markup is drawn to a scratch canvas as an image, and
 * every pixel it covers becomes a mask pixel, so an icon turns into cells
 * the same way a brush stroke does.
 *
 * Rendering as an image (rather than inserting the markup into the page)
 * is also what makes pasting arbitrary SVG safe: scripts in it never run
 * and it cannot load anything external.
 */

/* How much of the poster the pasted artwork spans, on its tighter axis. */
const FIT = 0.7;
/* Used when the SVG declares no size at all. */
const FALLBACK_SIZE = 24;
/* Offsets used to thicken artwork; enough that the result stays round. */
const GROW_STEPS = 12;
/* Coverage (0-255) above which a pixel counts as painted. */
const ALPHA_CUTOFF = 96;

/* The SVG document inside a pasted string, or null if there isn't one. */
export function findSvg(text: string) {
  const start = text.indexOf('<svg');
  const end = text.lastIndexOf('</svg>');
  return start !== -1 && end > start ? text.slice(start, end + 6) : null;
}

function length(value: string | null) {
  const number = value === null ? NaN : parseFloat(value);
  /* Percentages are relative to a container the image doesn't have. */
  return Number.isFinite(number) && number > 0 && !value?.trim().endsWith('%')
    ? number
    : null;
}

/*
 * Rewrites the root element so the artwork renders at exactly `fit` pixels:
 * an explicit pixel size, a viewBox to scale by, and black as the colour
 * that `currentColor` strokes (how icon sets ship) resolve to.
 */
function prepare(markup: string, maxWidth: number, maxHeight: number) {
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const root = doc.documentElement;
  if (root.nodeName !== 'svg' || doc.querySelector('parsererror')) return null;

  const box = root
    .getAttribute('viewBox')
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const hasBox = box?.length === 4 && box.every(Number.isFinite);
  const width =
    (hasBox ? box[2] : null) ||
    length(root.getAttribute('width')) ||
    FALLBACK_SIZE;
  const height =
    (hasBox ? box[3] : null) ||
    length(root.getAttribute('height')) ||
    FALLBACK_SIZE;
  if (!hasBox) root.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const scale = Math.min(maxWidth / width, maxHeight / height);
  const fit = {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
  root.setAttribute('width', String(fit.width));
  root.setAttribute('height', String(fit.height));
  root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  root.setAttribute(
    'style',
    `${root.getAttribute('style') ?? ''};color:#000`.replace(/^;/, ''),
  );

  return { markup: new XMLSerializer().serializeToString(root), ...fit };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That SVG could not be rendered'));
    image.src = src;
  });
}

/*
 * Paints the SVG into the mask, centred, in the given role. Only where the
 * artwork is opaque: its own colours are ignored. Resolves to the number of
 * mask pixels covered (0 means the artwork was empty or fully transparent).
 * `grow` thickens the artwork by that many mask pixels on every side, so the
 * thin strokes icon sets use still fill whole cells on a coarse grid.
 * `before` runs just ahead of the first write, for taking an undo snapshot.
 */
export async function stampSvg(
  mask: Mask,
  markup: string,
  value: MaskValue,
  grow = 0,
  before?: () => void,
) {
  const svg = prepare(markup, mask.width * FIT, mask.height * FIT);
  if (!svg) throw new Error('That does not look like a valid SVG');

  /* A data URL, not a blob URL: some browsers taint the canvas for blobs. */
  const image = await loadImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.markup)}`,
  );

  const canvas = document.createElement('canvas');
  canvas.width = mask.width;
  canvas.height = mask.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is unavailable');

  const x = Math.round((mask.width - svg.width) / 2);
  const y = Math.round((mask.height - svg.height) / 2);
  ctx.drawImage(image, x, y, svg.width, svg.height);
  /* Thickening: the same image again, offset round a circle. */
  if (grow > 0) {
    for (let i = 0; i < GROW_STEPS; i++) {
      const angle = (i / GROW_STEPS) * Math.PI * 2;
      ctx.drawImage(
        image,
        x + Math.cos(angle) * grow,
        y + Math.sin(angle) * grow,
        svg.width,
        svg.height,
      );
    }
  }

  let pixels: Uint8ClampedArray;
  try {
    pixels = ctx.getImageData(0, 0, mask.width, mask.height).data;
  } catch {
    /* Some SVG features (foreignObject, in Safari) make the canvas unreadable. */
    throw new Error('This browser cannot read that SVG');
  }

  let covered = 0;
  for (let i = 0; i < mask.data.length; i++) {
    if (pixels[i * 4 + 3] <= ALPHA_CUTOFF) continue;
    if (covered === 0) before?.();
    mask.data[i] = value;
    covered++;
  }
  return covered;
}
