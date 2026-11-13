/*
 * OKLCH colour maths. Ramps are interpolated here rather than in RGB, where
 * the midpoints of a light-to-saturated blend turn muddy.
 */

/* Lightness 0..1, chroma 0..~0.4, hue in degrees. */
export type Oklch = { l: number; c: number; h: number };

function toLinear(channel: number) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function fromLinear(value: number) {
  const c =
    value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, c)) * 255);
}

export function hexToOklch(hex: string): Oklch {
  const value = parseInt(hex.slice(1), 16);
  const r = toLinear((value >> 16) & 255);
  const g = toLinear((value >> 8) & 255);
  const b = toLinear(value & 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return {
    l: lightness,
    c: Math.hypot(a, bb),
    h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360,
  };
}

/* Linear sRGB, unclamped: values outside 0..1 are out of gamut. */
function toLinearRgb({ l, c, h }: Oklch) {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);

  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
}

function inGamut(rgb: number[]) {
  return rgb.every((value) => value >= -0.0005 && value <= 1.0005);
}

/*
 * To hex. A colour sRGB can't show keeps its lightness and hue and gives up
 * chroma until it fits, so derived ramps never shift hue at the extremes.
 */
export function oklchToHex(color: Oklch) {
  const l = Math.min(1, Math.max(0, color.l));
  let rgb = toLinearRgb({ ...color, l });

  if (!inGamut(rgb)) {
    let low = 0;
    let high = color.c;
    for (let i = 0; i < 16; i++) {
      const mid = (low + high) / 2;
      if (inGamut(toLinearRgb({ l, c: mid, h: color.h }))) low = mid;
      else high = mid;
    }
    rgb = toLinearRgb({ l, c: low, h: color.h });
  }

  return `#${rgb
    .map((value) => fromLinear(value).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
}

/* Greys have no meaningful hue, so they borrow the other colour's. */
const ACHROMATIC = 0.004;

export function mixOklch(a: Oklch, b: Oklch, t: number): Oklch {
  const ha = a.c < ACHROMATIC ? b.h : a.h;
  const hb = b.c < ACHROMATIC ? a.h : b.h;
  /* The short way round the wheel. */
  const delta = ((hb - ha + 540) % 360) - 180;
  return {
    l: a.l + (b.l - a.l) * t,
    c: a.c + (b.c - a.c) * t,
    h: (ha + delta * t + 360) % 360,
  };
}

export function mixHex(a: string, b: string, t: number) {
  return oklchToHex(mixOklch(hexToOklch(a), hexToOklch(b), t));
}

/* Perceptual distance in OKLab: about 0.02 is just noticeable. */
export function distance(a: Oklch, b: Oklch) {
  const rad = Math.PI / 180;
  return Math.hypot(
    a.l - b.l,
    a.c * Math.cos(a.h * rad) - b.c * Math.cos(b.h * rad),
    a.c * Math.sin(a.h * rad) - b.c * Math.sin(b.h * rad),
  );
}
