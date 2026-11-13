import { cellFill, contrastColor, inkColor, wordColor } from './palettes';
import {
  CAP_CENTRE,
  GLYPH_WEIGHT,
  MONO,
  SANS,
  SERIF,
  WORDMARK_WEIGHT,
  fontString,
  type Scene,
} from './scene';

/*
 * Canvas renderer. Draws in poster units: the caller sets the transform, so
 * the same code paints the on-screen canvas and the 2x/4x exports.
 */
export function drawScene(ctx: CanvasRenderingContext2D, scene: Scene) {
  const { palette, cell, gap } = scene;
  const ink = inkColor(palette);

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, scene.width, scene.height);
  ctx.textBaseline = 'alphabetic';

  if (scene.mode === 'cells') {
    const baseline = cell / 2 + scene.glyphSize * CAP_CENTRE;
    ctx.font = fontString(GLYPH_WEIGHT, scene.glyphSize, MONO);
    ctx.textAlign = 'center';

    for (const item of scene.cells) {
      const x = item.col * cell;
      const y = item.row * cell;
      const fill = cellFill(item, palette);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fillRect(x + gap / 2, y + gap / 2, cell - gap, cell - gap);
      }
      ctx.fillStyle = fill ? contrastColor(fill, palette) : palette.dim;
      ctx.fillText(item.glyph, x + cell / 2, y + baseline);
    }
  } else {
    const { charWidth, lineHeight, fontSize } = scene.wordField;
    const baseline = lineHeight / 2 + fontSize * CAP_CENTRE;
    ctx.font = fontString(GLYPH_WEIGHT, fontSize, MONO);
    ctx.textAlign = 'left';

    for (const word of scene.words) {
      ctx.fillStyle = wordColor(word.role, palette);
      ctx.fillText(
        word.text,
        word.col * charWidth,
        word.line * lineHeight + baseline,
      );
    }
  }

  /* Text overlay */
  ctx.textAlign = 'left';
  for (const label of scene.labels) {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.roundRect(
      label.x,
      label.y,
      label.width,
      label.height,
      label.height / 2,
    );
    ctx.fill();
    ctx.fillStyle = contrastColor(ink, palette);
    ctx.font = fontString(GLYPH_WEIGHT, label.size, MONO);
    ctx.fillText(label.text, label.textX, label.textY);
  }

  ctx.fillStyle = ink;
  ctx.font = fontString(400, scene.headline.size, SERIF);
  for (const line of scene.headline.lines) {
    ctx.fillText(line.text, line.x, line.y);
  }

  if (scene.wordmark) {
    ctx.font = fontString(WORDMARK_WEIGHT, scene.wordmark.size, SANS);
    ctx.fillText(scene.wordmark.text, scene.wordmark.x, scene.wordmark.y);
  }
}

/* How strongly a previewed change tints the cell it would land on. */
const PREVIEW_ALPHA = 0.5;

/*
 * Hover preview, drawn over a finished scene on screen only (never in an
 * export). `next` is the scene as it would be after a click: every cell or
 * word whose role differs is tinted with the colour it would take.
 */
export function drawPreview(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  next: Scene,
) {
  const { palette, cell, gap } = scene;
  const tint = (role: Scene['cells'][number]['role']) =>
    role === 'accent'
      ? palette.accent
      : role === 'shape'
        ? inkColor(palette)
        : palette.background;

  ctx.save();
  ctx.globalAlpha = PREVIEW_ALPHA;

  if (scene.mode === 'cells') {
    /* Same grid, same order: the two scenes differ only in their mask. */
    for (let i = 0; i < scene.cells.length; i++) {
      const after = next.cells[i];
      if (!after || after.role === scene.cells[i].role) continue;
      ctx.fillStyle = tint(after.role);
      ctx.fillRect(
        after.col * cell + gap / 2,
        after.row * cell + gap / 2,
        cell - gap,
        cell - gap,
      );
    }
  } else {
    const { charWidth, lineHeight } = scene.wordField;
    for (let i = 0; i < scene.words.length; i++) {
      const after = next.words[i];
      if (!after || after.role === scene.words[i].role) continue;
      ctx.fillStyle = tint(after.role);
      ctx.fillRect(
        after.col * charWidth,
        after.line * lineHeight,
        Array.from(after.text).length * charWidth,
        lineHeight,
      );
    }
  }

  ctx.restore();
}
