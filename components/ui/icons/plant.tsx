import { STICKER_STROKE, StickerOutline, stickerFill } from './sticker-outline';

// Each leaf with its vein, grouped so it can grow from where it meets the stem
const LEAVES = [
  {
    d: 'M138.54,149.46C106.62,96.25,149.18,43.05,239.63,48.37,245,138.82,191.75,181.38,138.54,149.46Z',
    vein: 'M200,88L138.75,149.25',
    origin: '138.75px 149.25px',
    // Folds toward the stem before unfurling
    tilt: '-14deg',
    delay: '0s',
  },
  {
    d: 'M88.47,160.47c22.8-38-7.6-76-72.21-72.21C12.46,152.87,50.47,183.27,88.47,160.47Z',
    vein: 'M56,128L120,192',
    origin: '120px 192px',
    tilt: '14deg',
    delay: '0.08s',
  },
];
const STEM = 'M138.75,149.25A64,64,0,0,0,120,194.51V224';
const STROKE_WIDTH = 16;

// Grow once per hover (or when the parent HoverBlob opens)
const PLANT_CLASS =
  '[transform-box:view-box] motion-safe:in-[svg:hover]:animate-grow-stem motion-safe:in-[.token:hover]:animate-grow-stem motion-safe:in-aria-expanded:animate-grow-stem';
const LEAF_CLASS =
  '[transform-box:view-box] motion-safe:in-[svg:hover]:animate-grow-leaf motion-safe:in-[.token:hover]:animate-grow-leaf motion-safe:in-aria-expanded:animate-grow-leaf';

function Shapes(props: React.SVGProps<SVGGElement>) {
  return (
    <g {...props}>
      {/* Same classes on every copy (icon, outline, mask) keeps them in sync */}
      <g className={PLANT_CLASS} style={{ transformOrigin: '120px 224px' }}>
        {LEAVES.map(({ d, vein, origin, tilt, delay }) => (
          <g
            key={origin}
            className={LEAF_CLASS}
            style={
              {
                transformOrigin: origin,
                animationDelay: delay,
                '--grow-tilt': tilt,
              } as React.CSSProperties
            }
          >
            <path d={d} />
            <path d={vein} fill="none" />
          </g>
        ))}
        <path d={STEM} fill="none" />
      </g>
    </g>
  );
}

// Solid version of the whole icon (leaves filled), used to build the outline
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

export function PlantIcon({
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
