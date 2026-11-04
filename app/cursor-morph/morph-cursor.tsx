'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, type RefObject } from 'react';

import { cn } from '@/lib/utils';

import { CARET_BLINK_CLASS, COMPILED_SHAPES, STROKE_WIDTH } from './compiled';
import { MORPH_MOTION, MorphEngine, type ShapeChange } from './morph-engine';
import { CURSOR_SHAPES, isCursorState, type CursorStateId } from './shapes';
import { useFinePointer } from './use-fine-pointer';

export type CursorSnapshot = {
  /* The shape the cursor is showing. */
  state: CursorStateId;
  /* The `data-cursor-state` target under the pointer, if any. */
  target: CursorStateId | null;
};

export const IDLE: CursorSnapshot = { state: 'default', target: null };

const EDITABLE = 'input, textarea, select, [contenteditable="true"]';
const INTERACTIVE =
  'a[href], button, [role="button"], [role="slider"], label, summary';

/* Room around the hotspot; shapes may overflow it, the svg doesn't clip. */
const BOX = 48;

function resolve(
  element: Element | null,
  scope: HTMLElement,
  pressed: boolean,
): CursorSnapshot {
  if (!element || !scope.contains(element)) return IDLE;

  const declared = element.closest<HTMLElement>('[data-cursor-state]')?.dataset
    .cursorState;

  if (isCursorState(declared)) {
    const whilePressed = CURSOR_SHAPES[declared].pressed;
    const state =
      pressed && isCursorState(whilePressed) ? whilePressed : declared;
    return { state, target: declared };
  }

  /* A cursor hint for controls: same shapes, but not a tile target. */
  const hinted = element.closest<HTMLElement>('[data-cursor]')?.dataset.cursor;
  if (isCursorState(hinted)) return { state: hinted, target: null };

  /* Everything else in the scope gets what the browser would have shown. */
  if (element.closest(EDITABLE)) return { state: 'text', target: null };
  if (element.closest(INTERACTIVE)) return { state: 'pointer', target: null };
  return IDLE;
}

/*
 * Replaces the native cursor inside `scopeRef` only. The hotspot is the centre
 * of every shape, and the position is written straight to the transform on
 * each pointer event, so the cursor never trails the real pointer; only the
 * shape is animated.
 */
export function MorphCursor({
  scopeRef,
  onChange,
  timeScale = 1,
}: {
  scopeRef: RefObject<HTMLElement | null>;
  onChange?: (snapshot: CursorSnapshot) => void;
  /* Playback speed for the morph; 1 is real time. */
  timeScale?: number;
}) {
  const enabled = useFinePointer();
  const reduceMotion = useReducedMotion() ?? false;

  const positionRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const caretRef = useRef<SVGSVGElement>(null);
  const engineRef = useRef<MorphEngine | null>(null);
  const onChangeRef = useRef(onChange);
  const reduceMotionRef = useRef(reduceMotion);
  const timeScaleRef = useRef(timeScale);

  useEffect(() => {
    timeScaleRef.current = timeScale;
    engineRef.current?.setTimeScale(timeScale);
  }, [timeScale]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
    engineRef.current?.setMotion(
      reduceMotion ? MORPH_MOTION.reduced : MORPH_MOTION.full,
    );
  }, [reduceMotion]);

  useEffect(() => {
    const scope = scopeRef.current;
    const position = positionRef.current;
    const body = bodyRef.current;
    const path = pathRef.current;
    const caret = caretRef.current;
    if (!enabled || !scope || !position || !body || !path || !caret) return;

    const engine = new MorphEngine(
      path,
      COMPILED_SHAPES.default,
      reduceMotionRef.current ? MORPH_MOTION.reduced : MORPH_MOTION.full,
    );
    engine.setTimeScale(timeScaleRef.current);
    engineRef.current = engine;
    scope.classList.add('cursor-none');

    let current = IDLE;
    let visible = false;
    let pressed = false;
    let x = 0;
    let y = 0;

    function apply(next: CursorSnapshot, change: ShapeChange = {}) {
      if (change.immediate || next.state !== current.state) {
        engine.setShape(COMPILED_SHAPES[next.state], change);
      }
      if (next.state !== current.state || next.target !== current.target) {
        onChangeRef.current?.(next);
      }
      current = next;
      syncBlink();
    }

    /*
     * Blink for as long as the shape asks for it, moving or not. The attribute
     * only changes with the state, so the cycle runs uninterrupted, and each
     * new entry starts it again from the visible phase.
     */
    function syncBlink() {
      caret!.toggleAttribute(
        'data-blink',
        visible && Boolean(CURSOR_SHAPES[current.state].blink),
      );
    }

    function resolveAtPointer() {
      return resolve(document.elementFromPoint(x, y), scope!, pressed);
    }

    function show(next: CursorSnapshot) {
      visible = true;
      body!.toggleAttribute('data-visible', true);
      /* Appear already in shape: no morph from wherever it was last seen. */
      apply(next, { immediate: true });
    }

    function hide() {
      if (!visible) return;
      visible = false;
      pressed = false;
      engine.setPressed(false);
      body!.toggleAttribute('data-visible', false);
      if (current !== IDLE) onChangeRef.current?.(IDLE);
      current = IDLE;
      syncBlink();
    }

    function handleMove(event: PointerEvent) {
      if (event.pointerType === 'touch') return hide();

      x = event.clientX;
      y = event.clientY;
      position!.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      const next = resolve(event.target as Element, scope!, pressed);
      if (visible) apply(next);
      else show(next);
    }

    function handleDown(event: PointerEvent) {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      pressed = true;
      const next = resolve(event.target as Element, scope!, pressed);
      /* A press that changes the shape (grab → grabbing) is its own feedback;
       * squashing the cursor on top of it would compress it twice. */
      const changesShape = next.state !== current.state;
      engine.setPressed(!changesShape);
      if (visible) apply(next, { via: 'snap' });
    }

    function handleUp() {
      if (!pressed) return;
      pressed = false;
      engine.setPressed(false);
      if (visible) apply(resolveAtPointer());
    }

    /* Content can scroll under a resting pointer without any pointer event. */
    function handleScroll() {
      if (visible) apply(resolveAtPointer());
    }

    function handleVisibility() {
      if (document.hidden) hide();
    }

    scope.addEventListener('pointermove', handleMove, { passive: true });
    scope.addEventListener('pointerdown', handleDown, { passive: true });
    scope.addEventListener('pointerleave', hide);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    window.addEventListener('scroll', handleScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      scope.removeEventListener('pointermove', handleMove);
      scope.removeEventListener('pointerdown', handleDown);
      scope.removeEventListener('pointerleave', hide);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', handleVisibility);

      scope.classList.remove('cursor-none');
      engine.destroy();
      engineRef.current = null;
      onChangeRef.current?.(IDLE);
    };
  }, [enabled, scopeRef]);

  if (!enabled) return null;

  return (
    <div
      ref={positionRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-9999"
      style={{ transform: 'translate3d(-100vw, -100vh, 0)' }}
    >
      <div
        ref={bodyRef}
        className="-translate-x-1/2 -translate-y-1/2 scale-90 opacity-0 transition-[opacity,scale] duration-150 ease-(--ease-out-quint) data-visible:scale-100 data-visible:opacity-100 motion-reduce:scale-100"
      >
        <svg
          ref={caretRef}
          width={BOX}
          height={BOX}
          viewBox={`${-BOX / 2} ${-BOX / 2} ${BOX} ${BOX}`}
          className={cn(
            'block overflow-visible text-foreground',
            CARET_BLINK_CLASS,
          )}
        >
          <path
            ref={pathRef}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
