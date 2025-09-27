'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

const Cursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX - 4);
      cursorY.set(e.clientY - 4);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mousePosition, cursorX, cursorY]);

  return (
    <motion.div
      className="cursor fixed pointer-events-none z-50 top-0 left-0"
      style={{
        x: cursorX,
        y: cursorY,
      }}
      transition={{
        type: 'tween',
        duration: 0,
      }}
    >
      <svg
        className="size-6 text-background"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 40"
      >
        <path
          fill="currentColor"
          stroke="var(--foreground)"
          strokeWidth="3"
          d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
        />
      </svg>
    </motion.div>
  );
};

export default Cursor;
