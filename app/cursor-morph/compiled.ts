import { compileShape, pathFromData, type CompiledShape } from './morph-engine';
import { CURSOR_SHAPES, CURSOR_STATES, type CursorStateId } from './shapes';

/* Fill and stroke share a colour; the stroke only rounds the corners. */
export const STROKE_WIDTH = 1.5;

/*
 * Caret blink for the cursor and the stage. Declared on the element (not as a
 * theme token) so the duration resolves --morph-speed from the page, which
 * keeps the blink in step with the speed control. At 0× it effectively holds.
 */
export const CARET_BLINK_CLASS =
  'data-blink:animate-[caret-blink_calc(0.7s/max(var(--morph-speed,1),0.001))_ease-in-out_infinite] motion-reduce:animate-none';

export const COMPILED_SHAPES = Object.fromEntries(
  CURSOR_STATES.map((id) => [id, compileShape(CURSOR_SHAPES[id])]),
) as Record<CursorStateId, CompiledShape>;

/* Static outlines for the tile previews, from the exact same geometry. */
export const PREVIEW_PATHS = Object.fromEntries(
  CURSOR_STATES.map((id) => [id, pathFromData(COMPILED_SHAPES[id].frames[0])]),
) as Record<CursorStateId, string>;
