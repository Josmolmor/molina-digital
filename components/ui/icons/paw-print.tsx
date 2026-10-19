import { STICKER_STROKE, StickerOutline, stickerFill } from './sticker-outline';

// Left to right, so the toe splay ripples across
const TOES = [
  { cx: 44, cy: 108 },
  { cx: 92, cy: 60 },
  { cx: 164, cy: 60 },
  { cx: 212, cy: 108 },
];
const TOE_RADIUS = 20;
const PAD =
  'M128,104A36,36,0,0,0,93.43,130a43.49,43.49,0,0,1-20.67,25.9,32,32,0,0,0,27.73,57.62,72.49,72.49,0,0,1,55,0,32,32,0,0,0,27.73-57.62A43.46,43.46,0,0,1,162.57,130,36,36,0,0,0,128,104Z';
// Toes splay out along the line from here to their center
const PAD_CENTER = { x: 128, y: 150 };
const STROKE_WIDTH = 16;

// Press once per hover (or when the parent HoverBlob opens)
const PAW_CLASS =
  '[transform-box:view-box] motion-safe:in-[svg:hover]:animate-paw-press motion-safe:in-[.token:hover]:animate-paw-press motion-safe:in-aria-expanded:animate-paw-press';
const TOE_CLASS =
  '[transform-box:view-box] motion-safe:in-[svg:hover]:animate-toe-splay motion-safe:in-[.token:hover]:animate-toe-splay motion-safe:in-aria-expanded:animate-toe-splay';

function toeStyle(cx: number, cy: number, index: number) {
  const dx = cx - PAD_CENTER.x;
  const dy = cy - PAD_CENTER.y;
  const length = Math.hypot(dx, dy);

  return {
    animationDelay: `${index * 40}ms`,
    '--toe-dx': dx / length,
    '--toe-dy': dy / length,
  } as React.CSSProperties;
}

function Shapes(props: React.SVGProps<SVGGElement>) {
  return (
    <g {...props}>
      {/* Same classes on every copy (icon, outline, mask) keeps them in sync */}
      <g className={PAW_CLASS} style={{ transformOrigin: '128px 220px' }}>
        {TOES.map(({ cx, cy }, index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={TOE_RADIUS}
            className={TOE_CLASS}
            style={toeStyle(cx, cy, index)}
          />
        ))}
        <path d={PAD} />
      </g>
    </g>
  );
}

// Solid version of the whole icon (pads filled), used to build the outline
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

export function PawPrintIcon({
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
