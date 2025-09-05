export default function CrossPattern() {
  return (
    <svg className="grid-background w-full h-full inset-0 fixed z-[-1] mix-blend-color">
      <defs>
        <pattern
          id="grid"
          width="160"
          height="160"
          patternUnits="userSpaceOnUse"
        >
          {/* Grid lines */}
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="160"
            stroke="var(--grid-background-lines-stroke-color)"
            strokeWidth="var(--grid-background-lines-stroke-width)"
            opacity="var(--grid-background-lines-opacity)"
          />
          <line
            x1="0"
            y1="0"
            x2="160"
            y2="0"
            stroke="var(--grid-background-lines-stroke-color)"
            strokeWidth="var(--grid-background-lines-stroke-width)"
            opacity="var(--grid-background-lines-opacity)"
          />

          {/* Top-left cross (0,0) - exactly on the intersection */}
          <line
            x1="0"
            y1="0"
            x2="4"
            y2="0"
            stroke="var(--grid-background-cross-stroke-color)"
            strokeWidth="var(--grid-background-cross-stroke-width)"
            opacity="var(--grid-background-cross-opacity)"
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="4"
            stroke="var(--grid-background-cross-stroke-color)"
            strokeWidth="var(--grid-background-cross-stroke-width)"
            opacity="var(--grid-background-cross-opacity)"
          />
          <line
            x1="156"
            y1="0"
            x2="160"
            y2="0"
            stroke="var(--grid-background-cross-stroke-color)"
            strokeWidth="var(--grid-background-cross-stroke-width)"
            opacity="var(--grid-background-cross-opacity)"
          />
          <line
            x1="0"
            y1="156"
            x2="0"
            y2="160"
            stroke="var(--grid-background-cross-stroke-color)"
            strokeWidth="var(--grid-background-cross-stroke-width)"
            opacity="var(--grid-background-cross-opacity)"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
