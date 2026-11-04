'use client';

import {
  AnimatePresence,
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

interface HoverBlobProps {
  children: React.ReactNode;
  imageContent?: React.ReactNode;
  message: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  // `token` draws the pill behind the trigger; `plain` leaves the text as-is so children can style the affordance
  variant?: 'token' | 'plain';
}

const FINE_HOVER_QUERY = '(hover: hover) and (pointer: fine)';
const VIEWPORT_GUTTER = 12;
// Image blobs need room so the photo doesn't crowd the trigger; a bare label should sit close like a tooltip
const IMAGE_BLOB_GAP = 20;
const LABEL_BLOB_GAP = 8;
const CLOSE_GRACE_MS = 150;
const WOBBLE_RANGE = 8;
// Ignore sub-pixel jitter; any real scroll detaches the blob from its trigger
const SCROLL_CLOSE_THRESHOLD = 2;
const SCROLL_HOVER_COOLDOWN_MS = 150;

function wobbleFromPointer(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
) {
  if (!rect.width || !rect.height) return null;

  return {
    x: ((clientX - rect.left) / rect.width - 0.5) * WOBBLE_RANGE,
    y: ((clientY - rect.top) / rect.height - 0.5) * WOBBLE_RANGE,
  };
}

// Bridges the gap so moving the pointer from the trigger to the blob doesn't close it
const gapFillerClassName = {
  top: 'absolute inset-x-0 top-full',
  bottom: 'absolute inset-x-0 bottom-full',
  left: 'absolute inset-y-0 left-full',
  right: 'absolute inset-y-0 right-full',
} as const;

function gapFillerStyle(
  position: keyof typeof gapFillerClassName,
  gap: number,
) {
  return position === 'top' || position === 'bottom'
    ? { height: gap }
    : { width: gap };
}

type Coordinates = {
  left: number;
  top: number;
};

const exitOffset = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
};

function hasFineHover() {
  return window.matchMedia(FINE_HOVER_QUERY).matches;
}

