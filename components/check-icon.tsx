import { useEffect, useRef } from 'react';

const DEFAULT_PATH = 'M 3.5 6 L 4 6 L 8.5 6';

export const AnimatedCheckmark = ({ checked = false, className = '' }) => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      if (checked) {
        pathRef.current.setAttribute('d', 'M 3.5 6.5 L 5.5 8.5 L 9 4.5');
      } else {
        pathRef.current.setAttribute('d', DEFAULT_PATH);
      }
    }
  }, [checked]);

  return (
    <svg
      className={`size-3 ${className}`}
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        ref={pathRef}
        d={DEFAULT_PATH}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="transition-all duration-400 ease-out-quad"
      />
    </svg>
  );
};
