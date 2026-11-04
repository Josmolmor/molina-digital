'use client';

import Link from 'next/link';
import { useRef, useState, type CSSProperties } from 'react';
import { motion, MotionConfig } from 'motion/react';

import { ArrowLeft } from '@/components/ui/icons/arrow-left';
import { ScrubSlider } from '@/components/ui/scrub-slider';
import { cn } from '@/lib/utils';

import { PREVIEW_PATHS, STROKE_WIDTH } from './compiled';
import { IDLE, MorphCursor, type CursorSnapshot } from './morph-cursor';
import { MorphStage } from './morph-stage';
import { CURSOR_SHAPES, TILE_STATES, type CursorStateId } from './shapes';
import { useFinePointer } from './use-fine-pointer';

const EASE_OUT = 'ease-(--ease-out-quint)';

/* Playback speed for the morph: 0× pauses it, 1× is real time. */
const MAX_SPEED = 2;
const REAL_TIME = 1;

/* Always two decimals, so the readout keeps its width while scrubbing. */
function formatSpeed(speed: number) {
  return `${speed.toFixed(2)}×`;
}

export default function CursorMorph() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();
  const [cursor, setCursor] = useState<CursorSnapshot>(IDLE);
  /* Touch has no cursor to replace: tapping a tile drives the stage instead. */
  const [selected, setSelected] = useState<CursorStateId>('default');
  const [speed, setSpeed] = useState(REAL_TIME);

  const current = finePointer ? cursor.state : selected;

  return (
    <div
      ref={scopeRef}
      className="relative min-h-dvh"
      style={{ '--morph-speed': speed } as CSSProperties}
    >
      <MorphCursor scopeRef={scopeRef} onChange={setCursor} timeScale={speed} />

      {/* reducedMotion="user" drops the slide and keeps the fade. */}
      <MotionConfig reducedMotion="user">
        <motion.div
          initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="pointer-events-none absolute top-4 left-4 z-1 flex items-center gap-2 text-sm"
        >
          <Link
            href="/"
            className="pointer-events-auto group text-muted-foreground flex items-center gap-2 p-2 font-medium transition-colors hover:text-foreground hover:underline underline-offset-2"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5"
            />
            Home
          </Link>
        </motion.div>
      </MotionConfig>

      <main className="flex w-full max-w-232 flex-col gap-10 px-6 pt-24 pb-14 sm:px-12 md:px-24 md:pb-28">
        <header className="flex flex-col gap-3">
          <h1 className="font-serif text-2xl font-medium">Cursor morph</h1>
          <p className="max-w-prose text-muted-foreground">
            An experiment in cursors that morph between states instead of
            switching.
          </p>
          <p className="text-muted-foreground pointer-fine:hidden">
            Best with a mouse or trackpad. Here, tap a tile to morph the shape.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <p className="font-mono text-sm text-muted-foreground">
              cursor:{' '}
              <span className="text-foreground">
                {CURSOR_SHAPES[current].css}
              </span>
              ;
            </p>

            {/* Scrubbing is a horizontal drag, so the bar gets that cursor. */}
            <ScrubSlider
              data-cursor="ew-resize"
              label="Speed"
              valueLabel={formatSpeed(speed)}
              min={0}
              max={MAX_SPEED}
              step={0.01}
              value={[speed]}
              onValueChange={([value]) => setSpeed(value)}
              onReset={() => setSpeed(REAL_TIME)}
              className="w-56"
            />
          </div>

          <div className="grid aspect-2/1 place-items-center rounded-2xl bg-card pointer-fine:hidden">
            <MorphStage
              state={selected}
              timeScale={speed}
              className="size-32 overflow-visible text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TILE_STATES.map((id) => {
              const shape = CURSOR_SHAPES[id];
              const active = finePointer
                ? cursor.target === id
                : selected === id;

              return (
                /* A hover target, not a control: with a mouse, hovering is the
                 * whole interaction. On touch a tap drives the stage above. */
                <div
                  key={id}
                  data-cursor-state={id}
                  data-active={active || undefined}
                  onClick={finePointer ? undefined : () => setSelected(id)}
                  className={cn(
                    'group relative flex aspect-square touch-manipulation select-none flex-col justify-between rounded-2xl bg-card p-4',
                    'transition-[background-color] duration-200 ease-[ease] data-active:bg-[oklch(from_var(--background)_calc(l+var(--surface-shift-active))_c_h)]',
                  )}
                >
                  {/* The preview ghosts while hovered: the shape has moved into the cursor. */}
                  <svg
                    aria-hidden
                    viewBox="-16 -16 32 32"
                    className={cn(
                      'pointer-events-none absolute inset-0 m-auto size-12 overflow-visible text-foreground transition-[opacity,scale] duration-200',
                      'group-data-active:scale-90 group-data-active:opacity-15',
                      'pointer-coarse:group-data-active:scale-100 pointer-coarse:group-data-active:opacity-100',
                      'motion-reduce:group-data-active:scale-100',
                      EASE_OUT,
                    )}
                  >
                    <path
                      d={PREVIEW_PATHS[id]}
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth={STROKE_WIDTH}
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
