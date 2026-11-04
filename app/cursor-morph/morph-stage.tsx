'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import { CARET_BLINK_CLASS, COMPILED_SHAPES, STROKE_WIDTH } from './compiled';
import { MORPH_MOTION, MorphEngine } from './morph-engine';
import { CURSOR_SHAPES, type CursorStateId } from './shapes';

/*
 * The same morph, scaled up and driven by taps instead of a pointer. Used
 * where there is no cursor to replace.
 */
export function MorphStage({
  state,
  className,
  timeScale = 1,
}: {
  state: CursorStateId;
  className?: string;
  /* Playback speed for the morph; 1 is real time. */
  timeScale?: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const pathRef = useRef<SVGPathElement>(null);
  const engineRef = useRef<MorphEngine | null>(null);
  const initialRef = useRef({ state, reduceMotion, timeScale });

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const { state, reduceMotion, timeScale } = initialRef.current;
    const engine = new MorphEngine(
      path,
      COMPILED_SHAPES[state],
      reduceMotion ? MORPH_MOTION.reduced : MORPH_MOTION.full,
    );
    engine.setTimeScale(timeScale);
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setShape(COMPILED_SHAPES[state]);
  }, [state]);

  useEffect(() => {
    engineRef.current?.setTimeScale(timeScale);
  }, [timeScale]);

  useEffect(() => {
    engineRef.current?.setMotion(
      reduceMotion ? MORPH_MOTION.reduced : MORPH_MOTION.full,
    );
  }, [reduceMotion]);

  return (
    <svg
      aria-hidden
      viewBox="-16 -16 32 32"
      data-blink={CURSOR_SHAPES[state].blink || undefined}
      className={cn(CARET_BLINK_CLASS, className)}
    >
      <path
        ref={pathRef}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
      />
    </svg>
  );
}
