import { STICKER_STROKE, StickerOutline, stickerFill } from './sticker-outline';

// Phosphor "chef-hat" (duotone), split into the puffy top and the band so they can move separately
const PUFF_FILL =
  'M184,64a48.34,48.34,0,0,0-10.35,1.12h0a48,48,0,0,0-91.28,0h0A48,48,0,1,0,72,160H184a48,48,0,0,0,0-96Z';
const PUFF_OUTLINE =
  'M173.65,65.12A48,48,0,1,1,184,160H72A48,48,0,1,1,82.35,65.12';
const PUFF_TOP = 'M80,80a48,48,0,0,1,96,0';
const PLEATS = [
  { x1: 96, y1: 160, x2: 88, y2: 128 },
  { x1: 160, y1: 160, x2: 168, y2: 128 },
  { x1: 128, y1: 160, x2: 128, y2: 128 },
];
// The band is open at the top in the original; this closed copy only exists to be filled
const BAND_FILL = 'M56,157.27V208a8,8,0,0,0,8,8H192a8,8,0,0,0,8-8V157.27Z';
const BAND_OUTLINE = 'M200,157.27V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V157.27';
const STROKE_WIDTH = 16;

// Toss once per hover (or when the parent HoverBlob opens)
const HAT_CLASS =
  '[transform-box:view-box] motion-safe:in-[svg:hover]:animate-hat-toss motion-safe:in-[.token:hover]:animate-hat-toss motion-safe:in-aria-expanded:animate-hat-toss';
const PUFF_CLASS =
  '[transform-box:view-box] motion-safe:in-[svg:hover]:animate-puff-rise motion-safe:in-[.token:hover]:animate-puff-rise motion-safe:in-aria-expanded:animate-puff-rise';

function Shapes(props: React.SVGProps<SVGGElement>) {
  return (
    <g {...props}>
      {/* Same classes on every copy (icon, outline, shadow) keeps them in sync */}
      <g className={HAT_CLASS} style={{ transformOrigin: '128px 216px' }}>
        <g
          className={PUFF_CLASS}
          style={{ transformOrigin: '128px 160px', animationDelay: '0.28s' }}
        >
          <path d={PUFF_FILL} stroke="none" />
          <path d={PUFF_OUTLINE} fill="none" />
          <path d={PUFF_TOP} fill="none" />
          {PLEATS.map((line) => (
            <line key={line.x1} {...line} />
          ))}
        </g>
        <path d={BAND_FILL} stroke="none" />
        <path d={BAND_OUTLINE} fill="none" />
      </g>
    </g>
  );
}

// Solid version of the whole icon (hat filled), used to build the outline
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

export function ChefHatIcon({
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
