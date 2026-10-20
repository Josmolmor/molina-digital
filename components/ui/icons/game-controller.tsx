import { STICKER_STROKE, StickerOutline, stickerFill } from './sticker-outline';

// Phosphor "game-controller" (duotone)
const BODY =
  'M105.91,152,63.8,199.8a28,28,0,0,1-47.37-24.66L32.79,91a52,52,0,0,1,51.1-43H172a52,52,0,1,1,0,104Z';
// The right grip is open in the original; this closed copy only exists to be filled
const RIGHT_GRIP_FILL =
  'M239.57,175.14,223.21,91h0A51.94,51.94,0,0,1,172,152H150.09l42.11,47.8a28,28,0,0,0,47.37-24.66Z';
const RIGHT_GRIP = 'M150.09,152l42.11,47.8a28,28,0,0,0,47.37-24.66L223.21,91';
const STROKE_WIDTH = 16;

// Rumble once per hover (or when the parent HoverBlob opens); the d-pad and buttons press in turn
const CONTROLLER_CLASS =
  '[transform-box:view-box] motion-safe:in-[svg:hover]:animate-rumble motion-safe:in-[.token:hover]:animate-rumble motion-safe:in-aria-expanded:animate-rumble';
const BUTTON_CLASS =
  'origin-center [transform-box:fill-box] motion-safe:in-[svg:hover]:animate-button-press motion-safe:in-[.token:hover]:animate-button-press motion-safe:in-aria-expanded:animate-button-press';

function Shapes(props: React.SVGProps<SVGGElement>) {
  return (
    <g {...props}>
      {/* Same classes on every copy (icon, outline, shadow) keeps them in sync */}
      <g
        className={CONTROLLER_CLASS}
        style={{ transformOrigin: '128px 128px' }}
      >
        <path d={BODY} />
        <path d={RIGHT_GRIP_FILL} stroke="none" />
        <path d={RIGHT_GRIP} fill="none" />
        {/* D-pad */}
        <g className={BUTTON_CLASS} style={{ animationDelay: '0.05s' }}>
          <line x1="72" y1="104" x2="104" y2="104" />
          <line x1="88" y1="88" x2="88" y2="120" />
        </g>
        {/* Buttons */}
        <g className={BUTTON_CLASS} style={{ animationDelay: '0.2s' }}>
          <line x1="152" y1="104" x2="176" y2="104" />
        </g>
      </g>
    </g>
  );
}

// Solid version of the whole icon (body filled), used to build the outline
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

export function GameControllerIcon({
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
