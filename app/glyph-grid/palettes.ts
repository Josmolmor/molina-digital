import {
  distance,
  hexToOklch,
  mixHex,
  mixOklch,
  oklchToHex,
  type Oklch,
} from './color';
import type { Cell, Role } from './generator';

/*
 * Every palette has the same structure: a quiet ground, a ramp of bands that
 * carries the shape (the first is the lead tone and doubles as the ink for
 * type), and one hot accent.
 */
export type Palette = {
  name: string;
  background: string;
  /* Glyphs on empty cells: the background texture. */
  dim: string;
  /* Edge cells of a shape. */
  outline: string;
  /* Interior tones, 3-5 of them, lead tone first. */
  bands: string[];
  accent: string;
};

/* How far the background glyphs sit from the ground, in OKLCH lightness. */
const DIM_SHIFT = 0.085;

/*
 * A preset from its ground, bands and accent. The two supporting tones are
 * derived: the outline is halfway from the ground to the lead band, and the
 * dim glyphs are the ground nudged a little towards it.
 */
function preset(
  name: string,
  background: string,
  bands: string[],
  accent: string,
): Palette {
  const ground = hexToOklch(background);
  const lead = hexToOklch(bands[0]);
  return {
    name,
    background,
    dim: oklchToHex({
      ...ground,
      l: ground.l + (lead.l > ground.l ? DIM_SHIFT : -DIM_SHIFT),
    }),
    outline: mixHex(background, bands[0], 0.5),
    bands,
    accent,
  };
}

export const PRESETS = {
  dark: {
    name: 'Dark',
    background: '#1E1F21',
    dim: '#3A3B3D',
    outline: '#8A8D8C',
    bands: ['#F2F0EA', '#DDE3E0', '#A9A294', '#7E9A8F', '#2F5A4A'],
    accent: '#F28C28',
  },
  green: {
    name: 'Green',
    background: '#3F6858',
    dim: '#56796B',
    outline: '#A9C0B5',
    bands: ['#F2F0EA', '#DDE3E0'],
    accent: '#F2A65A',
  },
  light: {
    name: 'Light',
    background: '#F2F0EA',
    dim: '#D9D6CD',
    outline: '#8A8D8C',
    bands: ['#1E1F21', '#2F5A4A', '#7E9A8F'],
    accent: '#F28C28',
  },
  midnight: preset(
    'Midnight',
    '#14192B',
    ['#EEF1F6', '#C9D2E3', '#7F93B8', '#34497A'],
    '#FFC53D',
  ),
  oxblood: preset(
    'Oxblood',
    '#2A1416',
    ['#F4ECE6', '#E0C9BE', '#B5766B', '#6E2A2E'],
    '#5FD3BC',
  ),
  plum: preset(
    'Plum',
    '#221A2B',
    ['#F1EDF3', '#D3C7DB', '#9A82AD', '#4F3A66'],
    '#C8E64A',
  ),
  clay: preset('Clay', '#B5553A', ['#FBF3E8', '#F0D9C2', '#E3B594'], '#1F3A4D'),
  paper: preset(
    'Paper',
    '#F2F0EA',
    ['#1E1F21', '#55585A', '#9A9C99'],
    '#E5372B',
  ),
  blueprint: preset(
    'Blueprint',
    '#1F4FA8',
    ['#FFFFFF', '#C8D8F5', '#8FB0EA'],
    '#FF7A45',
  ),
  terminal: preset(
    'Terminal',
    '#0D0F0D',
    ['#D8F5DC', '#8FD9A0', '#3F9A5A', '#1D4A2C'],
    '#FF4FA3',
  ),
  mustard: preset(
    'Mustard',
    '#D9A21B',
    ['#FFF9EC', '#F7E6B5', '#EFD080'],
    '#1D2B4F',
  ),
} satisfies Record<string, Palette>;

export type PresetId = keyof typeof PRESETS;
export type PaletteId = PresetId | 'custom';

export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];

/*
 * A custom palette is three decisions; everything else is derived, because
 * most free combinations of eight colours look bad.
 */
export type CustomPalette = {
  /* Ground: dark or light, plus a hue. Its saturation is fixed and low. */
  dark: boolean;
  groundHue: number;
  /* The band ramp runs through this colour. */
  tint: string;
  /* null follows the tint: its hue rotated most of the way round the wheel. */
  accent: string | null;
};

