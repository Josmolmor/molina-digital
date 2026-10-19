import { STICKER_STROKE, StickerOutline, stickerFill } from './sticker-outline';

const STAR =
  'M84.27,171.73l-55.09-20.3a7.92,7.92,0,0,1,0-14.86l55.09-20.3,20.3-55.09a7.92,7.92,0,0,1,14.86,0l20.3,55.09,55.09,20.3a7.92,7.92,0,0,1,0,14.86l-55.09,20.3-20.3,55.09a7.92,7.92,0,0,1-14.86,0Z';
// The two small plus-shaped sparks next to the star
const SPARKS = [
  { cx: 176, cy: 40, r: 24, delay: '0s' },
  { cx: 224, cy: 88, r: 16, delay: '0.3s' },
];
const STROKE_WIDTH = 16;

// Twinkle while hovered (or while the parent HoverBlob is open)
const SPARK_CLASS =
  'origin-center [transform-box:fill-box] motion-safe:in-[svg:hover]:animate-twinkle motion-safe:in-[.token:hover]:animate-twinkle motion-safe:in-aria-expanded:animate-twinkle';
// The big star pops once per hover while the sparks keep twinkling
const STAR_CLASS =
  '[transform-box:view-box] motion-safe:in-[svg:hover]:animate-star-pop motion-safe:in-[.token:hover]:animate-star-pop motion-safe:in-aria-expanded:animate-star-pop';

function Shapes(props: React.SVGProps<SVGGElement>) {
  return (
    <g {...props}>
      <path
        d={STAR}
        className={STAR_CLASS}
        style={{ transformOrigin: '112px 144px' }}
      />
      {SPARKS.map(({ cx, cy, r, delay }) => (
        // Same class on every copy (icon, outline, mask) keeps them in sync
        <g
          key={`${cx}-${cy}`}
          className={SPARK_CLASS}
          style={{ animationDelay: delay }}
        >
          <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
        </g>
      ))}
    </g>
  );
}

// Solid version of the whole icon (star filled), used to build the outline
function Silhouette({
  strokeWidth,
  color,
}: {
  strokeWidth: number;
  color: string;
}) {
  return (
    <Shapes
      style={{ color }}
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
  );
}

export function SparklesIcon({
  className,
  outlineColor,
  outlineWidth = 16,
}: {
  className?: string;
  // No outline unless a color is passed
  outlineColor?: string;
  // In viewBox units (256 = full icon width)
  outlineWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      // Let the outline spill past the viewBox instead of getting clipped
      overflow="visible"
      className={className}
    >
      <rect width="256" height="256" fill="none" />
      {outlineColor && (
        <StickerOutline
          color={outlineColor}
          width={outlineWidth}
          iconStrokeWidth={STROKE_WIDTH}
          renderSilhouette={(strokeWidth, color) => (
            <Silhouette strokeWidth={strokeWidth} color={color} />
          )}
        />
      )}
      {outlineColor ? (
        <Shapes style={{ fill: stickerFill(outlineColor) }} />
      ) : (
        <Shapes opacity="var(--duotone-opacity)" fill="currentColor" />
      )}
      <Shapes
        fill="none"
        stroke="currentColor"
        style={outlineColor ? { stroke: STICKER_STROKE } : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
    </svg>
  );
}
