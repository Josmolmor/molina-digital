import {
  generateCells,
  generateWords,
  parseWords,
  type BandRule,
  type Cell,
  type Mask,
  type Rect,
  type Word,
} from './generator';
import {
  resolvePalette,
  type CustomPalette,
  type Palette,
  type PaletteId,
} from './palettes';

/*
 * The scene: everything a renderer needs, in poster units. Building it is
 * the only place layout happens, so the canvas and the SVG can't disagree.
 */

/* Poster width in logical units. Exports multiply this (2x = 2160px wide). */
export const POSTER_WIDTH = 1080;

/* System stacks, so nothing has to load before the first frame or an export. */
export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
export const SERIF = "Georgia, 'Times New Roman', serif";
export const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const GLYPH_WEIGHT = 500;
export const WORDMARK_WEIGHT = 600;

/* Gap between cells and glyph size, as fractions of a cell. */
const GAP = 0.06;
const GLYPH_SIZE = 0.45;
/* Offset from a box's middle to the baseline that centres capitals in it. */
export const CAP_CENTRE = 0.35;

export const ASPECTS = {
  '4:5': [4, 5],
  '1:1': [1, 1],
  '16:9': [16, 9],
} as const;

export type AspectId = keyof typeof ASPECTS;
export type Mode = 'cells' | 'words';

/* Where a draggable piece of type sits: the top-left of its box, as 0..1
 * across the poster. Stored like this (not in cells) so a position survives
 * a change of grid density; it is snapped to the grid when laid out. */
export type Point = { x: number; y: number };

export type Label = { id: number; text: string; pos: Point };

export type PosterSettings = {
  mode: Mode;
  cols: number;
  aspect: AspectId;
  threshold: number;
  bandRule: BandRule;
  jitter: number;
  paletteId: PaletteId;
  /* Inputs for the derived palette; used when paletteId is 'custom'. */
  custom: CustomPalette;
  seed: number;
  charset: string;
  words: string;
  headline: string;
  /* Fraction of the poster width. */
  headlineSize: number;
  /* null until dragged: bottom left, one margin in. */
  headlinePos: Point | null;
  wordmark: string;
  /* Fraction of the poster width, like the headline. */
  wordmarkSize: number;
  /* null until dragged: top right, one margin in. */
  wordmarkPos: Point | null;
  labels: Label[];
  /* Fraction of the poster width; shared by every label. */
  labelSize: number;
  quietZone: boolean;
};

export type Scene = {
  width: number;
  height: number;
  cols: number;
  rows: number;
  cell: number;
  gap: number;
  palette: Palette;
  mode: Mode;
  cells: Cell[];
  glyphSize: number;
  words: Word[];
  wordField: { charWidth: number; lineHeight: number; fontSize: number };
  headline: {
    size: number;
    /* x is the left edge, y the baseline. */
    lines: { text: string; x: number; y: number }[];
  };
  wordmark: { text: string; x: number; y: number; size: number } | null;
  /* Where type can be grabbed, in poster units: the box's origin, and the
   * areas that count as a hit. Later entries sit on top. */
  handles: {
    kind: 'headline' | 'wordmark' | 'label';
    /* Which label; unset for the other kinds. */
    id?: number;
    left: number;
    top: number;
    rects: { x0: number; y0: number; x1: number; y1: number }[];
  }[];
  labels: {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    textX: number;
    textY: number;
    size: number;
  }[];
};

export type Measure = (text: string, font: string) => number;

export function fontString(weight: number, size: number, family: string) {
  return `${weight} ${size}px ${family}`;
}

let measureContext: CanvasRenderingContext2D | null = null;

/* Browser text measurement, on a shared scratch canvas. */
export const measureText: Measure = (text, font) => {
  measureContext ??= document.createElement('canvas').getContext('2d');
  if (!measureContext) return 0;
  measureContext.font = font;
  return measureContext.measureText(text).width;
};

export function gridRows(cols: number, aspect: AspectId) {
  const [w, h] = ASPECTS[aspect];
  return Math.max(1, Math.round((cols * h) / w));
}