export const DEFAULT_CUSTOM: CustomPalette = {
  dark: true,
  groundHue: 250,
  tint: '#7E9A8F',
  accent: null,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/* Degrees from the tint to its automatic accent: near-complementary. */
const ACCENT_ROTATION = 165;

/* The accent has to read against the ground and not blend into a band. */
const MIN_GROUND_DISTANCE = 0.3;
const MIN_BAND_DISTANCE = 0.1;

function derive(custom: CustomPalette): Palette {
  const { dark } = custom;
  const picked = hexToOklch(custom.tint);
  const ground: Oklch = dark
    ? { l: 0.22, c: 0.02, h: custom.groundHue }
    : { l: 0.955, c: 0.012, h: custom.groundHue };

  /* Keep the tint in the range where it can sit between the ramp's ends. */
  const tint: Oklch = {
    ...picked,
    l: dark ? clamp(picked.l, 0.58, 0.8) : clamp(picked.l, 0.5, 0.72),
  };
  const deep: Oklch = {
    l: dark ? Math.max(0.4, tint.l - 0.24) : Math.max(0.32, tint.l - 0.24),
    c: tint.c * 0.95,
    h: tint.h,
  };

  /* Dark grounds: off-white, through the tint, to a deepened tint. Light
   * grounds lead with a near-black ink instead and lighten towards the tint,
   * so the lead band is always the one furthest from the ground. */
  const ramp: Oklch[] = dark
    ? [
        { l: 0.955, c: Math.min(0.012, tint.c), h: tint.h },
        mixOklch({ l: 0.955, c: 0.012, h: tint.h }, tint, 0.45),
        tint,
        mixOklch(tint, deep, 0.5),
        deep,
      ]
    : [
        { l: 0.24, c: Math.min(0.012, tint.c), h: tint.h },
        deep,
        mixOklch(deep, tint, 0.5),
        tint,
      ];

  let accent: Oklch = custom.accent
    ? hexToOklch(custom.accent)
    : {
        l: dark ? 0.76 : 0.66,
        c: dark ? 0.17 : 0.2,
        h: (tint.h + ACCENT_ROTATION) % 360,
      };

  /* Contrast check: step the accent's lightness away from the ground until
   * it clears the ground and every band, or runs out of room. */
  for (let i = 0; i < 10; i++) {
    const clear =
      distance(accent, ground) >= MIN_GROUND_DISTANCE &&
      ramp.every((band) => distance(accent, band) >= MIN_BAND_DISTANCE);
    if (clear) break;
    const next = clamp(accent.l + (dark ? 0.04 : -0.04), 0.35, 0.88);
    if (next === accent.l) break;
    accent = { ...accent, l: next };
  }

  return {
    name: 'Custom',
    background: oklchToHex(ground),
    dim: oklchToHex({
      ...ground,
      l: ground.l + (dark ? DIM_SHIFT : -DIM_SHIFT),
    }),
    outline: oklchToHex(mixOklch(ground, ramp[0], 0.5)),
    bands: ramp.map(oklchToHex),
    accent: oklchToHex(accent),
  };
}

/* Derivation runs every frame while drawing; the inputs rarely change. */
const derived = new WeakMap<CustomPalette, Palette>();

export function derivePalette(custom: CustomPalette) {
  let palette = derived.get(custom);
  if (!palette) {
    palette = derive(custom);
    derived.set(custom, palette);
  }
  return palette;
}

export function resolvePalette(id: PaletteId, custom: CustomPalette) {
  return id === 'custom' ? derivePalette(custom) : PRESETS[id];
}

/* A random tint hue; the ground and accent follow from it by the rules. */
export function shufflePalette(
  random: () => number = Math.random,
): CustomPalette {
  const hue = random() * 360;
  return {
    dark: random() < 0.75,
    /* Usually the tint's own hue, sometimes a neighbour's. */
    groundHue: Math.round((hue + (random() - 0.5) * 80 + 360) % 360),
    tint: oklchToHex({
      l: 0.66 + random() * 0.08,
      c: 0.06 + random() * 0.07,
      h: hue,
    }),
    accent: null,
  };
}

function luminance(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const c = ((value >> shift) & 255) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
}

function contrast(a: string, b: string) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const INK_DARK = '#1E1F21';
const INK_LIGHT = '#F2F0EA';
const contrastCache = new Map<string, string>();

/* The most legible of the palette background and the two inks. */
export function contrastColor(fill: string, palette: Palette) {
  const key = `${fill}|${palette.background}`;
  let best = contrastCache.get(key);
  if (!best) {
    best = [palette.background, INK_DARK, INK_LIGHT].reduce((a, b) =>
      contrast(b, fill) > contrast(a, fill) ? b : a,
    );
    /* Dragging a colour picker would otherwise grow this without limit. */
    if (contrastCache.size > 2000) contrastCache.clear();
    contrastCache.set(key, best);
  }
  return best;
}

export function inkColor(palette: Palette) {
  return palette.bands[0];
}

/* The fill for a cell, or null for empty cells (which have none). */
export function cellFill(cell: Cell, palette: Palette) {
  if (cell.role === 'accent') return palette.accent;
  if (cell.role === 'empty') return null;
  if (cell.edge) return palette.outline;
  return palette.bands[Math.min(cell.band, palette.bands.length - 1)];
}

/* Word field colours: no fills, the role tints the type itself. */
export function wordColor(role: Role, palette: Palette) {
  if (role === 'accent') return palette.accent;
  if (role === 'shape') return inkColor(palette);
  return palette.dim;
}
