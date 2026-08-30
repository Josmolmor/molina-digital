'use client';

import { useEffect, useRef, useState } from 'react';

type Point3D = {
  x: number;
  y: number;
  z: number;
};

type PathPair = {
  front: string;
  back: string;
};

const SIZE = 256;
const CENTER = SIZE / 2;
const RADIUS = 104;

const MERIDIANS = 12;
const LATITUDES = 7;
const SEGMENTS = 96;

function project(
  latitude: number,
  longitude: number,
  rotation: number,
): Point3D {
  const lat = (latitude * Math.PI) / 180;
  const lon = ((longitude + rotation) * Math.PI) / 180;

  const cosLat = Math.cos(lat);

  return {
    x: RADIUS * cosLat * Math.sin(lon),
    y: RADIUS * Math.sin(lat),
    z: RADIUS * cosLat * Math.cos(lon),
  };
}

function pathFromPoints(points: Point3D[]) {
  if (!points.length) return '';

  return points
    .map((p, i) => {
      const x = CENTER + p.x;
      const y = CENTER - p.y;

      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

/**
 * Splits a spherical line into front and back hemisphere paths.
 *
 * z > 0 = facing the viewer
 * z < 0 = behind the globe
 */
function splitVisible(points: Point3D[]): PathPair {
  const front: Point3D[] = [];
  const back: Point3D[] = [];

  const paths = {
    front: [] as Point3D[],
    back: [] as Point3D[],
  };

  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    if (point.z >= 0) {
      if (back.length) {
        paths.back.push(...back.splice(0));
      }

      front.push(point);
    } else {
      if (front.length) {
        paths.front.push(...front.splice(0));
      }

      back.push(point);
    }
  }

  if (front.length) {
    paths.front.push(...front);
  }

  if (back.length) {
    paths.back.push(...back);
  }

  return {
    front: pathFromPoints(paths.front),
    back: pathFromPoints(paths.back),
  };
}

function createMeridians(rotation: number): PathPair[] {
  const result: PathPair[] = [];

  for (let i = 0; i < MERIDIANS; i++) {
    const longitude = (i / MERIDIANS) * 360;

    const points: Point3D[] = [];

    for (let j = 0; j <= SEGMENTS; j++) {
      const latitude = -90 + (j / SEGMENTS) * 180;

      points.push(project(latitude, longitude, rotation));
    }

    result.push(splitVisible(points));
  }

  return result;
}

function createLatitudes(rotation: number): PathPair[] {
  const result: PathPair[] = [];

  // Avoid the poles because the meridians already meet there.
  const latitudeCount = LATITUDES;

  for (let i = 1; i < latitudeCount; i++) {
    const latitude = -90 + (i / latitudeCount) * 180;

    const points: Point3D[] = [];

    for (let j = 0; j <= SEGMENTS; j++) {
      const longitude = (j / SEGMENTS) * 360;

      points.push(project(latitude, longitude, rotation));
    }

    result.push(splitVisible(points));
  }

  return result;
}

export function RotatingGlobe({
  size = 32,
  speed = 20,
  className = '',
}: {
  size?: number;
  speed?: number;
  className?: string;
}) {
  const [rotation, setRotation] = useState(0);
  const frame = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const animate = (time: number) => {
      if (lastTime.current === null) {
        lastTime.current = time;
      }

      const delta = time - lastTime.current;
      lastTime.current = time;

      setRotation((current) => {
        const next = current + (delta / 1000) * speed;

        return next >= 360 ? next - 360 : next;
      });

      frame.current = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (reducedMotion.matches) return;

      lastTime.current = null;
      frame.current = requestAnimationFrame(animate);
    };

    const handleMotionPreferenceChange = () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }

      startAnimation();
    };

    startAnimation();
    reducedMotion.addEventListener('change', handleMotionPreferenceChange);

    return () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
      }

      reducedMotion.removeEventListener('change', handleMotionPreferenceChange);
    };
  }, [speed]);

  const meridians = createMeridians(rotation);
  const latitudes = createLatitudes(rotation);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer sphere */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        stroke="currentColor"
        strokeWidth="8"
      />

      {/* Back hemisphere */}
      <g
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.22"
      >
        {meridians.map((path, i) => (
          <path key={`meridian-back-${i}`} d={path.back} />
        ))}

        {latitudes.map((path, i) => (
          <path key={`latitude-back-${i}`} d={path.back} />
        ))}
      </g>

      {/* Front hemisphere */}
      <g
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {meridians.map((path, i) => (
          <path key={`meridian-front-${i}`} d={path.front} />
        ))}

        {latitudes.map((path, i) => (
          <path key={`latitude-front-${i}`} d={path.front} />
        ))}
      </g>
    </svg>
  );
}
