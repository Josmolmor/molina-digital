/**
 * Sticker-style outline around an icon's outer silhouette, with a subtle offset shadow.
 * Pure vector (no filters/masks), so it stays crisp at small sizes and while rotated or animating.
 * Render it inside a 256x256 viewBox SVG, before the icon's own shapes, and fill the icon's
 * closed shapes with stickerFill() so the ring doesn't show through them.
 */
export function StickerOutline({
  color,
  width,
  iconStrokeWidth,
  renderSilhouette,
}: {
  color: string;
  // In viewBox units (256 = full icon width)
  width: number;
  iconStrokeWidth: number;
  // Solid version of the icon (closed shapes filled) at the given stroke width
  renderSilhouette: (strokeWidth: number, color: string) => React.ReactNode;
}) {
  const strokeWidth = iconStrokeWidth + width * 2;

  return (
    <>
      <g transform="translate(0 8)" opacity="0.08">
        {renderSilhouette(strokeWidth, 'black')}
      </g>
      {renderSilhouette(strokeWidth, color)}
    </>
  );
}

// Opaque, mostly-saturated fill of the icon color, so the sticker looks the same on any background
export function stickerFill(outlineColor: string) {
  return `color-mix(in oklab, currentColor var(--sticker-fill), ${outlineColor})`;
}

// Darker shade of the icon color for the strokes, so they still read against the richer fill
export const STICKER_STROKE = 'color-mix(in oklab, currentColor 80%, black)';
