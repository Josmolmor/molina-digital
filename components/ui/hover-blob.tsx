'use client';

import {
  AnimatePresence,
  motion,
  useMotionValue,
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
}

const FINE_HOVER_QUERY = '(hover: hover) and (pointer: fine)';
const VIEWPORT_GUTTER = 12;
const BLOB_GAP = 12;

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
}: HoverBlobProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const contentX = useSpring(pointerX, { stiffness: 300, damping: 25 });
  const contentY = useSpring(pointerY, { stiffness: 300, damping: 25 });

  const closeBlob = useCallback(() => {
    setIsExiting(true);
    setIsOpen(false);
  }, []);

  const openBlob = () => {
    setCoordinates(null);
    setIsPositioned(false);
    setIsReady(false);
    setIsOpen(true);
  };

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
        top: targetRect.top - blobHeight - BLOB_GAP,
      },
      bottom: {
        left: centeredLeft,
        top: targetRect.bottom + BLOB_GAP,
      },
      left: {
        left: targetRect.left - blobWidth - BLOB_GAP,
        top: centeredTop,
      },
      right: {
        left: targetRect.right + BLOB_GAP,
        top: centeredTop,
      },
    };

    setCoordinates(placement[position]);
    setIsPositioned(true);
  }, [adjustToViewport, isExiting, isOpen, isPositioned, position]);

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

  return (
    <div
      ref={rootRef}
      className={`touch-hitbox relative inline font-medium ${className ?? ''}`}
      onPointerEnter={() => {
        const fineHover = hasFineHover();
        if (fineHover) openBlob();
      }}
      onPointerLeave={() => {
        const fineHover = hasFineHover();
        pointerX.set(0);
        pointerY.set(0);
        if (fineHover) closeBlob();
      }}
      onPointerMove={(event) => {
        if (!hasFineHover()) return;

        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 8);
        pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 8);
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
      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          setIsExiting(false);
          setIsPositioned(false);
          setIsReady(false);
        }}
      >
        {isOpen && (
          <motion.div
            ref={blobRef}
            className={`
              pointer-events-none
              fixed
              z-50
            `}
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
            <motion.div
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
              <span className="text-sm sm:text-default max-w-full text-center whitespace-normal font-normal">
                {message}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
