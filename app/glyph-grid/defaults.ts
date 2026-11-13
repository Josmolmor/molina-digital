import { DEFAULT_CHARSET, DEFAULT_WORDS } from './generator';
import { DEFAULT_CUSTOM, PRESET_IDS, shufflePalette } from './palettes';
import type { PosterSettings } from './scene';

export const MIN_COLS = 16;
export const MAX_COLS = 64;
export const DEFAULT_BRUSH = 1.5;

export const DEFAULTS: PosterSettings = {
  mode: 'cells',
  cols: 30,
  aspect: '4:5',
  threshold: 0.45,
  bandRule: 'depth',
  jitter: 0.15,
  paletteId: 'dark',
  custom: DEFAULT_CUSTOM,
  /* Fixed, not random: the first render has to match on server and client. */
  seed: 1337,
  charset: DEFAULT_CHARSET,
  words: DEFAULT_WORDS,
  headline: 'Glyph\nGrid',
  headlineSize: 0.12,
  headlinePos: null,
  wordmark: 'Wordmark',
  wordmarkSize: 0.026,
  wordmarkPos: null,
  /* One cell in from the corner at the default density. */
  labels: [{ id: 0, text: 'Fig. 01', pos: { x: 1 / 30, y: 1 / 38 } }],
  labelSize: 0.016,
  quietZone: true,
};

/*
 * What "Randomize" draws from. Repetition is weighting: the settings that
 * tend to look best appear more than once.
 */
const RANDOM_COLS = [20, 24, 28, 30, 30, 36, 42, 48];
const RANDOM_BAND_RULES = ['depth', 'depth', 'row', 'row', 'flat'] as const;
const RANDOM_CHARSETS = [
  DEFAULT_CHARSET,
  DEFAULT_CHARSET,
  DEFAULT_CHARSET,
  '0123456789',
  '0123456789ABCDEF',
  '01',
  '!?#$%&*+-=<>()[]{}/\\|~^:@',
  '+-=/\\|',
];

function pick<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function randomSeed() {
  return Math.floor(Math.random() * 2 ** 32);
}

/*
 * A new look for the same poster. It changes how things are rendered, never
 * what the user made or decided: the drawing, the words, where the type
 * sits and the format (aspect ratio) are left alone. Threshold is left too,
 * because it changes the shape itself.
 */
export function randomLook(): Partial<PosterSettings> {
  const preset = Math.random() < 0.6;
  return {
    seed: randomSeed(),
    mode: Math.random() < 0.25 ? 'words' : 'cells',
    cols: pick(RANDOM_COLS),
    bandRule: pick(RANDOM_BAND_RULES),
    jitter: Math.round(Math.random() * 30) / 100,
    charset: pick(RANDOM_CHARSETS),
    /* A narrow band around the default, so the layout shifts without the
     * headline taking over or disappearing. */
    headlineSize: Math.round((0.09 + Math.random() * 0.07) * 100) / 100,
    paletteId: preset ? pick(PRESET_IDS) : 'custom',
    ...(preset ? null : { custom: shufflePalette() }),
  };
}