export function HoverBlob({
  children,
  imageContent,
  message,
  className,
  position = 'top',
  variant = 'token',
}: HoverBlobProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const isOpenRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollAtRef = useRef(-Infinity);
  const pendingHoverRef = useRef(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const contentX = useSpring(pointerX, { stiffness: 300, damping: 25 });
  const contentY = useSpring(pointerY, { stiffness: 300, damping: 25 });
  const reducedMotion = useReducedMotion();
  const gap = imageContent ? IMAGE_BLOB_GAP : LABEL_BLOB_GAP;

  isOpenRef.current = isOpen;

  const cancelScheduledClose = useCallback(() => {
    if (closeTimeoutRef.current === null) return;
    clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
  }, []);

  const closeBlob = useCallback(() => {
    cancelScheduledClose();
    setIsExiting(true);
    setIsOpen(false);
  }, [cancelScheduledClose]);

  const openBlob = useCallback(() => {
    cancelScheduledClose();
    setIsExiting(false);
    if (isOpenRef.current) {
      setIsOpen(true);
      return;
    }
    setCoordinates(null);
    setIsPositioned(false);
    setIsReady(false);
    setIsOpen(true);
  }, [cancelScheduledClose]);

  const scheduleClose = useCallback(() => {
    if (!hasFineHover()) return;
    cancelScheduledClose();
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      closeBlob();
    }, CLOSE_GRACE_MS);
  }, [cancelScheduledClose, closeBlob]);

  const adjustToViewport = useCallback(() => {
    const blob = blobRef.current;
    if (!blob) return;

    const rects = [
      blob.getBoundingClientRect(),
      ...Array.from(blob.querySelectorAll('*')).map((element) =>
        element.getBoundingClientRect(),
      ),
    ];
    const left = Math.min(...rects.map((rect) => rect.left));
    const right = Math.max(...rects.map((rect) => rect.right));
    const top = Math.min(...rects.map((rect) => rect.top));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    const maxLeft = window.innerWidth - VIEWPORT_GUTTER;
    const maxTop = window.innerHeight - VIEWPORT_GUTTER;
    const offsetX =
      left < VIEWPORT_GUTTER
        ? VIEWPORT_GUTTER - left
        : right > maxLeft
          ? maxLeft - right
          : 0;
    const offsetY =
      top < VIEWPORT_GUTTER
        ? VIEWPORT_GUTTER - top
        : bottom > maxTop
          ? maxTop - bottom
          : 0;

    if (offsetX || offsetY) {
      setCoordinates(
        (current) =>
          current && {
            left: current.left + offsetX,
            top: current.top + offsetY,
          },
      );
    }
  }, []);

  useLayoutEffect(() => {
    const target = rootRef.current;
    const blob = blobRef.current;
    if (!isOpen || isExiting || isPositioned || !target || !blob) return;

    const targetRect = target.getBoundingClientRect();
    const blobWidth = blob.offsetWidth;
    const blobHeight = blob.offsetHeight;
    const centeredLeft = targetRect.left + (targetRect.width - blobWidth) / 2;
    const centeredTop = targetRect.top + (targetRect.height - blobHeight) / 2;
    const placement = {
      top: {
        left: centeredLeft,
        top: targetRect.top - blobHeight - gap,
      },
      bottom: {
        left: centeredLeft,
        top: targetRect.bottom + gap,
      },
      left: {
        left: targetRect.left - blobWidth - gap,
        top: centeredTop,
      },
      right: {
        left: targetRect.right + gap,
        top: centeredTop,
      },
    };

    setCoordinates(placement[position]);
    setIsPositioned(true);
  }, [adjustToViewport, gap, isExiting, isOpen, isPositioned, position]);

  useLayoutEffect(() => {
    if (!isOpen || isExiting || !isPositioned || isReady) return;

    adjustToViewport();
    setIsReady(true);
  }, [adjustToViewport, isExiting, isOpen, isPositioned, isReady]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (hasFineHover()) return;
      if (rootRef.current?.contains(event.target as Node)) return;
      closeBlob();
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsidePress);
  }, [closeBlob, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const reposition = () => {
      setIsReady(false);
      setIsPositioned(false);
    };
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, [isOpen]);

  // The blob is position: fixed, so once its trigger scrolls it's pointing at nothing — close it
  useEffect(() => {
    if (!isOpen) return;

    const target = rootRef.current;
    if (!target) return;
    const { top, left } = target.getBoundingClientRect();

    const closeOnScroll = () => {
      const rect = target.getBoundingClientRect();
      if (
        Math.abs(rect.top - top) > SCROLL_CLOSE_THRESHOLD ||
        Math.abs(rect.left - left) > SCROLL_CLOSE_THRESHOLD
      )
        closeBlob();
    };

    // Capture so scrolls inside any ancestor container are caught too
    window.addEventListener('scroll', closeOnScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener('scroll', closeOnScroll, { capture: true });
  }, [closeBlob, isOpen]);

  // Browsers fire pointerenter when content scrolls under a resting cursor; remember scrolls so those don't open the blob
  useEffect(() => {
    const markScroll = () => {
      lastScrollAtRef.current = performance.now();
    };
    window.addEventListener('scroll', markScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener('scroll', markScroll, { capture: true });
  }, []);

  const hoverOpen = () => {
    if (!hasFineHover()) return;
    if (
      performance.now() - lastScrollAtRef.current <
      SCROLL_HOVER_COOLDOWN_MS
    ) {
      // Defer to the next real pointer movement instead
      pendingHoverRef.current = true;
      return;
    }
    pendingHoverRef.current = false;
    openBlob();
  };

  useEffect(() => () => cancelScheduledClose(), [cancelScheduledClose]);

  return (
    <span
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      // The trigger is a stacking context (relative + `token`'s isolation), so the blob's z-50 can't escape it; lift the whole trigger while the blob is visible
      className={`touch-hitbox relative inline rounded-sm ${isOpen || isExiting ? 'z-50' : ''} ${variant === 'token' ? 'token font-medium' : 'outline-offset-2'} ${className ?? ''}`}
      onFocus={(event) => {
        if (event.currentTarget.matches(':focus-visible')) openBlob();
      }}
      onBlur={(event) => {
        if (
          isOpenRef.current &&
          !event.currentTarget.contains(event.relatedTarget as Node)
        )
          closeBlob();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) closeBlob();
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (isOpen) closeBlob();
          else openBlob();
        }
      }}
      onPointerEnter={hoverOpen}
      onPointerLeave={() => {
        pendingHoverRef.current = false;
        pointerX.set(0);
        pointerY.set(0);
        scheduleClose();
      }}
      onPointerMove={(event) => {
        if (pendingHoverRef.current) hoverOpen();
        if (reducedMotion || !hasFineHover()) return;

        const blob = blobRef.current;
        const content = contentRef.current;
        const overBlob = Boolean(blob?.contains(event.target as Node));
        const image =
          overBlob && event.target instanceof Element
            ? event.target.closest('img')
            : null;
        const trackingRect = overBlob
          ? (image?.getBoundingClientRect() ?? content?.getBoundingClientRect())
          : event.currentTarget.getBoundingClientRect();

        if (!trackingRect) return;

        const wobble = wobbleFromPointer(event.clientX, event.clientY, {
          left: trackingRect.left - (overBlob ? contentX.get() : 0),
          top: trackingRect.top - (overBlob ? contentY.get() : 0),
          width: trackingRect.width,
          height: trackingRect.height,
        });
        if (!wobble) return;

        pointerX.set(wobble.x);
        pointerY.set(wobble.y);
      }}
      onClick={() => {
        const fineHover = hasFineHover();
        if (!fineHover) {
          if (isOpen) closeBlob();
          else openBlob();
        }
      }}
    >
      {children}
      <MotionConfig reducedMotion="user">
        <AnimatePresence
          mode="wait"
          onExitComplete={() => {
            setIsExiting(false);
            setIsPositioned(false);
            setIsReady(false);
          }}
        >
          {isOpen && (
            <motion.span
              ref={blobRef}
              className="fixed z-50"
              style={{
                left: coordinates?.left ?? 0,
                top: coordinates?.top ?? 0,
                visibility: isReady ? 'visible' : 'hidden',
              }}
              initial={false}
              exit={{
                opacity: 0,
                scale: 0.96,
                ...exitOffset[position],
                transition: {
                  duration: 0.14,
                  ease: 'easeOut',
                },
              }}
            >
              <span
                aria-hidden
                className={gapFillerClassName[position]}
                style={gapFillerStyle(position, gap)}
              />
              <motion.span
                ref={contentRef}
                key={isReady ? 'animated' : 'measuring'}
                className="
                flex
                items-center
                justify-center
                rounded-full
                bg-foreground
                px-4
                py-2
                text-background
                shadow-lg
                max-w-[calc(100vw-1.5rem)]
                will-change-transform
              "
                style={{ x: contentX, y: contentY }}
                initial={
                  isReady
                    ? {
                        opacity: 0,
                        scaleX: 0.4,
                        scaleY: 0.5,
                      }
                    : false
                }
                animate={
                  isReady
                    ? {
                        opacity: 1,
                        scaleX: 1,
                        scaleY: 1,
                        transition: { delay: 0.25 },
                      }
                    : {
                        opacity: 1,
                        scaleX: 1,
                        scaleY: 1,
                      }
                }
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 20,
                  mass: 0.55,
                }}
              >
                {imageContent}
                <span className="text-sm sm:text-default max-w-full text-center whitespace-normal font-normal cursor-default">
                  {message}
                </span>
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </MotionConfig>
    </span>
  );
}
