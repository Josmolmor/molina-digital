'use client';

import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const FINE_HOVER_QUERY = '(hover: hover) and (pointer: fine)';
/* The preview's box, in CSS px; keep in sync with the classes below. */
const WIDTH = 288;
const HEIGHT = 180;
const CURSOR_GAP = 24;
const VIEWPORT_GUTTER = 12;

/*
 * A list whose rows show an image beside the cursor while hovered. Rows opt
 * in with `data-preview="<image src>"`, so they can stay server-rendered
 * links: this only listens for the pointer on the wrapper.
 *
 * The motion is HoverBlob's (the same squash-and-pop spring, the same quick
 * exit), but one preview is shared by the whole list, so moving from row to
 * row swaps the image instead of closing one blob and opening another.
 *
 * Decorative and pointer-only: the rows already say where they lead, so
 * there is nothing here for touch, keyboard or screen readers to miss.
 */
export function HoverPreviews({
  images,
  className,
  children,
}: {
  /* Every image a row may ask for; loaded once the list is first hovered. */
  images: string[];
  className?: string;
  children: ReactNode;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const activeRef = useRef<string | null>(null);
  const reducedMotion = useReducedMotion();
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, { stiffness: 500, damping: 40, mass: 0.6 });
  const y = useSpring(targetY, { stiffness: 500, damping: 40, mass: 0.6 });

  function show(src: string | null) {
    activeRef.current = src;
    setActive(src);
  }

  /* The preview is fixed to the cursor; once the page scrolls, the row under
   * it has changed without the pointer moving. Close, and let the next real
   * movement reopen it. */
  useEffect(() => {
    if (!active) return;
    const close = () => show(null);
    window.addEventListener('scroll', close, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', close, { capture: true });
  }, [active]);

  function track(event: React.PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== 'mouse' ||
      !window.matchMedia(FINE_HOVER_QUERY).matches
    ) {
      return;
    }
    setArmed(true);

    const row =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-preview]')
        : null;
    const src = row?.dataset.preview ?? null;

    /* Beside the cursor, on whichever side has room, kept on screen. */
    const right = event.clientX + CURSOR_GAP;
    const left =
      right + WIDTH > window.innerWidth - VIEWPORT_GUTTER
        ? event.clientX - CURSOR_GAP - WIDTH
        : right;
    const top = Math.min(
      Math.max(event.clientY - HEIGHT / 2, VIEWPORT_GUTTER),
      window.innerHeight - VIEWPORT_GUTTER - HEIGHT,
    );

    if (activeRef.current === null || reducedMotion) {
      /* Appear where the cursor is, rather than flying in from the last spot. */
      x.jump(left);
      y.jump(top);
    }
    targetX.set(left);
    targetY.set(top);

    if (src !== activeRef.current) show(src);
  }

  return (
    <div
      className={className}
      onPointerMove={track}
      onPointerLeave={() => show(null)}
    >
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed top-0 left-0 z-50"
            style={{ x, y }}
            exit={{
              opacity: 0,
              transition: { duration: 0.14, ease: 'easeOut' },
            }}
          >
            <motion.div
              className="relative h-45 w-72 overflow-hidden rounded-xl bg-card ring-6 ring-card drop-shadow-lg will-change-transform"
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scaleX: 0.4, scaleY: 0.5 }
              }
              animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
              exit={reducedMotion ? undefined : { scale: 0.96 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 20,
                mass: 0.55,
                /* Long enough that sweeping across the list doesn't flash. */
                delay: 0.08,
              }}
            >
              <PreviewImages images={images} active={active} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Fetched ahead of the first preview, so it never opens empty. */}
      {armed && !active && (
        <div
          aria-hidden
          className="pointer-events-none fixed size-0 overflow-hidden"
        >
          <div className="relative h-45 w-72">
            <PreviewImages images={images} active={null} />
          </div>
        </div>
      )}
    </div>
  );
}

/* Every image stacked in one frame; the active one fades in over the rest. */
function PreviewImages({
  images,
  active,
}: {
  images: string[];
  active: string | null;
}) {
  return images.map((src) => (
    <Image
      key={src}
      src={src}
      alt=""
      fill
      sizes="288px"
      loading="eager"
      draggable={false}
      className="object-cover object-top transition-opacity duration-150 ease-out motion-reduce:transition-none"
      style={{ opacity: src === active ? 1 : 0 }}
    />
  ));
}