export function buildScene(
  mask: Mask,
  settings: PosterSettings,
  measure: Measure = measureText,
): Scene {
  const { cols, mode } = settings;
  const rows = gridRows(cols, settings.aspect);
  const width = POSTER_WIDTH;
  const cell = width / cols;
  /* Whole cells only, so the poster is the nominal ratio to the nearest row. */
  const height = rows * cell;
  const palette = resolvePalette(settings.paletteId, settings.custom);
  /* Margins snap to the grid so type lines up with cell edges. */
  const margin = cell * Math.max(1, Math.round((0.045 * width) / cell));

  /* In poster units; normalised before they reach the generator. */
  const quiet: Rect[] = [];
  const reserve = (x0: number, y0: number, x1: number, y1: number) =>
    quiet.push({
      x0: x0 / width,
      y0: y0 / height,
      x1: x1 / width,
      y1: y1 / height,
    });

  /* A dragged position, snapped to the grid and kept on the poster; or the
   * default when it has never been dragged. */
  const place = (
    pos: Point | null,
    fallback: { left: number; top: number },
    boxWidth: number,
    boxHeight: number,
  ) => {
    if (!pos) return fallback;
    const snap = (value: number, room: number) =>
      Math.min(
        Math.max(0, Math.floor(room / cell + 1e-6)),
        Math.max(0, Math.round(value / cell)),
      ) * cell;
    return {
      left: snap(pos.x * width, width - boxWidth),
      top: snap(pos.y * height, height - boxHeight),
    };
  };
  const handles: Scene['handles'] = [];

  /* Headline */
  const size = settings.headlineSize * width;
  const lineHeight = size * 1.05;
  const texts = settings.headline.replace(/\s+$/, '').split('\n');
  const hasHeadline = texts.some((text) => text.trim() !== '');
  const headline: Scene['headline'] = { size, lines: [] };

  if (hasHeadline) {
    const font = fontString(400, size, SERIF);
    const widths = texts.map((text) => measure(text, font));
    const boxWidth = Math.max(...widths);
    const boxHeight = texts.length * lineHeight;
    const { left, top } = place(
      settings.headlinePos,
      { left: margin, top: height - margin - boxHeight },
      boxWidth,
      boxHeight,
    );

    headline.lines = texts.map((text, i) => ({
      text,
      x: left,
      y: top + i * lineHeight + size * 0.8,
    }));
    /* One hit area per line, as wide as its text: the gaps beside short
     * lines stay paintable. */
    handles.push({
      kind: 'headline',
      left,
      top,
      rects: widths.map((lineWidth, i) => ({
        x0: left,
        y0: top + i * lineHeight,
        x1: left + lineWidth,
        y1: top + (i + 1) * lineHeight,
      })),
    });

    if (settings.quietZone) {
      reserve(left, top, left + boxWidth, top + boxHeight);
    }
  }

  /* Wordmark */
  let wordmark: Scene['wordmark'] = null;
  const mark = settings.wordmark.trim();
  if (mark) {
    const markSize = width * settings.wordmarkSize;
    const markHeight = markSize * 1.2;
    const markWidth = measure(
      mark,
      fontString(WORDMARK_WEIGHT, markSize, SANS),
    );
    const { left, top } = place(
      settings.wordmarkPos,
      { left: width - margin - markWidth, top: margin },
      markWidth,
      markHeight,
    );
    wordmark = { text: mark, x: left, y: top + markSize * 0.8, size: markSize };
    /* Small type: the hit area is padded so it can be grabbed by touch. */
    const pad = cell * 0.4;
    handles.push({
      kind: 'wordmark',
      left,
      top,
      rects: [
        {
          x0: left - pad,
          y0: top - pad,
          x1: left + markWidth + pad,
          y1: top + markHeight + pad,
        },
      ],
    });
    if (settings.quietZone) {
      reserve(left, top, left + markWidth, top + markHeight);
    }
  }

  /* Labels: pills sized from the poster, not the grid, so they keep their
   * size when the column count changes. Only their position snaps. */
  const gap = cell * GAP;
  const labelSize = width * settings.labelSize;
  const labelPad = labelSize * 0.85;
  const pillHeight = labelSize * 1.95;
  const labelFont = fontString(GLYPH_WEIGHT, labelSize, MONO);
  const labels: Scene['labels'] = [];

  for (const label of settings.labels) {
    const text = label.text.trim().toUpperCase();
    if (!text) continue;
    const pillWidth = measure(text, labelFont) + labelPad * 2;
    /* The box includes the same inset a cell has, so a pill lines up with
     * the cells around it. */
    const boxWidth = pillWidth + gap;
    const boxHeight = pillHeight + gap;
    const { left, top } = place(
      label.pos,
      { left: 0, top: 0 },
      boxWidth,
      boxHeight,
    );
    labels.push({
      text,
      x: left + gap / 2,
      y: top + gap / 2,
      width: pillWidth,
      height: pillHeight,
      textX: left + gap / 2 + labelPad,
      textY: top + gap / 2 + pillHeight / 2 + labelSize * CAP_CENTRE,
      size: labelSize,
    });
    handles.push({
      kind: 'label',
      id: label.id,
      left,
      top,
      rects: [{ x0: left, y0: top, x1: left + boxWidth, y1: top + boxHeight }],
    });
    /* The pill hides these cells; clearing them also gives it an outline. */
    reserve(left, top, left + boxWidth, top + boxHeight);
  }

  /*
   * Word field metrics: two characters per cell column. The font is sized
   * from its measured advance, so words sit on the character grid whatever
   * monospace font the system resolves.
   */
  const charCols = cols * 2;
  const charWidth = width / charCols;
  const advance =
    measure('MMMMMMMMMM', fontString(GLYPH_WEIGHT, 100, MONO)) / 1000;
  const wordSize = charWidth / (advance || 0.6);
  const lines = Math.max(1, Math.round(height / (charWidth * 2.4)));

  return {
    width,
    height,
    cols,
    rows,
    cell,
    gap,
    palette,
    mode,
    cells:
      mode === 'cells'
        ? generateCells(
            mask,
            {
              cols,
              rows,
              threshold: settings.threshold,
              bandRule: settings.bandRule,
              bandCount: palette.bands.length,
              jitter: settings.jitter,
              charset: settings.charset,
              quiet,
            },
            settings.seed,
          )
        : [],
    glyphSize: cell * GLYPH_SIZE,
    words:
      mode === 'words'
        ? generateWords(
            mask,
            {
              charCols,
              lines,
              words: parseWords(settings.words),
              threshold: settings.threshold,
              quiet,
            },
            settings.seed,
          )
        : [],
    wordField: { charWidth, lineHeight: height / lines, fontSize: wordSize },
    headline,
    wordmark,
    handles,
    labels,
  };
}
