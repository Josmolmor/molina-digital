type PolygonIconProps = {
  className?: string;
};

export function ArcIcon({ className }: PolygonIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
      className={className}
      aria-hidden
    >
      <path
        d="M0 0C11.0457 0 20 8.95431 20 20H10C10 14.4772 5.52285 10 0 10V0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CornerIcon({ className }: PolygonIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
      className={className}
      aria-hidden
    >
      <path d="M19.9999 0L20.0001 20H6.85196e-05L19.9999 0Z" fill="currentColor" />
    </svg>
  );
}

export function CrossIcon({ className }: PolygonIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      fill="none"
      viewBox="0 0 17 17"
      className={className}
      aria-hidden
    >
      <path
        d="M16.9707 2.82812L11.3135 8.48535L16.9707 14.1426L14.1426 16.9707L8.48535 11.3135L2.82812 16.9707L0 14.1426L5.65723 8.48535L0 2.82812L2.82812 0L8.48535 5.65723L14.1426 0L16.9707 2.82812Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function EllipseIcon({ className }: PolygonIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
      className={className}
      aria-hidden
    >
      <circle cx="10" cy="10" r="10" fill="currentColor" />
    </svg>
  );
}

export function RectangleIcon({ className }: PolygonIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
      className={className}
      aria-hidden
    >
      <rect width="20" height="20" fill="currentColor" />
    </svg>
  );
}

export function TriangleIcon({ className }: PolygonIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="18"
      fill="none"
      viewBox="0 0 21 18"
      className={className}
      aria-hidden
    >
      <path
        d="M10.3921 0L20.7844 18H-0.000214577L10.3921 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export const POLYGON_ICONS = {
  arc: ArcIcon,
  corner: CornerIcon,
  cross: CrossIcon,
  ellipse: EllipseIcon,
  rectangle: RectangleIcon,
  triangle: TriangleIcon,
} as const;

export type PolygonName = keyof typeof POLYGON_ICONS;
