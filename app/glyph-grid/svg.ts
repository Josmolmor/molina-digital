import { cellFill, contrastColor, inkColor, wordColor } from './palettes';
import {
  CAP_CENTRE,
  GLYPH_WEIGHT,
  MONO,
  SANS,
  SERIF,
  WORDMARK_WEIGHT,
  type Scene,
} from './scene';

function escape(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Two decimals: sub-pixel accurate at 4x, without the float noise. */
function n(value: number) {
  return String(Math.round(value * 100) / 100);
}

/*
 * SVG renderer. Same scene as the canvas: one rect + text per filled cell,
 * and all type as real text. Baselines are positioned explicitly rather than
 * with dominant-baseline, which design tools tend to ignore.
 */
export function buildSvg(scene: Scene) {
  const { palette, cell, gap, width, height } = scene;
  const ink = inkColor(palette);
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${n(width)}" height="${n(height)}" viewBox="0 0 ${n(width)} ${n(height)}">`,
    `<rect width="${n(width)}" height="${n(height)}" fill="${palette.background}"/>`,
  ];
  const mono = `font-family="${escape(MONO)}" font-weight="${GLYPH_WEIGHT}"`;

  if (scene.mode === 'cells') {
    const baseline = cell / 2 + scene.glyphSize * CAP_CENTRE;
    const side = n(cell - gap);
    parts.push(
      `<g ${mono} font-size="${n(scene.glyphSize)}" text-anchor="middle">`,
    );
    for (const item of scene.cells) {
      const x = item.col * cell;
      const y = item.row * cell;
      const fill = cellFill(item, palette);
      if (fill) {
        parts.push(
          `<rect x="${n(x + gap / 2)}" y="${n(y + gap / 2)}" width="${side}" height="${side}" fill="${fill}"/>`,
        );
      }
      parts.push(
        `<text x="${n(x + cell / 2)}" y="${n(y + baseline)}" fill="${fill ? contrastColor(fill, palette) : palette.dim}">${escape(item.glyph)}</text>`,
      );
    }
    parts.push('</g>');
  } else {
    const { charWidth, lineHeight, fontSize } = scene.wordField;
    const baseline = lineHeight / 2 + fontSize * CAP_CENTRE;
    parts.push(`<g ${mono} font-size="${n(fontSize)}">`);
    for (const word of scene.words) {
      /* textLength pins each word to the character grid even if the viewer
       * substitutes a monospace font with a different advance. */
      const length = Array.from(word.text).length * charWidth;
      parts.push(
        `<text x="${n(word.col * charWidth)}" y="${n(word.line * lineHeight + baseline)}" textLength="${n(length)}" lengthAdjust="spacing" fill="${wordColor(word.role, palette)}">${escape(word.text)}</text>`,
      );
    }
    parts.push('</g>');
  }

  for (const label of scene.labels) {
    parts.push(
      `<rect x="${n(label.x)}" y="${n(label.y)}" width="${n(label.width)}" height="${n(label.height)}" rx="${n(label.height / 2)}" fill="${ink}"/>`,
      `<text x="${n(label.textX)}" y="${n(label.textY)}" ${mono} font-size="${n(label.size)}" fill="${contrastColor(ink, palette)}">${escape(label.text)}</text>`,
    );
  }

  if (scene.headline.lines.length > 0) {
    parts.push(
      `<g font-family="${escape(SERIF)}" font-size="${n(scene.headline.size)}" fill="${ink}" xml:space="preserve">`,
    );
    for (const line of scene.headline.lines) {
      parts.push(
        `<text x="${n(line.x)}" y="${n(line.y)}">${escape(line.text)}</text>`,
      );
    }
    parts.push('</g>');
  }

  if (scene.wordmark) {
    parts.push(
      `<text x="${n(scene.wordmark.x)}" y="${n(scene.wordmark.y)}" font-family="${escape(SANS)}" font-weight="${WORDMARK_WEIGHT}" font-size="${n(scene.wordmark.size)}" fill="${ink}">${escape(scene.wordmark.text)}</text>`,
    );
  }

  parts.push('</svg>');
  return parts.join('\n');
}
